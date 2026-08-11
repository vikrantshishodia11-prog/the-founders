import parseLedgerExcel from "./parsers/ledgerExcelParser.js";
import parseBankPdf from "./parsers/bankPdfParser.js";

import normalizeTransaction from "./normalizer/normalizeTransaction.js";

import exactMatcher from "./matcher/exactMatcher.js";
import fuzzyMatcher from "./matcher/fuzzyMatcher.js";
import classifyDiscrepancies from "./matcher/discrepancyClassifier.js";

import reconciliationReport from "./report/reconciliationReport.js";

import {
  buildEvidenceReport,
} from "./evidence/evidenceBuilder.js";

import {
  investigateFinding,
  investigateEvidenceReport,
} from "./investigation/investigationEngine.js";


// ==================================================
// FILE PATHS
// ==================================================

const LEDGER_FILE = "./data/ledger/ledger.xlsx";
const BANK_FILE =  "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";

// ==================================================
// MAIN
// ==================================================

async function main() {

  console.log("\n");

  console.log(
    "╔══════════════════════════════════════════════════╗"
  );

  console.log(
    "║      THE FOUNDERS — INVESTIGATION ENGINE         ║"
  );

  console.log(
    "╚══════════════════════════════════════════════════╝"
  );


  // ==================================================
  // 1. PARSE LEDGER
  // ==================================================

  console.log("\n[1] Parsing ledger...");

  const rawLedger =
    await parseLedgerExcel(LEDGER_FILE);

  console.log(
    "Ledger transactions:",
    rawLedger.length
  );


  // ==================================================
  // 2. PARSE BANK
  // ==================================================

  console.log("\n[2] Parsing bank statement...");

  const rawBank =
    await parseBankPdf(BANK_FILE);

  console.log(
    "Bank transactions:",
    rawBank.length
  );


  // ==================================================
  // 3. NORMALIZE
  // ==================================================

  console.log("\n[3] Normalizing transactions...");

  const ledgerTransactions =
    rawLedger.map(normalizeTransaction);

  const bankTransactions =
    rawBank.map(normalizeTransaction);

  console.log(
    "Normalized ledger:",
    ledgerTransactions.length
  );

  console.log(
    "Normalized bank:",
    bankTransactions.length
  );


  // ==================================================
  // 4. EXACT MATCHING
  // ==================================================

  console.log("\n[4] Running exact matcher...");

  const exactResult =
    exactMatcher(
      ledgerTransactions,
      bankTransactions
    );

  console.log(
    "Exact matches:",
    exactResult.matches.length
  );


  // ==================================================
  // 5. FUZZY MATCHING
  // ==================================================

  console.log("\n[5] Running fuzzy matcher...");

  const fuzzyResult =
    fuzzyMatcher(
      exactResult.unmatchedLedger,
      exactResult.unmatchedBank
    );

  console.log(
    "Fuzzy matches:",
    fuzzyResult.matches.length
  );


  // ==================================================
  // 6. DISCREPANCY CLASSIFICATION
  // ==================================================

  console.log(
    "\n[6] Classifying discrepancies..."
  );

  const discrepancies =
    classifyDiscrepancies(
      fuzzyResult.unmatchedLedger,
      fuzzyResult.unmatchedBank
    );

  console.log(
    "Discrepancies:",
    discrepancies.length
  );


  // ==================================================
  // 7. RECONCILIATION REPORT
  // ==================================================

  console.log(
    "\n[7] Building reconciliation report..."
  );

  const reconciliation =
    reconciliationReport({
      ledgerTransactions,
      bankTransactions,

      exactMatches:
        exactResult.matches,

      fuzzyMatches:
        fuzzyResult.matches,

      discrepancies,
    });


  console.log(
    "\n=============================="
  );

  console.log(
    "RECONCILIATION SUMMARY"
  );

  console.log(
    "=============================="
  );

  console.table(
    reconciliation.summary
  );


  // ==================================================
  // 8. BUILD EVIDENCE
  // ==================================================

  console.log(
    "\n[8] Building evidence..."
  );

  const evidenceReport =
    buildEvidenceReport({
      discrepancies: [
        ...fuzzyResult.matches,
        ...discrepancies,
      ],
    });


  console.log(
    "Evidence findings:",
    evidenceReport.totalFindings
  );


  // ==================================================
  // 9. RUN INVESTIGATION ENGINE
  // ==================================================

  console.log(
    "\n[9] Running investigation engine..."
  );

  const investigationReport =
    investigateEvidenceReport(
      evidenceReport
    );


  // ==================================================
  // 10. INVESTIGATION SUMMARY
  // ==================================================

  console.log(
    "\n=============================="
  );

  console.log(
    "INVESTIGATION SUMMARY"
  );

  console.log(
    "=============================="
  );

  console.table(
    investigationReport.summary
  );


  console.log(
    "\nTotal investigations:",
    investigationReport.totalInvestigations
  );


  // ==================================================
  // 11. SHOW EVERY INVESTIGATION
  // ==================================================

  console.log(
    "\n=============================="
  );

  console.log(
    "INVESTIGATION FINDINGS"
  );

  console.log(
    "=============================="
  );


  for (
    const investigation
    of investigationReport.investigations
  ) {

    console.log("\n");

    console.log(
      "------------------------------------------"
    );

    console.log(
      `REFERENCE: ${investigation.reference}`
    );

    console.log(
      `PARTY: ${investigation.party}`
    );

    console.log(
      `STATUS: ${investigation.findingStatus}`
    );

    console.log(
      `CATEGORY: ${investigation.category}`
    );

    console.log(
      `RISK: ${investigation.risk}`
    );

    console.log(
      `CONFIDENCE: ${
        investigation.confidence ?? "N/A"
      }`
    );

    console.log(
      `SCORE: ${
        investigation.score ?? "N/A"
      }`
    );

    console.log(
      `LEDGER: ${
        investigation.ledgerAmount !== null
          ? `₹${investigation.ledgerAmount.toFixed(2)}`
          : "N/A"
      }`
    );

    console.log(
      `BANK: ${
        investigation.bankAmount !== null
          ? `₹${investigation.bankAmount.toFixed(2)}`
          : "N/A"
      }`
    );

    console.log(
      `DIFFERENCE: ${
        investigation.difference !== null
          ? `₹${investigation.difference.toFixed(2)}`
          : "N/A"
      }`
    );

    console.log(
      "\nEXPLANATION:"
    );

    console.log(
      investigation.explanation
    );

    console.log(
      "\nPOSSIBLE REASONS:"
    );

    investigation.possibleReasons.forEach(
      (reason, index) => {
        console.log(
          `${index + 1}. ${reason}`
        );
      }
    );

    console.log(
      "\nRECOMMENDED ACTIONS:"
    );

    investigation.recommendedActions.forEach(
      (action, index) => {
        console.log(
          `${index + 1}. ${action}`
        );
      }
    );

    console.log(
      "\nNEXT ACTION:"
    );

    console.log(
      investigation.nextAction
    );

    console.log(
      "\nINVESTIGATION SUMMARY:"
    );

    console.log(
      investigation.summary
    );
  }


  // ==================================================
  // 12. TEST ONE FINDING
  // ==================================================

  console.log(
    "\n\n=============================="
  );

  console.log(
    "SINGLE FINDING TEST"
  );

  console.log(
    "=============================="
  );


  const firstInvestigation =
    investigationReport
      .investigations[0];


  if (firstInvestigation) {

    const singleResult =
      investigateFinding(
        evidenceReport.evidence[0]
      );

    console.dir(
      singleResult,
      {
        depth: null,
      }
    );

  } else {

    console.log(
      "No investigation findings available."
    );
  }


  // ==================================================
  // 13. FINAL
  // ==================================================

  console.log(
    "\n=============================="
  );

  console.log(
    "INVESTIGATION ENGINE TEST COMPLETE"
  );

  console.log(
    "=============================="
  );
}


// ==================================================
// ERROR HANDLING
// ==================================================

main().catch((error) => {

  console.error(
    "\nInvestigation engine test failed:"
  );

  console.error(error);

});
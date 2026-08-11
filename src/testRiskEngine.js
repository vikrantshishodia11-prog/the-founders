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
  investigateEvidenceReport,
} from "./investigation/investigationEngine.js";

import {
  calculateRisk,
  calculateRiskReport,
} from "./risk/riskEngine.js";


// ==================================================
// FILE PATHS
// ==================================================

const LEDGER_FILE =  "./data/ledger/ledger.xlsx";
const BANK_FILE = "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";


// ==================================================
// MAIN
// ==================================================

async function main() {

  console.log("\n");

  console.log(
    "╔══════════════════════════════════════════════════╗"
  );

  console.log(
    "║          THE FOUNDERS — RISK ENGINE              ║"
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

  console.log("\n[3] Normalizing...");

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

  console.log("\n[4] Exact matching...");

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

  console.log("\n[5] Fuzzy matching...");

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
  // 8. EVIDENCE
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
  // 9. INVESTIGATION
  // ==================================================

  console.log(
    "\n[9] Running investigation..."
  );

  const investigationReport =
    investigateEvidenceReport(
      evidenceReport
    );


  console.log(
    "Investigations:",
    investigationReport.totalInvestigations
  );


  // ==================================================
  // 10. RISK ENGINE
  // ==================================================

  console.log(
    "\n[10] Running risk engine..."
  );

  const riskReport =
    calculateRiskReport(
      investigationReport
    );


  // ==================================================
  // 11. RISK SUMMARY
  // ==================================================

  console.log(
    "\n=============================="
  );

  console.log(
    "RISK SUMMARY"
  );

  console.log(
    "=============================="
  );

  console.table(
    riskReport.summary
  );

  console.log(
    "\nTotal findings:",
    riskReport.totalFindings
  );

  console.log(
    "Total financial exposure:",
    `₹${riskReport.financialExposure.toFixed(2)}`
  );


  // ==================================================
  // 12. RISK TABLE
  // ==================================================

  console.log(
    "\n=============================="
  );

  console.log(
    "RISK FINDINGS"
  );

  console.log(
    "=============================="
  );


  console.table(
    riskReport.risks.map(
      (item) => ({
        reference:
          item.reference,

        party:
          item.party,

        status:
          item.findingStatus,

        exposure:
          item.financialExposure,

        riskScore:
          item.riskScore,

        riskLevel:
          item.riskLevel,

        priority:
          item.priority,

        confidence:
          item.confidence ?? "N/A",

        score:
          item.score ?? "N/A",
      })
    )
  );


  // ==================================================
  // 13. DETAILED RISK FINDINGS
  // ==================================================

  console.log(
    "\n=============================="
  );

  console.log(
    "DETAILED RISK ANALYSIS"
  );

  console.log(
    "=============================="
  );


  for (
    const risk
    of riskReport.risks
  ) {

    console.log("\n");

    console.log(
      "------------------------------------------"
    );

    console.log(
      `REFERENCE: ${risk.reference}`
    );

    console.log(
      `PARTY: ${risk.party}`
    );

    console.log(
      `STATUS: ${risk.findingStatus}`
    );

    console.log(
      `CATEGORY: ${risk.category}`
    );

    console.log(
      `RISK LEVEL: ${risk.riskLevel}`
    );

    console.log(
      `RISK SCORE: ${risk.riskScore}/100`
    );

    console.log(
      `PRIORITY: ${risk.priority}`
    );

    console.log(
      `FINANCIAL EXPOSURE: ₹${risk.financialExposure.toFixed(2)}`
    );

    console.log(
      `CONFIDENCE: ${risk.confidence ?? "N/A"}`
    );

    console.log(
      `MATCH SCORE: ${risk.score ?? "N/A"}`
    );


    // ----------------------------------------------
    // Risk factors
    // ----------------------------------------------

    console.log(
      "\nRISK FACTORS:"
    );

    risk.riskFactors.forEach(
      (factor, index) => {

        console.log(
          `${index + 1}. ` +
          `${factor.factor} ` +
          `(+${factor.score}) — ` +
          `${factor.description}`
        );

      }
    );


    // ----------------------------------------------
    // Recommended actions
    // ----------------------------------------------

    console.log(
      "\nRECOMMENDED ACTIONS:"
    );

    risk.recommendedActions.forEach(
      (action, index) => {

        console.log(
          `${index + 1}. ${action}`
        );

      }
    );
  }


  // ==================================================
  // 14. SINGLE FINDING TEST
  // ==================================================

  console.log(
    "\n\n=============================="
  );

  console.log(
    "SINGLE RISK TEST"
  );

  console.log(
    "=============================="
  );


  const firstInvestigation =
    investigationReport
      .investigations[0];


  if (firstInvestigation) {

    const singleRisk =
      calculateRisk(
        firstInvestigation
      );

    console.dir(
      singleRisk,
      {
        depth: null,
      }
    );

  } else {

    console.log(
      "No investigation available."
    );
  }


  // ==================================================
  // 15. FINAL
  // ==================================================

  console.log(
    "\n=============================="
  );

  console.log(
    "RISK ENGINE TEST COMPLETE"
  );

  console.log(
    "=============================="
  );
}


// ==================================================
// ERROR HANDLING
// ==================================================

main().catch(
  (error) => {

    console.error(
      "\nRisk engine test failed:"
    );

    console.error(error);

  }
);
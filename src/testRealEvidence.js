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


// ==================================================
// FILE PATHS
// ==================================================

// Change these only if your actual filenames/locations
// are different.

const LEDGER_FILE = "./data/ledger/ledger.xlsx";
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
    "║       THE FOUNDERS — REAL EVIDENCE TEST          ║"
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
    "Raw ledger transactions:",
    rawLedger.length
  );


  // ==================================================
  // 2. PARSE BANK
  // ==================================================

  console.log("\n[2] Parsing bank statement...");

  const rawBank =
    await parseBankPdf(BANK_FILE);

  console.log(
    "Raw bank transactions:",
    rawBank.length
  );


  // ==================================================
  // 3. NORMALIZE LEDGER
  // ==================================================

  console.log("\n[3] Normalizing ledger...");

  const ledgerTransactions =
    rawLedger.map(normalizeTransaction);

  console.log(
    "Normalized ledger transactions:",
    ledgerTransactions.length
  );


  // ==================================================
  // 4. NORMALIZE BANK
  // ==================================================

  console.log("\n[4] Normalizing bank...");

  const bankTransactions =
    rawBank.map(normalizeTransaction);

  console.log(
    "Normalized bank transactions:",
    bankTransactions.length
  );


  // ==================================================
  // 5. EXACT MATCHING
  // ==================================================

  console.log("\n[5] Running exact matching...");

  const exactResult = exactMatcher(
    ledgerTransactions,
    bankTransactions
  );

  console.log(
    "Exact matches:",
    exactResult.matches.length
  );

  console.log(
    "Unmatched ledger:",
    exactResult.unmatchedLedger.length
  );

  console.log(
    "Unmatched bank:",
    exactResult.unmatchedBank.length
  );


  // ==================================================
  // 6. FUZZY MATCHING
  // ==================================================

  console.log("\n[6] Running fuzzy matching...");

  const fuzzyResult = fuzzyMatcher(
    exactResult.unmatchedLedger,
    exactResult.unmatchedBank
  );

  console.log(
    "Fuzzy matches:",
    fuzzyResult.matches.length
  );

  console.log(
    "Remaining unmatched ledger:",
    fuzzyResult.unmatchedLedger.length
  );

  console.log(
    "Remaining unmatched bank:",
    fuzzyResult.unmatchedBank.length
  );


  // ==================================================
  // 7. DISCREPANCY CLASSIFICATION
  // ==================================================

  console.log("\n[7] Classifying discrepancies...");

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
  // 8. RECONCILIATION REPORT
  // ==================================================

  console.log("\n[8] Building reconciliation report...");

  const report = reconciliationReport({
    ledgerTransactions,
    bankTransactions,

    exactMatches: exactResult.matches,

    fuzzyMatches: fuzzyResult.matches,

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

  console.table(report.summary);

  console.log(
    "\nFINANCIAL IMPACT"
  );

  console.table(report.financialImpact);


  // ==================================================
  // 9. BUILD EVIDENCE
  // ==================================================

  console.log(
    "\n[9] Building evidence report..."
  );

  /*
   * IMPORTANT:
   *
   * reconciliationReport() converts the raw
   * discrepancies into "findings".
   *
   * Evidence Builder needs the original ledger/bank
   * transaction objects, so we create an evidence
   * input using the raw reconciliation findings.
   */

  const evidenceInput = {
    discrepancies: [
      ...fuzzyResult.matches,
      ...discrepancies,
    ],
  };

  const evidenceReport =
    buildEvidenceReport(evidenceInput);


  // ==================================================
  // 10. EVIDENCE SUMMARY
  // ==================================================

  console.log(
    "\n=============================="
  );

  console.log(
    "EVIDENCE SUMMARY"
  );

  console.log(
    "=============================="
  );

  console.log(
    "Total findings:",
    evidenceReport.totalFindings
  );

  console.log(
    "Critical evidence:",
    evidenceReport.summary
      .findingsWithCriticalEvidence
  );

  console.log(
    "Warnings:",
    evidenceReport.summary
      .findingsWithWarnings
  );

  console.log(
    "Requiring review:",
    evidenceReport.summary
      .findingsRequiringReview
  );


  // ==================================================
  // 11. PRINT EVIDENCE
  // ==================================================

  console.log(
    "\n=============================="
  );

  console.log(
    "REAL EVIDENCE"
  );

  console.log(
    "=============================="
  );

  console.dir(
    evidenceReport.evidence,
    {
      depth: null,
    }
  );


  // ==================================================
  // 12. FINAL
  // ==================================================

  console.log(
    "\n=============================="
  );

  console.log(
    "REAL EVIDENCE TEST COMPLETE"
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
    "\nReal evidence test failed:"
  );

  console.error(error);
});
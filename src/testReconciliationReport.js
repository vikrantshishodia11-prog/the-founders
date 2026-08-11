import parseLedgerExcel from "./parsers/ledgerExcelParser.js";
import parseBankPdf from "./parsers/bankPdfParser.js";

import normalizeTransaction from "./normalizer/normalizeTransaction.js";

import exactMatcher from "./matcher/exactMatcher.js";
import fuzzyMatcher from "./matcher/fuzzyMatcher.js";
import classifyDiscrepancies from "./matcher/discrepancyClassifier.js";

import reconciliationReport from "./report/reconciliationReport.js";
import formatReport from "./report/formatReport.js";


const ledgerPath = "./data/ledger/ledger.xlsx";

const bankPath =
  "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";


// ========================================
// 1. PARSE
// ========================================

const ledgerRaw = await parseLedgerExcel(ledgerPath);

const bankRaw = await parseBankPdf(bankPath);


// ========================================
// 2. NORMALIZE
// ========================================

const ledger = ledgerRaw.map(
  normalizeTransaction
);

const bank = bankRaw.map(
  normalizeTransaction
);


// ========================================
// 3. EXACT MATCHING
// ========================================

const exactResult = exactMatcher(
  ledger,
  bank
);


// ========================================
// 4. FUZZY MATCHING
// ========================================

const fuzzyResult = fuzzyMatcher(
  exactResult.unmatchedLedger,
  exactResult.unmatchedBank
);


// ========================================
// 5. DISCREPANCY CLASSIFICATION
// ========================================

const discrepancies = classifyDiscrepancies(
  fuzzyResult.unmatchedLedger,
  fuzzyResult.unmatchedBank
);


// ========================================
// 6. GENERATE REPORT
// ========================================

const report = reconciliationReport({
  ledgerTransactions: ledger,
  bankTransactions: bank,

  exactMatches: exactResult.matches,

  fuzzyMatches: fuzzyResult.matches,

  discrepancies,
});


// ========================================
// 7. DISPLAY REPORT
// ========================================


console.log(
  formatReport(report)
);


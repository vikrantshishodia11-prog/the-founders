import parseLedgerExcel from "./parsers/ledgerExcelParser.js";
import parseBankPdf from "./parsers/bankPdfParser.js";

import normalizeTransaction from "./normalizer/normalizeTransaction.js";

import exactMatcher from "./matcher/exactMatcher.js";
import classifyDiscrepancies from "./matcher/discrepancyClassifier.js";
import fuzzyMatcher from "./matcher/fuzzyMatcher.js";

const ledgerPath = "./data/ledger/ledger.xlsx";

const bankPath =
  "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";

// Parse
const ledgerRaw = await parseLedgerExcel(ledgerPath);
const bankRaw = await parseBankPdf(bankPath);

// Normalize
const ledger = ledgerRaw.map(normalizeTransaction);
const bank = bankRaw.map(normalizeTransaction);

// Exact matching
const matchResult = exactMatcher(ledger, bank);

// Classify remaining transactions
const fuzzyResult = fuzzyMatcher(
  matchResult.unmatchedLedger,
  matchResult.unmatchedBank
);

const discrepancies = classifyDiscrepancies(
  fuzzyResult.unmatchedLedger,
  fuzzyResult.unmatchedBank
);

console.log("\n==============================");
console.log("RECONCILIATION RESULTS");
console.log("==============================");

console.log("Exact matches:", matchResult.matches.length);

console.log(
  "Discrepancies:",
  discrepancies.length
);

console.log("\nDiscrepancies:\n");

console.dir(discrepancies, {
  depth: null,
});

console.log("\nFuzzy matches:", fuzzyResult.matches.length);

console.log("\nFuzzy matches:\n");

console.dir(fuzzyResult.matches, {
  depth: null,
});
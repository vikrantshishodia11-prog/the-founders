import parseLedgerExcel from "./parsers/ledgerExcelParser.js";
import parseBankPdf from "./parsers/bankPdfParser.js";

import normalizeTransaction from "./normalizer/normalizeTransaction.js";
import exactMatcher from "./matcher/exactMatcher.js";

const ledgerPath = "./data/ledger/ledger.xlsx";

const bankPath =
  "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";

// 1. Parse
const ledgerRaw = await parseLedgerExcel(ledgerPath);
const bankRaw = await parseBankPdf(bankPath);

// 2. Normalize
const ledger = ledgerRaw.map(normalizeTransaction);
const bank = bankRaw.map(normalizeTransaction);

// 3. Exact matching
const result = exactMatcher(ledger, bank);

console.log("\n==============================");
console.log("EXACT MATCH RESULTS");
console.log("==============================");

console.log("Ledger transactions:", ledger.length);
console.log("Bank transactions:", bank.length);

console.log("\nExact matches:", result.matches.length);

console.log(
  "Unmatched ledger:",
  result.unmatchedLedger.length
);

console.log(
  "Unmatched bank:",
  result.unmatchedBank.length
);

console.log("\nMatches:\n");

console.dir(result.matches.slice(0, 10), {
  depth: null,
});

console.log("\nUnmatched Ledger:\n");

console.dir(result.unmatchedLedger, {
  depth: null,
});

console.log("\nUnmatched Bank:\n");

console.dir(result.unmatchedBank, {
  depth: null,
});
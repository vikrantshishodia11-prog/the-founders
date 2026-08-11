import parseLedgerExcel from "./parsers/ledgerExcelParser.js";
import normalizeTransaction from "./normalizer/normalizeTransaction.js";

const filePath = "./data/ledger/ledger.xlsx";

const transactions = await parseLedgerExcel(filePath);

const normalizedTransactions = transactions.map(
  normalizeTransaction
);

console.log("Raw transactions:", transactions.length);
console.log("Normalized transactions:", normalizedTransactions.length);

console.log("\nFirst 5 normalized transactions:\n");

console.dir(normalizedTransactions.slice(0, 5), {
  depth: null,
});
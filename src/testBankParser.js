import parseBankPdf from "./parsers/bankPdfParser.js";
import normalizeTransaction from "./normalizer/normalizeTransaction.js";

const filePath =
  "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";

const transactions = await parseBankPdf(filePath);

const normalizedTransactions = transactions.map(
  normalizeTransaction
);

console.log("Raw bank transactions:", transactions.length);
console.log(
  "Normalized bank transactions:",
  normalizedTransactions.length
);

console.log("\nFirst 5 normalized bank transactions:\n");

console.dir(normalizedTransactions.slice(0, 5), {
  depth: null,
});
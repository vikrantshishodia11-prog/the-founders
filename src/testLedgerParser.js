import parseLedgerExcel from "./parsers/ledgerExcelParser.js";

const filePath = "./data/ledger/ledger.xlsx";

const transactions = await parseLedgerExcel(filePath);

console.log("Total transactions:", transactions.length);

console.dir(transactions.slice(0, 5), {
  depth: null,
});
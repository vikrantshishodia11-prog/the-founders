import ExcelJS from "exceljs";

export default async function parseLedgerExcel(filePath) {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet("Bank Ledger");

  if (!worksheet) {
    throw new Error("Bank Ledger sheet not found");
  }

  // Find the actual header row.
  let headerRowNumber = null;

  worksheet.eachRow((row, rowNumber) => {
    const values = row.values;

    if (
      values.includes("Date") &&
      values.includes("Particulars") &&
      values.includes("Vch Type") &&
      values.includes("Vch No.") &&
      values.includes("Debit") &&
      values.includes("Credit")
    ) {
      headerRowNumber = rowNumber;
    }
  });

  if (!headerRowNumber) {
    throw new Error("Ledger header row not found");
  }

  const transactions = [];

  for (
    let rowNumber = headerRowNumber + 1;
    rowNumber <= worksheet.rowCount;
    rowNumber++
  ) {
    const row = worksheet.getRow(rowNumber);

    const date = row.getCell(1).value;
    const particulars = row.getCell(2).value;
    const voucherType = row.getCell(3).value;
    const voucherNumber = row.getCell(4).value;
    const debit = row.getCell(5).value;
    const credit = row.getCell(6).value;

    // Ignore empty rows / total rows
    if (!date || !particulars) {
      continue;
    }

    const amount = debit ?? credit;

    transactions.push({
      date,
      particulars,
      voucherType,
      reference: voucherNumber,
      debit: debit ?? 0,
      credit: credit ?? 0,
      amount,
      type: debit !== null && debit !== undefined
        ? "DEBIT"
        : "CREDIT",
    });
  }

  return transactions;
}
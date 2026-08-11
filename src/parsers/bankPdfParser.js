import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

export default async function parseBankPdf(filePath) {
  const buffer = await fs.readFile(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  const lines = result.text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const transactions = [];

  for (const line of lines) {
    const match = line.match(
      /^(\d{2}-[A-Za-z]{3}-\d{4})\s+(.+?)\s+([A-Z]+(?:-[A-Z0-9]+)+)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$/
    );

    if (!match) {
      continue;
    }

    const [
      ,
      date,
      narration,
      reference,
      amount,
      balance,
    ] = match;

    transactions.push({
      date,
      particulars: narration,
      reference,
      amount: Number(amount.replace(/,/g, "")),
      balance: Number(balance.replace(/,/g, "")),
      type: null,
    });
  }

  // Determine debit/credit from balance movement.
  for (let i = 1; i < transactions.length; i++) {
    const previous = transactions[i - 1];
    const current = transactions[i];

    if (current.balance < previous.balance) {
      current.type = "DEBIT";
    } else if (current.balance > previous.balance) {
      current.type = "CREDIT";
    } else {
      current.type = "UNKNOWN";
    }
  }

  return transactions;
}
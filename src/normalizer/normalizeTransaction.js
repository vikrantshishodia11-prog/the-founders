export default function normalizeTransaction(transaction) {
  return {
    date: normalizeDate(transaction.date),

    reference: normalizeReference(transaction.reference),

    particulars: normalizeText(transaction.particulars),

    amount: normalizeAmount(transaction.amount),

    type: transaction.type,
  };
}

function normalizeDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  const date = String(value).trim();

  // Already normalized: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // Handle DD-MMM-YY and DD-MMM-YYYY
  const match = date.match(
    /^(\d{1,2})-([A-Za-z]{3})-(\d{2}|\d{4})$/
  );

  if (match) {
    const [, day, month, year] = match;

    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const normalizedYear =
      year.length === 2 ? `20${year}` : year;

    return `${normalizedYear}-${months[month]}-${day.padStart(
      2,
      "0"
    )}`;
  }

  return date;
}

function normalizeReference(value) {
  if (!value) return "";

  return String(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function normalizeText(value) {
  if (!value) return "";

  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeAmount(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return Number(Number(value).toFixed(2));
}
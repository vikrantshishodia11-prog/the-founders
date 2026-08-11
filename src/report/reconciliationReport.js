export default function reconciliationReport({
  ledgerTransactions,
  bankTransactions,
  exactMatches,
  fuzzyMatches,
  discrepancies,
}) {
  const amountDiscrepancies = fuzzyMatches.filter(
    (item) => item.status === "AMOUNT_DISCREPANCY"
  );

  const fuzzyOnlyMatches = fuzzyMatches.filter(
    (item) => item.status === "FUZZY_MATCH"
  );

  const missingBank = discrepancies.filter(
    (item) => item.status === "MISSING_BANK"
  );

  const missingLedger = discrepancies.filter(
    (item) => item.status === "MISSING_LEDGER"
  );

  // --------------------------------
  // Financial impact
  // --------------------------------

  const totalAmountDifference = Number(
    amountDiscrepancies
      .reduce(
        (total, item) => total + Math.abs(item.difference || 0),
        0
      )
      .toFixed(2)
  );

  const totalLedgerAmount = Number(
    ledgerTransactions
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      )
      .toFixed(2)
  );

  const totalBankAmount = Number(
    bankTransactions
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      )
      .toFixed(2)
  );

  // --------------------------------
  // Match percentage
  // --------------------------------

  const totalTransactions = Math.max(
    ledgerTransactions.length,
    bankTransactions.length
  );

  const exactMatchPercentage =
    totalTransactions === 0
      ? 0
      : Number(
          (
            (exactMatches.length / totalTransactions) *
            100
          ).toFixed(2)
        );

const identifiedTransactions =
  exactMatches.length +
  fuzzyOnlyMatches.length +
  amountDiscrepancies.length;

const transactionCoveragePercentage =
  totalTransactions === 0
    ? 0
    : Number(
        (
          (identifiedTransactions / totalTransactions) *
          100
        ).toFixed(2)
      );

  // --------------------------------
  // Build findings
  // --------------------------------

  const findings = [];

  // Amount discrepancies
  for (const item of amountDiscrepancies) {
    findings.push({
      status: "AMOUNT_DISCREPANCY",
      severity: getAmountSeverity(
        Math.abs(item.difference || 0)
      ),

      reference: item.ledger?.reference,
      date: item.ledger?.date,
      party: item.ledger?.particulars,

      ledgerAmount: item.ledger?.amount,
      bankAmount: item.bank?.amount,

      difference: item.difference,

      confidence: item.confidence || "LOW",
      score: item.score || 0,
    });
  }

  // Fuzzy matches
  for (const item of fuzzyOnlyMatches) {
    findings.push({
      status: "FUZZY_MATCH",
      severity: getFuzzySeverity(
        item.confidence
      ),

      reference: item.ledger?.reference,
      date: item.ledger?.date,
      party: item.ledger?.particulars,

      ledgerAmount: item.ledger?.amount,
      bankAmount: item.bank?.amount,

      difference: item.difference || 0,

      confidence: item.confidence,
      score: item.score,
    });
  }

  // Missing bank transactions
  for (const item of missingBank) {
    findings.push({
      status: "MISSING_BANK",
      severity: "HIGH",

      reference: item.ledger?.reference,
      date: item.ledger?.date,
      party: item.ledger?.particulars,

      ledgerAmount: item.ledger?.amount,
      bankAmount: null,

      difference: null,

      confidence: null,
      score: null,
    });
  }

  // Missing ledger transactions
  for (const item of missingLedger) {
    findings.push({
      status: "MISSING_LEDGER",
      severity: "MEDIUM",

      reference: item.bank?.reference,
      date: item.bank?.date,
      party: item.bank?.particulars,

      ledgerAmount: null,
      bankAmount: item.bank?.amount,

      difference: null,

      confidence: null,
      score: null,
    });
  }

  // --------------------------------
  // Final report
  // --------------------------------

  return {
    summary: {
      totalLedgerTransactions:
        ledgerTransactions.length,

      totalBankTransactions:
        bankTransactions.length,

      exactMatches:
        exactMatches.length,

      fuzzyMatches:
        fuzzyOnlyMatches.length,

      amountDiscrepancies:
        amountDiscrepancies.length,

      missingBank:
        missingBank.length,

      missingLedger:
        missingLedger.length,

      totalFindings:
        findings.length,

      exactMatchPercentage,

      transactionCoveragePercentage,
    },

    financialImpact: {
      totalLedgerAmount,
      totalBankAmount,
      totalAmountDifference,
    },

    findings,
  };
}


// --------------------------------
// Severity helpers
// --------------------------------

function getAmountSeverity(amount) {
  if (amount >= 100000) {
    return "CRITICAL";
  }

  if (amount >= 10000) {
    return "HIGH";
  }

  if (amount >= 1000) {
    return "MEDIUM";
  }

  return "LOW";
}


function getFuzzySeverity(confidence) {
  if (confidence === "HIGH") {
    return "LOW";
  }

  if (confidence === "MEDIUM") {
    return "MEDIUM";
  }

  return "REVIEW";
}
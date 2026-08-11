export default function classifyDiscrepancies(
  unmatchedLedger,
  unmatchedBank
) {
  const discrepancies = [];

  const usedBankIndexes = new Set();

  for (const ledger of unmatchedLedger) {
    let matchedBankIndex = -1;

    // First look for same date + reference
    matchedBankIndex = unmatchedBank.findIndex(
      (bank, index) =>
        !usedBankIndexes.has(index) &&
        bank.date === ledger.date &&
        bank.reference === ledger.reference
    );

    if (matchedBankIndex !== -1) {
      const bank = unmatchedBank[matchedBankIndex];

      usedBankIndexes.add(matchedBankIndex);

      discrepancies.push({
        status: "DISCREPANCY_AMOUNT",
        ledger,
        bank,
        difference: Number(
          (bank.amount - ledger.amount).toFixed(2)
        ),
      });

      continue;
    }

    // No corresponding bank transaction found
    discrepancies.push({
      status: "MISSING_BANK",
      ledger,
      bank: null,
      difference: null,
    });
  }

  // Remaining bank transactions
  unmatchedBank.forEach((bank, index) => {
    if (usedBankIndexes.has(index)) {
      return;
    }

    discrepancies.push({
      status: "MISSING_LEDGER",
      ledger: null,
      bank,
      difference: null,
    });
  });

  return discrepancies;
}
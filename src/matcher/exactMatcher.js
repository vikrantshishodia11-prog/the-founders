export default function exactMatcher(ledgerTransactions, bankTransactions) {
  const matches = [];
  const unmatchedLedger = [];
  const unmatchedBank = [];

  const bankMap = new Map();

  // Create lookup map for bank transactions
  for (const bank of bankTransactions) {
    const key = createMatchKey(bank);

    if (!bankMap.has(key)) {
      bankMap.set(key, []);
    }

    bankMap.get(key).push(bank);
  }

  // Match every ledger transaction
  for (const ledger of ledgerTransactions) {
    const key = createMatchKey(ledger);

    const candidates = bankMap.get(key);

    if (candidates && candidates.length > 0) {
      const bank = candidates.shift();

      matches.push({
        ledger,
        bank,
        status: "EXACT_MATCH",
      });
    } else {
      unmatchedLedger.push(ledger);
    }
  }

  // Whatever remains in bankMap is unmatched bank data
  for (const transactions of bankMap.values()) {
    for (const bank of transactions) {
      unmatchedBank.push(bank);
    }
  }

  return {
    matches,
    unmatchedLedger,
    unmatchedBank,
  };
}

function createMatchKey(transaction) {
  return [
    transaction.date,
    transaction.reference,
    transaction.amount.toFixed(2),
  ].join("|");
}
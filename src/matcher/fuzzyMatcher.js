export default function fuzzyMatcher(
  unmatchedLedger,
  unmatchedBank
) {
  const matches = [];
  const remainingLedger = [];
  const usedBankIndexes = new Set();

  for (const ledger of unmatchedLedger) {
    let bestMatch = null;
    let bestScore = 0;
    let bestBankIndex = -1;

    unmatchedBank.forEach((bank, index) => {
      if (usedBankIndexes.has(index)) {
        return;
      }

      const score = calculateScore(ledger, bank);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = bank;
        bestBankIndex = index;
      }
    });

    if (bestMatch && bestScore >= 70) {
      usedBankIndexes.add(bestBankIndex);

      const amountDifference = Number(
        (bestMatch.amount - ledger.amount).toFixed(2)
      );

      const status =
        amountDifference !== 0
          ? "AMOUNT_DISCREPANCY"
          : "FUZZY_MATCH";

      matches.push({
        ledger,
        bank: bestMatch,
        score: bestScore,
        confidence: getConfidence(bestScore),
        status,
        difference: amountDifference,
      });
    } else {
      remainingLedger.push(ledger);
    }
  }

  const remainingBank = unmatchedBank.filter(
    (_, index) => !usedBankIndexes.has(index)
  );

  return {
    matches,
    unmatchedLedger: remainingLedger,
    unmatchedBank: remainingBank,
  };
}


/**
 * Calculate similarity score between
 * a ledger transaction and a bank transaction.
 */
function calculateScore(ledger, bank) {
  let score = 0;

  // --------------------------------
  // 1. Reference similarity - 40
  // --------------------------------

  const referenceScore = stringSimilarity(
    ledger.reference,
    bank.reference
  );

  score += referenceScore * 40;


  // --------------------------------
  // 2. Particulars similarity - 25
  // --------------------------------

  const particularsScore = stringSimilarity(
    ledger.particulars,
    bank.particulars
  );

  score += particularsScore * 25;


  // --------------------------------
  // 3. Amount similarity - 25
  // --------------------------------

  if (ledger.amount === bank.amount) {
    score += 25;
  } else {
    const difference = Math.abs(
      ledger.amount - bank.amount
    );

    if (difference <= 1) {
      score += 20;
    } else if (difference <= 100) {
      score += 10;
    }
  }


  // --------------------------------
  // 4. Date proximity - 10
  // --------------------------------

  const dateDifference = daysBetween(
    ledger.date,
    bank.date
  );

  if (dateDifference === 0) {
    score += 10;
  } else if (dateDifference <= 1) {
    score += 7;
  } else if (dateDifference <= 3) {
    score += 4;
  }

  return Math.round(score);
}


/**
 * Convert score into confidence level.
 */
function getConfidence(score) {
  if (score >= 90) {
    return "HIGH";
  }

  if (score >= 80) {
    return "MEDIUM";
  }

  return "LOW";
}


/**
 * Compare two strings.
 */
function stringSimilarity(a, b) {
  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  if (a.includes(b) || b.includes(a)) {
    return 0.9;
  }

  const distance = levenshtein(a, b);

  const maxLength = Math.max(
    a.length,
    b.length
  );

  if (maxLength === 0) {
    return 1;
  }

  return 1 - distance / maxLength;
}


/**
 * Calculate Levenshtein distance.
 */
function levenshtein(a, b) {
  const matrix = Array.from(
    { length: b.length + 1 },
    () => []
  );

  // First column
  for (let i = 0; i <= b.length; i++) {
    matrix[i][0] = i;
  }

  // First row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate distance
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] =
          matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
      }
    }
  }

  return matrix[b.length][a.length];
}


/**
 * Calculate difference between two dates.
 */
function daysBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);

  const difference =
    Math.abs(b - a) /
    (1000 * 60 * 60 * 24);

  return difference;
}
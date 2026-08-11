export default function aiEngine({
  riskFindings = [],
  investigations = [],
  evidenceFindings = [],
}) {
  const analyses = riskFindings.map((risk) => {
    const investigation = investigations.find(
      (item) => item.reference === risk.reference
    );

    const evidence = evidenceFindings.find(
      (item) => item.reference === risk.reference
    );

    return analyzeFinding({
      risk,
      investigation,
      evidence,
    });
  });

  return {
    totalAnalyses: analyses.length,
    analyses,
  };
}

function analyzeFinding({
  risk,
  investigation,
  evidence,
}) {
  const status = risk.findingStatus;
  const riskLevel = risk.riskLevel;
  const exposure = risk.financialExposure || 0;

  const explanation = generateExplanation(
    status,
    risk,
    investigation
  );

  const possibleReasons = generatePossibleReasons(
    status
  );

  const questions = generateQuestions(
    status
  );

  const recommendedAction = generateAction(
    status,
    riskLevel
  );

  return {
    reference: risk.reference,
    date: risk.date,
    party: risk.party,

    findingStatus: status,
    riskLevel,
    riskScore: risk.riskScore,
    priority: risk.priority,

    financialExposure: exposure,

    explanation,

    possibleReasons,

    questions,

    recommendedAction,

    evidenceAvailable: Boolean(evidence),

    aiStatus: "RULE_BASED_ANALYSIS",
  };
}

// ----------------------------------------
// Explanation
// ----------------------------------------

function generateExplanation(
  status,
  risk,
  investigation
) {
  switch (status) {
    case "AMOUNT_DISCREPANCY":
      return (
        `The ledger and bank transaction appear to refer ` +
        `to the same transaction, but the recorded amounts differ ` +
        `by ₹${Math.abs(risk.difference || 0).toFixed(2)}. ` +
        `The ledger amount is ₹${(risk.ledgerAmount || 0).toFixed(2)} ` +
        `while the bank amount is ₹${(risk.bankAmount || 0).toFixed(2)}.`
      );

    case "FUZZY_MATCH":
      return (
        `The transaction was not an exact match but was identified ` +
        `as a probable match using reference, party, amount and ` +
        `date similarity. The matching confidence is ${risk.confidence}.`
      );

    case "MISSING_BANK":
      return (
        `A transaction exists in the ledger but no corresponding ` +
        `transaction was found in the bank statement. ` +
        `The financial exposure is ₹${(risk.financialExposure || 0).toFixed(2)}.`
      );

    case "MISSING_LEDGER":
      return (
        `A transaction exists in the bank statement but no ` +
        `corresponding transaction was found in the ledger. ` +
        `The bank transaction should be reviewed and potentially ` +
        `recorded in the ledger.`
      );

    default:
      return "The transaction requires review.";
  }
}

// ----------------------------------------
// Possible reasons
// ----------------------------------------

function generatePossibleReasons(status) {
  switch (status) {
    case "AMOUNT_DISCREPANCY":
      return [
        "Incorrect amount recorded in the ledger.",
        "Bank transaction may include an adjustment or deduction.",
        "Invoice or voucher amount may differ from the actual payment.",
        "Transaction may have been partially settled.",
      ];

    case "FUZZY_MATCH":
      return [
        "Transaction date may differ because of bank processing time.",
        "Reference number may have formatting differences.",
        "Transaction appears to represent the same underlying transaction.",
      ];

    case "MISSING_BANK":
      return [
        "Transaction may not have cleared the bank yet.",
        "Cheque may be pending or cancelled.",
        "Bank statement period may not contain the transaction.",
        "Ledger entry may have been recorded incorrectly.",
      ];

    case "MISSING_LEDGER":
      return [
        "Transaction may not have been entered into the ledger.",
        "Bank charges or interest may have been omitted.",
        "Transaction may have been posted under another reference.",
        "Ledger may require an adjustment entry.",
      ];

    default:
      return [];
  }
}

// ----------------------------------------
// Questions for CA
// ----------------------------------------

function generateQuestions(status) {
  switch (status) {
    case "AMOUNT_DISCREPANCY":
      return [
        "Does the invoice amount agree with the ledger?",
        "Does the bank debit/credit agree with the supporting document?",
        "Is there a bank charge, deduction or adjustment?",
        "Which amount should be treated as the correct accounting amount?",
      ];

    case "FUZZY_MATCH":
      return [
        "Does this transaction represent the same business transaction?",
        "Is the date difference explained by bank processing?",
        "Can the supporting voucher confirm the match?",
      ];

    case "MISSING_BANK":
      return [
        "Has the transaction cleared the bank?",
        "Is the cheque still outstanding?",
        "Was the cheque cancelled or reissued?",
        "Can the bank statement for the subsequent period confirm clearance?",
      ];

    case "MISSING_LEDGER":
      return [
        "Was this transaction intentionally omitted from the ledger?",
        "Does a corresponding accounting entry exist under another reference?",
        "Is a new journal or payment entry required?",
      ];

    default:
      return [];
  }
}

// ----------------------------------------
// Recommended action
// ----------------------------------------

function generateAction(status, riskLevel) {
  if (
    status === "MISSING_BANK" &&
    riskLevel === "CRITICAL"
  ) {
    return (
      "Immediate CA review. Verify the underlying " +
      "transaction documents and confirm whether the " +
      "transaction has cleared the bank."
    );
  }

  if (status === "AMOUNT_DISCREPANCY") {
    return (
      "Compare the invoice, voucher, ledger entry and " +
      "bank transaction and identify the reason for the amount difference."
    );
  }

  if (status === "FUZZY_MATCH") {
    return (
      "Review the supporting evidence and confirm that " +
      "the fuzzy match represents the same transaction."
    );
  }

  if (status === "MISSING_BANK") {
    return (
      "Verify supporting documents and check whether " +
      "the transaction has cleared the bank."
    );
  }

  if (status === "MISSING_LEDGER") {
    return (
      "Search the ledger for an equivalent transaction " +
      "and determine whether an accounting entry is required."
    );
  }

  return "Review the transaction.";
}
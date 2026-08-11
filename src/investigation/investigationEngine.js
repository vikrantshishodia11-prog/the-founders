/**
 * THE FOUNDERS
 * Investigation Engine
 *
 * Converts structured reconciliation evidence
 * into an investigation that a CA can review.
 *
 * IMPORTANT:
 * This is deterministic logic.
 * No AI is used here yet.
 *
 * AI will come later as an explanation/reasoning layer.
 */

// --------------------------------------------------
// Main function
// --------------------------------------------------

export function investigateFinding(evidenceItem) {
  if (!evidenceItem) {
    throw new Error("Evidence item is required.");
  }

  const {
    findingStatus,
    reference,
    date,
    party,
    ledgerAmount,
    bankAmount,
    difference,
    confidence,
    score,
    evidence = [],
  } = evidenceItem;

  // ------------------------------------------------
  // Determine investigation
  // ------------------------------------------------

  let category = "GENERAL_REVIEW";
  let risk = "MEDIUM";
  let explanation = "";
  let possibleReasons = [];
  let recommendedActions = [];

  // ==================================================
  // 1. AMOUNT DISCREPANCY
  // ==================================================

  if (findingStatus === "AMOUNT_DISCREPANCY") {
    category = "AMOUNT_VARIANCE";

    const absoluteDifference = Math.abs(
      difference || 0
    );

    // Determine risk from amount difference
    if (absoluteDifference >= 100000) {
      risk = "CRITICAL";
    } else if (absoluteDifference >= 10000) {
      risk = "HIGH";
    } else if (absoluteDifference >= 1000) {
      risk = "MEDIUM";
    } else {
      risk = "LOW";
    }

    explanation =
      `The ledger and bank records appear to refer to ` +
      `the same transaction, but the recorded amounts differ by ` +
      `₹${absoluteDifference.toFixed(2)}.`;

    possibleReasons = [
      "Ledger amount may have been recorded incorrectly.",
      "Bank payment may include an additional amount.",
      "Payment adjustment or settlement may have been recorded separately.",
      "Supporting payment voucher should be reviewed.",
    ];

    recommendedActions = [
      "Review the original invoice.",
      "Review the payment voucher.",
      "Compare the bank transaction with the accounting entry.",
      "Verify whether an additional adjustment exists.",
    ];
  }

  // ==================================================
  // 2. MISSING FROM BANK
  // ==================================================

  else if (findingStatus === "MISSING_BANK") {
    category = "MISSING_BANK_TRANSACTION";

    risk = "HIGH";

    explanation =
      "A transaction exists in the ledger, but a " +
      "corresponding transaction was not found in the bank statement.";

    possibleReasons = [
      "Transaction may not have cleared the bank yet.",
      "Cheque may still be outstanding.",
      "Bank statement period may not include the transaction.",
      "Transaction may have been incorrectly recorded in the ledger.",
      "Reference or transaction details may differ in the bank statement.",
    ];

    recommendedActions = [
      "Verify the bank statement for the surrounding dates.",
      "Check whether the payment has cleared.",
      "Review the payment voucher.",
      "For cheque transactions, verify cheque status.",
      "Confirm the transaction with the client if required.",
    ];
  }

  // ==================================================
  // 3. MISSING FROM LEDGER
  // ==================================================

  else if (findingStatus === "MISSING_LEDGER") {
    category = "MISSING_LEDGER_TRANSACTION";

    risk = "MEDIUM";

    explanation =
      "A transaction appears in the bank statement, " +
      "but no corresponding ledger entry was found.";

    possibleReasons = [
      "Transaction may not have been posted to the ledger.",
      "Bank charge or interest may not have been recorded.",
      "Transaction may have been posted under a different reference.",
      "Accounting entry may be pending.",
    ];

    recommendedActions = [
      "Review the bank transaction.",
      "Search the ledger for the same amount and party.",
      "Check whether the transaction requires an accounting entry.",
      "Post or correct the ledger entry if appropriate.",
    ];
  }

  // ==================================================
  // 4. FUZZY MATCH
  // ==================================================

  else if (findingStatus === "FUZZY_MATCH") {
    category = "FUZZY_TRANSACTION_MATCH";

    if (confidence === "HIGH") {
      risk = "LOW";
    } else if (confidence === "MEDIUM") {
      risk = "MEDIUM";
    } else {
      risk = "HIGH";
    }

    explanation =
      "The ledger and bank transactions appear to " +
      "represent the same transaction, but one or more " +
      "transaction attributes differ.";

    possibleReasons = [
      "Reference format may differ between systems.",
      "Transaction dates may differ because of processing or settlement.",
      "Bank and ledger descriptions may use different formats.",
      "Reference may contain an additional suffix or prefix.",
    ];

    recommendedActions = [
      "Review the matching evidence.",
      "Confirm the transaction reference.",
      "Verify the transaction date.",
      "Approve the match if the supporting evidence is sufficient.",
    ];
  }

  // ==================================================
  // 5. UNKNOWN / GENERAL
  // ==================================================

  else {
    explanation =
      "The transaction requires manual review because " +
      "the finding type is not recognized by the investigation engine.";

    possibleReasons = [
      "Additional transaction information may be required.",
      "The finding may require manual investigation.",
    ];

    recommendedActions = [
      "Review the available evidence.",
      "Inspect the original transaction documents.",
      "Add a review note.",
    ];
  }

  // --------------------------------------------------
  // Evidence analysis
  // --------------------------------------------------

  const confirmedEvidence = evidence.filter(
    (item) => item.status === "CONFIRMED"
  );

  const warningEvidence = evidence.filter(
    (item) => item.status === "WARNING"
  );

  const criticalEvidence = evidence.filter(
    (item) => item.status === "CRITICAL"
  );

  const reviewEvidence = evidence.filter(
    (item) => item.status === "REVIEW"
  );

  // --------------------------------------------------
  // Investigation summary
  // --------------------------------------------------

  const investigationSummary =
    buildInvestigationSummary({
      findingStatus,
      reference,
      party,
      risk,
      difference,
      confirmedEvidence,
      warningEvidence,
      criticalEvidence,
      reviewEvidence,
    });

  // --------------------------------------------------
  // Final investigation object
  // --------------------------------------------------

  return {
    reference,
    date,
    party,

    findingStatus,

    category,

    risk,

    confidence:
      confidence ?? null,

    score:
      score ?? null,

    ledgerAmount:
      ledgerAmount ?? null,

    bankAmount:
      bankAmount ?? null,

    difference:
      difference ?? null,

    explanation,

    possibleReasons,

    recommendedActions,

    evidence: {
      confirmed: confirmedEvidence,
      warnings: warningEvidence,
      critical: criticalEvidence,
      review: reviewEvidence,
    },

    summary: investigationSummary,

    nextAction:
      recommendedActions[0] || "Manual review required.",
  };
}


// --------------------------------------------------
// Investigate complete evidence report
// --------------------------------------------------

export function investigateEvidenceReport(
  evidenceReport
) {
  if (!evidenceReport) {
    throw new Error(
      "Evidence report is required."
    );
  }

  const evidence =
    evidenceReport.evidence || [];

  const investigations =
    evidence.map(investigateFinding);

  return {
    totalInvestigations:
      investigations.length,

    investigations,

    summary: {
      critical: investigations.filter(
        (item) => item.risk === "CRITICAL"
      ).length,

      high: investigations.filter(
        (item) => item.risk === "HIGH"
      ).length,

      medium: investigations.filter(
        (item) => item.risk === "MEDIUM"
      ).length,

      low: investigations.filter(
        (item) => item.risk === "LOW"
      ).length,
    },
  };
}


// --------------------------------------------------
// Build human-readable investigation summary
// --------------------------------------------------

function buildInvestigationSummary({
  findingStatus,
  reference,
  party,
  risk,
  difference,
  confirmedEvidence,
  warningEvidence,
  criticalEvidence,
  reviewEvidence,
}) {
  const parts = [];

  if (reference) {
    parts.push(`Reference ${reference}`);
  }

  if (party) {
    parts.push(`Party ${party}`);
  }

  parts.push(`Finding ${findingStatus}`);

  if (difference !== null && difference !== undefined) {
    parts.push(
      `Difference ₹${Math.abs(difference).toFixed(2)}`
    );
  }

  parts.push(`Risk ${risk}`);

  parts.push(
    `${confirmedEvidence.length} confirmed evidence item(s)`
  );

  if (warningEvidence.length > 0) {
    parts.push(
      `${warningEvidence.length} warning(s)`
    );
  }

  if (criticalEvidence.length > 0) {
    parts.push(
      `${criticalEvidence.length} critical evidence item(s)`
    );
  }

  if (reviewEvidence.length > 0) {
    parts.push(
      `${reviewEvidence.length} item(s) require review`
    );
  }

  return parts.join(" | ");
}
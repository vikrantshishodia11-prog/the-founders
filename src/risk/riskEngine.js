/**
 * THE FOUNDERS
 * Risk Engine v2
 *
 * Deterministic audit-risk scoring.
 *
 * The Risk Engine does NOT decide whether fraud occurred.
 * It prioritizes findings for human/CA review.
 */

export function calculateRisk(investigation) {
  if (!investigation) {
    throw new Error("Investigation is required.");
  }

  const {
    reference,
    date,
    party,
    findingStatus,
    category,
    investigationRisk,
    confidence,
    score,
    ledgerAmount,
    bankAmount,
    difference,
    evidence = {},
  } = investigation;

  // -----------------------------------------------
  // 1. Financial exposure
  // -----------------------------------------------

  const financialExposure =
    calculateFinancialExposure({
      findingStatus,
      ledgerAmount,
      bankAmount,
      difference,
    });

  // -----------------------------------------------
  // 2. Risk components
  // -----------------------------------------------

  const findingRisk =
    calculateFindingRisk(findingStatus);

  const amountRisk =
    calculateAmountRisk(financialExposure);

  const evidenceRisk =
    calculateEvidenceRisk(evidence);

  const confidenceRisk =
    calculateConfidenceRisk({
      findingStatus,
      confidence,
      score,
    });

  // -----------------------------------------------
  // 3. Special adjustment
  // -----------------------------------------------

  const specialAdjustment =
    calculateSpecialAdjustment({
      findingStatus,
      financialExposure,
      confidence,
      score,
    });

  // -----------------------------------------------
  // 4. Final score
  // -----------------------------------------------

  const riskScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        findingRisk +
        amountRisk +
        evidenceRisk +
        confidenceRisk +
        specialAdjustment
      )
    )
  );

  // -----------------------------------------------
  // 5. Risk level
  // -----------------------------------------------

  const riskLevel =
    getRiskLevel(riskScore);

  // -----------------------------------------------
  // 6. Priority
  // -----------------------------------------------

  const priority =
    getPriority(riskLevel);

  // -----------------------------------------------
  // 7. Risk factors
  // -----------------------------------------------

  const riskFactors =
    buildRiskFactors({
      findingStatus,
      financialExposure,
      findingRisk,
      amountRisk,
      evidenceRisk,
      confidenceRisk,
      specialAdjustment,
      confidence,
      score,
    });

  // -----------------------------------------------
  // 8. Recommended actions
  // -----------------------------------------------

  const recommendedActions =
    buildRiskActions({
      findingStatus,
      riskLevel,
      financialExposure,
    });

  return {
    reference,
    date,
    party,

    findingStatus,
    category,

    investigationRisk:
      investigationRisk ?? null,

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

    financialExposure,

    riskScore,

    riskLevel,

    priority,

    riskFactors,

    recommendedActions,
  };
}


// ==================================================
// FINANCIAL EXPOSURE
// ==================================================

function calculateFinancialExposure({
  findingStatus,
  ledgerAmount,
  bankAmount,
  difference,
}) {

  // For an amount discrepancy,
  // only the difference is exposure.
  if (
    findingStatus === "AMOUNT_DISCREPANCY"
  ) {
    return Math.abs(
      Number(difference || 0)
    );
  }

  // A fuzzy match with the same amount
  // has no unresolved monetary exposure.
  if (
    findingStatus === "FUZZY_MATCH"
  ) {
    return Math.abs(
      Number(difference || 0)
    );
  }

  // Ledger transaction missing from bank.
  if (
    findingStatus === "MISSING_BANK"
  ) {
    return Math.abs(
      Number(ledgerAmount || 0)
    );
  }

  // Bank transaction missing from ledger.
  if (
    findingStatus === "MISSING_LEDGER"
  ) {
    return Math.abs(
      Number(bankAmount || 0)
    );
  }

  return 0;
}


// ==================================================
// FINDING TYPE RISK
// ==================================================

function calculateFindingRisk(
  findingStatus
) {

  switch (findingStatus) {

    case "MISSING_BANK":
      return 35;

    case "MISSING_LEDGER":
      return 25;

    case "AMOUNT_DISCREPANCY":
      return 25;

    case "FUZZY_MATCH":
      return 5;

    default:
      return 15;
  }
}


// ==================================================
// FINANCIAL AMOUNT RISK
// ==================================================

function calculateAmountRisk(
  amount
) {

  if (amount >= 100000) {
    return 35;
  }

  if (amount >= 50000) {
    return 25;
  }

  if (amount >= 25000) {
    return 18;
  }

  if (amount >= 10000) {
    return 12;
  }

  if (amount >= 5000) {
    return 8;
  }

  if (amount >= 1000) {
    return 5;
  }

  if (amount > 0) {
    return 2;
  }

  return 0;
}


// ==================================================
// EVIDENCE RISK
// ==================================================

function calculateEvidenceRisk(
  evidence
) {

  const critical =
    Array.isArray(evidence.critical)
      ? evidence.critical.length
      : 0;

  const warnings =
    Array.isArray(evidence.warnings)
      ? evidence.warnings.length
      : 0;

  const review =
    Array.isArray(evidence.review)
      ? evidence.review.length
      : 0;

  let score = 0;

  score += critical * 15;
  score += warnings * 4;
  score += review * 5;

  return Math.min(
    score,
    25
  );
}


// ==================================================
// CONFIDENCE RISK
// ==================================================

function calculateConfidenceRisk({
  findingStatus,
  confidence,
  score,
}) {

  // A high-confidence fuzzy match with
  // zero financial difference should have
  // very little risk.
  if (
    findingStatus === "FUZZY_MATCH" &&
    confidence === "HIGH" &&
    Number(score || 0) >= 90
  ) {
    return 0;
  }

  if (
    confidence === "HIGH"
  ) {
    return 2;
  }

  if (
    confidence === "MEDIUM"
  ) {
    return 5;
  }

  if (
    confidence === "LOW"
  ) {
    return 8;
  }

  // Missing transactions have no matching
  // confidence, so don't add artificial risk.
  return 0;
}


// ==================================================
// SPECIAL ADJUSTMENTS
// ==================================================

function calculateSpecialAdjustment({
  findingStatus,
  financialExposure,
  confidence,
  score,
}) {

  // High-confidence fuzzy match with
  // zero difference = very low concern.
  if (
    findingStatus === "FUZZY_MATCH" &&
    financialExposure === 0 &&
    confidence === "HIGH"
  ) {
    return -5;
  }

  // A low-confidence amount discrepancy
  // deserves additional review attention.
  if (
    findingStatus === "AMOUNT_DISCREPANCY" &&
    confidence === "LOW"
  ) {
    return 5;
  }

  return 0;
}


// ==================================================
// RISK LEVEL
// ==================================================

function getRiskLevel(
  score
) {

  if (score >= 75) {
    return "CRITICAL";
  }

  if (score >= 50) {
    return "HIGH";
  }

  if (score >= 25) {
    return "MEDIUM";
  }

  return "LOW";
}


// ==================================================
// PRIORITY
// ==================================================

function getPriority(
  riskLevel
) {

  switch (riskLevel) {

    case "CRITICAL":
      return 1;

    case "HIGH":
      return 2;

    case "MEDIUM":
      return 3;

    case "LOW":
      return 4;

    default:
      return 5;
  }
}


// ==================================================
// RISK FACTORS
// ==================================================

function buildRiskFactors({
  findingStatus,
  financialExposure,
  findingRisk,
  amountRisk,
  evidenceRisk,
  confidenceRisk,
  specialAdjustment,
  confidence,
  score,
}) {

  const factors = [];

  factors.push({
    factor: "FINDING_TYPE",
    score: findingRisk,
    description:
      `${findingStatus} finding`,
  });


  if (
    financialExposure > 0
  ) {

    factors.push({
      factor:
        financialExposure >= 100000
          ? "HIGH_FINANCIAL_EXPOSURE"
          : "FINANCIAL_EXPOSURE",

      score: amountRisk,

      description:
        `Financial exposure is ₹${financialExposure.toFixed(2)}`,
    });
  }


  if (
    evidenceRisk > 0
  ) {

    factors.push({
      factor:
        "EVIDENCE_RISK",

      score:
        evidenceRisk,

      description:
        "Evidence contains warnings, critical items, or review items.",
    });
  }


  if (
    confidenceRisk > 0
  ) {

    factors.push({
      factor:
        "MATCH_CONFIDENCE",

      score:
        confidenceRisk,

      description:
        `Matching confidence is ${confidence || "UNKNOWN"}${score !== null && score !== undefined ? ` with score ${score}` : ""}.`,
    });
  }


  if (
    specialAdjustment !== 0
  ) {

    factors.push({
      factor:
        "SPECIAL_ADJUSTMENT",

      score:
        specialAdjustment,

      description:
        specialAdjustment < 0
          ? "High-confidence fuzzy match with no financial difference."
          : "Additional review required because matching confidence is low.",
    });
  }


  return factors;
}


// ==================================================
// RECOMMENDED ACTIONS
// ==================================================

function buildRiskActions({
  findingStatus,
  riskLevel,
  financialExposure,
}) {

  const actions = [];


  if (
    riskLevel === "CRITICAL"
  ) {

    actions.push(
      "Immediate CA review required."
    );

    actions.push(
      "Verify the underlying transaction documents."
    );

    actions.push(
      "Do not close the finding until supporting evidence is reviewed."
    );

  } else if (
    riskLevel === "HIGH"
  ) {

    actions.push(
      "Prioritize this finding for CA review."
    );

    actions.push(
      "Verify the supporting transaction documents."
    );

    actions.push(
      "Confirm the transaction with the relevant records."
    );

  } else if (
    riskLevel === "MEDIUM"
  ) {

    actions.push(
      "Review the finding during the reconciliation workflow."
    );

    actions.push(
      "Verify the relevant supporting document."
    );

  } else {

    actions.push(
      "Review during normal reconciliation workflow."
    );
  }


  // -----------------------------------------------
  // Finding-specific actions
  // -----------------------------------------------

  if (
    findingStatus === "MISSING_BANK"
  ) {

    actions.push(
      "Check whether the transaction has cleared the bank."
    );

    actions.push(
      "For cheque transactions, verify cheque status."
    );
  }


  if (
    findingStatus === "MISSING_LEDGER"
  ) {

    actions.push(
      "Search the ledger for an equivalent transaction."
    );

    actions.push(
      "Determine whether a new accounting entry is required."
    );
  }


  if (
    findingStatus === "AMOUNT_DISCREPANCY"
  ) {

    actions.push(
      `Verify the ₹${financialExposure.toFixed(2)} amount difference.`
    );

    actions.push(
      "Compare the invoice, voucher, and bank transaction."
    );
  }


  if (
    findingStatus === "FUZZY_MATCH"
  ) {

    actions.push(
      "Confirm that the fuzzy match represents the same transaction."
    );
  }


  return actions;
}


// ==================================================
// COMPLETE RISK REPORT
// ==================================================

export function calculateRiskReport(
  investigationReport
) {

  if (!investigationReport) {
    throw new Error(
      "Investigation report is required."
    );
  }

  const investigations =
    investigationReport.investigations || [];

  const risks =
    investigations.map(
      calculateRisk
    );


  const financialExposure =
    risks
      .reduce(
        (total, item) =>
          total +
          item.financialExposure,
        0
      );


  return {

    totalFindings:
      risks.length,

    risks,

    summary: {

      critical:
        risks.filter(
          item =>
            item.riskLevel === "CRITICAL"
        ).length,

      high:
        risks.filter(
          item =>
            item.riskLevel === "HIGH"
        ).length,

      medium:
        risks.filter(
          item =>
            item.riskLevel === "MEDIUM"
        ).length,

      low:
        risks.filter(
          item =>
            item.riskLevel === "LOW"
        ).length,
    },

    financialExposure:
      Number(
        financialExposure.toFixed(2)
      ),
  };
}
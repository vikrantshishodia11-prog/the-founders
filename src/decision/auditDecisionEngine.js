export default function auditDecisionEngine({
  aiAnalyses = [],
  riskFindings = [],
  evidenceFindings = [],
}) {
  const decisions = [];

  for (const ai of aiAnalyses) {
    const risk = findRisk(ai, riskFindings);
    const evidence = findEvidence(ai, evidenceFindings);

    const decision = buildDecision({
      ai,
      risk,
      evidence,
    });

    decisions.push(decision);
  }

  return {
    totalDecisions: decisions.length,

    summary: buildSummary(decisions),

    decisions,
  };
}


// ==================================================
// FIND RISK
// ==================================================

function findRisk(ai, riskFindings) {
  return riskFindings.find(
    (item) =>
      item.reference === ai.reference
  ) || null;
}


// ==================================================
// FIND EVIDENCE
// ==================================================

function findEvidence(ai, evidenceFindings) {
  return evidenceFindings.find(
    (item) =>
      item.reference === ai.reference
  ) || null;
}


// ==================================================
// BUILD DECISION
// ==================================================

function buildDecision({
  ai,
  risk,
  evidence,
}) {

  const riskLevel =
    ai.riskLevel ||
    risk?.riskLevel ||
    "LOW";

  const riskScore =
    ai.riskScore ??
    risk?.riskScore ??
    0;

  const exposure =
    ai.financialExposure ??
    0;

  const priority =
    determinePriority({
      riskLevel,
      riskScore,
      exposure,
      findingStatus:
        ai.findingStatus,
    });


  const requiredEvidence =
    determineRequiredEvidence(
      ai.findingStatus
    );


  const decision =
    determineDecision({
      findingStatus:
        ai.findingStatus,

      riskLevel,

      evidence,
    });


  const owner =
    determineOwner(
      ai.findingStatus
    );


  return {

    reference:
      ai.reference,

    date:
      ai.date,

    party:
      ai.party,

    findingStatus:
      ai.findingStatus,

    priority,

    riskLevel,

    riskScore,

    financialExposure:
      exposure,

    decision,

    owner,

    reason:
      ai.explanation,

    possibleReasons:
      ai.possibleReasons || [],

    requiredEvidence,

    questions:
      ai.questions || [],

    recommendedAction:
      ai.recommendedAction,

    evidenceAvailable:
      evidence
        ? true
        : false,

    status: "OPEN",
  };
}


// ==================================================
// PRIORITY
// ==================================================

function determinePriority({
  riskLevel,
  riskScore,
  exposure,
  findingStatus,
}) {

  // Critical findings are always P1
  if (
    riskLevel === "CRITICAL"
  ) {
    return "P1";
  }


  // Large missing-bank transactions
  if (
    findingStatus === "MISSING_BANK" &&
    exposure >= 50000
  ) {
    return "P1";
  }


  // High risk
  if (
    riskLevel === "HIGH" ||
    riskScore >= 60
  ) {
    return "P2";
  }


  // Medium risk
  if (
    riskLevel === "MEDIUM" ||
    riskScore >= 30
  ) {
    return "P3";
  }


  return "P4";
}


// ==================================================
// DECISION
// ==================================================

function determineDecision({
  findingStatus,
  riskLevel,
  evidence,
}) {

  if (
    findingStatus === "MISSING_BANK"
  ) {

    if (
      riskLevel === "CRITICAL" ||
      riskLevel === "HIGH"
    ) {
      return "REQUIRES_REVIEW";
    }

    return "INVESTIGATE";
  }


  if (
    findingStatus ===
    "AMOUNT_DISCREPANCY"
  ) {
    return "REQUIRES_REVIEW";
  }


  if (
    findingStatus === "MISSING_LEDGER"
  ) {
    return "INVESTIGATE";
  }


  if (
    findingStatus === "FUZZY_MATCH"
  ) {

    if (evidence) {
      return "VERIFY_MATCH";
    }

    return "REQUIRES_REVIEW";
  }


  return "INVESTIGATE";
}


// ==================================================
// REQUIRED EVIDENCE
// ==================================================

function determineRequiredEvidence(
  findingStatus
) {

  switch (findingStatus) {

    case "MISSING_BANK":

      return [
        "Payment voucher",
        "Cheque or payment proof",
        "Subsequent bank statement",
      ];


    case "MISSING_LEDGER":

      return [
        "Bank statement",
        "Supporting invoice or receipt",
        "Ledger search result",
      ];


    case "AMOUNT_DISCREPANCY":

      return [
        "Invoice",
        "Payment voucher",
        "Bank transaction",
        "Supporting adjustment document",
      ];


    case "FUZZY_MATCH":

      return [
        "Original ledger entry",
        "Bank transaction",
        "Supporting voucher",
      ];


    default:

      return [];
  }
}


// ==================================================
// OWNER
// ==================================================

function determineOwner(
  findingStatus
) {

  if (
    findingStatus === "MISSING_BANK"
  ) {
    return "CA";
  }

  if (
    findingStatus ===
    "AMOUNT_DISCREPANCY"
  ) {
    return "CA";
  }

  if (
    findingStatus ===
    "MISSING_LEDGER"
  ) {
    return "ACCOUNTANT";
  }

  if (
    findingStatus === "FUZZY_MATCH"
  ) {
    return "CA";
  }

  return "CA";
}


// ==================================================
// SUMMARY
// ==================================================

function buildSummary(decisions) {

  return {

    total:
      decisions.length,

    p1:
      decisions.filter(
        (item) =>
          item.priority === "P1"
      ).length,

    p2:
      decisions.filter(
        (item) =>
          item.priority === "P2"
      ).length,

    p3:
      decisions.filter(
        (item) =>
          item.priority === "P3"
      ).length,

    p4:
      decisions.filter(
        (item) =>
          item.priority === "P4"
      ).length,

    requiresReview:
      decisions.filter(
        (item) =>
          item.decision ===
          "REQUIRES_REVIEW"
      ).length,

    investigate:
      decisions.filter(
        (item) =>
          item.decision ===
          "INVESTIGATE"
      ).length,

    verifyMatch:
      decisions.filter(
        (item) =>
          item.decision ===
          "VERIFY_MATCH"
      ).length,
  };
}
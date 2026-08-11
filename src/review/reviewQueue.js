export default function reviewQueue({
  decisions = [],
}) {
  const queue = decisions.map((decision) => {
    return {
      id: createReviewId(decision),

      reference: decision.reference,
      date: decision.date,
      party: decision.party,

      findingStatus: decision.findingStatus,

      priority: decision.priority,
      riskLevel: decision.riskLevel,
      riskScore: decision.riskScore,

      financialExposure:
        decision.financialExposure || 0,

      decision: decision.decision,

      owner: decision.owner,

      reason: decision.reason,

      requiredEvidence:
        decision.requiredEvidence || [],

      questions:
        decision.questions || [],

      recommendedAction:
        decision.recommendedAction,

      evidenceAvailable:
        decision.evidenceAvailable || false,

      // Workflow
      status: "OPEN",

      assignedTo:
        decision.owner || "CA",

      resolution: null,

      resolutionNote: null,

      reviewedAt: null,
    };
  });

  // Highest priority first
  queue.sort(
    (a, b) =>
      priorityValue(a.priority) -
      priorityValue(b.priority)
  );

  return {
    totalItems: queue.length,

    summary: buildSummary(queue),

    queue,
  };
}


// ================================================
// REVIEW ID
// ================================================

function createReviewId(decision) {
  return `REV-${decision.reference}`;
}


// ================================================
// PRIORITY
// ================================================

function priorityValue(priority) {
  switch (priority) {
    case "P1":
      return 1;

    case "P2":
      return 2;

    case "P3":
      return 3;

    case "P4":
      return 4;

    default:
      return 5;
  }
}


// ================================================
// SUMMARY
// ================================================

function buildSummary(queue) {
  return {
    total:
      queue.length,

    open:
      queue.filter(
        (item) =>
          item.status === "OPEN"
      ).length,

    inReview:
      queue.filter(
        (item) =>
          item.status === "IN_REVIEW"
      ).length,

    waitingForEvidence:
      queue.filter(
        (item) =>
          item.status ===
          "WAITING_FOR_EVIDENCE"
      ).length,

    resolved:
      queue.filter(
        (item) =>
          item.status === "RESOLVED"
      ).length,

    p1:
      queue.filter(
        (item) =>
          item.priority === "P1"
      ).length,

    p2:
      queue.filter(
        (item) =>
          item.priority === "P2"
      ).length,

    p3:
      queue.filter(
        (item) =>
          item.priority === "P3"
      ).length,

    p4:
      queue.filter(
        (item) =>
          item.priority === "P4"
      ).length,
  };
}
export default function resolutionEngine({
  reviewItem,
  action,
  resolution = null,
  note = null,
  user = "CA",
}) {
  if (!reviewItem) {
    throw new Error("Review item is required");
  }

  const allowedActions = [
    "START_REVIEW",
    "REQUEST_EVIDENCE",
    "RESOLVE",
  ];

  if (!allowedActions.includes(action)) {
    throw new Error(
      `Invalid action: ${action}`
    );
  }

  const now = new Date().toISOString();

  // ============================================
  // START REVIEW
  // ============================================

  if (action === "START_REVIEW") {
    return {
      ...reviewItem,

      status: "IN_REVIEW",

      assignedTo:
        user || reviewItem.assignedTo,

      reviewedAt: now,

      resolution: null,

      resolutionNote: null,

      lastAction: {
        action: "START_REVIEW",
        performedBy: user,
        performedAt: now,
      },
    };
  }

  // ============================================
  // REQUEST EVIDENCE
  // ============================================

  if (action === "REQUEST_EVIDENCE") {
    return {
      ...reviewItem,

      status: "WAITING_FOR_EVIDENCE",

      reviewedAt: now,

      lastAction: {
        action: "REQUEST_EVIDENCE",
        performedBy: user,
        performedAt: now,
      },
    };
  }

  // ============================================
  // RESOLVE
  // ============================================

  if (action === "RESOLVE") {
    if (!resolution) {
      throw new Error(
        "Resolution is required"
      );
    }

    const allowedResolutions = [
      "APPROVED",
      "ADJUSTED",
      "REJECTED",
      "FALSE_POSITIVE",
      "OUTSTANDING",
    ];

    if (
      !allowedResolutions.includes(
        resolution
      )
    ) {
      throw new Error(
        `Invalid resolution: ${resolution}`
      );
    }

    if (!note) {
      throw new Error(
        "Resolution note is required"
      );
    }

    return {
      ...reviewItem,

      status: "RESOLVED",

      resolution,

      resolutionNote: note,

      reviewedAt: now,

      lastAction: {
        action: "RESOLVE",
        performedBy: user,
        performedAt: now,

        resolution,

        note,
      },
    };
  }
} 
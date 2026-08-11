export default function auditTrail({
  reviewItem,
  events = [],
}) {
  if (!reviewItem) {
    throw new Error("Review item is required");
  }

  const trail = [
    ...events,
  ];

  return {
    reviewId: reviewItem.id,

    reference: reviewItem.reference,

    totalEvents: trail.length,

    events: trail,

    currentStatus: reviewItem.status,

    resolution: reviewItem.resolution || null,

    lastUpdated:
      trail.length > 0
        ? trail[trail.length - 1].timestamp
        : null,
  };
}


// ============================================
// CREATE EVENT
// ============================================

export function createAuditEvent({
  action,
  performedBy,
  details = {},
  timestamp = new Date().toISOString(),
}) {
  if (!action) {
    throw new Error(
      "Audit action is required"
    );
  }

  if (!performedBy) {
    throw new Error(
      "PerformedBy is required"
    );
  }

  return {
    id: createEventId(),

    action,

    performedBy,

    timestamp,

    details,
  };
}


// ============================================
// EVENT ID
// ============================================

function createEventId() {
  return `AUD-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;
}
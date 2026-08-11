/**
 * THE FOUNDERS
 * Evidence Builder
 *
 * Converts reconciliation findings into structured,
 * traceable financial evidence.
 */

function buildEvidenceForFinding(finding) {
  const ledger = finding.ledger || null;
  const bank = finding.bank || null;

  const evidence = [];

  // --------------------------------------------------
  // 1. Reference evidence
  // --------------------------------------------------

  if (ledger?.reference && bank?.reference) {
    if (ledger.reference === bank.reference) {
      evidence.push({
        type: "REFERENCE_MATCH",
        status: "CONFIRMED",
        description: `Reference matches: ${ledger.reference}`,
      });
    } else {
      evidence.push({
        type: "REFERENCE_MISMATCH",
        status: "WARNING",
        description: `Ledger reference ${ledger.reference} differs from bank reference ${bank.reference}`,
      });
    }
  }

  // --------------------------------------------------
  // 2. Party / particulars evidence
  // --------------------------------------------------

  if (ledger?.particulars && bank?.particulars) {
    if (ledger.particulars === bank.particulars) {
      evidence.push({
        type: "PARTY_MATCH",
        status: "CONFIRMED",
        description: `Party matches: ${ledger.particulars}`,
      });
    } else {
      evidence.push({
        type: "PARTY_MISMATCH",
        status: "WARNING",
        description: `Ledger party "${ledger.particulars}" differs from bank party "${bank.particulars}"`,
      });
    }
  }

  // --------------------------------------------------
  // 3. Date evidence
  // --------------------------------------------------

  if (ledger?.date && bank?.date) {
    if (ledger.date === bank.date) {
      evidence.push({
        type: "DATE_MATCH",
        status: "CONFIRMED",
        description: `Transaction date matches: ${ledger.date}`,
      });
    } else {
      evidence.push({
        type: "DATE_DIFFERENCE",
        status: "WARNING",
        description: `Ledger date ${ledger.date} differs from bank date ${bank.date}`,
      });
    }
  }

  // --------------------------------------------------
  // 4. Amount evidence
  // --------------------------------------------------

  if (ledger?.amount != null && bank?.amount != null) {
    const difference = Number(
      (bank.amount - ledger.amount).toFixed(2)
    );

    if (difference === 0) {
      evidence.push({
        type: "AMOUNT_MATCH",
        status: "CONFIRMED",
        description: `Amount matches: ₹${ledger.amount.toFixed(2)}`,
      });
    } else {
      evidence.push({
        type: "AMOUNT_MISMATCH",
        status: "WARNING",
        description:
          `Ledger amount ₹${ledger.amount.toFixed(2)} ` +
          `vs bank amount ₹${bank.amount.toFixed(2)} ` +
          `(difference ₹${Math.abs(difference).toFixed(2)})`,
      });
    }
  }

  // --------------------------------------------------
  // 5. Missing bank evidence
  // --------------------------------------------------

  if (finding.status === "MISSING_BANK") {
    evidence.push({
      type: "MISSING_BANK_TRANSACTION",
      status: "CRITICAL",
      description:
        "Transaction exists in the ledger but no corresponding bank transaction was found.",
    });
  }

  // --------------------------------------------------
  // 6. Missing ledger evidence
  // --------------------------------------------------

  if (finding.status === "MISSING_LEDGER") {
    evidence.push({
      type: "MISSING_LEDGER_TRANSACTION",
      status: "WARNING",
      description:
        "Transaction exists in the bank statement but no corresponding ledger transaction was found.",
    });
  }

  // --------------------------------------------------
  // 7. Fuzzy match evidence
  // --------------------------------------------------

  if (finding.status === "FUZZY_MATCH") {
    evidence.push({
      type: "FUZZY_MATCH",
      status: "REVIEW",
      description:
        `Transaction matched using fuzzy matching with score ${finding.score}.`,
    });

    if (finding.confidence) {
      evidence.push({
        type: "MATCH_CONFIDENCE",
        status: "INFO",
        description:
          `Matching confidence: ${finding.confidence}`,
      });
    }
  }

  // --------------------------------------------------
  // 8. Build summary
  // --------------------------------------------------

  const confirmed = evidence.filter(
    (item) => item.status === "CONFIRMED"
  ).length;

  const warnings = evidence.filter(
    (item) => item.status === "WARNING"
  ).length;

  const critical = evidence.filter(
    (item) => item.status === "CRITICAL"
  ).length;

  const review = evidence.filter(
    (item) => item.status === "REVIEW"
  ).length;

  return {
    findingStatus: finding.status,

    reference:
      ledger?.reference ||
      bank?.reference ||
      null,

    date:
      ledger?.date ||
      bank?.date ||
      null,

    party:
      ledger?.particulars ||
      bank?.particulars ||
      null,

    ledgerAmount:
      ledger?.amount ?? null,

    bankAmount:
      bank?.amount ?? null,

    difference:
      finding.difference ?? null,

    confidence:
      finding.confidence ?? null,

    score:
      finding.score ?? null,

    evidence,

    evidenceSummary: {
      confirmed,
      warnings,
      critical,
      review,
      total: evidence.length,
    },
  };
}


// --------------------------------------------------
// Build evidence for complete reconciliation result
// --------------------------------------------------

function buildEvidenceReport(reconciliationResult) {
  if (!reconciliationResult) {
    throw new Error(
      "Reconciliation result is required."
    );
  }

  const findings =
    reconciliationResult.discrepancies || [];

  const evidence = findings.map(
    buildEvidenceForFinding
  );

  return {
    totalFindings: evidence.length,

    evidence,

    summary: {
      findingsWithCriticalEvidence: evidence.filter(
        (item) =>
          item.evidenceSummary.critical > 0
      ).length,

      findingsWithWarnings: evidence.filter(
        (item) =>
          item.evidenceSummary.warnings > 0
      ).length,

      findingsRequiringReview: evidence.filter(
        (item) =>
          item.evidenceSummary.review > 0
      ).length,
    },
  };
}


export {
  buildEvidenceForFinding,
  buildEvidenceReport,
};
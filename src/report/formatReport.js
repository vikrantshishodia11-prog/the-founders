export default function formatReport(report) {
  const {
    summary,
    financialImpact,
    findings,
  } = report;

  const lines = [];

  lines.push("");
  lines.push("╔══════════════════════════════════════════════════╗");
  lines.push("║          THE FOUNDERS — RECONCILIATION           ║");
  lines.push("╚══════════════════════════════════════════════════╝");

  lines.push("");

  // --------------------------------
  // SUMMARY
  // --------------------------------

  lines.push("SUMMARY");
  lines.push("──────────────────────────────────────────────────");

  lines.push(
    `Ledger transactions       : ${summary.totalLedgerTransactions}`
  );

  lines.push(
    `Bank transactions         : ${summary.totalBankTransactions}`
  );

  lines.push(
    `Exact matches             : ${summary.exactMatches}`
  );

  lines.push(
    `Fuzzy matches             : ${summary.fuzzyMatches}`
  );

  lines.push(
    `Amount discrepancies      : ${summary.amountDiscrepancies}`
  );

  lines.push(
    `Missing from bank         : ${summary.missingBank}`
  );

  lines.push(
    `Missing from ledger       : ${summary.missingLedger}`
  );

  lines.push(
    `Exact match rate          : ${summary.exactMatchPercentage}%`
  );

  lines.push(
    `Transaction coverage     : ${summary.transactionCoveragePercentage}%`
  );

  // --------------------------------
  // FINANCIAL IMPACT
  // --------------------------------

  lines.push("");
  lines.push("FINANCIAL IMPACT");
  lines.push("──────────────────────────────────────────────────");

  lines.push(
    `Ledger total              : ${formatCurrency(
      financialImpact.totalLedgerAmount
    )}`
  );

  lines.push(
    `Bank total                : ${formatCurrency(
      financialImpact.totalBankAmount
    )}`
  );

  lines.push(
    `Discrepancy exposure      : ${formatCurrency(
      financialImpact.totalAmountDifference
    )}`
  );

  // --------------------------------
  // HIGH PRIORITY
  // --------------------------------

  const highPriority = findings.filter(
    (finding) =>
      finding.severity === "CRITICAL" ||
      finding.severity === "HIGH"
  );

  lines.push("");
  lines.push("HIGH PRIORITY");
  lines.push("──────────────────────────────────────────────────");

  if (highPriority.length === 0) {
    lines.push("No high-priority findings.");
  } else {
    for (const finding of highPriority) {
      lines.push(
        formatFinding(finding)
      );
    }
  }

  // --------------------------------
  // AMOUNT DISCREPANCIES
  // --------------------------------

  const amountDiscrepancies =
    findings.filter(
      (finding) =>
        finding.status ===
        "AMOUNT_DISCREPANCY"
    );

  lines.push("");
  lines.push("AMOUNT DISCREPANCIES");
  lines.push("──────────────────────────────────────────────────");

  if (amountDiscrepancies.length === 0) {
    lines.push("None.");
  } else {
    for (const finding of amountDiscrepancies) {
      lines.push(
        `${finding.reference.padEnd(14)} ` +
        `${formatSignedCurrency(
          finding.difference
        ).padStart(14)}  ` +
        `${finding.party}`
      );
    }
  }

  // --------------------------------
  // FUZZY MATCHES
  // --------------------------------

  const fuzzyMatches =
    findings.filter(
      (finding) =>
        finding.status === "FUZZY_MATCH"
    );

  lines.push("");
  lines.push("FUZZY MATCHES");
  lines.push("──────────────────────────────────────────────────");

  if (fuzzyMatches.length === 0) {
    lines.push("None.");
  } else {
    for (const finding of fuzzyMatches) {
      lines.push(
        `${finding.reference.padEnd(14)} ` +
        `Score: ${String(
          finding.score
        ).padEnd(3)} ` +
        `Confidence: ${finding.confidence}`
      );
    }
  }

  // --------------------------------
  // MISSING BANK
  // --------------------------------

  const missingBank =
    findings.filter(
      (finding) =>
        finding.status === "MISSING_BANK"
    );

  lines.push("");
  lines.push("MISSING FROM BANK");
  lines.push("──────────────────────────────────────────────────");

  if (missingBank.length === 0) {
    lines.push("None.");
  } else {
    for (const finding of missingBank) {
      lines.push(
        `${finding.reference.padEnd(14)} ` +
        `${formatCurrency(
          finding.ledgerAmount
        ).padStart(14)}  ` +
        `${finding.party}`
      );
    }
  }

  // --------------------------------
  // MISSING LEDGER
  // --------------------------------

  const missingLedger =
    findings.filter(
      (finding) =>
        finding.status === "MISSING_LEDGER"
    );

  lines.push("");
  lines.push("MISSING FROM LEDGER");
  lines.push("──────────────────────────────────────────────────");

  if (missingLedger.length === 0) {
    lines.push("None.");
  } else {
    for (const finding of missingLedger) {
      lines.push(
        `${finding.reference.padEnd(14)} ` +
        `${formatCurrency(
          finding.bankAmount
        ).padStart(14)}  ` +
        `${finding.party}`
      );
    }
  }

  lines.push("");
  lines.push("──────────────────────────────────────────────────");
  lines.push("Reconciliation complete.");
  lines.push("");

  return lines.join("\n");
}


// ========================================
// Helpers
// ========================================

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `₹${Number(value).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}


function formatSignedCurrency(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  const number = Number(value);

  const sign = number >= 0 ? "+" : "-";

  return `${sign}${formatCurrency(
    Math.abs(number)
  )}`;
}


function formatFinding(finding) {
  const amount =
    finding.ledgerAmount ??
    finding.bankAmount;

  return (
    `${finding.reference.padEnd(14)} ` +
    `${formatCurrency(amount).padStart(14)}  ` +
    `${finding.status}  ` +
    `${finding.party}`
  );
}
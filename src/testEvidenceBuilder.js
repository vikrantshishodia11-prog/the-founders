import {
  buildEvidenceForFinding,
  buildEvidenceReport,
} from "./evidence/evidenceBuilder.js";

// --------------------------------------------------
// Sample reconciliation findings
// These represent the output from our Phase 1 engine.
// --------------------------------------------------

const reconciliationResult = {
  discrepancies: [
    {
      status: "AMOUNT_DISCREPANCY",

      ledger: {
        date: "2026-07-02",
        reference: "INV4029",
        particulars: "krishna enterprises",
        amount: 45000,
        type: "DEBIT",
      },

      bank: {
        date: "2026-07-02",
        reference: "INV4029",
        particulars: "krishna enterprises",
        amount: 50000,
        type: "DEBIT",
      },

      difference: 5000,
      confidence: "LOW",
      score: 75,
    },

    {
      status: "MISSING_BANK",

      ledger: {
        date: "2026-07-11",
        reference: "CHQ8820",
        particulars: "rajesh cotton mills",
        amount: 120000,
        type: "DEBIT",
      },

      bank: null,

      difference: null,
      confidence: null,
      score: null,
    },

    {
      status: "MISSING_LEDGER",

      ledger: null,

      bank: {
        date: "2026-07-05",
        reference: "BANKCHG07",
        particulars: "bank charges",
        amount: 590,
        type: "DEBIT",
      },

      difference: null,
      confidence: null,
      score: null,
    },

    {
      status: "FUZZY_MATCH",

      ledger: {
        date: "2026-07-07",
        reference: "UPI778821",
        particulars: "shree ram traders",
        amount: 38068.41,
        type: "CREDIT",
      },

      bank: {
        date: "2026-07-08",
        reference: "UPI778821",
        particulars: "shree ram traders",
        amount: 38068.41,
        type: "CREDIT",
      },

      difference: 0,
      confidence: "HIGH",
      score: 97,
    },
  ],
};


// --------------------------------------------------
// Test 1
// Build evidence for a single finding
// --------------------------------------------------

console.log("\n==============================");
console.log("SINGLE FINDING EVIDENCE");
console.log("==============================");

const singleEvidence = buildEvidenceForFinding(
  reconciliationResult.discrepancies[0]
);

console.dir(singleEvidence, {
  depth: null,
});


// --------------------------------------------------
// Test 2
// Build evidence for all findings
// --------------------------------------------------

console.log("\n==============================");
console.log("FULL EVIDENCE REPORT");
console.log("==============================");

const evidenceReport = buildEvidenceReport(
  reconciliationResult
);

console.dir(evidenceReport, {
  depth: null,
});


// --------------------------------------------------
// Test 3
// Simple validation
// --------------------------------------------------

console.log("\n==============================");
console.log("VALIDATION");
console.log("==============================");

console.log(
  "Total findings:",
  evidenceReport.totalFindings
);

console.log(
  "Critical findings:",
  evidenceReport.summary
    .findingsWithCriticalEvidence
);

console.log(
  "Warnings:",
  evidenceReport.summary
    .findingsWithWarnings
);

console.log(
  "Requiring review:",
  evidenceReport.summary
    .findingsRequiringReview
);

console.log("\nEvidence builder test complete.");
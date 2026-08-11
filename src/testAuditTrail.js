import parseLedgerExcel from "./parsers/ledgerExcelParser.js";
import parseBankPdf from "./parsers/bankPdfParser.js";

import normalizeTransaction from "./normalizer/normalizeTransaction.js";

import exactMatcher from "./matcher/exactMatcher.js";
import fuzzyMatcher from "./matcher/fuzzyMatcher.js";
import classifyDiscrepancies from "./matcher/discrepancyClassifier.js";

import {
  buildEvidenceReport,
} from "./evidence/evidenceBuilder.js";

import {
  investigateEvidenceReport,
} from "./investigation/investigationEngine.js";

import {
  calculateRiskReport,
} from "./risk/riskEngine.js";

import aiEngine from "./ai/aiEngine.js";

import auditDecisionEngine
  from "./decision/auditDecisionEngine.js";

import reviewQueue
  from "./review/reviewQueue.js";

import resolutionEngine
  from "./resolution/resolutionEngine.js";

import {
  createAuditEvent,
} from "./audit/auditTrail.js";

import auditTrail
  from "./audit/auditTrail.js";


const LEDGER_FILE = "./data/ledger/ledger.xlsx";
const BANK_FILE = "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";;


async function main() {

  console.log(`
╔══════════════════════════════════════════════════╗
║           THE FOUNDERS — AUDIT TRAIL             ║
╚══════════════════════════════════════════════════╝
`);


  // ============================================
  // 1. PARSE
  // ============================================

  console.log("[1] Parsing...");

  const rawLedger =
    await parseLedgerExcel(
      LEDGER_FILE
    );

  const rawBank =
    await parseBankPdf(
      BANK_FILE
    );


  // ============================================
  // 2. NORMALIZE
  // ============================================

  console.log("[2] Normalizing...");

  const ledgerTransactions =
    rawLedger.map(
      normalizeTransaction
    );

  const bankTransactions =
    rawBank.map(
      normalizeTransaction
    );


  // ============================================
  // 3. MATCH
  // ============================================

  console.log("[3] Matching...");

  const exactResult =
    exactMatcher(
      ledgerTransactions,
      bankTransactions
    );

  const fuzzyResult =
    fuzzyMatcher(
      exactResult.unmatchedLedger,
      exactResult.unmatchedBank
    );

  const discrepancies =
    classifyDiscrepancies(
      fuzzyResult.unmatchedLedger,
      fuzzyResult.unmatchedBank
    );


  // ============================================
  // 4. EVIDENCE
  // ============================================

  console.log("[4] Evidence...");

  const evidenceReport =
    buildEvidenceReport({

      discrepancies: [
        ...fuzzyResult.matches,
        ...discrepancies,
      ],

    });


  // ============================================
  // 5. INVESTIGATION
  // ============================================

  console.log("[5] Investigation...");

  const investigationReport =
    investigateEvidenceReport(
      evidenceReport
    );


  // ============================================
  // 6. RISK
  // ============================================

  console.log("[6] Risk...");

  const riskReport =
    calculateRiskReport(
      investigationReport
    );


  // ============================================
  // 7. AI
  // ============================================

  console.log("[7] AI...");

  const aiReport =
    aiEngine({

      riskFindings:
        riskReport.risks,

      investigations:
        investigationReport.investigations,

      evidenceFindings:
        evidenceReport.evidence,

    });


  // ============================================
  // 8. AUDIT DECISION
  // ============================================

  console.log(
    "[8] Audit Decision..."
  );

  const decisionReport =
    auditDecisionEngine({

      aiAnalyses:
        aiReport.analyses,

      riskFindings:
        riskReport.risks,

      evidenceFindings:
        evidenceReport.evidence,

    });


  // ============================================
  // 9. REVIEW QUEUE
  // ============================================

  console.log(
    "[9] Review Queue..."
  );

  const queueReport =
    reviewQueue({

      decisions:
        decisionReport.decisions,

    });


  // ============================================
  // FIND REAL P1
  // ============================================

  let reviewItem =
    queueReport.queue.find(
      (item) =>
        item.reference === "CHQ8820"
    );


  if (!reviewItem) {
    throw new Error(
      "CHQ8820 not found"
    );
  }


  // ============================================
  // AUDIT EVENTS
  // ============================================

  const events = [];


  // --------------------------------------------
  // EVENT 1 — FINDING CREATED
  // --------------------------------------------

  events.push(
    createAuditEvent({

      action:
        "FINDING_CREATED",

      performedBy:
        "SYSTEM",

      details: {
        findingStatus:
          reviewItem.findingStatus,

        priority:
          reviewItem.priority,

        riskLevel:
          reviewItem.riskLevel,

        riskScore:
          reviewItem.riskScore,

        financialExposure:
          reviewItem.financialExposure,
      },

    })
  );


  // ============================================
  // RESOLUTION 1
  // ============================================

  reviewItem =
    resolutionEngine({

      reviewItem,

      action:
        "START_REVIEW",

      user:
        "CA",

    });


  events.push(
    createAuditEvent({

      action:
        "REVIEW_STARTED",

      performedBy:
        "CA",

      details: {
        status:
          reviewItem.status,

      },

    })
  );


  // ============================================
  // RESOLUTION 2
  // ============================================

  reviewItem =
    resolutionEngine({

      reviewItem,

      action:
        "REQUEST_EVIDENCE",

      user:
        "CA",

    });


  events.push(
    createAuditEvent({

      action:
        "EVIDENCE_REQUESTED",

      performedBy:
        "CA",

      details: {

        requiredEvidence:
          reviewItem.requiredEvidence,

        status:
          reviewItem.status,

      },

    })
  );


  // ============================================
  // RESOLUTION 3
  // ============================================

  reviewItem =
    resolutionEngine({

      reviewItem,

      action:
        "RESOLVE",

      resolution:
        "OUTSTANDING",

      note:
        "Cheque has not appeared in the current bank statement. Verify the subsequent bank statement before final closure.",

      user:
        "CA",

    });


  events.push(
    createAuditEvent({

      action:
        "FINDING_RESOLVED",

      performedBy:
        "CA",

      details: {

        resolution:
          reviewItem.resolution,

        note:
          reviewItem.resolutionNote,

        status:
          reviewItem.status,

      },

    })
  );


  // ============================================
  // BUILD AUDIT TRAIL
  // ============================================

  const report =
    auditTrail({

      reviewItem,

      events,

    });


  // ============================================
  // OUTPUT
  // ============================================

  console.log(`
==============================
AUDIT TRAIL SUMMARY
==============================
`);

  console.table({

    reviewId:
      report.reviewId,

    reference:
      report.reference,

    totalEvents:
      report.totalEvents,

    currentStatus:
      report.currentStatus,

    resolution:
      report.resolution,

    lastUpdated:
      report.lastUpdated,

  });


  console.log(`
==============================
AUDIT HISTORY
==============================
`);


  report.events.forEach(
    (event, index) => {

      console.log(`
[${index + 1}]

Event       : ${event.action}
Performed By: ${event.performedBy}
Timestamp   : ${event.timestamp}

Details:
`);

      console.dir(
        event.details,
        { depth: null }
      );

    }
  );


  console.log(`
==============================
FINAL STATE
==============================

Reference   : ${reviewItem.reference}
Status      : ${reviewItem.status}
Resolution  : ${reviewItem.resolution}
Reviewed By : ${reviewItem.assignedTo}

Note:
${reviewItem.resolutionNote}

==============================
AUDIT TRAIL TEST COMPLETE
==============================
`);
}


main().catch(
  (error) => {

    console.error(
      "\nAudit Trail test failed:"
    );

    console.error(error);

  }
);
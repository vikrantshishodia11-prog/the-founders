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

import auditDecisionEngine from "./decision/auditDecisionEngine.js";

import reviewQueue from "./review/reviewQueue.js";

import resolutionEngine from "./resolution/resolutionEngine.js";


const LEDGER_FILE =
   "./data/ledger/ledger.xlsx";

const BANK_FILE =
  "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";


async function main() {

  console.log(`
╔══════════════════════════════════════════════════╗
║       THE FOUNDERS — RESOLUTION ENGINE           ║
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
  // 3. EXACT MATCH
  // ============================================

  console.log("[3] Exact matching...");

  const exactResult =
    exactMatcher(
      ledgerTransactions,
      bankTransactions
    );


  // ============================================
  // 4. FUZZY MATCH
  // ============================================

  console.log("[4] Fuzzy matching...");

  const fuzzyResult =
    fuzzyMatcher(
      exactResult.unmatchedLedger,
      exactResult.unmatchedBank
    );


  // ============================================
  // 5. DISCREPANCIES
  // ============================================

  console.log("[5] Classifying...");

  const discrepancies =
    classifyDiscrepancies(
      fuzzyResult.unmatchedLedger,
      fuzzyResult.unmatchedBank
    );


  // ============================================
  // 6. EVIDENCE
  // ============================================

  console.log("[6] Evidence...");

  const evidenceReport =
    buildEvidenceReport({

      discrepancies: [
        ...fuzzyResult.matches,
        ...discrepancies,
      ],

    });


  // ============================================
  // 7. INVESTIGATION
  // ============================================

  console.log("[7] Investigation...");

  const investigationReport =
    investigateEvidenceReport(
      evidenceReport
    );


  // ============================================
  // 8. RISK
  // ============================================

  console.log("[8] Risk...");

  const riskReport =
    calculateRiskReport(
      investigationReport
    );


  // ============================================
  // 9. AI
  // ============================================

  console.log("[9] AI...");

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
  // 10. DECISION
  // ============================================

  console.log(
    "[10] Audit Decision..."
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
  // 11. REVIEW QUEUE
  // ============================================

  console.log(
    "[11] Review Queue..."
  );

  const queueReport =
    reviewQueue({

      decisions:
        decisionReport.decisions,

    });


  console.log(`
Total review items:
${queueReport.totalItems}
`);


  // ============================================
  // FIND P1 ITEM
  // ============================================

  const reviewItem =
    queueReport.queue.find(
      (item) =>
        item.reference === "CHQ8820"
    );


  if (!reviewItem) {
    throw new Error(
      "CHQ8820 review item not found"
    );
  }


  console.log(`
==============================
ORIGINAL REVIEW ITEM
==============================
`);

  console.dir(
    reviewItem,
    { depth: null }
  );


  // ============================================
  // ACTION 1
  // ============================================

  console.log(`
==============================
ACTION 1: START REVIEW
==============================
`);

  let resolvedItem =
    resolutionEngine({

      reviewItem,

      action:
        "START_REVIEW",

      user:
        "CA",

    });


  console.dir(
    resolvedItem,
    { depth: null }
  );


  // ============================================
  // ACTION 2
  // ============================================

  console.log(`
==============================
ACTION 2: REQUEST EVIDENCE
==============================
`);

  resolvedItem =
    resolutionEngine({

      reviewItem:
        resolvedItem,

      action:
        "REQUEST_EVIDENCE",

      user:
        "CA",

    });


  console.dir(
    resolvedItem,
    { depth: null }
  );


  // ============================================
  // ACTION 3
  // ============================================

  console.log(`
==============================
ACTION 3: RESOLVE
==============================
`);

  resolvedItem =
    resolutionEngine({

      reviewItem:
        resolvedItem,

      action:
        "RESOLVE",

      resolution:
        "OUTSTANDING",

      note:
        "Cheque has not appeared in the current bank statement. Verify the subsequent bank statement before final closure.",

      user:
        "CA",

    });


  console.dir(
    resolvedItem,
    { depth: null }
  );


  // ============================================
  // FINAL STATUS
  // ============================================

  console.log(`
==============================
FINAL RESOLUTION
==============================

Reference   : ${resolvedItem.reference}
Status      : ${resolvedItem.status}
Resolution  : ${resolvedItem.resolution}
Reviewed By : ${resolvedItem.assignedTo}

Note:
${resolvedItem.resolutionNote}

==============================
RESOLUTION ENGINE TEST COMPLETE
==============================
`);
}


main().catch(
  (error) => {

    console.error(
      "\nResolution Engine test failed:"
    );

    console.error(error);

  }
);
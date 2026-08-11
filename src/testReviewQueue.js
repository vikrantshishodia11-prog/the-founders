import parseLedgerExcel from "./parsers/ledgerExcelParser.js";
import parseBankPdf from "./parsers/bankPdfParser.js";

import normalizeTransaction from "./normalizer/normalizeTransaction.js";

import exactMatcher from "./matcher/exactMatcher.js";
import fuzzyMatcher from "./matcher/fuzzyMatcher.js";
import classifyDiscrepancies from "./matcher/discrepancyClassifier.js";

import reconciliationReport from "./report/reconciliationReport.js";

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


const LEDGER_FILE =
   "./data/ledger/ledger.xlsx";

const BANK_FILE =
  "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";


async function main() {

  console.log(`
╔══════════════════════════════════════════════════╗
║          THE FOUNDERS — REVIEW QUEUE             ║
╚══════════════════════════════════════════════════╝
`);


  // ================================================
  // 1. PARSE
  // ================================================

  console.log("[1] Parsing...");

  const rawLedger =
    await parseLedgerExcel(
      LEDGER_FILE
    );

  const rawBank =
    await parseBankPdf(
      BANK_FILE
    );


  // ================================================
  // 2. NORMALIZE
  // ================================================

  console.log("[2] Normalizing...");

  const ledgerTransactions =
    rawLedger.map(
      normalizeTransaction
    );

  const bankTransactions =
    rawBank.map(
      normalizeTransaction
    );


  // ================================================
  // 3. EXACT MATCH
  // ================================================

  console.log("[3] Exact matching...");

  const exactResult =
    exactMatcher(
      ledgerTransactions,
      bankTransactions
    );


  // ================================================
  // 4. FUZZY MATCH
  // ================================================

  console.log("[4] Fuzzy matching...");

  const fuzzyResult =
    fuzzyMatcher(
      exactResult.unmatchedLedger,
      exactResult.unmatchedBank
    );


  // ================================================
  // 5. DISCREPANCIES
  // ================================================

  console.log("[5] Classifying...");

  const discrepancies =
    classifyDiscrepancies(
      fuzzyResult.unmatchedLedger,
      fuzzyResult.unmatchedBank
    );


  // ================================================
  // 6. RECONCILIATION
  // ================================================

  console.log(
    "[6] Reconciliation..."
  );

  reconciliationReport({
    ledgerTransactions,

    bankTransactions,

    exactMatches:
      exactResult.matches,

    fuzzyMatches:
      fuzzyResult.matches,

    discrepancies,
  });


  // ================================================
  // 7. EVIDENCE
  // ================================================

  console.log(
    "[7] Evidence..."
  );

  const evidenceReport =
    buildEvidenceReport({

      discrepancies: [
        ...fuzzyResult.matches,
        ...discrepancies,
      ],
    });


  // ================================================
  // 8. INVESTIGATION
  // ================================================

  console.log(
    "[8] Investigation..."
  );

  const investigationReport =
    investigateEvidenceReport(
      evidenceReport
    );


  // ================================================
  // 9. RISK
  // ================================================

  console.log(
    "[9] Risk..."
  );

  const riskReport =
    calculateRiskReport(
      investigationReport
    );


  // ================================================
  // 10. AI
  // ================================================

  console.log(
    "[10] AI..."
  );

  const aiReport =
    aiEngine({

      riskFindings:
        riskReport.risks,

      investigations:
        investigationReport.investigations,

      evidenceFindings:
        evidenceReport.evidence,
    });


  // ================================================
  // 11. AUDIT DECISION
  // ================================================

  console.log(
    "[11] Audit Decision..."
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


  // ================================================
  // 12. REVIEW QUEUE
  // ================================================

  console.log(
    "[12] Building Review Queue..."
  );

  const queueReport =
    reviewQueue({

      decisions:
        decisionReport.decisions,
    });


  // ================================================
  // SUMMARY
  // ================================================

  console.log(`
==============================
REVIEW QUEUE SUMMARY
==============================
`);

  console.table(
    queueReport.summary
  );


  // ================================================
  // QUEUE
  // ================================================

  console.log(`
==============================
CA REVIEW QUEUE
==============================
`);

  console.table(
    queueReport.queue.map(
      (item) => ({

        id:
          item.id,

        priority:
          item.priority,

        reference:
          item.reference,

        party:
          item.party,

        finding:
          item.findingStatus,

        risk:
          item.riskLevel,

        exposure:
          item.financialExposure,

        decision:
          item.decision,

        owner:
          item.owner,

        status:
          item.status,
      })
    )
  );


  // ================================================
  // PRIORITY ITEMS
  // ================================================

  console.log(`
==============================
HIGH PRIORITY ITEMS
==============================
`);

  const highPriority =
    queueReport.queue.filter(
      (item) =>
        item.priority === "P1" ||
        item.priority === "P2"
    );

  for (
    const item
    of highPriority
  ) {

    console.log(`
------------------------------------------
${item.id}

Reference : ${item.reference}
Party     : ${item.party}
Priority  : ${item.priority}
Risk      : ${item.riskLevel}
Exposure  : ₹${item.financialExposure.toFixed(2)}
Decision  : ${item.decision}
Owner     : ${item.owner}
Status    : ${item.status}
------------------------------------------

Reason:
${item.reason}

Required Evidence:
`);

    item.requiredEvidence.forEach(
      (evidence, index) => {

        console.log(
          `${index + 1}. ${evidence}`
        );

      }
    );

    console.log(`
Recommended Action:
${item.recommendedAction}
`);
  }


  console.log(`
==============================
REVIEW QUEUE TEST COMPLETE
==============================
`);
}


main().catch(
  (error) => {

    console.error(
      "\nReview Queue test failed:"
    );

    console.error(error);

  }
);
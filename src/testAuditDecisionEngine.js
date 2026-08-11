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


const LEDGER_FILE = "./data/ledger/ledger.xlsx";
const BANK_FILE = "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";;


async function main() {

  console.log(`
╔══════════════════════════════════════════════════╗
║       THE FOUNDERS — AUDIT DECISION ENGINE       ║
╚══════════════════════════════════════════════════╝
`);


  // ================================================
  // PARSE
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
  // NORMALIZE
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
  // EXACT MATCH
  // ================================================

  console.log("[3] Exact matching...");

  const exactResult =
    exactMatcher(
      ledgerTransactions,
      bankTransactions
    );


  // ================================================
  // FUZZY MATCH
  // ================================================

  console.log("[4] Fuzzy matching...");

  const fuzzyResult =
    fuzzyMatcher(
      exactResult.unmatchedLedger,
      exactResult.unmatchedBank
    );


  // ================================================
  // DISCREPANCIES
  // ================================================

  console.log("[5] Classifying...");

  const discrepancies =
    classifyDiscrepancies(
      fuzzyResult.unmatchedLedger,
      fuzzyResult.unmatchedBank
    );


  // ================================================
  // RECONCILIATION
  // ================================================

  console.log(
    "[6] Reconciliation report..."
  );

  const report =
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
  // EVIDENCE
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
  // INVESTIGATION
  // ================================================

  console.log(
    "[8] Investigation..."
  );

  const investigationReport =
    investigateEvidenceReport(
      evidenceReport
    );


  // ================================================
  // RISK
  // ================================================

  console.log(
    "[9] Risk..."
  );

  const riskReport =
    calculateRiskReport(
      investigationReport
    );


  // ================================================
  // AI
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
  // AUDIT DECISION
  // ================================================

  console.log(
    "[11] Audit Decision Engine..."
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
  // SUMMARY
  // ================================================

  console.log(`
==============================
AUDIT DECISION SUMMARY
==============================
`);

  console.table(
    decisionReport.summary
  );


  // ================================================
  // DECISIONS
  // ================================================

  console.log(`
==============================
DECISIONS
==============================
`);

  console.table(
    decisionReport.decisions.map(
      (item) => ({

        reference:
          item.reference,

        party:
          item.party,

        status:
          item.findingStatus,

        priority:
          item.priority,

        risk:
          item.riskLevel,

        decision:
          item.decision,

        exposure:
          item.financialExposure,

        owner:
          item.owner,
      })
    )
  );


  // ================================================
  // DETAILED OUTPUT
  // ================================================

  for (
    const item
    of decisionReport.decisions
  ) {

    console.log(`
------------------------------------------
REFERENCE : ${item.reference}
PARTY     : ${item.party}
PRIORITY  : ${item.priority}
RISK      : ${item.riskLevel}
DECISION  : ${item.decision}
OWNER     : ${item.owner}
EXPOSURE  : ₹${item.financialExposure.toFixed(2)}
------------------------------------------
`);

    console.log(
      "REASON:"
    );

    console.log(
      item.reason
    );


    console.log(
      "\nREQUIRED EVIDENCE:"
    );

    item.requiredEvidence.forEach(
      (evidence, index) => {

        console.log(
          `${index + 1}. ${evidence}`
        );

      }
    );


    console.log(
      "\nRECOMMENDED ACTION:"
    );

    console.log(
      item.recommendedAction
    );
  }


  console.log(`
==============================
AUDIT DECISION TEST COMPLETE
==============================
`);
}


main().catch(
  (error) => {

    console.error(
      "\nAudit Decision Engine failed:"
    );

    console.error(error);

  }
);
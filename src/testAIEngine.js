import parseLedgerExcel from "./parsers/ledgerExcelParser.js";
import parseBankPdf from "./parsers/bankPdfParser.js";

import normalizeTransaction from "./normalizer/normalizeTransaction.js";

import exactMatcher from "./matcher/exactMatcher.js";
import fuzzyMatcher from "./matcher/fuzzyMatcher.js";
import classifyDiscrepancies from "./matcher/discrepancyClassifier.js";

import reconciliationReport from "./report/reconciliationReport.js";

import { buildEvidenceReport } from "./evidence/evidenceBuilder.js";

import {
  investigateEvidenceReport,
} from "./investigation/investigationEngine.js";

import {
  calculateRiskReport,
} from "./risk/riskEngine.js";

import aiEngine from "./ai/aiEngine.js";


// ==================================================
// FILES
// ==================================================

const LEDGER_FILE = "./data/ledger/ledger.xlsx";
const BANK_FILE = "./data/bank/Sample_Bank_Statement_HDFC_Jul2026.pdf";;


// ==================================================
// MAIN
// ==================================================

async function main() {

  console.log(`
╔══════════════════════════════════════════════════╗
║       THE FOUNDERS — REAL AI ENGINE TEST         ║
╚══════════════════════════════════════════════════╝
`);


  // ==================================================
  // 1. PARSE
  // ==================================================

  console.log("[1] Parsing ledger...");

  const rawLedger =
    await parseLedgerExcel(LEDGER_FILE);

  console.log(
    "Ledger:",
    rawLedger.length
  );


  console.log("\n[2] Parsing bank statement...");

  const rawBank =
    await parseBankPdf(BANK_FILE);

  console.log(
    "Bank:",
    rawBank.length
  );


  // ==================================================
  // 2. NORMALIZE
  // ==================================================

  console.log("\n[3] Normalizing...");

  const ledgerTransactions =
    rawLedger.map(normalizeTransaction);

  const bankTransactions =
    rawBank.map(normalizeTransaction);


  // ==================================================
  // 3. EXACT MATCH
  // ==================================================

  console.log("\n[4] Exact matching...");

  const exactResult =
    exactMatcher(
      ledgerTransactions,
      bankTransactions
    );

  console.log(
    "Exact matches:",
    exactResult.matches.length
  );


  // ==================================================
  // 4. FUZZY MATCH
  // ==================================================

  console.log("\n[5] Fuzzy matching...");

  const fuzzyResult =
    fuzzyMatcher(
      exactResult.unmatchedLedger,
      exactResult.unmatchedBank
    );

  console.log(
    "Fuzzy matches:",
    fuzzyResult.matches.length
  );


  // ==================================================
  // 5. DISCREPANCIES
  // ==================================================

  console.log(
    "\n[6] Classifying discrepancies..."
  );

  const discrepancies =
    classifyDiscrepancies(
      fuzzyResult.unmatchedLedger,
      fuzzyResult.unmatchedBank
    );

  console.log(
    "Discrepancies:",
    discrepancies.length
  );


  // ==================================================
  // 6. RECONCILIATION REPORT
  // ==================================================

  console.log(
    "\n[7] Building reconciliation report..."
  );

  const reconciliation =
    reconciliationReport({
      ledgerTransactions,
      bankTransactions,

      exactMatches:
        exactResult.matches,

      fuzzyMatches:
        fuzzyResult.matches,

      discrepancies,
    });


  console.log("\nRECONCILIATION");

  console.table(
    reconciliation.summary
  );


  // ==================================================
  // 7. EVIDENCE
  // ==================================================

  console.log(
    "\n[8] Building evidence..."
  );

  const allFindings = [
    ...fuzzyResult.matches,
    ...discrepancies,
  ];

  const evidenceReport =
    buildEvidenceReport({
      discrepancies: allFindings,
    });

  console.log(
    "Evidence findings:",
    evidenceReport.totalFindings
  );


  // ==================================================
  // 8. INVESTIGATION
  // ==================================================

  console.log(
    "\n[9] Running investigation..."
  );

  const investigationReport =
    investigateEvidenceReport(
      evidenceReport
    );

  console.log(
    "Investigations:",
    investigationReport.totalInvestigations
  );


  // ==================================================
  // 9. RISK
  // ==================================================

  console.log(
    "\n[10] Running risk engine..."
  );

  const riskReport =
    calculateRiskReport(
      investigationReport
    );

  console.log(
    "Risk findings:",
    riskReport.totalFindings
  );

  console.table(
    riskReport.summary
  );


  // ==================================================
  // 10. AI
  // ==================================================

  console.log(
    "\n[11] Running AI Engine..."
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


  // ==================================================
  // 11. AI SUMMARY
  // ==================================================

  console.log(`
==============================
AI ANALYSIS SUMMARY
==============================
`);

  console.log(
    "Total AI analyses:",
    aiReport.totalAnalyses
  );


  // ==================================================
  // 12. AI FINDINGS
  // ==================================================

  console.log(`
==============================
AI FINDINGS
==============================
`);


  console.table(
    aiReport.analyses.map(
      (item) => ({

        reference:
          item.reference,

        party:
          item.party,

        status:
          item.findingStatus,

        risk:
          item.riskLevel,

        score:
          item.riskScore,

        exposure:
          item.financialExposure,

        confidence:
          item.confidence ?? "N/A",
      })
    )
  );


  // ==================================================
  // 13. DETAILED AI ANALYSIS
  // ==================================================

  for (
    const analysis
    of aiReport.analyses
  ) {

    console.log(`
------------------------------------------
REFERENCE: ${analysis.reference}
PARTY: ${analysis.party}
STATUS: ${analysis.findingStatus}
RISK: ${analysis.riskLevel}
RISK SCORE: ${analysis.riskScore}
EXPOSURE: ₹${analysis.financialExposure.toFixed(2)}
------------------------------------------
`);

    console.log(
      "WHY:"
    );

    console.log(
      analysis.explanation
    );


    console.log(
      "\nPOSSIBLE REASONS:"
    );

    analysis.possibleReasons.forEach(
      (reason, index) => {

        console.log(
          `${index + 1}. ${reason}`
        );

      }
    );


    console.log(
      "\nQUESTIONS FOR CA:"
    );

    analysis.questions.forEach(
      (question, index) => {

        console.log(
          `${index + 1}. ${question}`
        );

      }
    );


    console.log(
      "\nRECOMMENDED ACTION:"
    );

    console.log(
      analysis.recommendedAction
    );
  }


  // ==================================================
  // COMPLETE
  // ==================================================

  console.log(`
==============================
REAL AI ENGINE TEST COMPLETE
==============================
`);
}


// ==================================================
// ERROR HANDLING
// ==================================================

main().catch(
  (error) => {

    console.error(
      "\nReal AI Engine test failed:"
    );

    console.error(error);

  }
);
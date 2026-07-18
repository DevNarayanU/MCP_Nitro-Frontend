import React from "react";
import type { EvaluationResults } from "../../types/invoicexray";
import { STREditor } from "../DeepDive/STREditor";
import { RegulatoryActionsPanel } from "../DeepDive/RegulatoryActionsPanel";
import { FileText } from "lucide-react";

interface ReportsPageProps {
  evaluation: EvaluationResults | null;
  selectedId: string | null;
  onSelectTransaction: (id: string) => void;
  generateCounterfactualReport: (id: string) => string;
  generateRBIFormETX: (id: string) => string;
  exportSTRNarrative: (id: string) => Promise<string>;
  showToast: (msg: string) => void;
  transactionIds: string[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  evaluation,
  selectedId,
  onSelectTransaction,
  generateCounterfactualReport,
  generateRBIFormETX,
  exportSTRNarrative,
  showToast,
  transactionIds,
}) => {
  const seedKeys = transactionIds || [];

  if (!evaluation) {
    return (
      <div className="p-12 text-center text-zinc-500 font-mono text-base">
        No transaction selected for report generation.
      </div>
    );
  }

  const htmlReport = generateCounterfactualReport(evaluation.invoice_id);
  const rbiFormETX = generateRBIFormETX(evaluation.invoice_id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header & Selector Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white uppercase tracking-wider font-sans">
              Reports & Statutory Filings Hub
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              FIU-IND Suspicious Transaction Narrative, Audit Report & RBI Form ETX
            </p>
          </div>
        </div>

        {/* Transaction Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800 font-mono text-xs">
          <span className="text-zinc-500 px-2 uppercase font-sans font-semibold">Select Invoice:</span>
          {seedKeys.map((key) => (
            <button
              key={key}
              onClick={() => onSelectTransaction(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                selectedId === key
                  ? "bg-red-600 text-white font-bold shadow-md"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Section 1: FIU-IND STR Narrative Terminal */}
      <div className="space-y-8">
        <STREditor
          strDraft={evaluation.str}
          onCopyNarrative={() => exportSTRNarrative(evaluation.invoice_id)}
        />

        {/* Reports Section 2: Statutory & HTML Audit Filings */}
        <RegulatoryActionsPanel
          invoiceId={evaluation.invoice_id}
          htmlReport={htmlReport}
          rbiFormETX={rbiFormETX}
          onShowToast={showToast}
        />
      </div>
    </div>
  );
};

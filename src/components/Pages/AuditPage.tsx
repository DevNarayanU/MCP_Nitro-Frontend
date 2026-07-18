import React from "react";
import type { EvaluationResults } from "../../types/invoicexray";
import { TransactionMetaHeader } from "../DeepDive/TransactionMetaHeader";
import { CounterfactualVisualizer } from "../DeepDive/CounterfactualVisualizer";
import { CrossAgencyPanel } from "../DeepDive/CrossAgencyPanel";
import { RedFlagsFeed } from "../DeepDive/RedFlagsFeed";
import { SEED_TRANSACTIONS } from "../../data/seedTransactions";
import { FileSpreadsheet, ChevronRight, Sun, Moon } from "lucide-react";

interface AuditPageProps {
  evaluation: EvaluationResults | null;
  selectedId: string | null;
  onSelectTransaction: (id: string) => void;
  onNavigate: (page: "dashboard" | "audit" | "reports") => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const AuditPage: React.FC<AuditPageProps> = ({
  evaluation,
  selectedId,
  onSelectTransaction,
  onNavigate,
  theme,
  onToggleTheme,
}) => {
  const seedKeys = Object.keys(SEED_TRANSACTIONS);

  if (!evaluation) {
    return (
      <div className="p-12 text-center text-zinc-500 font-mono text-base">
        No transaction selected for audit inspection.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header & Selector Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white uppercase tracking-wider font-sans">
              Transaction Deep-Dive Audit
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Counterfactual valuation engine & live cross-agency verification
            </p>
          </div>
        </div>

        {/* Switcher & Theme Toggle Container */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            title="Toggle color theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{theme === "dark" ? "LIGHT" : "DARK"}</span>
          </button>

          {/* Transaction Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800 font-mono text-xs">
            <span className="text-zinc-500 px-2 uppercase font-sans font-semibold">Inspect Record:</span>
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

        {/* Switch to Reports Page Shortcut */}
        <button
          onClick={() => onNavigate("reports")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold transition-all"
        >
          <span>View Reports & Filings</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main 2-Column Uncluttered Audit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Valuation & Agency Checks (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <TransactionMetaHeader
            meta={evaluation.transactionMeta}
            overallRisk={evaluation.overallRisk}
          />

          <CounterfactualVisualizer
            gap={evaluation.manipulationGap}
            declaredValue={evaluation.transactionMeta.declared_value_usd}
          />

          <CrossAgencyPanel crossAgency={evaluation.crossAgency} />
        </div>

        {/* Right Column: Red Flags Intelligence (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <RedFlagsFeed flags={evaluation.flags} />
        </div>
      </div>
    </div>
  );
};

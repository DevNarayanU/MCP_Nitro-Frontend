import React from "react";
import type { EvaluationResults, RiskLevel } from "../types/invoicexray";
import {
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  SlidersHorizontal,
  FileText,
} from "lucide-react";

interface TransactionsTableProps {
  evaluations: EvaluationResults[];
  selectedId: string | null;
  onSelectTransaction: (id: string, view: "audit" | "reports") => void;
  riskFilter: string;
  onRiskFilterChange: (risk: string) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  evaluations,
  selectedId,
  onSelectTransaction,
  riskFilter,
  onRiskFilterChange,
}) => {
  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold font-mono bg-red-500/10 text-red-500 border border-red-500/30 shadow-sm shadow-red-950">
            <ShieldAlert className="w-3.5 h-3.5" />
            CRITICAL BREACH
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            HIGH RISK
          </span>
        );
      case "CLEAR":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            VERIFIED CLEAR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
            ELEVATED
          </span>
        );
    }
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
      {/* Table Header Controls */}
      <div className="px-6 py-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-950/60">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-zinc-200 uppercase tracking-wide font-sans">
            Trade Transactions Directory
          </h2>
          <span className="px-3 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700 font-medium">
            {evaluations.length} evaluated records
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400 ml-1 mr-1" />
          {["ALL", "CRITICAL", "HIGH", "CLEAR"].map((level) => (
            <button
              key={level}
              onClick={() => onRiskFilterChange(level)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                riskFilter === level
                  ? level === "CRITICAL"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : level === "HIGH"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : level === "CLEAR"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Spacious High Density Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-xs font-mono uppercase text-zinc-400 bg-zinc-950/80">
              <th className="py-3.5 px-6 font-bold">Invoice Ref</th>
              <th className="py-3.5 px-6 font-bold">Exporter Entity</th>
              <th className="py-3.5 px-6 font-bold">Declared Value</th>
              <th className="py-3.5 px-6 font-bold">Risk Status</th>
              <th className="py-3.5 px-6 font-bold">Primary Risk Triggers</th>
              <th className="py-3.5 px-6 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 text-sm">
            {evaluations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono text-sm">
                  No records matching filter criteria.
                </td>
              </tr>
            ) : (
              evaluations.map((item) => {
                const isSelected = selectedId === item.invoice_id;
                return (
                  <tr
                    key={item.invoice_id}
                    onClick={() => onSelectTransaction(item.invoice_id, "audit")}
                    className={`group cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-red-950/20 border-l-4 border-l-red-500"
                        : "hover:bg-zinc-800/50"
                    }`}
                  >
                    {/* Invoice ID */}
                    <td className="py-4 px-6 font-mono font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.invoice_id}</span>
                        {item.invoice_id === "INV-2026-GOLD-99" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-red-950 text-red-300 border border-red-800/60">
                            DEMO SEED
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Exporter Name & IEC */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-zinc-100 text-sm">
                        {item.transactionMeta?.exporter_name || "N/A"}
                      </div>
                      <div className="text-xs font-mono text-zinc-400 mt-0.5">
                        IEC: <span className="text-zinc-300">{item.transactionMeta?.exporter_iec || "N/A"}</span>
                      </div>
                    </td>

                    {/* Declared Value & Gap */}
                    <td className="py-4 px-6 font-mono whitespace-nowrap">
                      <div className="font-bold text-zinc-100 text-base">
                        ${(item.transactionMeta?.declared_value_usd ?? 0).toLocaleString()}
                      </div>
                      {item.manipulationGap && item.manipulationGap.gap > 0 ? (
                        <div className="text-xs text-red-400 font-semibold mt-0.5">
                          +${item.manipulationGap.gap.toLocaleString()} Gap
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-400 mt-0.5">Within Range</div>
                      )}
                    </td>

                    {/* Risk Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getRiskBadge(item.overallRisk)}
                    </td>

                    {/* Primary Flags */}
                    <td className="py-4 px-6">
                      {item.flags.length === 0 ? (
                        <span className="text-xs font-mono text-emerald-400 font-medium">
                          ✓ All Checks Passed Clean
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {item.flags.slice(0, 2).map((flag, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-xs font-mono uppercase font-semibold border ${
                                flag.severity === "CRITICAL"
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {flag.flag_type.replace(/_/g, " ")}
                            </span>
                          ))}
                          {item.flags.length > 2 && (
                            <span className="px-2 py-0.5 rounded text-xs font-mono text-zinc-400 bg-zinc-800 border border-zinc-700">
                              +{item.flags.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTransaction(item.invoice_id, "audit");
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-1 transition-colors"
                        >
                          <span>Audit</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTransaction(item.invoice_id, "reports");
                          }}
                          className="px-2.5 py-1 rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-mono flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Reports</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from "react";
import {
  LayoutGrid,
  FileSpreadsheet,
  FileText,
  Search,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import type { EvaluationResults } from "../types/invoicexray";
import { Logo } from "./Logo";

interface SidebarProps {
  activePage: "dashboard" | "audit" | "reports" | "benchmarks";
  onNavigate: (page: "dashboard" | "audit" | "reports" | "benchmarks") => void;
  selectedId: string | null;
  onSelectTransaction: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onReevaluateAll: () => void;
  isEvaluating: boolean;
  transactionIds: string[];
  evaluations: Record<string, EvaluationResults>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  selectedId,
  onSelectTransaction,
  searchQuery,
  onSearchChange,
  onReevaluateAll,
  isEvaluating,
  transactionIds,
  evaluations,
}) => {
  const seedKeys = transactionIds || [];

  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Brand Header */}
        <Logo
          className="flex items-center gap-3.5 px-1.5 py-2.5 mb-2"
          iconClassName="w-12 h-12 shrink-0"
          textClassName="text-white text-xl"
          subtextClassName="text-[11px] text-zinc-400 font-sans block leading-tight"
        />

        {/* Global Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice, exporter..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/60 font-mono transition-all"
          />
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1.5">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2 font-mono">
            Navigation Menu
          </div>

          {/* Page 1: Dashboard */}
          <button
            onClick={() => onNavigate("dashboard")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activePage === "dashboard"
                ? "bg-red-500/10 text-red-400 border border-red-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-4 h-4" />
              <span>Risk Dashboard</span>
            </div>
            <span className="text-xs font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">
              Main
            </span>
          </button>

          {/* Page 2: Audit & Deep-Dive */}
          <button
            onClick={() => onNavigate("audit")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activePage === "audit"
                ? "bg-red-500/10 text-red-400 border border-red-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Transaction Audit</span>
            </div>
            {selectedId && (
              <span className="text-[10px] font-mono bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-800/40">
                {selectedId}
              </span>
            )}
          </button>

          {/* Page 3: Reports & Filings */}
          <button
            onClick={() => onNavigate("reports")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activePage === "reports"
                ? "bg-red-500/10 text-red-400 border border-red-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>Reports & Filings</span>
            </div>
            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
              STR / ETX
            </span>
          </button>

          {/* Page 4: Commodity Benchmarks */}
          <button
            onClick={() => onNavigate("benchmarks")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activePage === "benchmarks"
                ? "bg-red-500/10 text-red-400 border border-red-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4" />
              <span>Market Benchmarks</span>
            </div>
            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
              LME / ICE
            </span>
          </button>
        </nav>

        {/* Demo Seed Scenario Selector */}
        <div className="space-y-2 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
              Quick Scenarios
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">6 SEEDS</span>
          </div>

          <div className="space-y-1">
            {seedKeys.map((key) => {
              const seedItem = evaluations[key];
              const isSelected = selectedId === key;
              const isCritical = seedItem?.overallRisk === "CRITICAL";
              const isHigh = seedItem?.overallRisk === "HIGH";

              return (
                <button
                  key={key}
                  onClick={() => onSelectTransaction(key)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono transition-all flex items-center justify-between border ${
                    isSelected
                      ? "bg-zinc-800 text-white border-zinc-700 font-bold"
                      : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isCritical
                          ? "bg-red-500"
                          : isHigh
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    ></span>
                    <span className="truncate">{key}</span>
                  </div>

                  {key === "INV-2026-GOLD-99" && (
                    <span className="text-[9px] bg-red-950 text-red-400 px-1 rounded border border-red-800/40 shrink-0">
                      DEMO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer & MCP Pipeline Trigger */}
      <div className="p-4 border-t border-zinc-800/80 space-y-2 bg-zinc-950/80">
        <button
          onClick={onReevaluateAll}
          disabled={isEvaluating}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-mono font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? "animate-spin" : ""}`} />
          <span>{isEvaluating ? "EVALUATING..." : "RUN MCP PIPELINE"}</span>
        </button>


        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-medium">MCP ONLINE</span>
          </div>
          <span>v2.4</span>
        </div>
      </div>
    </aside>
  );
};

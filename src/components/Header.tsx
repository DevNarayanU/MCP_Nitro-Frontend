import React from "react";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  LayoutGrid,
  FileSpreadsheet,
} from "lucide-react";

interface HeaderProps {
  currentView: "dashboard" | "deepdive";
  onViewChange: (view: "dashboard" | "deepdive") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onReevaluateAll: () => void;
  isEvaluating: boolean;
  selectedId: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onReevaluateAll,
  isEvaluating,
  selectedId,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-red-600 to-amber-600 p-0.5 flex items-center justify-center shadow-lg shadow-red-950/50">
            <div className="h-full w-full bg-zinc-950 rounded-[5px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold tracking-tight text-white text-base font-sans flex items-center gap-1.5">
                INVOICE<span className="text-red-500 font-extrabold">X-RAY</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                v2.4-MCP
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Trade-Based Money Laundering Compliance Engine
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice ID, exporter, HS code, or ports..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-md pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 font-mono transition-all"
          />
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-3">
          {/* MCP Server Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-emerald-400">
              MCP SERVER READY
            </span>
          </div>

          {/* View Toggles */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-md border border-zinc-800">
            <button
              onClick={() => onViewChange("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                currentView === "dashboard"
                  ? "bg-zinc-800 text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onViewChange("deepdive")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                currentView === "deepdive"
                  ? "bg-zinc-800 text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Deep-Dive</span>
              {selectedId && (
                <span className="ml-1 text-[10px] font-mono text-red-400 bg-red-950/80 px-1 rounded border border-red-800/40">
                  {selectedId}
                </span>
              )}
            </button>
          </div>

          {/* Re-evaluate Button */}
          <button
            onClick={onReevaluateAll}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-medium transition-all disabled:opacity-50"
            title="Re-run MCP model evaluations on all seed cases"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? "animate-spin text-red-400" : ""}`} />
            <span className="font-mono text-[11px]">{isEvaluating ? "EVALUATING..." : "RUN PIPELINE"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

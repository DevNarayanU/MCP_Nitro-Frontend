import React from "react";
import { Layers, AlertTriangle, DollarSign, Activity } from "lucide-react";

interface MetricsOverviewProps {
  metrics: {
    monitoredVolume: number;
    criticalBreaches: number;
    totalCapitalExposed: number;
  };
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Metric 1: Monitored Volume */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-all shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-sans">
            Monitored Volume
          </span>
          <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
            {metrics.monitoredVolume}
          </span>
          <span className="text-sm text-zinc-400 font-mono">records in system</span>
        </div>
        <div className="mt-3 text-xs text-zinc-400 flex items-center gap-1.5 font-mono pt-3 border-t border-zinc-800/80">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Continuous Seed Data Pipeline Active</span>
        </div>
      </div>

      {/* Metric 2: Critical Breach Flags */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group hover:border-red-900/50 transition-all shadow-md glow-red">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-sans">
            Critical Breach Flags
          </span>
          <div className="p-2.5 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold font-mono text-red-500 tracking-tight">
            {metrics.criticalBreaches}
          </span>
          <span className="text-sm text-red-400/90 font-mono">active red alerts</span>
        </div>
        <div className="mt-3 text-xs text-red-400/90 font-mono pt-3 border-t border-zinc-800/80">
          High-severity TBML triggers synthesized
        </div>
      </div>

      {/* Metric 3: Total Capital Exposed */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group hover:border-amber-900/50 transition-all shadow-md glow-amber">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-sans">
            Total Capital Exposed
          </span>
          <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold font-mono text-amber-500 tracking-tight">
            ${metrics.totalCapitalExposed.toLocaleString()}
          </span>
          <span className="text-sm text-amber-400/90 font-mono">USD</span>
        </div>
        <div className="mt-3 text-xs text-zinc-400 font-mono pt-3 border-t border-zinc-800/80">
          Combined FEMA Penalty + Price Valuation Gap
        </div>
      </div>
    </div>
  );
};

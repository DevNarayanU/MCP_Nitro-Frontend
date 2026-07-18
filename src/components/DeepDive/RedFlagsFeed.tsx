import React from "react";
import type { AccumulatedFlag } from "../../types/invoicexray";
import { AlertOctagon, AlertTriangle, ShieldCheck } from "lucide-react";

interface RedFlagsFeedProps {
  flags: AccumulatedFlag[];
}

export const RedFlagsFeed: React.FC<RedFlagsFeedProps> = ({ flags }) => {
  const safeFlags = flags || [];

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-950 rounded-lg text-red-500">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
            Accumulated TBML Red Flags Feed ({safeFlags.length})
          </h3>
        </div>
        <span className="text-xs font-mono text-zinc-400">
          Synthesized Risk Engine
        </span>
      </div>

      {safeFlags.length === 0 ? (
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-6 text-center font-mono text-sm text-emerald-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Zero red flags accumulated. All compliance rules validated clean.
        </div>
      ) : (
        <div className="space-y-4 font-mono text-sm">
          {safeFlags.map((flag, idx) => {
            const isCritical = flag.severity === "CRITICAL";
            const isHigh = flag.severity === "HIGH";

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isCritical
                    ? "bg-red-950/30 border-red-500/40 text-zinc-200 shadow-md shadow-red-950/40"
                    : isHigh
                    ? "bg-amber-950/30 border-amber-500/40 text-zinc-200"
                    : "bg-zinc-950 border-zinc-800 text-zinc-300"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {isCritical ? (
                      <AlertOctagon className="w-5 h-5 text-red-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                    <span className="font-extrabold tracking-wide text-white text-base font-sans">
                      {flag.flag_type.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        isCritical
                          ? "bg-red-500/20 text-red-400 border border-red-500/40"
                          : isHigh
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {flag.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs bg-zinc-900 text-zinc-400 border border-zinc-800">
                      CONFIDENCE: {flag.confidence}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed font-sans font-normal">
                  {flag.detail}
                </p>

                {/* Supporting Data Chips */}
                {flag.supporting_data && Object.keys(flag.supporting_data).length > 0 && (
                  <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap gap-2 text-xs">
                    {Object.entries(flag.supporting_data).map(([key, val]) => (
                      <div
                        key={key}
                        className="bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800 flex items-center gap-1.5 text-zinc-300"
                      >
                        <span className="text-zinc-500 uppercase text-[11px] font-sans">{key.replace(/_/g, " ")}:</span>
                        <span className="font-bold text-zinc-100">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

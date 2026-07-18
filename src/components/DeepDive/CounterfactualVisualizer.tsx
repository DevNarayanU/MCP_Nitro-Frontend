import React from "react";
import type { ManipulationGap } from "../../types/invoicexray";
import { Scale, TrendingUp, AlertOctagon, CheckCircle2, BarChart2 } from "lucide-react";

interface CounterfactualVisualizerProps {
  gap: ManipulationGap | null;
  declaredValue: number;
}

export const CounterfactualVisualizer: React.FC<CounterfactualVisualizerProps> = ({
  gap,
  declaredValue,
}) => {
  if (!gap) {
    return (
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 font-mono text-sm">
        No counterfactual valuation analysis available for this record.
      </div>
    );
  }

  const safeDeclared = declaredValue || 0;
  const safeGap = gap.gap || 0;
  const benchmarkTotal = Math.max(0, safeDeclared - safeGap);
  const maxTotalVal = Math.max(safeDeclared, benchmarkTotal, 1) * 1.15;
  const declaredBarWidthPct = Math.min(100, Math.max(12, (safeDeclared / maxTotalVal) * 100));
  const benchmarkBarWidthPct = Math.min(100, Math.max(12, (benchmarkTotal / maxTotalVal) * 100));

  const isOverInvoiced = gap.direction === "OVER_INVOICED";
  const isWithinRange = gap.direction === "WITHIN_RANGE";

  // Exact Unit Price Positioning Math
  const declaredUnit = gap.declared;
  const benchmarkUnit = gap.benchmark;
  const lowerTol = benchmarkUnit * 0.9;
  const upperTol = benchmarkUnit * 1.1;

  const minVal = Math.min(declaredUnit, lowerTol);
  const maxVal = Math.max(declaredUnit, upperTol);
  const rawSpan = maxVal - minVal || 1;

  // 1. Calculate min_axis and max_axis cleanly
  const min_axis = Math.max(0, minVal - rawSpan * 0.25);
  const max_axis = maxVal + rawSpan * 0.25;
  const axisRange = max_axis - min_axis || 1;

  // 1. Exact formula: percentage = ((value - min_axis) / (max_axis - min_axis)) * 100
  const getPercentage = (value: number) => ((value - min_axis) / axisRange) * 100;

  const lowerTolPct = getPercentage(lowerTol);
  const upperTolPct = getPercentage(upperTol);
  const rangeWidthPct = upperTolPct - lowerTolPct;
  const benchmarkPct = getPercentage(benchmarkUnit);
  const declaredPct = getPercentage(declaredUnit);

  const formatPrice = (val: number) => {
    return val >= 1000 ? `$${val.toLocaleString()}` : `$${val.toFixed(2)}`;
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
              Counterfactual Pricing & Market Benchmark Visualizer
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Unit price discrepancy vs LBMA & global customs commodity index
            </p>
          </div>
        </div>

        {/* Direction Badge */}
        <span
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border flex items-center gap-2 ${
            isOverInvoiced
              ? "bg-red-500/10 text-red-500 border-red-500/30 shadow-md shadow-red-950"
              : isWithinRange
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}
        >
          {isOverInvoiced ? (
            <AlertOctagon className="w-4 h-4" />
          ) : isWithinRange ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          {gap.direction.replace(/_/g, " ")}
        </span>
      </div>

      {/* Total Valuation Comparison Bars */}
      <div className="space-y-4 font-mono text-sm">
        {/* Declared Total Value */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-zinc-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Declared Total Invoice Value
            </span>
            <span className="text-red-400 font-bold text-sm">
              ${declaredValue.toLocaleString()} USD ({formatPrice(gap.declared)}/unit)
            </span>
          </div>
          <div className="h-6 bg-zinc-950 rounded-lg overflow-hidden p-0.5 border border-zinc-800 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-md transition-all duration-700"
              style={{ width: `${declaredBarWidthPct}%` }}
            ></div>
          </div>
        </div>

        {/* Market Benchmark Value */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-zinc-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Market Benchmark Fair Valuation
            </span>
            <span className="text-blue-400 font-bold text-sm">
              ${benchmarkTotal.toLocaleString()} USD ({formatPrice(gap.benchmark)}/unit)
            </span>
          </div>
          <div className="h-6 bg-zinc-950 rounded-lg overflow-hidden p-0.5 border border-zinc-800 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-md transition-all duration-700 opacity-90"
              style={{ width: `${benchmarkBarWidthPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Unit Price Distribution vs Fair Market Range Slider Chart */}
      <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 pb-3 border-b border-zinc-800">
          <span className="flex items-center gap-2 font-bold text-zinc-200 text-sm font-sans">
            <BarChart2 className="w-4 h-4 text-amber-400" /> Unit Price Distribution vs Fair Market Range
          </span>
          <span className="text-zinc-500">CURRENCY: USD / UNIT</span>
        </div>

        {/* Legend Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/60 shrink-0"></span>
            <div>
              <div className="text-[11px] text-zinc-400 font-sans">Fair Market Range</div>
              <div className="font-bold text-emerald-400">{formatPrice(lowerTol)} - {formatPrice(upperTol)}</div>
            </div>
          </div>

          <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-500 shrink-0"></span>
            <div>
              <div className="text-[11px] text-zinc-400 font-sans">Spot Benchmark</div>
              <div className="font-bold text-blue-400">{formatPrice(benchmarkUnit)}</div>
            </div>
          </div>

          <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500 shrink-0"></span>
            <div>
              <div className="text-[11px] text-zinc-400 font-sans">Declared Unit Price</div>
              <div className="font-bold text-red-400">{formatPrice(declaredUnit)}</div>
            </div>
          </div>
        </div>

        {/* 2. & 3. Slider Track Container with adequate horizontal padding & overflow visible */}
        <div className="pt-2 px-3 space-y-2 font-mono">
          <div className="relative h-14 bg-zinc-900 rounded-xl border border-zinc-800 overflow-visible flex items-center">
            {/* Fair Market Range Band */}
            <div
              className="absolute h-full bg-emerald-500/15 border-x-2 border-emerald-500/40 flex items-center justify-center pointer-events-none"
              style={{
                left: `${lowerTolPct}%`,
                width: `${rangeWidthPct}%`,
              }}
            >
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest opacity-80 hidden sm:inline">
                NORMAL ZONE
              </span>
            </div>

            {/* 3. Spot Benchmark Marker Handle - Centered with translateX(-50%) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10 flex flex-col justify-between items-center -translate-x-1/2 pointer-events-none"
              style={{ left: `${benchmarkPct}%` }}
            >
              <div className="w-3.5 h-3.5 bg-blue-500 rounded-full -translate-y-1.5 shadow-md border border-blue-300"></div>
              <div className="w-3.5 h-3.5 bg-blue-500 rounded-full translate-y-1.5 shadow-md border border-blue-300"></div>
            </div>

            {/* 2. & 3. Red Declared Unit Price Marker Handle - Centered with translateX(-50%) & Overflow Visible */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-red-500 z-20 flex flex-col justify-between items-center -translate-x-1/2 shadow-lg shadow-red-950/80 pointer-events-none"
              style={{ left: `${declaredPct}%` }}
            >
              <div className="w-4 h-4 bg-red-500 rounded-full -translate-y-2 shadow-lg shadow-red-950 border-2 border-white"></div>
              <div className="w-4 h-4 bg-red-500 rounded-full translate-y-2 shadow-lg shadow-red-950 border-2 border-white"></div>
            </div>
          </div>

          {/* Axis Min & Max Labels */}
          <div className="flex justify-between text-[11px] text-zinc-500 font-mono pt-1">
            <span>Min Axis: {formatPrice(min_axis)}</span>
            <span className="text-zinc-400 font-semibold">
              Variance: {gap.benchmark > 0 ? `${(((gap.declared - gap.benchmark) / gap.benchmark) * 100).toFixed(1)}%` : "0%"}
            </span>
            <span>Max Axis: {formatPrice(max_axis)}</span>
          </div>
        </div>
      </div>

      {/* Discrepancy Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-sm">
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <span className="text-xs text-zinc-400 uppercase tracking-wider block font-sans">Valuation Gap Delta</span>
          <div className="font-extrabold text-red-500 text-xl mt-1">
            ${gap.gap.toLocaleString()} USD
          </div>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-right">
          <span className="text-xs text-zinc-400 uppercase tracking-wider block font-sans">Unit Price Variance</span>
          <div className="font-extrabold text-amber-400 text-xl mt-1">
            {gap.benchmark > 0
              ? `${(((gap.declared - gap.benchmark) / gap.benchmark) * 100).toFixed(2)}%`
              : "0%"}
          </div>
        </div>
      </div>

      {/* Pre-formatted Narrative Quote Block */}
      <div className="bg-zinc-950 border-l-4 border-l-red-500 border border-zinc-800 p-4 rounded-r-xl text-sm text-zinc-300 italic font-mono leading-relaxed">
        <p className="not-italic text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5 font-sans">
          Algorithmic Counterfactual Audit Narrative
        </p>
        "{gap.narrative}"
      </div>
    </div>
  );
};

import React from "react";
import type { CommodityBenchmark } from "../../types/invoicexray";
import { TrendingUp, Scale, RefreshCw, Sun, Moon } from "lucide-react";

interface BenchmarksPageProps {
  benchmarks: CommodityBenchmark[];
  isLoading: boolean;
  onRefresh: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const BenchmarksPage: React.FC<BenchmarksPageProps> = ({
  benchmarks,
  isLoading,
  onRefresh,
  theme,
  onToggleTheme,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            Independent Pricing Benchmarks
          </h1>
          <p className="text-sm text-zinc-400 font-mono mt-1">
            Dynamic valuation indicators queried from database via MCP
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>REFRESH</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            title="Toggle color theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{theme === "dark" ? "LIGHT" : "DARK"}</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/30 transition-all shadow-lg shadow-zinc-950/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
              Active Commodities
            </span>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {benchmarks.length}
          </div>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            Tracked HS Codes in Database
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/30 transition-all shadow-lg shadow-zinc-950/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
              Data Feeds
            </span>
            <Scale className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            LME / COMTRADE / ICE
          </div>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            Direct Exchange Integrations
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/30 transition-all shadow-lg shadow-zinc-950/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
              Pricing Volatility
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            90-Day SMA
          </div>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            Rolling pricing model activated
          </p>
        </div>
      </div>

      {/* Benchmarks Grid / Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl shadow-zinc-950/30">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/30">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Exchange Pricing & Statistical Benchmarks List
          </h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 font-mono text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
            <span>Fetching live database benchmarks...</span>
          </div>
        ) : benchmarks.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-mono text-xs">
            No benchmarks found in the database. Run backend seeds to populate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-zinc-900/30 border-b border-zinc-800">
                  <th className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-left py-4 px-6 font-mono">
                    Commodity / HS Code
                  </th>
                  <th className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right py-4 px-6 font-mono">
                    Spot Price (USD)
                  </th>
                  <th className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right py-4 px-6 font-mono">
                    90D Mean Price
                  </th>
                  <th className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right py-4 px-6 font-mono">
                    Volatility Range (90D)
                  </th>
                  <th className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center py-4 px-6 font-mono">
                    Adjustment Factor
                  </th>
                  <th className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-left py-4 px-6 font-mono">
                    Source / Grade
                  </th>
                  <th className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right py-4 px-6 font-mono">
                    Last Sync
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                {benchmarks.map((bench) => (
                  <tr key={bench.hs_code} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-sans font-bold text-white text-sm">
                          {bench.commodity_name}
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">
                          HS Code: {bench.hs_code}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-emerald-400">
                      ${bench.spot_price_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })} / {bench.unit}
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-300">
                      ${bench.mean_price_90d.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-400">
                      <div className="flex flex-col text-right">
                        <span>
                          Min: ${bench.min_price_90d.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span>
                          Max: ${bench.max_price_90d.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-zinc-300">
                      x{bench.seasonal_adjustment_factor.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-zinc-200 font-bold">{bench.source}</span>
                        <span className="text-[10px] text-zinc-400 uppercase">
                          Grade: {bench.quality_grade}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-500 text-[10px]">
                      {new Date(bench.last_updated).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

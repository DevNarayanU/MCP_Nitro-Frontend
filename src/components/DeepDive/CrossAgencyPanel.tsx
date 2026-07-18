import React from "react";
import type { CrossAgencyVerification } from "../../types/invoicexray";
import { ShieldCheck, ShieldAlert, Scale, MapPin, CheckCircle, AlertCircle } from "lucide-react";

interface CrossAgencyPanelProps {
  crossAgency: CrossAgencyVerification;
}

export const CrossAgencyPanel: React.FC<CrossAgencyPanelProps> = ({ crossAgency }) => {
  const isDgftCaution = crossAgency.dgft_status.status === "CAUTION_LISTED";
  const isIcegateAnomaly = crossAgency.icegate_customs.anomaly_detected;
  const isGeospatialAnomaly = crossAgency.geospatial_routing.is_landlocked;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
          Cross-Agency Intelligence Verification
        </h3>
        <span className="text-xs font-mono text-zinc-400">
          Live Crossmatch Data Stream
        </span>
      </div>

      <div className="space-y-4 font-mono text-sm">
        {/* 1. DGFT Status */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isDgftCaution
              ? "bg-red-500/10 border-red-500/40 text-zinc-200 shadow-md shadow-red-950"
              : "bg-zinc-950 border-zinc-800 text-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="font-bold text-zinc-100 text-base flex items-center gap-2 font-sans">
              {isDgftCaution ? (
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              DGFT Importer-Exporter Code (IEC) Status
            </span>
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold ${
                isDgftCaution
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}
            >
              {crossAgency.dgft_status.status}
            </span>
          </div>
          <div className="text-xs text-zinc-400 mt-2 space-y-1">
            <div>
              IEC Code: <span className="text-zinc-200 font-bold">{crossAgency.dgft_status.iec}</span>
            </div>
            {crossAgency.dgft_status.issue_details && (
              <p className="text-red-400 font-semibold text-xs mt-1">
                ⚠ {crossAgency.dgft_status.issue_details}
              </p>
            )}
          </div>
        </div>

        {/* 2. ICEGATE Customs Integration */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isIcegateAnomaly
              ? "bg-amber-500/10 border-amber-500/40 text-zinc-200 shadow-md"
              : "bg-zinc-950 border-zinc-800 text-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="font-bold text-zinc-100 text-base flex items-center gap-2 font-sans">
              {isIcegateAnomaly ? (
                <Scale className="w-5 h-5 text-amber-500 shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              ICEGATE Customs Cargo Manifest Scan
            </span>
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold ${
                isIcegateAnomaly
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}
            >
              {isIcegateAnomaly ? "WEIGHT ANOMALY DETECTED" : "VERIFIED MATCH"}
            </span>
          </div>
          <div className="text-xs text-zinc-400 mt-2 grid grid-cols-2 gap-3">
            <div>
              SB Ref: <span className="text-zinc-200 font-bold">{crossAgency.icegate_customs.shipping_bill}</span>
            </div>
            <div>
              Declared: <span className="text-zinc-200 font-bold">{crossAgency.icegate_customs.declared_weight_kg} kg</span>
            </div>
            <div>
              Customs Scanned: <span className="text-zinc-200 font-bold">{crossAgency.icegate_customs.customs_logged_weight_kg} kg</span>
            </div>
            <div>
              Variance:{" "}
              <span
                className={`font-extrabold ${
                  isIcegateAnomaly ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {crossAgency.icegate_customs.weight_variance_pct}%
              </span>
            </div>
          </div>
        </div>

        {/* 3. Geospatial Shipping Route Validation */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isGeospatialAnomaly
              ? "bg-red-500/10 border-red-500/40 text-zinc-200 shadow-md shadow-red-950"
              : "bg-zinc-950 border-zinc-800 text-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="font-bold text-zinc-100 text-base flex items-center gap-2 font-sans">
              {isGeospatialAnomaly ? (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              Geospatial Shipping Route Risk Analysis
            </span>
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold ${
                isGeospatialAnomaly
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}
            >
              {isGeospatialAnomaly ? "LANDLOCKED DISCHARGE" : "VALID SEAPORT"}
            </span>
          </div>
          <div className="text-xs text-zinc-400 mt-2 space-y-1">
            <div>
              Port Corridor: <span className="text-zinc-200 font-bold">{crossAgency.geospatial_routing.origin_port}</span> ➔{" "}
              <span className="text-amber-400 font-bold">{crossAgency.geospatial_routing.discharge_port} ({crossAgency.geospatial_routing.country})</span>
            </div>
            {crossAgency.geospatial_routing.anomaly && (
              <p className="text-red-400 font-semibold text-xs mt-1">
                ⚠ {crossAgency.geospatial_routing.anomaly}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

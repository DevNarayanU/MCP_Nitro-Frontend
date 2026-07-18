import React from "react";
import type { TransactionMeta, RiskLevel } from "../../types/invoicexray";
import {
  FileText,
  UserCheck,
  Globe,
  Anchor,
  Clock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface TransactionMetaHeaderProps {
  meta: TransactionMeta;
  overallRisk: RiskLevel;
}

export const TransactionMetaHeader: React.FC<TransactionMetaHeaderProps> = ({
  meta,
  overallRisk,
}) => {
  const getRiskPill = (risk: RiskLevel) => {
    switch (risk) {
      case "CRITICAL":
        return (
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-red-500/10 text-red-500 border border-red-500/40 flex items-center gap-2 shadow-md shadow-red-950">
            <ShieldAlert className="w-4 h-4" />
            CRITICAL BREACH
          </span>
        );
      case "HIGH":
        return (
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/40 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            HIGH RISK
          </span>
        );
      case "CLEAR":
        return (
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            VERIFIED CLEAR
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            ELEVATED
          </span>
        );
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-lg space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold font-mono text-white tracking-wide">
                {meta.invoice_id}
              </h2>
              {getRiskPill(overallRisk)}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Issued: <strong className="text-zinc-200">{meta.invoice_date}</strong> • Realization Window:{" "}
              <strong className="text-amber-400">{meta.days_remaining} Days Remaining</strong>
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-xs text-zinc-400 uppercase tracking-wider">Declared Invoice Value</div>
          <div className="text-2xl font-extrabold text-white">
            ${meta.declared_value_usd.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">USD</span>
          </div>
        </div>
      </div>

      {/* Spacious 4-Column Data Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-sm">
        <div className="bg-zinc-950/80 p-4 rounded-lg border border-zinc-800 space-y-1">
          <div className="text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <UserCheck className="w-4 h-4 text-zinc-400" /> Exporter IEC
          </div>
          <div className="font-bold text-zinc-100 text-base truncate">{meta.exporter_name}</div>
          <div className="text-xs text-red-400 font-bold">IEC: {meta.exporter_iec}</div>
        </div>

        <div className="bg-zinc-950/80 p-4 rounded-lg border border-zinc-800 space-y-1">
          <div className="text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Globe className="w-4 h-4 text-zinc-400" /> Foreign Counterparty
          </div>
          <div className="font-bold text-zinc-100 text-base truncate">{meta.importer_name}</div>
          <div className="text-xs text-zinc-400">Incoterms: <strong className="text-zinc-200">{meta.incoterms}</strong></div>
        </div>

        <div className="bg-zinc-950/80 p-4 rounded-lg border border-zinc-800 space-y-1">
          <div className="text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Anchor className="w-4 h-4 text-zinc-400" /> Shipping Ports
          </div>
          <div className="font-bold text-zinc-100 text-sm truncate">{meta.origin_port}</div>
          <div className="text-xs text-amber-400 font-semibold truncate">➔ {meta.discharge_port}</div>
        </div>

        <div className="bg-zinc-950/80 p-4 rounded-lg border border-zinc-800 space-y-1">
          <div className="text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Clock className="w-4 h-4 text-zinc-400" /> Commodity HS Code
          </div>
          <div className="font-bold text-zinc-100 text-base">{meta.hs_code}</div>
          <div className="text-xs text-zinc-400 truncate">{meta.hs_description}</div>
        </div>
      </div>
    </div>
  );
};

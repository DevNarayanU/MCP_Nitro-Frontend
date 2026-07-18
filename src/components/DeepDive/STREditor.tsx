import React, { useState, useEffect } from "react";
import type { FIU_STR_Draft } from "../../types/invoicexray";
import { Terminal, Copy, Check } from "lucide-react";

interface STREditorProps {
  strDraft: FIU_STR_Draft | null;
  onCopyNarrative: (narrative: string) => void;
}

export const STREditor: React.FC<STREditorProps> = ({ strDraft, onCopyNarrative }) => {
  const [editableNarrative, setEditableNarrative] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (strDraft?.fiu_ind_str_draft?.fiu_ready_narrative) {
      setEditableNarrative(strDraft.fiu_ind_str_draft.fiu_ready_narrative);
    } else {
      setEditableNarrative("No FIU-IND Suspicious Transaction Report generated for this clear/low-risk record.");
    }
  }, [strDraft]);

  const handleCopy = () => {
    onCopyNarrative(editableNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const meta = strDraft?.fiu_ind_str_draft?.metadata;
  const header = strDraft?.fiu_ind_str_draft?.header;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-lg space-y-4">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-950 rounded-lg text-red-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
              FIU-IND Suspicious Transaction Report (STR) Draft
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Regulatory compliance markdown narrative terminal
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-md transition-all active:scale-95"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY STR NARRATIVE"}</span>
        </button>
      </div>

      {/* Meta Header Grid */}
      {header && meta && (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-zinc-500 uppercase block font-sans text-[11px]">STR REF ID</span>
            <span className="text-zinc-200 font-bold text-sm">{header.str_id}</span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase block font-sans text-[11px]">JURISDICTION</span>
            <span className="text-zinc-200 font-bold text-sm">{header.jurisdiction}</span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase block font-sans text-[11px]">TBML RISK RATING</span>
            <span className="text-red-400 font-bold text-sm">{meta.tbml_risk_rating}</span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase block font-sans text-[11px]">FEMA PENALTY EXPOSURE</span>
            <span className="text-amber-400 font-bold text-sm">${meta.estimated_fema_penalty_exposure_usd.toLocaleString()} USD</span>
          </div>
        </div>
      )}

      {/* Terminal / Paper Styled Narrative Editor */}
      <div className="relative rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden font-mono text-sm shadow-inner">
        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 flex items-center justify-between font-mono">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> Terminal STR Compliance Draft
          </span>
          <span className="text-zinc-500 uppercase">Interactive Editor</span>
        </div>

        <textarea
          value={editableNarrative}
          onChange={(e) => setEditableNarrative(e.target.value)}
          rows={12}
          className="w-full bg-zinc-950 p-4 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500/40 leading-relaxed font-mono resize-y text-sm"
          placeholder="FIU narrative loading..."
        />
      </div>
    </div>
  );
};

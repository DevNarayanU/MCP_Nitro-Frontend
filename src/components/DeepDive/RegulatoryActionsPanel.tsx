import React, { useState } from "react";
import { FileCode, FileText, Copy, Download, Check } from "lucide-react";

interface RegulatoryActionsPanelProps {
  invoiceId: string;
  htmlReport: string;
  rbiFormETX: string;
  onShowToast: (msg: string) => void;
}

export const RegulatoryActionsPanel: React.FC<RegulatoryActionsPanelProps> = ({
  invoiceId,
  htmlReport,
  rbiFormETX,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<"audit_html" | "rbi_etx">("audit_html");
  const [copiedEtx, setCopiedEtx] = useState<boolean>(false);

  const handleCopyEtx = () => {
    navigator.clipboard.writeText(rbiFormETX);
    setCopiedEtx(true);
    onShowToast("RBI Form ETX copied to clipboard!");
    setTimeout(() => setCopiedEtx(false), 2000);
  };

  const handleDownloadEtx = () => {
    const blob = new Blob([rbiFormETX], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RBI_Form_ETX_${invoiceId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`Downloaded RBI_Form_ETX_${invoiceId}.txt`);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-lg space-y-4">
      {/* Panel Header & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-lg text-blue-400">
            <FileCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
            Regulatory Actions & Statutory Reports
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab("audit_html")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
              activeTab === "audit_html"
                ? "bg-zinc-800 text-white font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Counterfactual Report (HTML)</span>
          </button>

          <button
            onClick={() => setActiveTab("rbi_etx")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
              activeTab === "rbi_etx"
                ? "bg-zinc-800 text-white font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>RBI Form ETX</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: Sandboxed HTML Audit Report Iframe */}
      {activeTab === "audit_html" && (
        <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-inner">
          <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono flex items-center justify-between">
            <span>ISOLATED SANDBOXED AUDIT CONTAINER</span>
            <span className="text-zinc-500 font-mono">HTML5 AUDIT SPECIFICATION</span>
          </div>
          <iframe
            srcDoc={htmlReport}
            title={`Audit Report ${invoiceId}`}
            className="w-full h-[520px] border-none bg-zinc-950"
            sandbox="allow-same-origin"
          />
        </div>
      )}

      {/* Tab Content 2: Plain Text RBI Form ETX Layout */}
      {activeTab === "rbi_etx" && (
        <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden font-mono text-sm shadow-inner">
          <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono flex items-center justify-between">
            <span>RESERVE BANK OF INDIA STATUTORY EXTENSION FILING</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyEtx}
                className="flex items-center gap-1.5 text-zinc-200 hover:text-white transition-colors font-semibold"
              >
                {copiedEtx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEtx ? "Copied" : "Copy Form"}</span>
              </button>
              <button
                onClick={handleDownloadEtx}
                className="flex items-center gap-1.5 text-zinc-200 hover:text-white transition-colors font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          <pre className="p-6 text-zinc-200 bg-zinc-950 font-mono text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {rbiFormETX}
          </pre>
        </div>
      )}
    </div>
  );
};

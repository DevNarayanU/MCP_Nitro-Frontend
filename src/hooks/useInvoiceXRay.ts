import { useState, useCallback, useEffect, useMemo } from "react";
import type { EvaluationResults } from "../types/invoicexray";
import { SEED_TRANSACTIONS } from "../data/seedTransactions";

export function useInvoiceXRay() {
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationResults>>({});
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>("INV-2026-GOLD-99");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Evaluate single transaction (simulating MCP server tool execution)
  const evaluateTransaction = useCallback(async (id: string): Promise<EvaluationResults> => {
    // Simulate slight network delay for high-tech pipeline feel
    await new Promise((res) => setTimeout(res, 250));

    const result = SEED_TRANSACTIONS[id];
    if (!result) {
      throw new Error(`Transaction ID ${id} not found in MCP registry.`);
    }

    setEvaluations((prev) => ({
      ...prev,
      [id]: {
        ...result,
        evaluatedAt: new Date().toISOString(),
      },
    }));

    return result;
  }, []);

  // Orchestrate sequential/concurrent loading of all seed IDs
  const evaluateAll = useCallback(async () => {
    setIsEvaluating(true);
    const ids = Object.keys(SEED_TRANSACTIONS);
    for (const id of ids) {
      await evaluateTransaction(id);
    }
    setIsEvaluating(false);
  }, [evaluateTransaction]);

  // Auto-initialize on mount
  useEffect(() => {
    evaluateAll();
  }, [evaluateAll]);

  // Derived filtered transactions list
  const filteredEvaluations = useMemo(() => {
    const list = Object.values(evaluations);
    return list.filter((item) => {
      const matchesSearch =
        item.invoice_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transactionMeta.exporter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transactionMeta.importer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transactionMeta.hs_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRisk = riskFilter === "ALL" || item.overallRisk === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [evaluations, searchQuery, riskFilter]);

  // Global aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const list = Object.values(evaluations);
    const monitoredVolume = list.length;
    let criticalBreaches = 0;
    let totalCapitalExposed = 0;

    list.forEach((item) => {
      if (item.overallRisk === "CRITICAL" || item.overallRisk === "HIGH") {
        criticalBreaches += item.flags.filter(
          (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
        ).length;
      }

      const penalty = item.totalPenaltyExposure || 0;
      const gap = item.manipulationGap?.gap || 0;
      totalCapitalExposed += penalty + gap;
    });

    return {
      monitoredVolume,
      criticalBreaches,
      totalCapitalExposed,
    };
  }, [evaluations]);

  const selectedEvaluation = useMemo(() => {
    if (!selectedId) return null;
    return evaluations[selectedId] || SEED_TRANSACTIONS[selectedId] || null;
  }, [selectedId, evaluations]);

  // HTML Counterfactual Audit Report Generator
  const generateCounterfactualReport = useCallback((id: string): string => {
    const record = evaluations[id] || SEED_TRANSACTIONS[id];
    if (!record) return "<p>Transaction not found.</p>";

    const { transactionMeta, manipulationGap, overallRisk, flags, crossAgency } = record;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>InvoiceX-Ray Counterfactual Valuation Audit - ${id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; padding: 24px; margin: 0; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 2px solid #27272a; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
    .subtitle { color: #a1a1aa; font-size: 12px; font-family: monospace; }
    .badge { padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
    .badge-CRITICAL { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-HIGH { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-CLEAR { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .section { background: #18181b; border: 1px solid #27272a; border-radius: 6px; padding: 16px; margin-bottom: 16px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #a1a1aa; margin-bottom: 12px; border-bottom: 1px solid #27272a; padding-bottom: 6px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .data-item { display: flex; flex-direction: column; }
    .data-label { color: #71717a; font-size: 11px; text-transform: uppercase; }
    .data-value { font-family: monospace; font-size: 13px; color: #e4e4e7; font-weight: 600; }
    .bar-container { background: #27272a; border-radius: 4px; height: 24px; position: relative; margin: 8px 0; overflow: hidden; }
    .bar-declared { background: #ef4444; height: 100%; border-radius: 4px; transition: width 0.5s ease; }
    .bar-benchmark { background: #3b82f6; height: 100%; border-radius: 4px; opacity: 0.8; }
    .narrative { background: #09090b; border-left: 3px solid #ef4444; padding: 10px 14px; font-size: 12px; color: #d4d4d8; margin-top: 10px; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #27272a; font-size: 12px; }
    th { color: #a1a1aa; font-weight: 600; font-size: 11px; text-transform: uppercase; }
    td { font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">COUNTERFACTUAL VALUATION AUDIT REPORT</div>
      <div class="subtitle">INVOICE ID: ${transactionMeta.invoice_id} | EVALUATED: ${new Date(record.evaluatedAt).toLocaleString()}</div>
    </div>
    <div>
      <span class="badge badge-${overallRisk}">${overallRisk} RISK</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Trade Entity & Logistics Summary</div>
    <div class="grid">
      <div class="data-item"><span class="data-label">Exporter</span><span class="data-value">${transactionMeta.exporter_name} (${transactionMeta.exporter_iec})</span></div>
      <div class="data-item"><span class="data-label">Importer</span><span class="data-value">${transactionMeta.importer_name}</span></div>
      <div class="data-item"><span class="data-label">HS Commodity</span><span class="data-value">${transactionMeta.hs_code} - ${transactionMeta.hs_description}</span></div>
      <div class="data-item"><span class="data-label">Route Ports</span><span class="data-value">${transactionMeta.origin_port} ➔ ${transactionMeta.discharge_port}</span></div>
    </div>
  </div>

  ${
    manipulationGap
      ? `<div class="section">
    <div class="section-title">Counterfactual Pricing Analysis</div>
    <div class="grid">
      <div class="data-item"><span class="data-label">Declared Total</span><span class="data-value">$${transactionMeta.declared_value_usd.toLocaleString()} USD</span></div>
      <div class="data-item"><span class="data-label">Benchmark Market Valuation</span><span class="data-value">$${(transactionMeta.declared_value_usd - manipulationGap.gap).toLocaleString()} USD</span></div>
      <div class="data-item"><span class="data-label">Valuation Discrepancy (Gap)</span><span class="data-value" style="color: ${manipulationGap.gap > 0 ? "#ef4444" : "#10b981"}">$${manipulationGap.gap.toLocaleString()} USD (${manipulationGap.direction})</span></div>
      <div class="data-item"><span class="data-label">Penalty Exposure</span><span class="data-value" style="color: #f59e0b">$${record.totalPenaltyExposure.toLocaleString()} USD</span></div>
    </div>
    <div class="narrative">"${manipulationGap.narrative}"</div>
  </div>`
      : ""
  }

  <div class="section">
    <div class="section-title">Synthesized TBML Risk Indicators (${flags.length})</div>
    <table>
      <thead>
        <tr>
          <th>Flag Code</th>
          <th>Severity</th>
          <th>Confidence</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${flags
          .map(
            (f) => `<tr>
          <td style="color: #f4f4f5; font-weight: 700;">${f.flag_type}</td>
          <td><span style="color: ${f.severity === "CRITICAL" ? "#ef4444" : f.severity === "HIGH" ? "#f59e0b" : "#a1a1aa"}">${f.severity}</span></td>
          <td>${f.confidence}</td>
          <td>${f.detail}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Cross-Agency Data Verification</div>
    <div class="grid">
      <div class="data-item"><span class="data-label">DGFT IEC Status</span><span class="data-value" style="color: ${crossAgency.dgft_status.status === "CAUTION_LISTED" ? "#ef4444" : "#10b981"}">${crossAgency.dgft_status.status}</span></div>
      <div class="data-item"><span class="data-label">ICEGATE Weight Variance</span><span class="data-value" style="color: ${crossAgency.icegate_customs.anomaly_detected ? "#ef4444" : "#10b981"}">${crossAgency.icegate_customs.weight_variance_pct}% Variance</span></div>
      <div class="data-item"><span class="data-label">Geospatial Discharge Risk</span><span class="data-value">${crossAgency.geospatial_routing.is_landlocked ? "LANDLOCKED DISCHARGE" : "NORMAL SEAPORT"}</span></div>
    </div>
  </div>

  <div style="font-size: 10px; color: #52525b; text-align: center; margin-top: 20px; font-family: monospace;">
    GENERATED BY INVOICEX-RAY COMPLIANCE PLATFORM • CONFIDENTIAL REGULATORY REPORT
  </div>
</body>
</html>`;
  }, [evaluations]);

  // Formatted plain text RBI Form ETX layout generator
  const generateRBIFormETX = useCallback((id: string): string => {
    const record = evaluations[id] || SEED_TRANSACTIONS[id];
    if (!record) return "Transaction not found.";

    const { transactionMeta, overallRisk, totalPenaltyExposure } = record;

    return `================================================================================
RESERVE BANK OF INDIA - FOREIGN EXCHANGE MANAGEMENT ACT (FEMA)
FORM ETX: APPLICATION FOR EXTENSION OF TIME FOR REALIZATION OF EXPORT BILLS
================================================================================
DATE OF APPLICATION : ${new Date().toISOString().split("T")[0]}
SYSTEM AUDIT REF NO : ETX-INVOICEXRAY-${id}-${Date.now().toString().slice(-4)}

1. PARTICULARS OF EXPORTER:
   Name of Exporter       : ${transactionMeta.exporter_name}
   Importer-Exporter Code : ${transactionMeta.exporter_iec}
   Authorised Dealer Bank : State Bank of India, Overseas Branch, Mumbai

2. PARTICULARS OF EXPORT BILL / INVOICE:
   Invoice Number & Date  : ${transactionMeta.invoice_id} / ${transactionMeta.invoice_date}
   Shipping Bill No & Date: ${record.crossAgency.icegate_customs.shipping_bill}
   Port of Loading        : ${transactionMeta.origin_port}
   Destination Port       : ${transactionMeta.discharge_port}
   Commodity / HS Code    : ${transactionMeta.hs_description} (${transactionMeta.hs_code})

3. FINANCIAL SUMMARY:
   Total Invoice Value    : $${transactionMeta.declared_value_usd.toLocaleString()} USD
   Amount Realized to Date: $${transactionMeta.realized_amount_usd.toLocaleString()} USD
   Outstanding Balance    : $${(transactionMeta.declared_value_usd - transactionMeta.realized_amount_usd).toLocaleString()} USD
   Original Due Date      : ${transactionMeta.realization_deadline} (${transactionMeta.days_remaining} Days Remaining)

4. TBML COMPLIANCE RISK ASSESSMENT:
   Automated Risk Rating  : ${overallRisk}
   Estimated FEMA Penalty : $${totalPenaltyExposure.toLocaleString()} USD
   Primary Compliance Flag: ${record.flags[0]?.detail || "N/A - Standard Commercial Realization Monitoring"}

5. EXTENSION REQUEST & REASON:
   Extension Period Sought: 180 Days beyond statutory 9-month window.
   Justification Narrative: Export proceeds delayed due to buyer commercial dispute and overseas correspondent banking clearance checks. Trade documents under compliance hold.

================================================================================
STATUS: PENDING AD AUTHORISED OFFICER APPROVAL & EDPMS REGISTRATION
================================================================================`;
  }, [evaluations]);

  const exportSTRNarrative = useCallback(
    async (id: string): Promise<string> => {
      const record = evaluations[id] || SEED_TRANSACTIONS[id];
      const narrative = record?.str?.fiu_ind_str_draft?.fiu_ready_narrative || "No STR Narrative generated for this transaction.";
      try {
        await navigator.clipboard.writeText(narrative);
        showToast("STR Narrative copied to clipboard!");
      } catch (err) {
        showToast("Copied text to clipboard");
      }
      return narrative;
    },
    [evaluations, showToast]
  );

  return {
    evaluations,
    filteredEvaluations,
    aggregateMetrics,
    isEvaluating,
    selectedId,
    setSelectedId,
    selectedEvaluation,
    evaluateTransaction,
    evaluateAll,
    generateCounterfactualReport,
    generateRBIFormETX,
    exportSTRNarrative,
    searchQuery,
    setSearchQuery,
    riskFilter,
    setRiskFilter,
    toastMessage,
    showToast,
  };
}

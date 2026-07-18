import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { EvaluationResults, AccumulatedFlag, CommodityBenchmark } from "../types/invoicexray";

// Browser-safe, native EventSource/Fetch-based MCP Client to prevent Node dependency crashes in the browser
class BrowserMcpClient {
  private eventSource: EventSource | null = null;
  private postUrl: string | null = null;
  private pendingRequests = new Map<number | string, { resolve: (val: any) => void; reject: (err: any) => void }>();
  private idCounter = 1;
  private connectPromise: Promise<void> | null = null;

  private sseUrl: string;

  constructor(sseUrl: string) {
    this.sseUrl = sseUrl;
  }

  async connect(): Promise<void> {
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise<void>((resolve, reject) => {
      console.log(`[BrowserMcpClient] Connecting to SSE at ${this.sseUrl}...`);
      const es = new EventSource(this.sseUrl);
      this.eventSource = es;

      const timeout = setTimeout(() => {
        es.close();
        reject(new Error("Connection timeout after 5 seconds"));
      }, 5000);

      es.addEventListener("endpoint", (event) => {
        clearTimeout(timeout);
        const relativeUrl = event.data;
        const base = new URL(this.sseUrl).origin;
        this.postUrl = new URL(relativeUrl, base).toString();
        console.log(`[BrowserMcpClient] Post endpoint established: ${this.postUrl}`);
        resolve();
      });

      es.addEventListener("message", (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.id !== undefined && this.pendingRequests.has(msg.id)) {
            const { resolve: reqResolve, reject: reqReject } = this.pendingRequests.get(msg.id)!;
            this.pendingRequests.delete(msg.id);
            if (msg.error) {
              reqReject(new Error(msg.error.message || JSON.stringify(msg.error)));
            } else {
              reqResolve(msg.result);
            }
          }
        } catch (e) {
          console.error("[BrowserMcpClient] Error handling message:", e);
        }
      });

      es.onerror = (err) => {
        clearTimeout(timeout);
        console.error("[BrowserMcpClient] SSE Connection Error:", err);
        reject(err);
      };
    });

    return this.connectPromise;
  }

  async callTool(name: string, args: Record<string, any>): Promise<any> {
    await this.connect();
    if (!this.postUrl) throw new Error("Not connected");

    const id = this.idCounter++;
    const promise = new Promise<any>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
    });

    try {
      const res = await fetch(this.postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id,
          method: "tools/call",
          params: { name, arguments: args }
        })
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      this.pendingRequests.delete(id);
      throw err;
    }

    return promise;
  }

  async readResource(params: { uri: string }): Promise<any> {
    await this.connect();
    if (!this.postUrl) throw new Error("Not connected");

    const id = this.idCounter++;
    const promise = new Promise<any>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
    });

    try {
      const res = await fetch(this.postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id,
          method: "resources/read",
          params: { uri: params.uri }
        })
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      this.pendingRequests.delete(id);
      throw err;
    }

    return promise;
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}

// Helper to make tool calls to the MCP server
async function callTool<T>(
  client: BrowserMcpClient,
  toolName: string,
  args: Record<string, unknown>
): Promise<T> {
  const response = await client.callTool(toolName, args);
  if (response.isError) {
    const errText = (response.content as Array<{ type: string; text: string }>)?.[0]?.text || `Tool execution failed: ${toolName}`;
    throw new Error(errText);
  }
  const textContent = response.content as Array<{ type: string; text: string }>;
  const text = textContent?.[0]?.text;
  if (!text) throw new Error(`Empty response from tool: ${toolName}`);
  if (text.startsWith("Error:") || text.startsWith("Error executing tool")) {
    throw new Error(text);
  }
  return JSON.parse(text) as T;
}

export function useInvoiceXRay() {
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationResults>>({});
  const [transactionIds, setTransactionIds] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>("INV-2026-GOLD-99");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [benchmarks, setBenchmarks] = useState<CommodityBenchmark[]>([]);
  const [isLoadingBenchmarks, setIsLoadingBenchmarks] = useState<boolean>(false);

  const clientRef = useRef<BrowserMcpClient | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Establish a connection to the live MCP server
  const getClient = useCallback(async (): Promise<BrowserMcpClient> => {
    if (clientRef.current) return clientRef.current;

    const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const defaultServerUrl = isLocalhost
      ? "http://localhost:3000/sse"
      : "https://mcp-server-6a5-hackoverflow-amrita-university-amritapuri-campus.app.nitrocloud.ai/sse";

    const envProcess = typeof globalThis !== "undefined" ? (globalThis as any).process : undefined;
    const sseUrl =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_MCP_SERVER_URL) ||
      envProcess?.env?.NEXT_PUBLIC_MCP_SERVER_URL ||
      envProcess?.env?.VITE_MCP_SERVER_URL ||
      defaultServerUrl;

    console.log(`[useInvoiceXRay] Connecting to live MCP server at ${sseUrl}...`);
    const client = new BrowserMcpClient(sseUrl);

    await client.connect();
    clientRef.current = client;
    console.log("[useInvoiceXRay] Connected to live MCP server!");
    return client;
  }, []);

  const fetchBenchmarks = useCallback(async () => {
    setIsLoadingBenchmarks(true);
    try {
      const client = await getClient();
      console.log("[useInvoiceXRay] Fetching commodity benchmarks from MCP...");
      const list = await callTool<CommodityBenchmark[]>(client, "list_all_benchmarks", {});
      if (list && Array.isArray(list)) {
        setBenchmarks(list);
        console.log("[useInvoiceXRay] Loaded benchmarks:", list);
      }
    } catch (err: any) {
      console.error("[useInvoiceXRay] Failed to fetch commodity benchmarks:", err);
    } finally {
      setIsLoadingBenchmarks(false);
    }
  }, [getClient]);

  // Evaluate single transaction via live MCP tools (with mock fallback)
  const evaluateTransaction = useCallback(async (id: string): Promise<EvaluationResults> => {
    try {
      const client = await getClient();
      console.log(`[useInvoiceXRay] Running live TBML compliance pipeline for: ${id}`);

      // 1. Fetch transaction via resource
      const resource = await client.readResource({
        uri: `trade-invoice-feed://${id}`
      });
      const text = (resource.contents?.[0] as any)?.text;
      if (!text) throw new Error(`Transaction resource not found for ID: ${id}`);
      const txn = JSON.parse(text);

      // 2. check_price_deviation
      const priceResult = await callTool<any>(client, "check_price_deviation", { invoice_id: id });
      
      // 3. check_timeline_risk
      const timelineResult = await callTool<any>(client, "check_timeline_risk", { exporter_id: txn.exporter_id });
      
      // 4. check_counterparty_pattern
      const patternResult = await callTool<any>(client, "check_counterparty_pattern", { entity_id: txn.counterparty_id });
      
      // 5. verify_dgft_iec
      const dgftResult = await callTool<any>(client, "verify_dgft_iec", { iec: txn.exporter_iec, pan: "ABCDE1234F" });
      
      // 6. verify_icegate_customs
      const customsResult = await callTool<any>(client, "verify_icegate_customs", {
        shipping_bill_no: txn.shipping_bill_no,
        port_of_loading: txn.port_of_loading,
        declared_weight: txn.quantity,
      });

      // 7. check_sanctions
      const sanctionsResult = await callTool<any>(client, "check_sanctions", {
        entity_name: txn.counterparty_name,
        country_code: txn.counterparty_country,
      });

      // 7.1. check_routing_risk
      const routingResult = await callTool<any>(client, "check_routing_risk", {
        port_of_loading: txn.port_of_loading,
        port_of_discharge: txn.port_of_discharge,
      });

      // 7.2. check_double_financing
      const doubleFinancingResult = await callTool<any>(client, "check_double_financing", {
        shipping_bill_no: txn.shipping_bill_no,
        ad_bank_code: txn.ad_bank_code,
      });

      // Fetch EDPMS details to populate realized amount, deadline, and days remaining
      let realized_amount_usd = 0;
      let days_remaining = 240;
      let realization_deadline = txn.invoice_date;
      try {
        const edpmsResource = await client.readResource({
          uri: `edpms-realization-status://${txn.exporter_id}`
        });
        const edpmsText = (edpmsResource.contents?.[0] as any)?.text;
        let edpmsList: any[] = [];
        try {
          const parsed = edpmsText ? JSON.parse(edpmsText) : [];
          if (Array.isArray(parsed)) edpmsList = parsed;
        } catch {
          edpmsList = [];
        }
        const edpms = edpmsList.find((r: any) => r.invoice_id === id);
        if (edpms) {
          realized_amount_usd = edpms.realized_amount_usd;
          days_remaining = edpms.days_remaining;
          realization_deadline = edpms.realization_deadline;
        }
      } catch (err) {
        console.warn("[useInvoiceXRay] Failed to fetch EDPMS status:", err);
      }

      // Map transaction metadata
      const transactionMeta = {
        invoice_id: txn.invoice_id,
        exporter_name: txn.exporter_name,
        exporter_iec: txn.exporter_iec,
        importer_name: txn.counterparty_name,
        hs_code: txn.hs_code,
        hs_description: txn.commodity_description,
        incoterms: txn.incoterms,
        origin_port: txn.port_of_loading,
        discharge_port: txn.port_of_discharge,
        invoice_date: txn.invoice_date,
        realization_deadline,
        days_remaining,
        realized_amount_usd,
        declared_value_usd: txn.declared_value_usd,
      };

      // Accumulate red flags in matching structure
      const flags: AccumulatedFlag[] = [];

      if (priceResult.status === "RED_FLAG" || priceResult.status === "AMBER") {
        flags.push({
          flag_type: priceResult.counterfactual?.direction === "UNDER_INVOICED"
            ? "PRICE_DEVIATION_UNDER" : "PRICE_DEVIATION_OVER",
          severity: priceResult.status === "RED_FLAG" ? "CRITICAL" : "HIGH",
          confidence: priceResult.confidence_level || "HIGH",
          detail: priceResult.detail,
          supporting_data: {
            z_score: priceResult.z_score,
            deviation_percent: priceResult.deviation_percent,
            counterfactual: priceResult.counterfactual,
          },
        });
      }

      if (timelineResult.status === "RED_FLAG" || timelineResult.status === "AMBER") {
        flags.push({
          flag_type: "TIMELINE_PRESSURE",
          severity: timelineResult.status === "RED_FLAG" ? "CRITICAL" : "HIGH",
          confidence: "HIGH",
          detail: timelineResult.summary,
          supporting_data: {
            penalty_exposure: timelineResult.fema_penalty_exposure_usd,
            unrealized: timelineResult.total_unrealized_usd,
            flagged_count: timelineResult.flagged_count,
          },
        });
      }

      if (patternResult.status === "RED_FLAG" || patternResult.status === "AMBER") {
        if (patternResult.patterns_detected) {
          for (const pattern of patternResult.patterns_detected) {
            flags.push({
              flag_type: pattern.pattern_type === "IDENTICAL_VALUE_REPEAT" ? "MULTIPLE_INVOICING"
                : pattern.pattern_type === "RAPID_SUCCESSION" ? "RAPID_SUCCESSION"
                : "VALUE_CLUSTERING",
              severity: pattern.severity,
              confidence: pattern.severity === "CRITICAL" ? "HIGH" : "MEDIUM",
              detail: pattern.detail,
              supporting_data: {
                invoice_ids: pattern.invoice_ids,
                total_exposure: pattern.total_exposure_usd,
              },
            });
          }
        }
      }

      if (dgftResult.status === "RED_FLAG") {
        flags.push({
          flag_type: "ROUND_TRIP_INDICATOR",
          severity: "CRITICAL",
          confidence: "HIGH",
          detail: dgftResult.risk_details || dgftResult.message,
          supporting_data: { iec: txn.exporter_iec },
        });
      }

      if (customsResult.status === "RED_FLAG") {
        flags.push({
          flag_type: "VALUE_CLUSTERING",
          severity: "CRITICAL",
          confidence: "HIGH",
          detail: customsResult.risk_details,
          supporting_data: {
            shipping_bill_no: txn.shipping_bill_no,
            declared_weight: customsResult.declared_weight,
            customs_logged_weight: customsResult.customs_logged_weight,
            variance_percentage: customsResult.variance_percentage,
          },
        });
      }

      if (sanctionsResult.status === "RED_FLAG") {
        flags.push({
          flag_type: "ROUND_TRIP_INDICATOR",
          severity: "CRITICAL",
          confidence: "HIGH",
          detail: sanctionsResult.risk_details,
          supporting_data: {
            entity_name: txn.counterparty_name,
            match_score: sanctionsResult.match_score,
          },
        });
      }

      if (routingResult.status === "RED_FLAG") {
        flags.push({
          flag_type: "TIMELINE_PRESSURE",
          severity: "CRITICAL",
          confidence: "HIGH",
          detail: routingResult.detail,
          supporting_data: { risk_score: routingResult.risk_score },
        });
      }

      if (doubleFinancingResult.status === "RED_FLAG") {
        flags.push({
          flag_type: "ROUND_TRIP_INDICATOR",
          severity: "CRITICAL",
          confidence: "HIGH",
          detail: doubleFinancingResult.risk_details,
          supporting_data: {
            flagged_duplicates_count: doubleFinancingResult.flagged_duplicates_count,
            supporting_evidence: doubleFinancingResult.supporting_evidence,
          },
        });
      }

      // Generate Suspicious Transaction Report narrative if flags were accumulated
      let str: any = null;
      if (flags.length > 0) {
        try {
          str = await callTool<any>(client, "draft_str", {
            flags_list: flags,
            transaction_details: {
              invoice_id: txn.invoice_id,
              lc_number: txn.lc_number,
              exporter_id: txn.exporter_id,
              exporter_name: txn.exporter_name,
              counterparty_id: txn.counterparty_id,
              counterparty_name: txn.counterparty_name,
              counterparty_country: txn.counterparty_country,
              hs_code: txn.hs_code,
              commodity_description: txn.commodity_description,
              declared_value_usd: txn.declared_value_usd,
              quantity: txn.quantity,
              declared_unit_price_usd: txn.declared_unit_price_usd,
              unit_of_measurement: txn.unit_of_measurement,
              incoterms: txn.incoterms,
              invoice_date: txn.invoice_date,
            },
            counterfactual: priceResult.status !== "ERROR" ? {
              benchmark_total_value: priceResult.counterfactual.benchmark_total_value,
              manipulation_gap_usd: priceResult.counterfactual.manipulation_gap_usd,
              manipulation_gap_percent: priceResult.counterfactual.manipulation_gap_percent,
              direction: priceResult.counterfactual.direction,
            } : undefined,
          });
        } catch (strErr) {
          console.error("[useInvoiceXRay] Failed to generate compliance STR narrative:", strErr);
        }
      }

      // Pre-evaluate reports to cache them in state (keeps report generator sync/blocking for UI)
      let counterfactualReportHtml = "";
      let rbiFormEtxText = "";
      try {
        const reportRes = await callTool<{ html: string }>(client, "generate_counterfactual_report", { invoice_id: id });
        counterfactualReportHtml = reportRes.html;
      } catch (err) {
        console.warn("[useInvoiceXRay] Failed to generate counterfactual report during audit pipeline:", err);
      }

      try {
        const filingRes = await callTool<{ filing: string }>(client, "generate_rbi_filing", { invoice_id: id });
        rbiFormEtxText = filingRes.filing;
      } catch (err) {
        console.warn("[useInvoiceXRay] Failed to generate RBI Form ETX during audit pipeline:", err);
      }

      // Compute aggregates
      const hasCritical = flags.some((f) => f.severity === "CRITICAL");
      const hasHigh = flags.some((f) => f.severity === "HIGH");
      const overallRisk = hasCritical ? "CRITICAL"
        : hasHigh ? "HIGH"
        : flags.length > 0 ? "ELEVATED"
        : "CLEAR";

      const totalPenaltyExposure = (timelineResult.fema_penalty_exposure_usd ?? 0) +
        Math.abs(priceResult.counterfactual?.manipulation_gap_usd ?? 0) * 3;

      const manipulationGap = priceResult.counterfactual ? {
        declared: priceResult.counterfactual.declared_total_value,
        benchmark: priceResult.counterfactual.benchmark_total_value,
        gap: priceResult.counterfactual.manipulation_gap_usd,
        direction: priceResult.counterfactual.direction,
        narrative: priceResult.counterfactual.narrative,
      } : null;

      const crossAgency = {
        dgft_status: {
          iec: txn.exporter_iec,
          status: dgftResult.dgft_status || "ACTIVE",
          issue_details: dgftResult.risk_details,
        },
        icegate_customs: {
          shipping_bill: txn.shipping_bill_no,
          declared_weight_kg: txn.quantity,
          customs_logged_weight_kg: customsResult.customs_logged_weight || txn.quantity,
          weight_variance_pct: customsResult.variance_percentage || 0,
          anomaly_detected: customsResult.anomaly_detected || false,
        },
        geospatial_routing: {
          origin_port: txn.port_of_loading,
          discharge_port: txn.port_of_discharge,
          discharge_city: routingResult.discharge_city || txn.port_of_discharge,
          country: txn.counterparty_country,
          is_landlocked: routingResult.is_landlocked || false,
          anomaly: routingResult.status === "RED_FLAG" ? routingResult.detail : null,
        },
      };

      const result: EvaluationResults = {
        invoice_id: id,
        overallRisk,
        totalPenaltyExposure,
        manipulationGap,
        flags,
        str,
        evaluatedAt: new Date().toISOString(),
        transactionMeta,
        crossAgency,
        counterfactualReportHtml,
        rbiFormEtxText,
      };

      setEvaluations((prev) => ({
        ...prev,
        [id]: result,
      }));

      return result;
    } catch (err: any) {
      console.error(`[useInvoiceXRay] Live MCP audit failed for ${id}:`, err);
      showToast(`Audit failed for ${id}: ${err.message}`);
      throw err;
    }
  }, [getClient]);

  // Orchestrate sequential loading of all transaction IDs from database
  const evaluateAll = useCallback(async () => {
    setIsEvaluating(true);
    fetchBenchmarks(); // Fetch commodity pricing benchmarks from database
    let ids: string[] = [];
    try {
      const client = await getClient();
      console.log("[useInvoiceXRay] Fetching live transaction list from MCP database...");
      const list = await callTool<any[]>(client, "list_all_transactions", {});
      if (list && Array.isArray(list)) {
        ids = list.map((item: any) => item.invoice_id);
        console.log("[useInvoiceXRay] Live transactions loaded:", ids);
      }
    } catch (err: any) {
      console.error("[useInvoiceXRay] Live database listing failed:", err);
      showToast("Connection to MCP Database failed. Make sure your server is running.");
      ids = [];
    }
    setTransactionIds(ids);

    // Set selectedId to the first invoice in the list if none is set or if selectedId is not in the list
    if (ids.length > 0) {
      setSelectedId((prev) => (prev && ids.includes(prev) ? prev : ids[0]));
    }

    for (const id of ids) {
      await evaluateTransaction(id);
    }
    setIsEvaluating(false);
  }, [getClient, evaluateTransaction, fetchBenchmarks]);

  // Clean connection cleanup on unmount
  useEffect(() => {
    evaluateAll();
    
    return () => {
      if (clientRef.current) {
        clientRef.current.close();
      }
      clientRef.current = null;
    };
  }, [evaluateAll]);

  // Filtered list
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

  // Compute aggregate metrics
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
    return evaluations[selectedId] || null;
  }, [selectedId, evaluations]);

  // Renders HTML counterfactual report synchronously
  const generateCounterfactualReport = useCallback(
    (id: string): string => {
      const evaluation = evaluations[id];
      if (evaluation && evaluation.counterfactualReportHtml) {
        return evaluation.counterfactualReportHtml;
      }
      return "<p>Audit report not generated for this transaction.</p>";
    },
    [evaluations]
  );

  // Renders RBI Form ETX layout synchronously
  const generateRBIFormETX = useCallback(
    (id: string): string => {
      const evaluation = evaluations[id];
      if (evaluation && evaluation.rbiFormEtxText) {
        return evaluation.rbiFormEtxText;
      }
      return "RBI Form ETX draft not generated.";
    },
    [evaluations]
  );

  const exportSTRNarrative = useCallback(
    async (id: string): Promise<string> => {
      const record = evaluations[id];
      const narrative = (record?.str as any)?.fiu_ind_str_draft?.fiu_ready_narrative || "No STR Narrative generated for this transaction.";
      try {
        await navigator.clipboard.writeText(narrative);
        showToast("STR Narrative copied to clipboard!");
      } catch {
        showToast("Copied text to clipboard");
      }
      return narrative;
    },
    [evaluations, showToast]
  );

  return {
    evaluations,
    transactionIds,
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
    benchmarks,
    isLoadingBenchmarks,
    fetchBenchmarks,
  };
}

export default useInvoiceXRay;

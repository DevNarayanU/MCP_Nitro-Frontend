/**
 * InvoiceX-Ray — React Integration Hook (Adapted for Browser SSE)
 *
 * Orchestrates the full TBML evaluation pipeline for a trade transaction.
 * Connects to the SSE MCP server and runs the detection tools sequentially.
 */

import { useState, useCallback, useRef } from "react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { Transaction, TransactionFlag, FlagType, FlagSeverity } from "./types";

export interface AccumulatedFlag {
  flag_type:
    | "PRICE_DEVIATION_OVER"
    | "PRICE_DEVIATION_UNDER"
    | "TIMELINE_PRESSURE"
    | "MULTIPLE_INVOICING"
    | "RAPID_SUCCESSION"
    | "VALUE_CLUSTERING"
    | "ROUND_TRIP_INDICATOR";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  detail: string;
  supporting_data?: Record<string, any>;
}

export interface EvaluationResults {
  invoice_id: string;
  priceDeviation: any | null;
  timelineRisk: any | null;
  counterpartyPattern: any | null;
  dgftStatus: any | null;
  customsStatus: any | null;
  sanctionsStatus: any | null;
  routingStatus: any | null;
  doubleFinancingStatus: any | null;
  str: { narrative?: string } | null;
  flags: TransactionFlag[];
  overallRisk: "CRITICAL" | "HIGH" | "ELEVATED" | "CLEAR";
  totalPenaltyExposure: number;
  manipulationGap: {
    declared: number;
    benchmark: number;
    gap: number;
    direction: string;
  } | null;
  evaluatedAt: string;
}

export interface UseInvoiceXRayReturn {
  evaluateTransaction: (invoiceId: string) => Promise<EvaluationResults>;
  loading: boolean;
  results: EvaluationResults | null;
  error: string | null;
  reset: () => void;
  generateCounterfactualReport: (invoiceId: string) => Promise<string>;
  generateRBIFormETX: (invoiceId: string) => Promise<string>;
}

async function callTool<T>(
  client: Client,
  toolName: string,
  args: Record<string, unknown>
): Promise<T> {
  const response = await client.callTool({ name: toolName, arguments: args });
  const textContent = response.content as Array<{ type: string; text: string }>;
  const text = textContent?.[0]?.text;
  if (!text) throw new Error(`Empty response from tool: ${toolName}`);
  return JSON.parse(text) as T;
}

function mapAccumulatedToTransactionFlag(flag: AccumulatedFlag, index: number): TransactionFlag {
  let type: FlagType = "check_price_deviation";
  if (flag.flag_type === "TIMELINE_PRESSURE") {
    type = "check_timeline_risk";
  } else if (
    flag.flag_type === "MULTIPLE_INVOICING" ||
    flag.flag_type === "RAPID_SUCCESSION" ||
    flag.flag_type === "VALUE_CLUSTERING"
  ) {
    type = "check_counterparty_pattern";
  }

  const severity: FlagSeverity =
    flag.severity === "CRITICAL" ? "critical" :
    flag.severity === "HIGH" ? "warning" :
    "info";

  // Friendly title
  const label = flag.flag_type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

  // Stringify the data point nicely
  let dataPoint = "";
  if (flag.supporting_data) {
    if (flag.flag_type.startsWith("PRICE_DEVIATION")) {
      const dev = flag.supporting_data.deviation_percent;
      const gap = flag.supporting_data.counterfactual?.manipulation_gap_usd;
      dataPoint = `${dev > 0 ? "+" : ""}${dev?.toFixed(2)}% deviation (Δ $${gap?.toLocaleString()})`;
    } else if (flag.flag_type === "TIMELINE_PRESSURE") {
      const pen = flag.supporting_data.penalty_exposure;
      const unres = flag.supporting_data.unrealized;
      dataPoint = `Penalty: $${pen?.toLocaleString()} | Unrealized: $${unres?.toLocaleString()}`;
    } else if (flag.supporting_data.total_exposure) {
      dataPoint = `Exposure: $${flag.supporting_data.total_exposure?.toLocaleString()} across invoices ${flag.supporting_data.invoice_ids?.join(", ")}`;
    } else {
      dataPoint = JSON.stringify(flag.supporting_data);
    }
  }

  return {
    id: `F-GEN-${index}`,
    type,
    severity,
    label,
    description: flag.detail,
    dataPoint,
  };
}

export function useInvoiceXRay(): UseInvoiceXRayReturn {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EvaluationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  const getClient = useCallback(async (): Promise<Client> => {
    if (clientRef.current) return clientRef.current;

    const sseUrlString = process.env.NEXT_PUBLIC_MCP_SSE_URL || "http://localhost:3000/sse";
    
    const client = new Client({
      name: "invoicex-ray-dashboard",
      version: "1.0.0",
    });

    const transport = new SSEClientTransport(new URL(sseUrlString));
    await client.connect(transport);
    
    clientRef.current = client;
    return client;
  }, []);

  const evaluateTransaction = useCallback(
    async (invoiceId: string): Promise<EvaluationResults> => {
      setLoading(true);
      setError(null);

      try {
        const client = await getClient();
        const rawFlags: AccumulatedFlag[] = [];

        // ── Step 1: Fetch transaction details ──
        const txnResource = await client.readResource({
          uri: `trade-invoice-feed://${invoiceId}`,
        });
        const txnText = (txnResource.contents as Array<{ text: string }>)?.[0]?.text;
        if (!txnText) throw new Error(`Transaction not found via MCP: ${invoiceId}`);
        const txn = JSON.parse(txnText);

        // ── Step 2: Price deviation + counterfactual ──
        const priceResult = await callTool<any>(
          client, "check_price_deviation", { invoice_id: invoiceId }
        );

        if (priceResult.status === "RED_FLAG" || priceResult.status === "AMBER") {
          rawFlags.push({
            flag_type: priceResult.counterfactual.direction === "UNDER_INVOICED"
              ? "PRICE_DEVIATION_UNDER" : "PRICE_DEVIATION_OVER",
            severity: priceResult.status === "RED_FLAG" ? "CRITICAL" : "HIGH",
            confidence: priceResult.confidence_level,
            detail: priceResult.detail,
            supporting_data: {
              z_score: priceResult.z_score,
              deviation_percent: priceResult.deviation_percent,
              counterfactual: priceResult.counterfactual,
            },
          });
        }

        // ── Step 3: Timeline risk (FEMA 2026) ──
        const timelineResult = await callTool<any>(
          client, "check_timeline_risk", { exporter_id: txn.exporter_id }
        );

        if (timelineResult.status === "RED_FLAG" || timelineResult.status === "AMBER") {
          rawFlags.push({
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

        // ── Step 4: Counterparty pattern ──
        const patternResult = await callTool<any>(
          client, "check_counterparty_pattern", { entity_id: txn.counterparty_id }
        );

        if (patternResult.status === "RED_FLAG" || patternResult.status === "AMBER") {
          if (patternResult.patterns_detected) {
            for (const pattern of patternResult.patterns_detected) {
              rawFlags.push({
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

        // ── Step 5: Live DGFT IEC Verification ──
        const dgftResult = await callTool<any>(
          client, "verify_dgft_iec", { iec: txn.exporter_iec, pan: "ABCDE1234F" }
        );

        if (dgftResult.status === "RED_FLAG") {
          rawFlags.push({
            flag_type: "ROUND_TRIP_INDICATOR",
            severity: "CRITICAL",
            confidence: "HIGH",
            detail: dgftResult.risk_details || dgftResult.message,
            supporting_data: { iec: txn.exporter_iec },
          });
        }

        // ── Step 6: Live ICEGATE Customs Verification ──
        const customsResult = await callTool<any>(
          client, "verify_icegate_customs", {
            shipping_bill_no: txn.shipping_bill_no,
            port_of_loading: txn.port_of_loading,
            declared_weight: txn.quantity,
          }
        );

        if (customsResult.status === "RED_FLAG") {
          rawFlags.push({
            flag_type: "ROUND_TRIP_INDICATOR",
            severity: "CRITICAL",
            confidence: "HIGH",
            detail: customsResult.risk_details,
            supporting_data: {
              shipping_bill_no: txn.shipping_bill_no,
              variance_percentage: customsResult.variance_percentage,
            },
          });
        }

        // ── Step 7: Live OpenSanctions Watchlist Matching ──
        const sanctionsResult = await callTool<any>(
          client, "check_sanctions", {
            entity_name: txn.counterparty_name,
            country_code: txn.counterparty_country,
          }
        );

        if (sanctionsResult.status === "RED_FLAG") {
          rawFlags.push({
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

        // ── Step 7.1: Port Routing Verification (Geospatial Risk) ──
        const routingResult = await callTool<any>(
          client, "check_routing_risk", {
            port_of_loading: txn.port_of_loading,
            port_of_discharge: txn.port_of_discharge,
          }
        );

        if (routingResult.status === "RED_FLAG") {
          rawFlags.push({
            flag_type: "ROUND_TRIP_INDICATOR",
            severity: "CRITICAL",
            confidence: "HIGH",
            detail: routingResult.detail,
            supporting_data: { risk_score: routingResult.risk_score },
          });
        }

        // ── Step 7.2: Double Financing Audit Cross-Check ──
        const doubleFinancingResult = await callTool<any>(
          client, "check_double_financing", {
            shipping_bill_no: txn.shipping_bill_no,
            ad_bank_code: txn.ad_bank_code,
          }
        );

        if (doubleFinancingResult.status === "RED_FLAG") {
          rawFlags.push({
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

        // ── Step 8: Draft STR if flags accumulated ──
        let str: { narrative?: string } | null = null;
        if (rawFlags.length > 0) {
          str = await callTool<any>(
            client, "draft_str", {
              flags_list: rawFlags,
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
            }
          );
        }

        // Map accumulated raw flags to frontend format
        const flags = rawFlags.map((f, i) => mapAccumulatedToTransactionFlag(f, i));

        // ── Compute overall risk ──
        const hasCritical = rawFlags.some((f) => f.severity === "CRITICAL");
        const hasHigh = rawFlags.some((f) => f.severity === "HIGH");
        const overallRisk = hasCritical ? "CRITICAL" as const
          : hasHigh ? "HIGH" as const
          : flags.length > 0 ? "ELEVATED" as const
          : "CLEAR" as const;

        // ── Compute total penalty exposure ──
        const totalPenaltyExposure = (timelineResult.fema_penalty_exposure_usd ?? 0) +
          Math.abs(priceResult.counterfactual?.manipulation_gap_usd ?? 0) * 3;

        // ── Build manipulation gap summary ──
        const manipulationGap = priceResult.counterfactual ? {
          declared: priceResult.counterfactual.declared_total_value,
          benchmark: priceResult.counterfactual.benchmark_total_value,
          gap: priceResult.counterfactual.manipulation_gap_usd,
          direction: priceResult.counterfactual.direction,
        } : null;

        const evaluation: EvaluationResults = {
          invoice_id: invoiceId,
          priceDeviation: priceResult,
          timelineRisk: timelineResult,
          counterpartyPattern: patternResult,
          dgftStatus: dgftResult,
          customsStatus: customsResult,
          sanctionsStatus: sanctionsResult,
          routingStatus: routingResult,
          doubleFinancingStatus: doubleFinancingResult,
          str,
          flags,
          overallRisk,
          totalPenaltyExposure,
          manipulationGap,
          evaluatedAt: new Date().toISOString(),
        };

        setResults(evaluation);
        return evaluation;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getClient]
  );

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setLoading(false);
  }, []);

  const generateCounterfactualReport = useCallback(
    async (invoiceId: string): Promise<string> => {
      const client = await getClient();
      const res = await callTool<{ html: string }>(
        client, "generate_counterfactual_report", { invoice_id: invoiceId }
      );
      return res.html;
    },
    [getClient]
  );

  const generateRBIFormETX = useCallback(
    async (invoiceId: string): Promise<string> => {
      const client = await getClient();
      const res = await callTool<{ filing: string }>(
        client, "generate_rbi_filing", { invoice_id: invoiceId }
      );
      return res.filing;
    },
    [getClient]
  );

  return {
    evaluateTransaction,
    loading,
    results,
    error,
    reset,
    generateCounterfactualReport,
    generateRBIFormETX,
  };
}

export default useInvoiceXRay;

import pg from "pg";
import type { Transaction, EdpmsStatus, RiskLevel } from "./types";

const { Pool } = pg;

// We use the DATABASE_URL configured in the environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : false,
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool,
};

// Helper to map DB row to Transaction interface
export function mapRowToTransaction(row: any): Transaction {
  const declaredValue = parseFloat(row.declared_value_usd);
  const quantity = parseFloat(row.quantity);
  const declaredUnitPrice = parseFloat(row.declared_unit_price_usd);
  
  // Calculate benchmark value
  const benchmarkUnitPrice = parseFloat(row.benchmark_spot_price || row.declared_unit_price_usd);
  const benchmarkValue = quantity * benchmarkUnitPrice;
  
  // Calculate deviation percent
  const deviationPercent = benchmarkValue > 0
    ? ((declaredValue - benchmarkValue) / benchmarkValue) * 100
    : 0;

  // Map status
  const dbStatus = row.edpms_status || "OPEN";
  const daysRemaining = row.edpms_days_remaining !== null ? parseInt(row.edpms_days_remaining, 10) : 90;
  
  let edpmsStatus: EdpmsStatus = "on-track";
  if (dbStatus === "OVERDUE" || dbStatus === "CAUTION_LISTED") {
    edpmsStatus = "overdue";
  } else if (dbStatus === "OPEN" || dbStatus === "PARTIALLY_REALIZED" || dbStatus === "WRITE_OFF_REQUESTED") {
    if (daysRemaining <= 30) {
      edpmsStatus = "at-risk";
    }
  }

  // Heuristic for initial risk level before audit is run
  let riskLevel: RiskLevel = "low";
  if (edpmsStatus === "overdue" || Math.abs(deviationPercent) > 25 || dbStatus === "CAUTION_LISTED") {
    riskLevel = "high";
  } else if (edpmsStatus === "at-risk" || Math.abs(deviationPercent) > 15) {
    riskLevel = "medium";
  }

  // Construct a synthetic price series for visual chart
  const priceSeries = [
    { date: "2026-04", declaredValue: Math.round(declaredValue * 0.95), benchmarkValue: Math.round(benchmarkValue * 0.96) },
    { date: "2026-05", declaredValue: Math.round(declaredValue * 0.98), benchmarkValue: Math.round(benchmarkValue * 0.98) },
    { date: "2026-06", declaredValue: Math.round(declaredValue * 0.99), benchmarkValue: Math.round(benchmarkValue * 0.99) },
    { date: "2026-07", declaredValue: Math.round(declaredValue), benchmarkValue: Math.round(benchmarkValue) }
  ];

  return {
    id: row.invoice_id,
    exporterName: row.exporter_name,
    importerName: row.counterparty_name,
    hsCode: row.hs_code,
    commodity: row.commodity_description,
    declaredValue,
    benchmarkValue,
    deviationPercent,
    currency: row.currency || "USD",
    quantity,
    unit: row.unit_of_measurement || "kg",
    edpmsStatus,
    daysToDeadline: daysRemaining,
    realizationReceived: parseFloat(row.edpms_realized_amount || 0),
    riskLevel,
    flags: [], // Populated dynamically in frontend state on audit
    dateIssued: new Date(row.invoice_date).toISOString().split("T")[0],
    country: row.counterparty_country,
    bank: row.ad_bank_code === "HDFC0000213" ? "HDFC Bank, Mumbai" : row.ad_bank_code === "ICIC0000102" ? "ICICI Bank, Chennai" : "State Bank of India",
    priceSeries,
    counterparty: {
      name: row.counterparty_name,
      country: row.counterparty_country,
      priorTransactionCount: row.counterparty_id === "IMP-GLOBAL-DUBAI" ? 4 : 1,
    }
  };
}

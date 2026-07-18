import { NextResponse } from "next/server";
import { db, mapRowToTransaction } from "@/lib/db";
import type { Alert, FlagType, FlagSeverity } from "@/lib/types";

export async function GET() {
  try {
    const queryText = `
      SELECT 
        t.*, 
        e.status as edpms_status,
        e.days_remaining as edpms_days_remaining,
        e.realized_amount_usd as edpms_realized_amount,
        b.spot_price_usd as benchmark_spot_price,
        b.commodity_name as benchmark_commodity_name
      FROM trade_transactions t
      LEFT JOIN edpms_realization e ON t.invoice_id = e.invoice_id
      LEFT JOIN commodity_benchmarks b ON t.hs_code = b.hs_code
      ORDER BY t.invoice_date DESC
    `;
    const res = await db.query(queryText);
    const transactions = res.rows.map(mapRowToTransaction);
    
    const alerts: Alert[] = [];
    let alertIdCount = 1;

    // Scan for price deviation alerts
    for (const txn of transactions) {
      if (Math.abs(txn.deviationPercent) > 20) {
        const severity: FlagSeverity = Math.abs(txn.deviationPercent) > 25 ? "critical" : "warning";
        alerts.push({
          id: `ALT-GEN-${alertIdCount++}`,
          transactionId: txn.id,
          exporterName: txn.exporterName,
          flagType: "check_price_deviation",
          severity,
          message: `Price deviation of ${txn.deviationPercent.toFixed(2)}% above benchmark on HS ${txn.hsCode}`,
          timestamp: new Date(txn.dateIssued).toISOString(),
          read: false,
        });
      }

      // Scan for timeline risk alerts
      if (txn.daysToDeadline !== null && txn.daysToDeadline <= 15 && txn.realizationReceived < txn.declaredValue) {
        const severity: FlagSeverity = txn.daysToDeadline < 5 ? "critical" : "warning";
        alerts.push({
          id: `ALT-GEN-${alertIdCount++}`,
          transactionId: txn.id,
          exporterName: txn.exporterName,
          flagType: "check_timeline_risk",
          severity,
          message: `EDPMS realization deadline approaching in ${txn.daysToDeadline} days. Unrealized: $${(txn.declaredValue - txn.realizationReceived).toLocaleString()}`,
          timestamp: new Date(txn.dateIssued).toISOString(),
          read: false,
        });
      }
    }

    // Scan for counterparty pattern alerts (matching identical values)
    const valueMap: Record<number, string[]> = {};
    for (const txn of transactions) {
      if (!valueMap[txn.declaredValue]) {
        valueMap[txn.declaredValue] = [];
      }
      valueMap[txn.declaredValue].push(txn.id);
    }

    for (const [val, ids] of Object.entries(valueMap)) {
      if (ids.length >= 3) {
        // Carousel pattern found!
        for (const id of ids) {
          const txn = transactions.find(t => t.id === id);
          if (txn) {
            alerts.push({
              id: `ALT-GEN-${alertIdCount++}`,
              transactionId: txn.id,
              exporterName: txn.exporterName,
              flagType: "check_counterparty_pattern",
              severity: "warning",
              message: `Identical declared value ($${parseFloat(val).toLocaleString()}) repeated across ${ids.length} transactions - potential carousel indicator`,
              timestamp: new Date(txn.dateIssued).toISOString(),
              read: true, // Marked read as a historical warning
            });
          }
        }
      }
    }

    // Sort by timestamp desc
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ success: true, data: alerts });
  } catch (error: any) {
    console.error("API /api/alerts error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

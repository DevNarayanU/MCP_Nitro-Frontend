import { NextResponse } from "next/server";
import { db, mapRowToTransaction } from "@/lib/db";

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
    
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    console.error("API /api/transactions error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

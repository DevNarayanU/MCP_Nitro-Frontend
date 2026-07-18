import { NextResponse } from "next/server";
import { db, mapRowToTransaction } from "@/lib/db";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;
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
      WHERE t.invoice_id = $1
    `;
    const res = await db.query(queryText, [id]);
    
    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }
    
    const transaction = mapRowToTransaction(res.rows[0]);
    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    console.error(`API /api/transactions/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

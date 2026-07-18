export type RiskLevel = "CRITICAL" | "HIGH" | "ELEVATED" | "CLEAR";

export type FlagType =
  | "PRICE_DEVIATION_OVER"
  | "PRICE_DEVIATION_UNDER"
  | "TIMELINE_PRESSURE"
  | "MULTIPLE_INVOICING"
  | "RAPID_SUCCESSION"
  | "VALUE_CLUSTERING"
  | "ROUND_TRIP_INDICATOR";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export interface AccumulatedFlag {
  flag_type: FlagType;
  severity: Severity;
  confidence: Confidence;
  detail: string;
  supporting_data?: Record<string, unknown>;
}

export interface ManipulationGap {
  declared: number;
  benchmark: number;
  gap: number;
  direction: "OVER_INVOICED" | "UNDER_INVOICED" | "WITHIN_RANGE";
  narrative: string;
}

export interface FIU_STR_Draft {
  fiu_ind_str_draft: {
    header: Record<string, string>;
    metadata: {
      subject_exporter_id: string;
      subject_exporter_name: string;
      associated_invoice_id: string;
      fema_realization_deadline_pressure: "OVERDUE_BREACH" | "NORMAL";
      tbml_risk_rating: "CRITICAL" | "HIGH" | "CLEAR";
      estimated_fema_penalty_exposure_usd: number;
    };
    findings: {
      price_deviation_valuation_gap_usd: number;
      price_deviation_direction: string;
      total_unrealized_amount_usd: number;
      flags_synthesized: Array<{ code: string; level: string; notes: string }>;
    };
    fiu_ready_narrative: string;
  };
}

export interface CrossAgencyVerification {
  dgft_status: {
    iec: string;
    status: "CAUTION_LISTED" | "ACTIVE" | "SUSPENDED";
    issue_details?: string;
  };
  icegate_customs: {
    shipping_bill: string;
    declared_weight_kg: number;
    customs_logged_weight_kg: number;
    weight_variance_pct: number;
    anomaly_detected: boolean;
  };
  geospatial_routing: {
    origin_port: string;
    discharge_port: string;
    discharge_city: string;
    country: string;
    is_landlocked: boolean;
    anomaly: string | null;
  };
}

export interface TransactionMeta {
  invoice_id: string;
  exporter_name: string;
  exporter_iec: string;
  importer_name: string;
  hs_code: string;
  hs_description: string;
  incoterms: string;
  origin_port: string;
  discharge_port: string;
  invoice_date: string;
  realization_deadline: string;
  days_remaining: number;
  realized_amount_usd: number;
  declared_value_usd: number;
}

export interface EvaluationResults {
  invoice_id: string;
  overallRisk: RiskLevel;
  totalPenaltyExposure: number;
  manipulationGap: ManipulationGap | null;
  flags: AccumulatedFlag[];
  str: FIU_STR_Draft | null;
  evaluatedAt: string;
  transactionMeta: TransactionMeta;
  crossAgency: CrossAgencyVerification;
  counterfactualReportHtml?: string;
  rbiFormEtxText?: string;
}

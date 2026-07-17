// ─── Risk & Status Enums ─────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';

export type EdpmsStatus = 'on-track' | 'at-risk' | 'overdue';

export type FlagType =
  | 'check_price_deviation'
  | 'check_timeline_risk'
  | 'check_counterparty_pattern';

export type FlagSeverity = 'info' | 'warning' | 'critical';

// ─── Flag ─────────────────────────────────────────────────────────────────────

export interface TransactionFlag {
  id: string;
  type: FlagType;
  severity: FlagSeverity;
  label: string;
  description: string;
  dataPoint: string;
}

// ─── Price Benchmark ──────────────────────────────────────────────────────────

export interface PriceSeries {
  date: string; // ISO date
  declaredValue: number;
  benchmarkValue: number;
}

// ─── Counterparty ─────────────────────────────────────────────────────────────

export interface Counterparty {
  name: string;
  country: string;
  swiftCode?: string;
  priorTransactionCount: number;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  exporterName: string;
  importerName: string;
  hsCode: string;
  commodity: string;
  declaredValue: number;          // USD
  benchmarkValue: number;         // USD – independent benchmark
  deviationPercent: number;       // positive = over-invoiced, negative = under
  currency: string;
  quantity: number;
  unit: string;
  edpmsStatus: EdpmsStatus;
  daysToDeadline: number;         // negative = overdue
  realizationReceived: number;    // USD received so far
  riskLevel: RiskLevel;
  flags: TransactionFlag[];
  dateIssued: string;             // ISO date
  country: string;
  bank: string;
  priceSeries: PriceSeries[];     // for sparkline / counterfactual chart
  counterparty: Counterparty;
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  transactionId: string;
  exporterName: string;
  flagType: FlagType;
  severity: FlagSeverity;
  message: string;
  timestamp: string;
  read: boolean;
}

// ─── STR (Suspicious Transaction Report) ─────────────────────────────────────

export interface STRReport {
  id: string;
  transactionId: string;
  generatedAt: string;
  status: 'draft' | 'filed' | 'pending';
  content: string;              // Markdown
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalTransactions: number;
  openFlags: number;
  highRiskCount: number;
  avgDaysToRealization: number;
  flagsTrend: { date: string; count: number }[];
}

// ─── API Response Shape (for future wiring) ──────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PriceDeviationResult {
  transactionId: string;
  declaredValue: number;
  benchmarkValue: number;
  deviationPercent: number;
  severity: FlagSeverity;
  explanation: string;
}

export interface TimelineRiskResult {
  transactionId: string;
  daysToDeadline: number;
  realizationReceived: number;
  severity: FlagSeverity;
  explanation: string;
}

export interface CounterpartyPatternResult {
  transactionId: string;
  matchedTransactions: string[];
  patternDescription: string;
  severity: FlagSeverity;
}

import type {
  Transaction,
  Alert,
  DashboardStats,
  STRReport,
} from './types';

// ─── Transactions ─────────────────────────────────────────────────────────────

export const mockTransactions: Transaction[] = [
  // ① CLEAN — Granite exports, benchmark-aligned, on-track EDPMS
  {
    id: 'TXN-2024-0412',
    exporterName: 'Deccan Granites Pvt. Ltd.',
    importerName: 'Gulf Stone Trading LLC',
    hsCode: '2516.11',
    commodity: 'Granite (rough)',
    declaredValue: 142_000,
    benchmarkValue: 148_000,
    deviationPercent: -4.05,
    currency: 'USD',
    quantity: 850,
    unit: 'MT',
    edpmsStatus: 'on-track',
    daysToDeadline: 52,
    realizationReceived: 142_000,
    riskLevel: 'low',
    flags: [],
    dateIssued: '2024-05-10',
    country: 'UAE',
    bank: 'HDFC Bank, Chennai',
    counterparty: {
      name: 'Gulf Stone Trading LLC',
      country: 'UAE',
      swiftCode: 'CBDUAEADXXX',
      priorTransactionCount: 11,
    },
    priceSeries: [
      { date: '2024-02', declaredValue: 138000, benchmarkValue: 141000 },
      { date: '2024-03', declaredValue: 140000, benchmarkValue: 144000 },
      { date: '2024-04', declaredValue: 141000, benchmarkValue: 146000 },
      { date: '2024-05', declaredValue: 142000, benchmarkValue: 148000 },
      { date: '2024-06', declaredValue: 143000, benchmarkValue: 149000 },
    ],
  },

  // ② OVER-INVOICED — ~43% above benchmark, cotton yarn exports to shell co.
  {
    id: 'TXN-2024-0389',
    exporterName: 'Suryodaya Textiles Export Ltd.',
    importerName: 'Aster Commodities DMCC',
    hsCode: '5205.11',
    commodity: 'Cotton Yarn (single, uncombed)',
    declaredValue: 318_500,
    benchmarkValue: 222_000,
    deviationPercent: 43.47,
    currency: 'USD',
    quantity: 120,
    unit: 'MT',
    edpmsStatus: 'at-risk',
    daysToDeadline: 14,
    realizationReceived: 0,
    riskLevel: 'high',
    flags: [
      {
        id: 'F-0389-1',
        type: 'check_price_deviation',
        severity: 'critical',
        label: 'Severe Price Deviation',
        description:
          'Declared invoice value is 43.47% above the independent benchmark (ITC Trade Map + MCX spot). This significantly exceeds the 15% alert threshold and the 25% critical threshold.',
        dataPoint: 'USD 318,500 declared vs USD 222,000 benchmark (Δ USD 96,500)',
      },
      {
        id: 'F-0389-2',
        type: 'check_timeline_risk',
        severity: 'warning',
        label: 'Realization Risk',
        description:
          'Zero funds received against this shipment with only 14 days remaining to the RBI EDPMS 270-day realization deadline. Exporter has not applied for an extension.',
        dataPoint: 'USD 0 received of USD 318,500 — 14 days to deadline',
      },
      {
        id: 'F-0389-3',
        type: 'check_counterparty_pattern',
        severity: 'warning',
        label: 'Counterparty Pattern',
        description:
          'Aster Commodities DMCC (UAE Free Zone) appears in 4 prior transactions with identical declared invoice amounts across two separate Indian exporters — a hallmark of layered TBML structuring.',
        dataPoint: '4 matched transactions: TXN-2024-0201, TXN-2024-0228, TXN-2023-1104, TXN-2023-0987',
      },
    ],
    dateIssued: '2024-04-28',
    country: 'UAE',
    bank: 'Axis Bank, Surat',
    counterparty: {
      name: 'Aster Commodities DMCC',
      country: 'UAE',
      swiftCode: 'MASHAEADXXX',
      priorTransactionCount: 4,
    },
    priceSeries: [
      { date: '2024-02', declaredValue: 310000, benchmarkValue: 218000 },
      { date: '2024-03', declaredValue: 312000, benchmarkValue: 220000 },
      { date: '2024-04', declaredValue: 315000, benchmarkValue: 221000 },
      { date: '2024-05', declaredValue: 318500, benchmarkValue: 222000 },
      { date: '2024-06', declaredValue: 320000, benchmarkValue: 224000 },
    ],
  },

  // ③ EDPMS VIOLATION — severely overdue, basmati rice export to shell entity
  {
    id: 'TXN-2023-1851',
    exporterName: 'Himalayan Agri Exports Pvt. Ltd.',
    importerName: 'Bright Harvest International FZE',
    hsCode: '1006.30',
    commodity: 'Rice (semi-milled / wholly milled)',
    declaredValue: 487_200,
    benchmarkValue: 510_000,
    deviationPercent: -4.47,
    currency: 'USD',
    quantity: 1_200,
    unit: 'MT',
    edpmsStatus: 'overdue',
    daysToDeadline: -48,
    realizationReceived: 12_000,
    riskLevel: 'high',
    flags: [
      {
        id: 'F-1851-1',
        type: 'check_timeline_risk',
        severity: 'critical',
        label: 'EDPMS Deadline Breached',
        description:
          'Export payment realization deadline has passed by 48 days. Only USD 12,000 (2.5%) of USD 487,200 has been received. No RBI extension (AD Category-I approval) on file. Mandatory STR filing required under FEMA 1999 / PMLA provisions.',
        dataPoint: 'Deadline: 14 May 2024 — Current Date: 01 Jul 2024 — Overdue by 48 days',
      },
      {
        id: 'F-1851-2',
        type: 'check_counterparty_pattern',
        severity: 'warning',
        label: 'Counterparty Opacity',
        description:
          '"Bright Harvest International FZE" is a UAE Free Zone entity incorporated <6 months ago with no verifiable trade history. Ultimate beneficial owner (UBO) could not be confirmed through CIBIL STPL or Bureau van Dijk.',
        dataPoint: 'Company incorporated: Jan 2024 — UBO: Unverified',
      },
    ],
    dateIssued: '2023-12-14',
    country: 'UAE',
    bank: 'State Bank of India, Amritsar',
    counterparty: {
      name: 'Bright Harvest International FZE',
      country: 'UAE',
      swiftCode: 'SBINAEADXXX',
      priorTransactionCount: 1,
    },
    priceSeries: [
      { date: '2023-10', declaredValue: 490000, benchmarkValue: 508000 },
      { date: '2023-11', declaredValue: 488000, benchmarkValue: 509000 },
      { date: '2023-12', declaredValue: 487200, benchmarkValue: 510000 },
      { date: '2024-01', declaredValue: 487200, benchmarkValue: 512000 },
      { date: '2024-02', declaredValue: 487200, benchmarkValue: 511000 },
    ],
  },

  // ④ MEDIUM RISK — engineering goods, slight over-invoice, approaching deadline
  {
    id: 'TXN-2024-0501',
    exporterName: 'Precision Engineering Works Ltd.',
    importerName: 'TechnoVision GmbH',
    hsCode: '8483.40',
    commodity: 'Gear Boxes & Speed Reducers',
    declaredValue: 95_400,
    benchmarkValue: 82_000,
    deviationPercent: 16.34,
    currency: 'USD',
    quantity: 45,
    unit: 'UNITS',
    edpmsStatus: 'at-risk',
    daysToDeadline: 22,
    realizationReceived: 40_000,
    riskLevel: 'medium',
    flags: [
      {
        id: 'F-0501-1',
        type: 'check_price_deviation',
        severity: 'warning',
        label: 'Price Deviation Above Threshold',
        description:
          'Declared value is 16.34% above benchmark — crosses the 15% alert threshold. Possible justification: custom specifications, but no technical specification sheet was submitted.',
        dataPoint: 'USD 95,400 declared vs USD 82,000 benchmark (Δ USD 13,400)',
      },
    ],
    dateIssued: '2024-06-01',
    country: 'Germany',
    bank: 'ICICI Bank, Pune',
    counterparty: {
      name: 'TechnoVision GmbH',
      country: 'Germany',
      swiftCode: 'DEUTDEDBXXX',
      priorTransactionCount: 6,
    },
    priceSeries: [
      { date: '2024-03', declaredValue: 92000, benchmarkValue: 80000 },
      { date: '2024-04', declaredValue: 94000, benchmarkValue: 81000 },
      { date: '2024-05', declaredValue: 95000, benchmarkValue: 81500 },
      { date: '2024-06', declaredValue: 95400, benchmarkValue: 82000 },
    ],
  },

  // ⑤ CLEAN — pharmaceuticals, well below benchmark (standard discount)
  {
    id: 'TXN-2024-0445',
    exporterName: 'Bharat Pharma Exports Ltd.',
    importerName: 'MedConnect Kenya Ltd.',
    hsCode: '3004.90',
    commodity: 'Medicaments (generic)',
    declaredValue: 67_800,
    benchmarkValue: 71_200,
    deviationPercent: -4.78,
    currency: 'USD',
    quantity: 500,
    unit: 'CASES',
    edpmsStatus: 'on-track',
    daysToDeadline: 180,
    realizationReceived: 67_800,
    riskLevel: 'low',
    flags: [],
    dateIssued: '2024-06-20',
    country: 'Kenya',
    bank: 'Kotak Mahindra Bank, Hyderabad',
    counterparty: {
      name: 'MedConnect Kenya Ltd.',
      country: 'Kenya',
      swiftCode: 'BARCKENAXXX',
      priorTransactionCount: 22,
    },
    priceSeries: [
      { date: '2024-04', declaredValue: 68000, benchmarkValue: 70800 },
      { date: '2024-05', declaredValue: 67900, benchmarkValue: 71000 },
      { date: '2024-06', declaredValue: 67800, benchmarkValue: 71200 },
    ],
  },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    transactionId: 'TXN-2024-0389',
    exporterName: 'Suryodaya Textiles Export Ltd.',
    flagType: 'check_price_deviation',
    severity: 'critical',
    message: 'Price deviation 43.47% above benchmark — USD 96,500 excess',
    timestamp: '2024-07-01T09:14:00Z',
    read: false,
  },
  {
    id: 'ALT-002',
    transactionId: 'TXN-2023-1851',
    exporterName: 'Himalayan Agri Exports Pvt. Ltd.',
    flagType: 'check_timeline_risk',
    severity: 'critical',
    message: 'EDPMS deadline breached by 48 days — USD 475,200 unrealized',
    timestamp: '2024-07-01T08:45:00Z',
    read: false,
  },
  {
    id: 'ALT-003',
    transactionId: 'TXN-2024-0389',
    exporterName: 'Suryodaya Textiles Export Ltd.',
    flagType: 'check_timeline_risk',
    severity: 'warning',
    message: 'Timeline Risk: 14 days to EDPMS deadline, zero funds received',
    timestamp: '2024-07-01T08:30:00Z',
    read: false,
  },
  {
    id: 'ALT-004',
    transactionId: 'TXN-2024-0501',
    exporterName: 'Precision Engineering Works Ltd.',
    flagType: 'check_price_deviation',
    severity: 'warning',
    message: 'Price deviation 16.34% above threshold — review required',
    timestamp: '2024-06-30T16:22:00Z',
    read: true,
  },
  {
    id: 'ALT-005',
    transactionId: 'TXN-2024-0389',
    exporterName: 'Suryodaya Textiles Export Ltd.',
    flagType: 'check_counterparty_pattern',
    severity: 'warning',
    message: 'Counterparty matched in 4 prior suspicious transactions',
    timestamp: '2024-06-30T14:10:00Z',
    read: true,
  },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const mockDashboardStats: DashboardStats = {
  totalTransactions: 5,
  openFlags: 5,
  highRiskCount: 2,
  avgDaysToRealization: 34,
  flagsTrend: [
    { date: 'Jan', count: 2 },
    { date: 'Feb', count: 3 },
    { date: 'Mar', count: 4 },
    { date: 'Apr', count: 6 },
    { date: 'May', count: 5 },
    { date: 'Jun', count: 7 },
    { date: 'Jul', count: 5 },
  ],
};

// ─── STR Reports ──────────────────────────────────────────────────────────────

export const mockSTRTemplate = (txn: Transaction): string => `
# Suspicious Transaction Report (STR)

**Report Reference:** STR-${txn.id}-${new Date().getFullYear()}
**Filing AD Bank:** ${txn.bank}
**Date of Report:** ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
**Reporting Officer:** Compliance Review Unit — Trade Finance
**Status:** DRAFT — Pending Compliance Officer Sign-off

---

## 1. Transaction Summary

| Field | Details |
|---|---|
| **Transaction ID** | ${txn.id} |
| **Exporter** | ${txn.exporterName} |
| **Importer / Counterparty** | ${txn.counterparty.name}, ${txn.counterparty.country} |
| **HS Code** | ${txn.hsCode} |
| **Commodity** | ${txn.commodity} |
| **Declared Invoice Value** | USD ${txn.declaredValue.toLocaleString()} |
| **Independent Benchmark Value** | USD ${txn.benchmarkValue.toLocaleString()} |
| **Deviation** | ${txn.deviationPercent > 0 ? '+' : ''}${txn.deviationPercent.toFixed(2)}% |
| **Date of Export** | ${txn.dateIssued} |
| **EDPMS Status** | ${txn.edpmsStatus.toUpperCase()} |
| **Realization Received** | USD ${txn.realizationReceived.toLocaleString()} of USD ${txn.declaredValue.toLocaleString()} |

---

## 2. Grounds for Suspicion

${txn.flags.map((f, i) => `
### 2.${i + 1} ${f.label} [${f.severity.toUpperCase()}]

**Triggered Check:** \`${f.type}\`

**Data Point:** ${f.dataPoint}

**Analysis:** ${f.description}
`).join('\n')}

---

## 3. Regulatory Basis

- **FEMA 1999**, Section 10(5): Authorized Dealers must ensure realization of export proceeds within the prescribed period.
- **PMLA 2002**, Section 12: Reporting obligation of suspicious transactions to the Financial Intelligence Unit — India (FIU-IND).
- **RBI Master Direction on Export of Goods and Services (2016)** — Paragraph 3.2: Payment Realization within 9 months for exports to all countries.
- **RBI/EDPMS**: EDPMS status marked **${txn.edpmsStatus.toUpperCase()}** with ${txn.daysToDeadline < 0 ? `${Math.abs(txn.daysToDeadline)} days overdue` : `${txn.daysToDeadline} days remaining`}.

---

## 4. Narrative Summary

This STR is being filed in respect of export transaction **${txn.id}** involving **${txn.exporterName}** (Exporter) and **${txn.counterparty.name}** (Overseas Buyer, ${txn.counterparty.country}).

The transaction exhibits characteristics consistent with **Trade-Based Money Laundering (TBML)** as identified through systematic cross-referencing of declared invoice values against independent commodity benchmarks and EDPMS realization data.

${txn.deviationPercent > 25 ? `The declared invoice value of USD ${txn.declaredValue.toLocaleString()} is **${txn.deviationPercent.toFixed(2)}% above** the independently sourced benchmark of USD ${txn.benchmarkValue.toLocaleString()} — a deviation of USD ${(txn.declaredValue - txn.benchmarkValue).toLocaleString()}. This level of over-invoicing is consistent with value transfer mechanisms used to move illicit funds across borders under the cover of legitimate trade.` : ''}

${txn.daysToDeadline < 0 ? `The RBI EDPMS realization deadline for this export has been **breached by ${Math.abs(txn.daysToDeadline)} days**. Only USD ${txn.realizationReceived.toLocaleString()} (${((txn.realizationReceived / txn.declaredValue) * 100).toFixed(1)}%) of the declared invoice value has been received. No extension application or RBI approval is on record, placing this transaction in mandatory STR territory under PMLA provisions.` : ''}

---

## 5. Recommended Actions

- [ ] Freeze further trade finance facilities for **${txn.exporterName}** pending investigation
- [ ] File this STR with **FIU-IND** through the FINnet portal within prescribed timelines
- [ ] Initiate KYC re-verification of both exporter and overseas counterparty
- [ ] Request exporter to provide explanation and supporting documentation within 7 days
- [ ] Coordinate with RBI regional office if EDPMS extension has not been sought
- [ ] Escalate to Bank's MLCO (Money Laundering Compliance Officer) for sign-off

---

*This report was generated by InvoiceX-Ray AI Compliance System. It must be reviewed and authenticated by the designated Compliance Officer before filing. Contents are confidential and subject to PMLA tipping-off prohibitions.*
`.trim();

export const mockSTRReports: STRReport[] = [
  {
    id: 'STR-TXN-2023-1851-2024',
    transactionId: 'TXN-2023-1851',
    generatedAt: '2024-07-01T10:00:00Z',
    status: 'pending',
    content: mockSTRTemplate(mockTransactions[2]),
  },
];

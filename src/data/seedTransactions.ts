import type { EvaluationResults } from "../types/invoicexray";

export const SEED_TRANSACTIONS: Record<string, EvaluationResults> = {
  "INV-2026-GOLD-99": {
    invoice_id: "INV-2026-GOLD-99",
    overallRisk: "CRITICAL",
    totalPenaltyExposure: 1875000,
    evaluatedAt: "2026-07-18T09:45:00Z",
    transactionMeta: {
      invoice_id: "INV-2026-GOLD-99",
      exporter_name: "AeroGold Refineries Pvt Ltd",
      exporter_iec: "IEC123456789",
      importer_name: "Helvetia Precious Trading SA",
      hs_code: "7108.12.00",
      hs_description: "Gold Bullion 99.99% Unwrought Bars",
      incoterms: "CIF",
      origin_port: "INBOM (Mumbai Port)",
      discharge_port: "CHZRH (Zurich International Hub)",
      invoice_date: "2026-06-15",
      realization_deadline: "2027-03-15",
      days_remaining: 240,
      realized_amount_usd: 0,
      declared_value_usd: 5900000,
    },
    manipulationGap: {
      declared: 2950,
      benchmark: 2200,
      gap: 1500000,
      direction: "OVER_INVOICED",
      narrative:
        "CRITICAL VALUATION DISCREPANCY: Unit price of $2,950/oz exceeds LBMA London Spot fixing ($2,200/oz) by 34.09%. Indicates deliberate over-invoicing to illicitly export $1.5M USD excess capital under trade settlement guise.",
    },
    flags: [
      {
        flag_type: "PRICE_DEVIATION_OVER",
        severity: "CRITICAL",
        confidence: "HIGH",
        detail:
          "Gold Bullion unit price ($2,950/oz) declared 34.09% above global spot benchmark ($2,200/oz).",
        supporting_data: {
          declared_unit_price: 2950,
          benchmark_spot_price: 2200,
          variance_percentage: "+34.09%",
          total_overvaluation_usd: 1500000,
        },
      },
      {
        flag_type: "ROUND_TRIP_INDICATOR",
        severity: "CRITICAL",
        confidence: "HIGH",
        detail:
          "DGFT System Alert: Exporter IEC123456789 is currently caution-listed for prior circular trading inquiries.",
        supporting_data: {
          dgft_status: "CAUTION_LISTED",
          category: "DENIED_ENTITY_LIST_CIRCULAR",
        },
      },
      {
        flag_type: "VALUE_CLUSTERING",
        severity: "HIGH",
        confidence: "HIGH",
        detail:
          "ICEGATE Manifest Mismatch: Shipping Bill SB-AU-22109 manifests a 25.0% cargo weight deficiency relative to customs physical scan.",
        supporting_data: {
          shipping_bill: "SB-AU-22109",
          declared_kg: 2000,
          actual_customs_kg: 1500,
          phantom_variance: "25.0%",
        },
      },
      {
        flag_type: "TIMELINE_PRESSURE",
        severity: "HIGH",
        confidence: "MEDIUM",
        detail:
          "Geospatial Routing Anomaly: Discharge port CHZRH (Zurich) is landlocked. Bill of Lading shows ocean freight to landlocked location without intermodal transshipment manifest.",
        supporting_data: {
          destination: "Zurich, Switzerland",
          port_code: "CHZRH",
          anomaly_type: "LANDLOCKED_MARITIME_DISCHARGE",
        },
      },
    ],
    crossAgency: {
      dgft_status: {
        iec: "IEC123456789",
        status: "CAUTION_LISTED",
        issue_details: "DGFT Ref #2026/DEL/889 - Circular Trade Risk & Unrealized Remittances",
      },
      icegate_customs: {
        shipping_bill: "SB-AU-22109",
        declared_weight_kg: 2000,
        customs_logged_weight_kg: 1500,
        weight_variance_pct: 25.0,
        anomaly_detected: true,
      },
      geospatial_routing: {
        origin_port: "INBOM (Mumbai Port)",
        discharge_port: "CHZRH (Zurich Port)",
        discharge_city: "Zurich",
        country: "Switzerland",
        is_landlocked: true,
        anomaly: "Landlocked Discharge Port without valid multimodal transport document",
      },
    },
    str: {
      fiu_ind_str_draft: {
        header: {
          str_id: "STR-2026-0718-AU99",
          reporting_entity: "INVOICEX-RAY COMPLIANCE AUTOMATION ENGINE",
          jurisdiction: "FIU-IND (FINANCIAL INTELLIGENCE UNIT - INDIA)",
          urgency: "IMMEDIATE_ACTION_REQUIRED",
        },
        metadata: {
          subject_exporter_id: "IEC123456789",
          subject_exporter_name: "AeroGold Refineries Pvt Ltd",
          associated_invoice_id: "INV-2026-GOLD-99",
          fema_realization_deadline_pressure: "NORMAL",
          tbml_risk_rating: "CRITICAL",
          estimated_fema_penalty_exposure_usd: 1875000,
        },
        findings: {
          price_deviation_valuation_gap_usd: 1500000,
          price_deviation_direction: "OVER_INVOICED",
          total_unrealized_amount_usd: 5900000,
          flags_synthesized: [
            { code: "PRICE_DEVIATION_OVER", level: "CRITICAL", notes: "34.09% unit price inflation over LBMA spot price" },
            { code: "DGFT_CAUTION_LIST", level: "CRITICAL", notes: "Entity caution-listed under DGFT Circular Trading Watchlist" },
            { code: "ICEGATE_WEIGHT_MISMATCH", level: "HIGH", notes: "25% weight discrepancy detected at customs gateway" },
            { code: "GEOSPATIAL_LANDLOCKED_ANOMALY", level: "HIGH", notes: "Discharge port specified as Zurich (Landlocked)" },
          ],
        },
        fiu_ready_narrative: `### SUSPICIOUS TRANSACTION REPORT (FIU-IND)
**Subject Entity:** AeroGold Refineries Pvt Ltd (IEC: IEC123456789)
**Invoice Reference:** INV-2026-GOLD-99 | **Declared Value:** $5,900,000 USD

**Executive Summary of Suspicion:**
During automated Trade-Based Money Laundering (TBML) cross-match evaluation, Invoice \`INV-2026-GOLD-99\` exhibited a compound risk profile combining extreme valuation manipulation, DGFT regulatory red flags, physical cargo weight discrepancies, and impossible maritime routing.

**1. Price Valuation Audit:**
- Declared Unit Price: $2,950 / oz vs. Global Benchmark (LBMA Spot): $2,200 / oz.
- Valuation Gap: +34.09% OVER-INVOICING ($1,500,000 USD capital siphoning vector).

**2. Cross-Agency Regulatory Findings:**
- **DGFT IEC Verification:** IEC123456789 flagged on DGFT Caution List (Ref #2026/DEL/889) for circular trading patterns.
- **ICEGATE Customs Integration:** Shipping Bill SB-AU-22109 logged physical scanned weight of 1,500 kg against declared manifest weight of 2,000 kg (25% phantom cargo gap).
- **Geospatial & Route Analysis:** Destination discharge port recorded as CHZRH (Zurich, Switzerland). Zurich is a landlocked municipality; Bill of Lading fails to provide required intermodal rail/road transshipment documentation.

**Recommended Compliance Action:**
Immediate freeze of EDPMS realization account, issuance of Order under FEMA Section 13, and referral to Directorate of Enforcement (ED).`,
      },
    },
  },

  "INV-2026-TEXTILE-404": {
    invoice_id: "INV-2026-TEXTILE-404",
    overallRisk: "HIGH",
    totalPenaltyExposure: 450000,
    evaluatedAt: "2026-07-18T09:42:00Z",
    transactionMeta: {
      invoice_id: "INV-2026-TEXTILE-404",
      exporter_name: "Vanguard Weaves & Exports",
      exporter_iec: "IEC987654321",
      importer_name: "Atlas Garments Trading LLC",
      hs_code: "5208.32.10",
      hs_description: "Woven Cotton Fabrics Dyed Woven",
      incoterms: "FOB",
      origin_port: "INMAA (Chennai Sea)",
      discharge_port: "AEDXB (Jebel Ali, Dubai)",
      invoice_date: "2025-10-20",
      realization_deadline: "2026-07-21",
      days_remaining: 3,
      realized_amount_usd: 0,
      declared_value_usd: 1500000,
    },
    manipulationGap: {
      declared: 15.0,
      benchmark: 14.2,
      gap: 80000,
      direction: "WITHIN_RANGE",
      narrative:
        "TIMELINE EXPIRATION WARNING: Unit valuation is within acceptable commercial thresholds (5.63% deviation). However, 270-day EDPMS statutory realization deadline expires in 3 days with $0 funds realized.",
    },
    flags: [
      {
        flag_type: "TIMELINE_PRESSURE",
        severity: "CRITICAL",
        confidence: "HIGH",
        detail:
          "EDPMS Realization Breach Imminent: Only 3 days remaining on statutory 9-month window with $1,500,000 USD completely unrealized.",
        supporting_data: {
          days_remaining: 3,
          unrealized_usd: 1500000,
          fema_clause: "FEMA Section 13 (3x Penalty Risk)",
        },
      },
    ],
    crossAgency: {
      dgft_status: {
        iec: "IEC987654321",
        status: "ACTIVE",
      },
      icegate_customs: {
        shipping_bill: "SB-MAA-99482",
        declared_weight_kg: 45000,
        customs_logged_weight_kg: 44920,
        weight_variance_pct: 0.18,
        anomaly_detected: false,
      },
      geospatial_routing: {
        origin_port: "INMAA (Chennai Sea)",
        discharge_port: "AEDXB (Jebel Ali Port)",
        discharge_city: "Dubai",
        country: "United Arab Emirates",
        is_landlocked: false,
        anomaly: null,
      },
    },
    str: {
      fiu_ind_str_draft: {
        header: {
          str_id: "STR-2026-0718-TX404",
          reporting_entity: "INVOICEX-RAY COMPLIANCE AUTOMATION ENGINE",
          jurisdiction: "FIU-IND (FINANCIAL INTELLIGENCE UNIT - INDIA)",
          urgency: "HIGH_PRIORITY",
        },
        metadata: {
          subject_exporter_id: "IEC987654321",
          subject_exporter_name: "Vanguard Weaves & Exports",
          associated_invoice_id: "INV-2026-TEXTILE-404",
          fema_realization_deadline_pressure: "OVERDUE_BREACH",
          tbml_risk_rating: "HIGH",
          estimated_fema_penalty_exposure_usd: 450000,
        },
        findings: {
          price_deviation_valuation_gap_usd: 80000,
          price_deviation_direction: "WITHIN_RANGE",
          total_unrealized_amount_usd: 1500000,
          flags_synthesized: [
            { code: "TIMELINE_PRESSURE", level: "CRITICAL", notes: "3 days until FEMA EDPMS realization default" },
          ],
        },
        fiu_ready_narrative: `### SUSPICIOUS TRANSACTION REPORT (FIU-IND)
**Subject Entity:** Vanguard Weaves & Exports (IEC: IEC987654321)
**Invoice Reference:** INV-2026-TEXTILE-404 | **Declared Value:** $1,500,000 USD

**Executive Summary of Suspicion:**
Invoice \`INV-2026-TEXTILE-404\` presents a high EDPMS realization failure risk under FEMA regulations. The trade value of $1,500,000 USD has remained entirely unrealized for 267 days, leaving 3 days before a statutory realization breach occurs.

**Key Observations:**
1. Unit price ($15.00/meter) aligns closely with historical customs market values ($14.20/meter).
2. Physical shipping manifest verified via ICEGATE with zero weight variance.
3. Total unrealized capital represents a potential FEMA Section 13 penalty exposure of $450,000 USD (30% statutory penalty rate).

**Recommended Regulatory Action:**
Issue urgent Notice to Exporter to produce Form ETX extension approval or e-BRC realization proof within 72 hours.`,
      },
    },
  },

  "INV-2026-ELECT-101": {
    invoice_id: "INV-2026-ELECT-101",
    overallRisk: "HIGH",
    totalPenaltyExposure: 292500,
    evaluatedAt: "2026-07-18T09:40:00Z",
    transactionMeta: {
      invoice_id: "INV-2026-ELECT-101",
      exporter_name: "Nexus Components India Ltd",
      exporter_iec: "IEC554433221",
      importer_name: "Apex Global Tech FZE",
      hs_code: "8542.31.00",
      hs_description: "Electronic Integrated Circuits Processors",
      incoterms: "FOB",
      origin_port: "INNSA (Nhava Sheva)",
      discharge_port: "SGSIN (Singapore Port)",
      invoice_date: "2026-07-02",
      realization_deadline: "2027-04-02",
      days_remaining: 258,
      realized_amount_usd: 0,
      declared_value_usd: 1950000,
    },
    manipulationGap: {
      declared: 195.0,
      benchmark: 140.0,
      gap: 550000,
      direction: "OVER_INVOICED",
      narrative:
        "CAROUSEL INVOICING TRIGGER: Unit price declared at $195.00/unit vs benchmark of $140.00/unit (+39.29%). Part of a 3-part identical $1.95M cluster issued in 48-hour succession to Apex Global Tech FZE.",
    },
    flags: [
      {
        flag_type: "MULTIPLE_INVOICING",
        severity: "HIGH",
        confidence: "HIGH",
        detail:
          "Multiple Invoicing Pattern: Identical transaction amount ($1,950,000.00) issued 3 times in 48 hours to same foreign counterparty.",
        supporting_data: {
          counterparty: "Apex Global Tech FZE",
          cluster_invoices: ["INV-2026-ELECT-101", "INV-2026-ELECT-102", "INV-2026-ELECT-103"],
          cluster_total_usd: 5850000,
        },
      },
      {
        flag_type: "RAPID_SUCCESSION",
        severity: "HIGH",
        confidence: "HIGH",
        detail:
          "Rapid Succession Velocity: 3 high-value invoices submitted within 48-hour window exceeding exporter's 6-month historical median throughput by 420%.",
      },
      {
        flag_type: "ROUND_TRIP_INDICATOR",
        severity: "MEDIUM",
        confidence: "MEDIUM",
        detail:
          "Circular Trading Marker: Counterparty Apex Global Tech FZE shares beneficial owner registration history with exporter's Dubai affiliate.",
      },
    ],
    crossAgency: {
      dgft_status: {
        iec: "IEC554433221",
        status: "ACTIVE",
      },
      icegate_customs: {
        shipping_bill: "SB-NSA-11029",
        declared_weight_kg: 850,
        customs_logged_weight_kg: 840,
        weight_variance_pct: 1.18,
        anomaly_detected: false,
      },
      geospatial_routing: {
        origin_port: "INNSA (Nhava Sheva)",
        discharge_port: "SGSIN (Singapore)",
        discharge_city: "Singapore",
        country: "Singapore",
        is_landlocked: false,
        anomaly: null,
      },
    },
    str: {
      fiu_ind_str_draft: {
        header: {
          str_id: "STR-2026-0718-EL101",
          reporting_entity: "INVOICEX-RAY COMPLIANCE AUTOMATION ENGINE",
          jurisdiction: "FIU-IND (FINANCIAL INTELLIGENCE UNIT - INDIA)",
          urgency: "HIGH_PRIORITY",
        },
        metadata: {
          subject_exporter_id: "IEC554433221",
          subject_exporter_name: "Nexus Components India Ltd",
          associated_invoice_id: "INV-2026-ELECT-101",
          fema_realization_deadline_pressure: "NORMAL",
          tbml_risk_rating: "HIGH",
          estimated_fema_penalty_exposure_usd: 292500,
        },
        findings: {
          price_deviation_valuation_gap_usd: 550000,
          price_deviation_direction: "OVER_INVOICED",
          total_unrealized_amount_usd: 1950000,
          flags_synthesized: [
            { code: "MULTIPLE_INVOICING", level: "HIGH", notes: "Identical $1.95M invoices repeated 3 times" },
            { code: "RAPID_SUCCESSION", level: "HIGH", notes: "3 shipments in 48 hours to same FZE entity" },
            { code: "ROUND_TRIP_INDICATOR", level: "MEDIUM", notes: "Shared beneficial ownership across counterparty" },
          ],
        },
        fiu_ready_narrative: `### SUSPICIOUS TRANSACTION REPORT (FIU-IND)
**Subject Entity:** Nexus Components India Ltd (IEC: IEC554433221)
**Invoice Reference:** INV-2026-ELECT-101 | **Declared Value:** $1,950,000 USD

**Executive Summary:**
System flagged a classic carousel / circular trading structure involving 3 identical invoices totaling $5,850,000 USD billed to Apex Global Tech FZE within a 48-hour timeframe.

**Specific Anomalies:**
1. Unit Price of IC Processors declared at $195.00/unit vs market benchmark of $140.00/unit (+39.29% over-invoicing gap).
2. Consecutive invoices INV-2026-ELECT-101, 102, and 103 feature identical line items, weights, and dollar amounts.
3. Beneficial ownership search links importer Apex Global Tech FZE to direct family members of Nexus Components directors.`,
      },
    },
  },

  "INV-2026-ELECT-102": {
    invoice_id: "INV-2026-ELECT-102",
    overallRisk: "HIGH",
    totalPenaltyExposure: 292500,
    evaluatedAt: "2026-07-18T09:40:00Z",
    transactionMeta: {
      invoice_id: "INV-2026-ELECT-102",
      exporter_name: "Nexus Components India Ltd",
      exporter_iec: "IEC554433221",
      importer_name: "Apex Global Tech FZE",
      hs_code: "8542.31.00",
      hs_description: "Electronic Integrated Circuits Processors",
      incoterms: "FOB",
      origin_port: "INNSA (Nhava Sheva)",
      discharge_port: "SGSIN (Singapore Port)",
      invoice_date: "2026-07-03",
      realization_deadline: "2027-04-03",
      days_remaining: 259,
      realized_amount_usd: 0,
      declared_value_usd: 1950000,
    },
    manipulationGap: {
      declared: 195.0,
      benchmark: 140.0,
      gap: 550000,
      direction: "OVER_INVOICED",
      narrative:
        "CAROUSEL INVOICING TRIGGER: Unit price declared at $195.00/unit vs benchmark of $140.00/unit (+39.29%). Second invoice in 3-part identical $1.95M cluster.",
    },
    flags: [
      {
        flag_type: "MULTIPLE_INVOICING",
        severity: "HIGH",
        confidence: "HIGH",
        detail:
          "Multiple Invoicing Pattern: Duplicate invoice sequence in 48-hour window to Apex Global Tech FZE.",
      },
      {
        flag_type: "RAPID_SUCCESSION",
        severity: "HIGH",
        confidence: "HIGH",
        detail:
          "Rapid Succession Velocity: Consecutive high-value shipment to same foreign hub.",
      },
    ],
    crossAgency: {
      dgft_status: {
        iec: "IEC554433221",
        status: "ACTIVE",
      },
      icegate_customs: {
        shipping_bill: "SB-NSA-11030",
        declared_weight_kg: 850,
        customs_logged_weight_kg: 845,
        weight_variance_pct: 0.58,
        anomaly_detected: false,
      },
      geospatial_routing: {
        origin_port: "INNSA (Nhava Sheva)",
        discharge_port: "SGSIN (Singapore)",
        discharge_city: "Singapore",
        country: "Singapore",
        is_landlocked: false,
        anomaly: null,
      },
    },
    str: null,
  },

  "INV-2026-ELECT-103": {
    invoice_id: "INV-2026-ELECT-103",
    overallRisk: "HIGH",
    totalPenaltyExposure: 292500,
    evaluatedAt: "2026-07-18T09:40:00Z",
    transactionMeta: {
      invoice_id: "INV-2026-ELECT-103",
      exporter_name: "Nexus Components India Ltd",
      exporter_iec: "IEC554433221",
      importer_name: "Apex Global Tech FZE",
      hs_code: "8542.31.00",
      hs_description: "Electronic Integrated Circuits Processors",
      incoterms: "FOB",
      origin_port: "INNSA (Nhava Sheva)",
      discharge_port: "SGSIN (Singapore Port)",
      invoice_date: "2026-07-04",
      realization_deadline: "2027-04-04",
      days_remaining: 260,
      realized_amount_usd: 0,
      declared_value_usd: 1950000,
    },
    manipulationGap: {
      declared: 195.0,
      benchmark: 140.0,
      gap: 550000,
      direction: "OVER_INVOICED",
      narrative:
        "CAROUSEL INVOICING TRIGGER: Unit price declared at $195.00/unit vs benchmark of $140.00/unit (+39.29%). Third invoice in 3-part identical $1.95M cluster.",
    },
    flags: [
      {
        flag_type: "MULTIPLE_INVOICING",
        severity: "HIGH",
        confidence: "HIGH",
        detail:
          "Multiple Invoicing Pattern: Duplicate invoice sequence in 48-hour window to Apex Global Tech FZE.",
      },
      {
        flag_type: "ROUND_TRIP_INDICATOR",
        severity: "HIGH",
        confidence: "MEDIUM",
        detail:
          "Round Trip Cash Flow: Offshore payment clearing routing mirrors domestic loan disbursement timeline.",
      },
    ],
    crossAgency: {
      dgft_status: {
        iec: "IEC554433221",
        status: "ACTIVE",
      },
      icegate_customs: {
        shipping_bill: "SB-NSA-11031",
        declared_weight_kg: 850,
        customs_logged_weight_kg: 842,
        weight_variance_pct: 0.94,
        anomaly_detected: false,
      },
      geospatial_routing: {
        origin_port: "INNSA (Nhava Sheva)",
        discharge_port: "SGSIN (Singapore)",
        discharge_city: "Singapore",
        country: "Singapore",
        is_landlocked: false,
        anomaly: null,
      },
    },
    str: null,
  },

  "INV-2026-CLEAN-01": {
    invoice_id: "INV-2026-CLEAN-01",
    overallRisk: "CLEAR",
    totalPenaltyExposure: 0,
    evaluatedAt: "2026-07-18T09:30:00Z",
    transactionMeta: {
      invoice_id: "INV-2026-CLEAN-01",
      exporter_name: "Gujarat Agro Exports Ltd",
      exporter_iec: "IEC443322110",
      importer_name: "Hamburg Cotton Imports GmbH",
      hs_code: "5201.00.15",
      hs_description: "Raw Cotton Combed Grade A1",
      incoterms: "CIF",
      origin_port: "INPUD (Mundra Port)",
      discharge_port: "DEHAM (Hamburg Port)",
      invoice_date: "2026-01-10",
      realization_deadline: "2026-10-10",
      days_remaining: 84,
      realized_amount_usd: 820000,
      declared_value_usd: 820000,
    },
    manipulationGap: {
      declared: 2.45,
      benchmark: 2.42,
      gap: 0,
      direction: "WITHIN_RANGE",
      narrative:
        "VERIFIED CLEAR TRADE: Unit price of $2.45/kg strictly matches Bremen Cotton Exchange spot index ($2.42/kg + 1.2% quality premium). Zero price gap detected.",
    },
    flags: [],
    crossAgency: {
      dgft_status: {
        iec: "IEC443322110",
        status: "ACTIVE",
      },
      icegate_customs: {
        shipping_bill: "SB-MUN-77102",
        declared_weight_kg: 334693,
        customs_logged_weight_kg: 334650,
        weight_variance_pct: 0.01,
        anomaly_detected: false,
      },
      geospatial_routing: {
        origin_port: "INPUD (Mundra Port)",
        discharge_port: "DEHAM (Hamburg Port)",
        discharge_city: "Hamburg",
        country: "Germany",
        is_landlocked: false,
        anomaly: null,
      },
    },
    str: null,
  },
};

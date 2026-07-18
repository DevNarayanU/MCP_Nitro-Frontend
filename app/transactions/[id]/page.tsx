'use client';

import React, { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Tag,
  Calendar,
  DollarSign,
  Clock,
  FileWarning,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  SearchCode,
  Globe,
  Anchor,
  Copy,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import CounterfactualChart from '@/components/CounterfactualChart';
import RedFlagsPanel from '@/components/RedFlagsPanel';
import STRPanel from '@/components/STRPanel';
import { RiskBadge, EdpmsBadge } from '@/components/ui';
import { useInvoiceXRay } from '@/lib/useInvoiceXRay';
import type { Transaction } from '@/lib/types';

type Params = Promise<{ id: string }>;

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>{value}</span>
    </div>
  );
}

function LiveCheckRow({ label, status, detail, icon }: { label: string; status: "clear" | "flagged" | "pending"; detail: string; icon: React.ReactNode }) {
  const statusColors = {
    clear: { text: "var(--risk-low-text)", bg: "var(--risk-low-bg)", border: "var(--risk-low-border)", label: "CLEAR" },
    flagged: { text: "var(--risk-high-text)", bg: "var(--risk-high-bg)", border: "var(--risk-high-border)", label: "FLAGGED" },
    pending: { text: "var(--text-muted)", bg: "var(--bg-tertiary)", border: "var(--border-default)", label: "NOT AUDITED" },
  }[status];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: "var(--radius-sm)",
        background: status === "pending" ? "var(--bg-secondary)" : statusColors.bg,
        border: `1px solid ${statusColors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: statusColors.text,
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{detail}</div>
      </div>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        color: statusColors.text,
        background: statusColors.bg,
        border: `1px solid ${statusColors.border}`,
        padding: "2px 8px",
        borderRadius: "var(--radius-badge)"
      }}>
        {statusColors.label}
      </span>
    </div>
  );
}

export default function TransactionDetailPage({ params }: { params: Params }) {
  const { id } = use(params);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loadingTxn, setLoadingTxn] = useState(true);
  const [showSTR, setShowSTR] = useState(false);

  const { evaluateTransaction, loading: auditing, results, error: auditError } = useInvoiceXRay();

  useEffect(() => {
    async function loadTransaction() {
      try {
        const res = await fetch(`/api/transactions/${id}`).then(r => r.json());
        if (res.success) {
          setTransaction(res.data);
        }
      } catch (err) {
        console.error('Error loading transaction details:', err);
      } finally {
        setLoadingTxn(false);
      }
    }
    loadTransaction();
  }, [id]);

  if (loadingTxn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        <p>Loading Transaction Details...</p>
      </div>
    );
  }

  if (!transaction) notFound();

  // Merge dynamic audit results into transaction state if available
  const activeTxn = results ? {
    ...transaction,
    riskLevel: results.overallRisk.toLowerCase() as any,
    deviationPercent: results.priceDeviation?.deviation_percent ?? transaction.deviationPercent,
    benchmarkValue: results.priceDeviation?.counterfactual?.benchmark_total_value ?? transaction.benchmarkValue,
    declaredValue: results.priceDeviation?.counterfactual?.declared_total_value ?? transaction.declaredValue,
    flags: results.flags,
  } : transaction;

  const realizationPct = activeTxn.declaredValue > 0
    ? ((activeTxn.realizationReceived / activeTxn.declaredValue) * 100).toFixed(1)
    : '0';

  const handleAudit = async () => {
    try {
      await evaluateTransaction(activeTxn.id);
    } catch (err) {
      console.error("Audit failed:", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar
        title={`Transaction ${activeTxn.id}`}
        subtitle={`${activeTxn.exporterName} → ${activeTxn.importerName}`}
      />

      <div style={{ padding: '24px', flex: 1 }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/transactions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'color 0.15s ease',
            }}
          >
            <ArrowLeft size={14} />
            Back to Transactions
          </Link>
        </div>

        {/* Header strip */}
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 22px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span
                className="tabular-nums"
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-text)', fontFamily: 'IBM Plex Mono, monospace' }}
              >
                {activeTxn.id}
              </span>
              <RiskBadge level={activeTxn.riskLevel} />
              <EdpmsBadge status={activeTxn.edpmsStatus} />
              {results && (
                <span style={{
                  background: "var(--accent-wash)",
                  color: "var(--accent-text)",
                  border: "1px solid var(--accent-border)",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-badge)"
                }}>
                  ✅ AUDITED
                </span>
              )}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeTxn.exporterName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              {activeTxn.commodity} · HS <span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{activeTxn.hsCode}</span> · <span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{activeTxn.quantity.toLocaleString()}</span> {activeTxn.unit}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleAudit}
              disabled={auditing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: auditing ? 'var(--bg-tertiary)' : 'var(--accent-wash)',
                color: auditing ? 'var(--text-muted)' : 'var(--accent-text)',
                border: `1px solid ${auditing ? 'var(--border-default)' : 'var(--accent-border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '9px 16px',
                fontSize: 14,
                fontWeight: 600,
                cursor: auditing ? 'not-allowed' : 'pointer',
                fontFamily: 'IBM Plex Sans, sans-serif',
                transition: 'all 0.15s ease',
              }}
            >
              <SearchCode size={16} className={auditing ? "animate-spin" : ""} />
              {auditing ? "Auditing TBML Pipeline..." : results ? "Re-Audit Transaction" : "Run TBML Audit"}
            </button>

            {activeTxn.flags.length > 0 && !showSTR && (
              <button
                id="generate-str-btn"
                onClick={() => setShowSTR(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--risk-high-bg)',
                  color: 'var(--risk-high-text)',
                  border: '1px solid var(--risk-high-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <FileWarning size={16} />
                Generate STR
              </button>
            )}

            {!auditing && !results && activeTxn.flags.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Audit recommended under FEMA 2026.
              </div>
            )}
          </div>
        </div>

        {auditError && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--risk-high-bg)',
            border: '1px solid var(--risk-high-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--risk-high-text)',
            fontSize: 13,
            marginBottom: 16
          }}>
            Error running audit pipeline: {auditError}
          </div>
        )}

        {/* Three-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: showSTR ? '1fr 1fr' : '1fr 380px',
            gap: 16,
            alignItems: 'start',
          }}
        >
          {/* Left: Counterfactual Chart + Flags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Counterfactual Chart */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '22px',
              }}
            >
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>
                  Counterfactual View — Price vs. Benchmark
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Declared invoice value cross-referenced against ITC Trade Map & MCX independent commodity benchmark
                </p>
              </div>
              <CounterfactualChart transaction={activeTxn} />
            </div>

            {/* Red Flags */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '22px',
              }}
            >
              <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Red Flags
                </h2>
                {activeTxn.flags.length > 0 && (
                  <span
                    style={{
                      background: 'var(--risk-high-bg)',
                      color: 'var(--risk-high-text)',
                      border: '1px solid var(--risk-high-border)',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-badge)',
                    }}
                  >
                    {activeTxn.flags.length} triggered
                  </span>
                )}
              </div>
              <RedFlagsPanel flags={activeTxn.flags} />
            </div>
          </div>

          {/* Right: Transaction Meta OR STR Panel */}
          {showSTR ? (
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 200px)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border-default)',
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  STR Draft
                </span>
                <button
                  id="close-str-btn"
                  onClick={() => setShowSTR(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                  }}
                >
                  ✕ Close
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <STRPanel transaction={activeTxn} results={results} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Live MCP Audit Checkpoints Panel */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 22px',
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
                  Live Compliance Checkpoints
                </h3>
                <LiveCheckRow
                  label="Exporter DGFT Code"
                  icon={<ShieldCheck size={15} />}
                  status={results ? (results.dgftStatus.status === "RED_FLAG" ? "flagged" : "clear") : "pending"}
                  detail={results ? results.dgftStatus.message : "Checks caution list and PAN linkage"}
                />
                <LiveCheckRow
                  label="Customs Verification (ICEGATE)"
                  icon={<DollarSign size={15} />}
                  status={results ? (results.customsStatus.status === "RED_FLAG" ? "flagged" : "clear") : "pending"}
                  detail={results ? results.customsStatus.risk_details : "Cargo weight matching"}
                />
                <LiveCheckRow
                  label="PEP / Sanctions Search"
                  icon={<Globe size={15} />}
                  status={results ? (results.sanctionsStatus.status === "RED_FLAG" ? "flagged" : "clear") : "pending"}
                  detail={results ? results.sanctionsStatus.risk_details : "OpenSanctions watchlist database matching"}
                />
                <LiveCheckRow
                  label="Geospatial Port Routing"
                  icon={<Anchor size={15} />}
                  status={results ? (results.routingStatus.status === "RED_FLAG" ? "flagged" : "clear") : "pending"}
                  detail={results ? (results.routingStatus.detail) : "Verifies landlocked ports & transshipments"}
                />
                <LiveCheckRow
                  label="Double Financing Check"
                  icon={<Copy size={15} />}
                  status={results ? (results.doubleFinancingStatus.status === "RED_FLAG" ? "flagged" : "clear") : "pending"}
                  detail={results ? results.doubleFinancingStatus.risk_details : "Checks cross-bank duplicates"}
                />
              </div>

              {/* Transaction Details */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 22px',
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
                  Transaction Details
                </h3>
                <MetaRow icon={<Calendar size={15} />} label="Date Issued" value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{activeTxn.dateIssued}</span>} />
                <MetaRow icon={<Building2 size={15} />} label="AD Bank Code" value={activeTxn.bank} />
                <MetaRow
                  icon={<DollarSign size={15} />}
                  label="Declared Value"
                  value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>${activeTxn.declaredValue.toLocaleString()} {activeTxn.currency}</span>}
                />
                <MetaRow
                  icon={<DollarSign size={15} />}
                  label="Benchmark"
                  value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>${activeTxn.benchmarkValue.toLocaleString()} {activeTxn.currency}</span>}
                />
                <MetaRow
                  icon={<Tag size={15} />}
                  label="HS Code"
                  value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{activeTxn.hsCode}</span>}
                />
                <MetaRow
                  icon={<Tag size={15} />}
                  label="Quantity"
                  value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{activeTxn.quantity.toLocaleString()} {activeTxn.unit}</span>}
                />
              </div>

              {/* EDPMS Status */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 22px',
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
                  EDPMS Realization Status
                </h3>
                <div style={{ marginBottom: 14 }}>
                  <EdpmsBadge status={activeTxn.edpmsStatus} />
                </div>

                {/* Realization bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Realization progress</span>
                    <span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{realizationPct}%</span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: 'var(--chart-track)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(Number(realizationPct), 100)}%`,
                        background:
                          activeTxn.edpmsStatus === 'overdue' ? 'var(--risk-high)' :
                          activeTxn.edpmsStatus === 'at-risk' ? 'var(--risk-medium)' :
                          'var(--risk-low)',
                        borderRadius: 3,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>

                <MetaRow
                  icon={<DollarSign size={15} />}
                  label="Received"
                  value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>${activeTxn.realizationReceived.toLocaleString()}</span>}
                />
                <MetaRow
                  icon={<Clock size={15} />}
                  label="Days to Deadline"
                  value={
                    <span
                      className="tabular-nums"
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        color: activeTxn.daysToDeadline < 0 ? 'var(--risk-high-text)' : activeTxn.daysToDeadline < 30 ? 'var(--risk-medium-text)' : 'var(--risk-low-text)',
                        fontWeight: 600,
                      }}
                    >
                      {activeTxn.daysToDeadline < 0 ? `${Math.abs(activeTxn.daysToDeadline)} days overdue` : `${activeTxn.daysToDeadline} days`}
                    </span>
                  }
                />
              </div>

              {/* Counterparty */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 22px',
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
                  Overseas Counterparty
                </h3>
                <MetaRow icon={<Building2 size={15} />} label="Entity" value={activeTxn.counterparty.name} />
                <MetaRow icon={<MapPin size={15} />} label="Country" value={activeTxn.counterparty.country} />
                {activeTxn.counterparty.swiftCode && (
                  <MetaRow
                    icon={<Tag size={15} />}
                    label="SWIFT"
                    value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{activeTxn.counterparty.swiftCode}</span>}
                  />
                )}
                <MetaRow
                  icon={<ExternalLink size={15} />}
                  label="Prior Transactions"
                  value={
                    <span
                      className="tabular-nums"
                      style={{ fontFamily: 'IBM Plex Mono, monospace', color: activeTxn.counterparty.priorTransactionCount < 3 ? 'var(--risk-high-text)' : 'var(--text-primary)' }}
                    >
                      {activeTxn.counterparty.priorTransactionCount}
                      {activeTxn.counterparty.priorTransactionCount < 3 && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--risk-medium-text)', fontFamily: 'IBM Plex Sans, sans-serif' }}>⚠ Low history</span>
                      )}
                    </span>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

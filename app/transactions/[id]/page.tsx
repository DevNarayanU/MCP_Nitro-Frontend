'use client';

import React, { use, useState } from 'react';
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
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import CounterfactualChart from '@/components/CounterfactualChart';
import RedFlagsPanel from '@/components/RedFlagsPanel';
import STRPanel from '@/components/STRPanel';
import { RiskBadge, EdpmsBadge, SeverityBadge } from '@/components/ui';
import { mockTransactions } from '@/lib/mockData';

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

export default function TransactionDetailPage({ params }: { params: Params }) {
  const { id } = use(params);
  const txn = mockTransactions.find((t) => t.id === id);
  const [showSTR, setShowSTR] = useState(false);

  if (!txn) notFound();

  const realizationPct = txn.declaredValue > 0
    ? ((txn.realizationReceived / txn.declaredValue) * 100).toFixed(1)
    : '0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar
        title={`Transaction ${txn.id}`}
        subtitle={`${txn.exporterName} → ${txn.counterparty.name}`}
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
                {txn.id}
              </span>
              <RiskBadge level={txn.riskLevel} />
              <EdpmsBadge status={txn.edpmsStatus} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              {txn.exporterName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              {txn.commodity} · HS <span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{txn.hsCode}</span> · <span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{txn.quantity.toLocaleString()}</span> {txn.unit}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {txn.flags.length > 0 && !showSTR && (
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
            {txn.flags.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--risk-low-text)', fontSize: 13, fontWeight: 500 }}>
                <CheckCircle2 size={16} color="var(--risk-low-text)" />
                All checks passed
              </div>
            )}
          </div>
        </div>

        {/* Three-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: showSTR ? '1fr 1fr' : '1fr 360px',
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
              <CounterfactualChart transaction={txn} />
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
                {txn.flags.length > 0 && (
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
                    {txn.flags.length} triggered
                  </span>
                )}
              </div>
              <RedFlagsPanel flags={txn.flags} />
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
                <STRPanel transaction={txn} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <MetaRow icon={<Calendar size={15} />} label="Date Issued" value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{txn.dateIssued}</span>} />
                <MetaRow icon={<Building2 size={15} />} label="AD Bank" value={txn.bank} />
                <MetaRow
                  icon={<DollarSign size={15} />}
                  label="Declared Value"
                  value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>${txn.declaredValue.toLocaleString()} {txn.currency}</span>}
                />
                <MetaRow
                  icon={<DollarSign size={15} />}
                  label="Benchmark"
                  value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>${txn.benchmarkValue.toLocaleString()} {txn.currency}</span>}
                />
                <MetaRow
                  icon={<Tag size={15} />}
                  label="HS Code"
                  value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{txn.hsCode}</span>}
                />
                <MetaRow
                  icon={<Tag size={15} />}
                  label="Quantity"
                  value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{txn.quantity.toLocaleString()} {txn.unit}</span>}
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
                  <EdpmsBadge status={txn.edpmsStatus} />
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
                          txn.edpmsStatus === 'overdue' ? 'var(--risk-high)' :
                          txn.edpmsStatus === 'at-risk' ? 'var(--risk-medium)' :
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
                  value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>${txn.realizationReceived.toLocaleString()}</span>}
                />
                <MetaRow
                  icon={<Clock size={15} />}
                  label="Days to Deadline"
                  value={
                    <span
                      className="tabular-nums"
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        color: txn.daysToDeadline < 0 ? 'var(--risk-high-text)' : txn.daysToDeadline < 30 ? 'var(--risk-medium-text)' : 'var(--risk-low-text)',
                        fontWeight: 600,
                      }}
                    >
                      {txn.daysToDeadline < 0 ? `${Math.abs(txn.daysToDeadline)} days overdue` : `${txn.daysToDeadline} days`}
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
                <MetaRow icon={<Building2 size={15} />} label="Entity" value={txn.counterparty.name} />
                <MetaRow icon={<MapPin size={15} />} label="Country" value={txn.counterparty.country} />
                {txn.counterparty.swiftCode && (
                  <MetaRow
                    icon={<Tag size={15} />}
                    label="SWIFT"
                    value={<span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{txn.counterparty.swiftCode}</span>}
                  />
                )}
                <MetaRow
                  icon={<ExternalLink size={15} />}
                  label="Prior Transactions"
                  value={
                    <span
                      className="tabular-nums"
                      style={{ fontFamily: 'IBM Plex Mono, monospace', color: txn.counterparty.priorTransactionCount < 3 ? 'var(--risk-high-text)' : 'var(--text-primary)' }}
                    >
                      {txn.counterparty.priorTransactionCount}
                      {txn.counterparty.priorTransactionCount < 3 && (
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

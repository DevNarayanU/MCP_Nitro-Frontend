'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  XCircle,
  Timer,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  FileWarning,
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import TopBar from '@/components/TopBar';
import { StatCard, RiskBadge, EdpmsBadge, SectionHeader, Deviation } from '@/components/ui';
import AlertsPane from '@/components/AlertsPane';
import { mockDashboardStats, mockTransactions, mockAlerts } from '@/lib/mockData';

const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        fontSize: 13,
      }}
    >
      <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{label}</div>
      <div className="tabular-nums" style={{ fontWeight: 600, color: 'var(--accent-text)', fontFamily: 'IBM Plex Mono, monospace' }}>
        {payload[0].value} flags triggered
      </div>
    </div>
  );
};

const riskBreakdown = [
  { label: 'High Risk', count: 2, color: 'var(--risk-high)' },
  { label: 'Medium Risk', count: 1, color: 'var(--risk-medium)' },
  { label: 'Low Risk', count: 2, color: 'var(--risk-low)' },
];

const edpmsBreakdown = [
  { label: 'On Track', count: 2, color: 'var(--risk-low)' },
  { label: 'At Risk', count: 2, color: 'var(--risk-medium)' },
  { label: 'Overdue', count: 1, color: 'var(--risk-high)' },
];

export default function DashboardPage() {
  const stats = mockDashboardStats;
  const recentTxns = mockTransactions.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar
        title="Dashboard"
        subtitle="Bank of Bharat — Trade Finance Compliance · FY 2024–25"
      />

      <div style={{ padding: '24px', flex: 1 }}>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <StatCard
            label="Transactions Monitored"
            value={stats.totalTransactions}
            delta="+12 this week"
            deltaPositive={true}
            icon={<Activity size={16} />}
          />
          <StatCard
            label="Open Flags"
            value={stats.openFlags}
            delta="+2 today"
            deltaPositive={false}
            icon={<AlertTriangle size={16} />}
          />
          <StatCard
            label="High Risk Transactions"
            value={stats.highRiskCount}
            delta="Requires action"
            deltaPositive={false}
            icon={<XCircle size={16} />}
          />
          <StatCard
            label="Avg. Days to Realization"
            value={`${stats.avgDaysToRealization}d`}
            delta="Within SLA"
            deltaPositive={true}
            icon={<Timer size={16} />}
          />
        </div>

        {/* ── Row 2: Trend Chart + Risk Breakdown + Alerts ─────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 260px 300px',
            gap: 12,
            marginBottom: 12,
          }}
        >
          {/* Flags Trend */}
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
            }}
          >
            <SectionHeader
              title="Flags Trend"
              subtitle="Automated compliance checks triggered"
              action={
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Jan – Jul 2024</span>
              }
            />
            <ResponsiveContainer width="100%" height={168}>
              <LineChart data={stats.flagsTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'inherit' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={20}
                />
                <Tooltip content={<TrendTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--chart-accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--chart-accent)', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: 'var(--chart-accent)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Breakdown */}
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
            }}
          >
            <SectionHeader title="Risk Breakdown" subtitle="By transaction risk level" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {riskBreakdown.map(({ label, count, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>{label}</span>
                    <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--chart-track)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / 5) * 100}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                EDPMS Status
              </div>
              {edpmsBreakdown.map(({ label, count, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
                  <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Alerts */}
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-default)' }}>
              <SectionHeader
                title="Live Alerts"
                subtitle={`${mockAlerts.filter((a) => !a.read).length} unread`}
                action={
                  <Link
                    href="/alerts"
                    style={{
                      fontSize: 11,
                      color: 'var(--accent-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    View all <ArrowRight size={11} />
                  </Link>
                }
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <AlertsPane alerts={mockAlerts.slice(0, 4)} compact />
            </div>
          </div>
        </div>

        {/* ── Row 3: High-Risk Spotlight + Recent Transactions ─── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: 12,
          }}
        >
          {/* High-Risk Spotlight */}
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-default)',
                background: 'var(--risk-high-bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileWarning size={14} color="var(--risk-high)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--risk-high-text)' }}>
                  Requires Immediate Action
                </span>
              </div>
            </div>
            {mockTransactions
              .filter((t) => t.riskLevel === 'high')
              .map((txn, idx, arr) => (
                <Link
                  key={txn.id}
                  href={`/transactions/${txn.id}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    padding: '12px 16px',
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    textDecoration: 'none',
                    transition: 'background 0.12s ease',
                  }}
                  className="dashboard-row"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      className="tabular-nums"
                      style={{ fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', color: 'var(--risk-high)', fontWeight: 600 }}
                    >
                      {txn.id}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: 10, color: 'var(--risk-high-text)', background: 'var(--risk-high-bg)', padding: '1px 6px', borderRadius: 8, fontWeight: 600 }}>
                      {txn.flags.length} flag{txn.flags.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {txn.exporterName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {txn.edpmsStatus === 'overdue'
                      ? `⚠ Overdue ${Math.abs(txn.daysToDeadline)}d`
                      : txn.daysToDeadline < 30
                      ? `⏱ ${txn.daysToDeadline}d to deadline`
                      : txn.commodity}
                  </div>
                  <Deviation percent={txn.deviationPercent} />
                </Link>
              ))}
          </div>

          {/* Recent Transactions Table-style */}
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <SectionHeader title="Recent Transactions" subtitle="Latest monitored trade transactions" />
              <Link
                href="/transactions"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: 'var(--accent-text)',
                  textDecoration: 'none',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  marginBottom: 18,
                }}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {/* Header row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr 120px 110px 100px 90px',
                padding: '8px 20px',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              {['Txn ID', 'Exporter', 'Declared', 'EDPMS', 'Deviation', 'Risk'].map((col) => (
                <div key={col} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {col}
                </div>
              ))}
            </div>

            {recentTxns.map((txn, idx) => (
              <Link
                key={txn.id}
                href={`/transactions/${txn.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 120px 110px 100px 90px',
                  padding: '12px 20px',
                  borderBottom: idx < recentTxns.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  textDecoration: 'none',
                  alignItems: 'center',
                  transition: 'background 0.12s ease',
                }}
                className="dashboard-row"
              >
                <span
                  className="tabular-nums"
                  style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-text)', fontWeight: 500 }}
                >
                  {txn.id}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                    {txn.exporterName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{txn.commodity}</div>
                </div>
                <span className="tabular-nums" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                  ${txn.declaredValue.toLocaleString()}
                </span>
                <EdpmsBadge status={txn.edpmsStatus} />
                <Deviation percent={txn.deviationPercent} />
                <RiskBadge level={txn.riskLevel} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .dashboard-row:hover { background: var(--bg-secondary) !important; }
      `}</style>
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock, Network, ChevronRight } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { RiskBadge, EdpmsBadge, Deviation } from './ui';

const flagIcon: Record<string, React.ElementType> = {
  check_price_deviation:    AlertTriangle,
  check_timeline_risk:      Clock,
  check_counterparty_pattern: Network,
};

interface TransactionTableProps { transactions: Transaction[]; }

/* Column spec */
const cols = [
  { key: 'id',             label: 'TXN ID',         w: 128 },
  { key: 'exporterName',   label: 'Exporter',        w: 200 },
  { key: 'hsCode',         label: 'HS Code',         w: 88  },
  { key: 'declaredValue',  label: 'Declared (USD)',  w: 132 },
  { key: 'benchmarkValue', label: 'Benchmark (USD)', w: 140 },
  { key: 'deviationPercent', label: 'Deviation',    w: 96  },
  { key: 'edpmsStatus',    label: 'EDPMS Status',    w: 120 },
  { key: 'riskLevel',      label: 'Risk Level',      w: 110 },
  { key: 'dateIssued',     label: 'Date',            w: 100 },
  { key: 'flags',          label: 'Flags',           w: 70  },
];

const gridTemplate = cols.map((c) => `${c.w}px`).join(' ') + ' 32px';

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const router = useRouter();

  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '10px 18px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)' }}>
        {cols.map((col) => (
          <div key={col.key} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingRight: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {col.label}
          </div>
        ))}
        <div />
      </div>

      {/* Rows */}
      <div style={{ overflowX: 'auto' }}>
        {transactions.map((txn, idx) => (
          <div
            key={txn.id}
            id={`txn-row-${txn.id}`}
            className="table-row-hover"
            onClick={() => router.push(`/transactions/${txn.id}`)}
            style={{
              display: 'grid',
              gridTemplateColumns: gridTemplate,
              padding: '12px 18px',
              borderBottom: idx < transactions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.12s ease',
              alignItems: 'center',
            }}
          >
            {/* ID */}
            <div className="tabular-nums" style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent-text)', fontFamily: 'IBM Plex Mono, monospace', paddingRight: 8 }}>
              {txn.id}
            </div>

            {/* Exporter */}
            <div style={{ paddingRight: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {txn.exporterName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{txn.commodity}</div>
            </div>

            {/* HS Code */}
            <div className="tabular-nums" style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>
              {txn.hsCode}
            </div>

            {/* Declared */}
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'IBM Plex Mono, monospace' }}>
              ${txn.declaredValue.toLocaleString()}
            </div>

            {/* Benchmark */}
            <div className="tabular-nums" style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
              ${txn.benchmarkValue.toLocaleString()}
            </div>

            {/* Deviation */}
            <div><Deviation percent={txn.deviationPercent} /></div>

            {/* EDPMS */}
            <div><EdpmsBadge status={txn.edpmsStatus} /></div>

            {/* Risk */}
            <div><RiskBadge level={txn.riskLevel} /></div>

            {/* Date */}
            <div className="tabular-nums" style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>
              {txn.dateIssued}
            </div>

            {/* Flag icons */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
              {txn.flags.map((flag) => {
                const Icon = flagIcon[flag.type] ?? AlertTriangle;
                const color = flag.severity === 'critical' ? 'var(--risk-high-text)' : flag.severity === 'warning' ? 'var(--risk-medium-text)' : 'var(--accent-text)';
                return <span key={flag.id} title={flag.label} style={{ color }}><Icon size={13} strokeWidth={2} /></span>;
              })}
              {txn.flags.length === 0 && <span style={{ fontSize: 13, color: 'var(--risk-low-text)' }}>—</span>}
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ChevronRight size={13} color="var(--text-muted)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

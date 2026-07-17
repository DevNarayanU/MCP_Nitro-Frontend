'use client';

import React, { useState } from 'react';
import TopBar from '@/components/TopBar';
import TransactionTable from '@/components/TransactionTable';
import { mockTransactions } from '@/lib/mockData';
import type { RiskLevel, EdpmsStatus } from '@/lib/types';
import { SectionHeader } from '@/components/ui';
import { Filter, SlidersHorizontal } from 'lucide-react';

const riskOptions: { value: RiskLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'high', label: 'High Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'low', label: 'Low Risk' },
];

const edpmsOptions: { value: EdpmsStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All EDPMS' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'at-risk', label: 'At Risk' },
  { value: 'on-track', label: 'On Track' },
];

export default function TransactionsPage() {
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [edpmsFilter, setEdpmsFilter] = useState<EdpmsStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = mockTransactions.filter((txn) => {
    const matchRisk = riskFilter === 'all' || txn.riskLevel === riskFilter;
    const matchEdpms = edpmsFilter === 'all' || txn.edpmsStatus === edpmsFilter;
    const matchSearch =
      !search ||
      txn.id.toLowerCase().includes(search.toLowerCase()) ||
      txn.exporterName.toLowerCase().includes(search.toLowerCase()) ||
      txn.hsCode.includes(search) ||
      txn.commodity.toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchEdpms && matchSearch;
  });

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 12px',
    fontSize: 14,
    color: 'var(--text-primary)',
    fontFamily: 'IBM Plex Sans, sans-serif',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar
        title="Transactions"
        subtitle={`${filtered.length} of ${mockTransactions.length} transactions shown`}
      />

      <div style={{ padding: '24px', flex: 1 }}>
        {/* Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
            <SlidersHorizontal size={14} />
            Filter:
          </div>
          <select
            id="risk-filter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'all')}
            style={selectStyle}
          >
            {riskOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            id="edpms-filter"
            value={edpmsFilter}
            onChange={(e) => setEdpmsFilter(e.target.value as EdpmsStatus | 'all')}
            style={selectStyle}
          >
            {edpmsOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input
            id="txn-search"
            type="text"
            placeholder="Search ID, exporter, HS code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...selectStyle,
              width: 240,
            }}
          />

          {(riskFilter !== 'all' || edpmsFilter !== 'all' || search) && (
            <button
              id="clear-filters"
              onClick={() => { setRiskFilter('all'); setEdpmsFilter('all'); setSearch(''); }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 13,
                color: 'var(--accent-text)',
                cursor: 'pointer',
                fontFamily: 'IBM Plex Sans, sans-serif',
                padding: 0,
                fontWeight: 500,
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Risk summary pills */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {(['high', 'medium', 'low'] as RiskLevel[]).map((level) => {
            const count = mockTransactions.filter((t) => t.riskLevel === level).length;
            const colors: Record<RiskLevel, { bg: string; border: string; color: string; label: string }> = {
              high: { bg: 'var(--risk-high-bg)', border: 'var(--risk-high-border)', color: 'var(--risk-high-text)', label: 'High Risk' },
              medium: { bg: 'var(--risk-medium-bg)', border: 'var(--risk-medium-border)', color: 'var(--risk-medium-text)', label: 'Medium Risk' },
              low: { bg: 'var(--risk-low-bg)', border: 'var(--risk-low-border)', color: 'var(--risk-low-text)', label: 'Low Risk' },
            };
            const c = colors[level];
            const isSelected = riskFilter === level;
            return (
              <button
                key={level}
                id={`risk-pill-${level}`}
                onClick={() => setRiskFilter(isSelected ? 'all' : level)}
                style={{
                  background: isSelected ? c.bg : 'var(--bg-primary)',
                  color: c.color,
                  border: `1px solid ${c.border}`,
                  borderRadius: 'var(--radius-badge)',
                  padding: '4px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  transition: 'all 0.15s ease',
                }}
              >
                <span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace', marginRight: 4 }}>{count}</span> {c.label}
              </button>
            );
          })}
        </div>

        <TransactionTable transactions={filtered} />

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            No transactions match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}

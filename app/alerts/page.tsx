'use client';

import React, { useState } from 'react';
import TopBar from '@/components/TopBar';
import AlertsPane from '@/components/AlertsPane';
import { mockAlerts } from '@/lib/mockData';
import type { FlagSeverity } from '@/lib/types';
import { SectionHeader } from '@/components/ui';

const severityOptions: { value: FlagSeverity | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

export default function AlertsPage() {
  const [filter, setFilter] = useState<FlagSeverity | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filtered = mockAlerts.filter((a) => {
    const matchSev = filter === 'all' || a.severity === filter;
    const matchRead = !showUnreadOnly || !a.read;
    return matchSev && matchRead;
  });

  const unread = mockAlerts.filter((a) => !a.read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar
        title="Alerts"
        subtitle={`${unread} unread · ${mockAlerts.length} total`}
      />

      <div style={{ padding: '24px', flex: 1 }}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {severityOptions.map((opt) => (
              <button
                key={opt.value}
                id={`severity-filter-${opt.value}`}
                onClick={() => setFilter(opt.value)}
                style={{
                  padding: '7px 16px',
                  fontSize: 13,
                  fontWeight: filter === opt.value ? 600 : 400,
                  background: filter === opt.value ? 'var(--accent-wash)' : 'transparent',
                  color: filter === opt.value ? 'var(--accent-text)' : 'var(--text-muted)',
                  border: 'none',
                  borderRight: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  transition: 'all 0.13s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
            <input
              id="unread-only-toggle"
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
            />
            Unread only
          </label>
        </div>

        {/* Alert stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Critical', count: mockAlerts.filter((a) => a.severity === 'critical').length, color: 'var(--risk-high-text)', bg: 'var(--risk-high-bg)', border: 'var(--risk-high-border)' },
            { label: 'Warning', count: mockAlerts.filter((a) => a.severity === 'warning').length, color: 'var(--risk-medium-text)', bg: 'var(--risk-medium-bg)', border: 'var(--risk-medium-border)' },
            { label: 'Unread', count: unread, color: 'var(--accent-text)', bg: 'var(--accent-wash)', border: 'var(--accent-border)' },
          ].map(({ label, count, color, bg, border }) => (
            <div
              key={label}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 'var(--radius-sm)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span className="tabular-nums" style={{ fontSize: 26, fontWeight: 600, color, letterSpacing: '-0.02em', fontFamily: 'IBM Plex Mono, monospace' }}>
                {count}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Alerts list */}
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-secondary)' }}>
            <SectionHeader
              title={`${filtered.length} Alert${filtered.length !== 1 ? 's' : ''}`}
              subtitle="Click any alert to view the associated transaction"
            />
          </div>
          {filtered.length > 0 ? (
            <AlertsPane alerts={filtered} />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No alerts match the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

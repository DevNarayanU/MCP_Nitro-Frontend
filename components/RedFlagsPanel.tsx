'use client';

import React from 'react';
import { AlertTriangle, Clock, Network, Info } from 'lucide-react';
import type { TransactionFlag } from '@/lib/types';
import { SeverityBadge } from './ui';

const flagIcons: Record<string, React.ElementType> = {
  check_price_deviation:    AlertTriangle,
  check_timeline_risk:      Clock,
  check_counterparty_pattern: Network,
};

const flagColors = {
  critical: { border: 'var(--risk-high)',   iconBg: 'var(--risk-high-bg)',   icon: 'var(--risk-high-text)',   leftBar: 'var(--risk-high)' },
  warning:  { border: 'var(--risk-medium)', iconBg: 'var(--risk-medium-bg)', icon: 'var(--risk-medium-text)', leftBar: 'var(--risk-medium)' },
  info:     { border: 'var(--accent)',       iconBg: 'var(--accent-wash)',    icon: 'var(--accent-text)',      leftBar: 'var(--accent)' },
} as const;

interface RedFlagsPanelProps { flags: TransactionFlag[]; }

export default function RedFlagsPanel({ flags }: RedFlagsPanelProps) {
  if (flags.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', gap: 10, textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Info size={18} color="var(--risk-low-text)" />
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--risk-low-text)' }}>No flags triggered</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>This transaction passes all automated compliance checks.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {flags.map((flag) => {
        const Icon   = flagIcons[flag.type] ?? AlertTriangle;
        const colors = flagColors[flag.severity as keyof typeof flagColors] ?? flagColors.info;

        return (
          <div
            key={flag.id}
            className="animate-fade-in"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderLeft: `3px solid ${colors.leftBar}`,
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* Icon */}
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: colors.iconBg, border: `1px solid ${colors.border}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon size={15} color={colors.icon} strokeWidth={2} />
              </div>

              <div style={{ flex: 1 }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {flag.label}
                  </span>
                  <SeverityBadge severity={flag.severity} />
                  <code style={{ fontSize: 11, background: 'var(--bg-page)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: 3, fontFamily: 'IBM Plex Mono, monospace', border: '1px solid var(--border-default)' }}>
                    {flag.type}()
                  </code>
                </div>

                {/* Description */}
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                  {flag.description}
                </p>

                {/* Data point */}
                <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '7px 12px', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>DATA</span>
                  <span className="tabular-nums" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{flag.dataPoint}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

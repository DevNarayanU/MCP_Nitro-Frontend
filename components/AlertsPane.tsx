'use client';

import React from 'react';
import { AlertTriangle, Clock, Network, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Alert } from '@/lib/types';
import { SeverityBadge } from './ui';

const flagIcon: Record<string, React.ElementType> = {
  check_price_deviation:    AlertTriangle,
  check_timeline_risk:      Clock,
  check_counterparty_pattern: Network,
};

function timeAgo(iso: string): string {
  const delta = (Date.now() - new Date(iso).getTime()) / 1000;
  if (delta < 60)    return `${Math.floor(delta)}s ago`;
  if (delta < 3600)  return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

interface AlertsPaneProps {
  alerts: Alert[];
  compact?: boolean;
}

export default function AlertsPane({ alerts, compact = false }: AlertsPaneProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {alerts.map((alert) => {
        const Icon = flagIcon[alert.flagType] ?? AlertTriangle;
        const isUnread = !alert.read;

        const leftBarColor =
          alert.severity === 'critical' ? 'var(--risk-high)' :
          alert.severity === 'warning'  ? 'var(--risk-medium)' :
          'var(--accent)';

        const iconBg =
          alert.severity === 'critical' ? 'var(--risk-high-bg)' :
          alert.severity === 'warning'  ? 'var(--risk-medium-bg)' :
          'var(--accent-wash)';

        const iconColor =
          alert.severity === 'critical' ? 'var(--risk-high-text)' :
          alert.severity === 'warning'  ? 'var(--risk-medium-text)' :
          'var(--accent-text)';

        return (
          <div
            key={alert.id}
            id={`alert-${alert.id}`}
            className="alert-item"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: compact ? '10px 14px' : '13px 16px',
              background: 'transparent',
              borderBottom: '1px solid var(--border-subtle)',
              borderLeft: `3px solid ${isUnread ? leftBarColor : 'transparent'}`,
              transition: 'background 0.13s ease',
              cursor: 'pointer',
            }}
          >
            {/* Icon */}
            <div style={{
              width: compact ? 28 : 32,
              height: compact ? 28 : 32,
              borderRadius: 'var(--radius-sm)',
              background: iconBg,
              border: `1px solid ${leftBarColor}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}>
              <Icon size={compact ? 13 : 14} color={iconColor} strokeWidth={2} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: compact ? 13 : 14, fontWeight: isUnread ? 600 : 400, color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: 4 }}>
                {alert.message}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                  {alert.exporterName}
                </span>
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <span className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0 }}>
                  {alert.transactionId}
                </span>
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <span className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0 }}>
                  {timeAgo(alert.timestamp)}
                </span>
              </div>
            </div>

            {!compact && (
              <Link href={`/transactions/${alert.transactionId}`} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} title="View transaction">
                <ExternalLink size={13} />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

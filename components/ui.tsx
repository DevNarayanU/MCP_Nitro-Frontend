'use client';

import React from 'react';
import type { RiskLevel, EdpmsStatus, FlagSeverity } from '@/lib/types';

/* ─── Tinted-outline badge base ─────────────────────────────────────────── */
const badgeBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  fontSize: 13,
  fontWeight: 600,
  padding: '3px 9px',
  borderRadius: 'var(--radius-badge)',
  letterSpacing: '0.01em',
  whiteSpace: 'nowrap',
  border: '1px solid',
  fontFamily: 'IBM Plex Sans, sans-serif',
};

/* ─── Risk Level Badge ────────────────────────────────────────────────────── */
interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const config = {
    low:    { label: 'Low Risk', bg: 'var(--risk-low-bg)',    border: 'var(--risk-low-border)',    color: 'var(--risk-low-text)',    dot: 'var(--risk-low)' },
    medium: { label: 'Medium',   bg: 'var(--risk-medium-bg)', border: 'var(--risk-medium-border)', color: 'var(--risk-medium-text)', dot: 'var(--risk-medium)' },
    high:   { label: 'High Risk',bg: 'var(--risk-high-bg)',   border: 'var(--risk-high-border)',   color: 'var(--risk-high-text)',   dot: 'var(--risk-high)' },
  }[level];

  return (
    <span
      style={{
        ...badgeBase,
        background: config.bg,
        borderColor: config.border,
        color: config.color,
        fontSize: size === 'sm' ? 11 : 13,
        padding: size === 'sm' ? '2px 7px' : '3px 9px',
        gap: size === 'sm' ? 4 : 5,
      }}
    >
      <span style={{ width: size === 'sm' ? 5 : 6, height: size === 'sm' ? 5 : 6, borderRadius: '50%', background: config.dot, flexShrink: 0 }} />
      {config.label}
    </span>
  );
}

/* ─── EDPMS Status Badge ──────────────────────────────────────────────────── */
interface EdpmsBadgeProps { status: EdpmsStatus; }

export function EdpmsBadge({ status }: EdpmsBadgeProps) {
  const config = {
    'on-track': { label: 'On Track', bg: 'var(--risk-low-bg)',    border: 'var(--risk-low-border)',    color: 'var(--risk-low-text)' },
    'at-risk':  { label: 'At Risk',  bg: 'var(--risk-medium-bg)', border: 'var(--risk-medium-border)', color: 'var(--risk-medium-text)' },
    'overdue':  { label: 'Overdue',  bg: 'var(--risk-high-bg)',   border: 'var(--risk-high-border)',   color: 'var(--risk-high-text)' },
  }[status];

  return (
    <span style={{ ...badgeBase, background: config.bg, borderColor: config.border, color: config.color }}>
      {config.label}
    </span>
  );
}

/* ─── Severity Badge ──────────────────────────────────────────────────────── */
interface SeverityBadgeProps { severity: FlagSeverity; }

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = {
    info:     { label: 'INFO',     bg: 'var(--accent-wash)',      border: 'var(--accent-border)',       color: 'var(--accent-text)' },
    warning:  { label: 'WARNING',  bg: 'var(--risk-medium-bg)',   border: 'var(--risk-medium-border)',  color: 'var(--risk-medium-text)' },
    critical: { label: 'CRITICAL', bg: 'var(--risk-high-bg)',     border: 'var(--risk-high-border)',    color: 'var(--risk-high-text)' },
  }[severity];

  return (
    <span
      style={{
        ...badgeBase,
        background: config.bg,
        borderColor: config.border,
        color: config.color,
        fontSize: 10,
        padding: '2px 7px',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
      }}
    >
      {config.label}
    </span>
  );
}

/* ─── Deviation Display ───────────────────────────────────────────────────── */
interface DeviationProps { percent: number; }

export function Deviation({ percent }: DeviationProps) {
  const abs = Math.abs(percent);
  const color =
    abs > 25 ? 'var(--risk-high-text)' :
    abs > 15 ? 'var(--risk-medium-text)' :
    abs > 5  ? 'var(--text-secondary)' :
               'var(--risk-low-text)';

  return (
    <span className="tabular-nums" style={{ fontWeight: 600, fontSize: 14, color }}>
      {percent > 0 ? '+' : ''}{percent.toFixed(2)}%
    </span>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon: React.ReactNode;
  accent?: boolean;
}

export function StatCard({ label, value, delta, deltaPositive, icon, accent }: StatCardProps) {
  return (
    <div
      className="stat-card"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'border-color 0.15s ease',
        /* NO box-shadow */
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: accent ? 'var(--accent-wash)' : 'var(--bg-secondary)',
            border: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border-default)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent ? 'var(--accent-text)' : 'var(--text-muted)',
          }}
        >
          {icon}
        </div>
        {delta && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: deltaPositive ? 'var(--risk-low-text)' : 'var(--risk-high-text)',
              background: deltaPositive ? 'var(--risk-low-bg)' : 'var(--risk-high-bg)',
              border: `1px solid ${deltaPositive ? 'var(--risk-low-border)' : 'var(--risk-high-border)'}`,
              padding: '2px 8px',
              borderRadius: 'var(--radius-badge)',
              fontFamily: 'IBM Plex Sans, sans-serif',
            }}
          >
            {delta}
          </span>
        )}
      </div>
      <div>
        <div
          className="tabular-nums"
          style={{
            fontSize: 30,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontFamily: 'IBM Plex Mono, monospace',
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 6, fontWeight: 400 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ─── Section Header ──────────────────────────────────────────────────────── */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 3 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

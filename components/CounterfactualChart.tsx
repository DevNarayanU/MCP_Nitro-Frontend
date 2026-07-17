'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { Transaction } from '@/lib/types';

interface CounterfactualChartProps {
  transaction: Transaction;
}

/* Lightbox palette */
const DECLARED_COLOR  = '#4E9C93';   /* dimmer cyan — the "declared" side */
const BENCHMARK_COLOR = '#8FE3D8';   /* phosphor cyan — the benchmark */

export default function CounterfactualChart({ transaction }: CounterfactualChartProps) {
  const { priceSeries, declaredValue, benchmarkValue, deviationPercent } = transaction;

  const data = priceSeries.map((p) => ({
    date: p.date,
    declared:  p.declaredValue,
    benchmark: p.benchmarkValue,
  }));

  const formatUSD    = (v: number) => `$${(v / 1000).toFixed(0)}k`;
  const isOver       = deviationPercent > 0;
  const gapAmount    = Math.abs(declaredValue - benchmarkValue);
  const deviationAbs = Math.abs(deviationPercent);

  const deviationColor =
    deviationAbs > 25 ? 'var(--risk-high-text)' :
    deviationAbs > 15 ? 'var(--risk-medium-text)' :
    deviationAbs > 5  ? 'var(--text-secondary)' :
                        'var(--risk-low-text)';

  const deviationBg =
    deviationAbs > 25 ? 'var(--risk-high-bg)' :
    deviationAbs > 15 ? 'var(--risk-medium-bg)' :
    deviationAbs > 5  ? 'var(--bg-secondary)' :
                        'var(--risk-low-bg)';

  const deviationBorder =
    deviationAbs > 25 ? 'var(--risk-high-border)' :
    deviationAbs > 15 ? 'var(--risk-medium-border)' :
    deviationAbs > 5  ? 'var(--border-default)' :
                        'var(--risk-low-border)';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 14px',
        fontSize: 13,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>{label}</div>
        {payload.map((entry: any) => (
          <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: entry.fill, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize', fontSize: 12 }}>{entry.name}:</span>
            <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-primary)', marginLeft: 'auto', paddingLeft: 10 }}>
              ${entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* ── Three-cell value strip ─────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        marginBottom: 16,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-default)',
      }}>
        {/* Declared */}
        <div style={{ flex: 1, padding: '14px 18px', background: 'var(--bg-secondary)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Declared Invoice
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 600, color: DECLARED_COLOR, letterSpacing: '-0.02em', fontFamily: 'IBM Plex Mono, monospace' }}>
            ${declaredValue.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>USD — as filed</div>
        </div>

        {/* Deviation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '14px 22px',
          background: deviationBg,
          border: `0 solid ${deviationBorder}`,
          borderLeft: `1px solid ${deviationBorder}`,
          borderRight: `1px solid ${deviationBorder}`,
          minWidth: 130,
        }}>
          <div style={{ fontSize: 10, color: deviationColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Deviation
          </div>
          <div className="tabular-nums" style={{ fontSize: 30, fontWeight: 700, color: deviationColor, letterSpacing: '-0.02em', fontFamily: 'IBM Plex Mono, monospace' }}>
            {isOver ? '+' : ''}{deviationPercent.toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, color: deviationColor, opacity: 0.7, marginTop: 2 }}>
            {isOver ? 'above' : 'below'} benchmark
          </div>
        </div>

        {/* Benchmark */}
        <div style={{ flex: 1, padding: '14px 18px', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Benchmark Value
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 600, color: BENCHMARK_COLOR, letterSpacing: '-0.02em', fontFamily: 'IBM Plex Mono, monospace' }}>
            ${benchmarkValue.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>ITC Trade Map / MCX</div>
        </div>
      </div>

      {/* ── Gap callout ────────────────────────────────────────── */}
      {gapAmount > 5_000 && (
        <div style={{
          padding: '10px 14px',
          background: isOver ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
          border: `1px solid ${isOver ? 'var(--risk-high-border)' : 'var(--risk-low-border)'}`,
          borderLeft: `3px solid ${isOver ? 'var(--risk-high)' : 'var(--risk-low)'}`,
          borderRadius: 'var(--radius-sm)',
          marginBottom: 16,
          fontSize: 13,
          color: isOver ? 'var(--risk-high-text)' : 'var(--risk-low-text)',
          lineHeight: 1.55,
        }}>
          <strong className="tabular-nums">${gapAmount.toLocaleString()}</strong>{' '}
          {isOver ? 'excess value declared above benchmark — potential value transfer out of India.' : 'below benchmark — possible under-invoicing or import of foreign exchange.'}
        </div>
      )}

      {/* ── Bar chart ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.02em' }}>
          Price trend — trailing period (USD)
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={4} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatUSD}
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="benchmark" name="benchmark" fill={BENCHMARK_COLOR} radius={[2, 2, 0, 0]} maxBarSize={28} fillOpacity={0.9} />
            <Bar dataKey="declared"  name="declared"  fill={DECLARED_COLOR}  radius={[2, 2, 0, 0]} maxBarSize={28} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
        {[
          { color: BENCHMARK_COLOR, label: 'Benchmark (ITC/MCX)' },
          { color: DECLARED_COLOR,  label: 'Declared Invoice' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 4, borderRadius: 1, background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

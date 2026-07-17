'use client';

import React, { useState } from 'react';
import TopBar from '@/components/TopBar';
import { Shield, Bell, Database, Sliders, Users, CheckCircle2 } from 'lucide-react';

interface SettingRow {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input';
  value?: string | boolean;
  options?: string[];
}

const settingGroups: {
  icon: React.ElementType;
  title: string;
  items: SettingRow[];
}[] = [
  {
    icon: Shield,
    title: 'Compliance Thresholds',
    items: [
      { id: 'alert-threshold', label: 'Alert Threshold', description: 'Flag transactions when deviation exceeds this %', type: 'input', value: '15' },
      { id: 'critical-threshold', label: 'Critical Threshold', description: 'Mark as critical when deviation exceeds this %', type: 'input', value: '25' },
      { id: 'edpms-warning-days', label: 'EDPMS Warning Window', description: 'Days before deadline to trigger at-risk status', type: 'input', value: '30' },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    items: [
      { id: 'email-alerts', label: 'Email Alerts', description: 'Send alerts to compliance officer email', type: 'toggle', value: true },
      { id: 'critical-only', label: 'Critical Flags Only', description: 'Only notify on critical severity flags', type: 'toggle', value: false },
      { id: 'daily-digest', label: 'Daily Digest', description: 'Morning summary of all open flags', type: 'toggle', value: true },
    ],
  },
  {
    icon: Database,
    title: 'Benchmark Sources',
    items: [
      { id: 'benchmark-source', label: 'Primary Benchmark', description: 'Independent commodity price reference', type: 'select', value: 'ITC Trade Map', options: ['ITC Trade Map', 'MCX Spot Prices', 'DGFT Export Data', 'LME / CME'] },
      { id: 'edpms-sync', label: 'EDPMS Sync Frequency', description: 'How often to pull RBI EDPMS data', type: 'select', value: 'Real-time', options: ['Real-time', 'Hourly', 'Daily'] },
    ],
  },
  {
    icon: Users,
    title: 'MCP Tool Configuration',
    items: [
      { id: 'auto-check-price', label: 'Auto-run check_price_deviation', description: 'Trigger price check automatically on new transactions', type: 'toggle', value: true },
      { id: 'auto-check-timeline', label: 'Auto-run check_timeline_risk', description: 'Trigger timeline check daily', type: 'toggle', value: true },
      { id: 'auto-check-counterparty', label: 'Auto-run check_counterparty_pattern', description: 'Run pattern analysis weekly', type: 'toggle', value: false },
      { id: 'auto-draft-str', label: 'Auto-draft STR on critical flags', description: 'Pre-draft STR when critical severity is triggered', type: 'toggle', value: false },
    ],
  },
];

function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 42,
        height: 22,
        borderRadius: 11,
        background: checked ? 'var(--accent-wash)' : 'var(--bg-tertiary)',
        border: `1px solid ${checked ? 'var(--accent-border)' : 'var(--border-default)'}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: checked ? 'var(--accent)' : 'var(--text-muted)',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {};
    settingGroups.forEach((group) => {
      group.items.forEach((item) => {
        initial[item.id] = item.value ?? '';
      });
    });
    return initial;
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar
        title="Settings"
        subtitle="Compliance thresholds, notification preferences, and MCP tool configuration"
      />

      <div style={{ padding: '24px', flex: 1, maxWidth: 800 }}>
        {settingGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div
              key={group.title}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 16,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-default)',
                  background: 'var(--bg-secondary)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-wash)',
                    border: '1px solid var(--accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GroupIcon size={15} color="var(--accent-text)" />
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {group.title}
                </span>
              </div>

              {group.items.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    borderBottom: idx < group.items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {item.description}
                    </div>
                  </div>

                  {item.type === 'toggle' && (
                    <Toggle
                      id={`toggle-${item.id}`}
                      checked={settings[item.id] as boolean}
                      onChange={() => setSettings((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                    />
                  )}

                  {item.type === 'select' && (
                    <select
                      id={`select-${item.id}`}
                      value={settings[item.id] as string}
                      onChange={(e) => setSettings((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '7px 12px',
                        fontSize: 14,
                        color: 'var(--text-primary)',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: 170,
                      }}
                    >
                      {item.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {item.type === 'input' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        id={`input-${item.id}`}
                        type="number"
                        value={settings[item.id] as string}
                        onChange={(e) => setSettings((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '7px 12px',
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          fontFamily: 'IBM Plex Mono, monospace',
                          width: 80,
                          outline: 'none',
                          textAlign: 'right',
                        }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button
            id="save-settings-btn"
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: saved ? 'var(--risk-low-bg)' : 'var(--accent-wash)',
              color: saved ? 'var(--risk-low-text)' : 'var(--accent-text)',
              border: `1px solid ${saved ? 'var(--risk-low-border)' : 'var(--accent-border)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'IBM Plex Sans, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            {saved ? <CheckCircle2 size={16} /> : <Sliders size={16} />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

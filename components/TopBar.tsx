'use client';

import React, { useState } from 'react';
import { Search, Sun, Moon, Bell, HelpCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { mockAlerts } from '@/lib/mockData';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const unread = mockAlerts.filter((a) => !a.read).length;
  const [searchFocused, setSearchFocused] = useState(false);

  const iconBtn: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-default)',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    transition: 'all 0.13s ease',
    flexShrink: 0,
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        gap: 20,
        position: 'sticky',
        top: 0,
        zIndex: 30,
        /* NO box-shadow */
      }}
    >
      {/* ── Page title ──────────────────────────────────────────── */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-secondary)',
          border: `1px solid ${searchFocused ? 'var(--accent-border)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '7px 12px',
          width: 260,
          transition: 'border-color 0.13s ease',
        }}
      >
        <Search size={13} color="var(--text-muted)" />
        <input
          id="topbar-search"
          type="text"
          placeholder="Search transactions, exporters…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 14,
            color: 'var(--text-primary)',
            flex: 1,
            fontFamily: 'IBM Plex Sans, sans-serif',
          }}
        />
        <kbd style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-default)',
          borderRadius: 3,
          padding: '1px 5px',
          fontFamily: 'IBM Plex Mono, monospace',
        }}>
          ⌘K
        </kbd>
      </div>

      {/* ── Action buttons ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button id="topbar-alerts-btn" style={iconBtn} title="Alerts">
          <Bell size={14} />
          {unread > 0 && (
            <span style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--risk-high)',
              border: '1.5px solid var(--bg-primary)',
            }} />
          )}
        </button>

        <button id="topbar-help-btn" style={iconBtn} title="Help">
          <HelpCircle size={14} />
        </button>

        <button id="topbar-theme-toggle" onClick={toggleTheme} style={iconBtn}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <div style={{ width: 1, height: 22, background: 'var(--border-default)', margin: '0 6px' }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-wash)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--accent)',
            fontFamily: 'IBM Plex Mono, monospace',
          }}>
            SP
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Sneha Pillai</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bank of Bharat</span>
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Bell,
  FileText,
  Settings,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { mockAlerts } from '@/lib/mockData';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badgeKey?: 'alerts';
}

const navItems: NavItem[] = [
  { label: 'Dashboard',      href: '/',            icon: LayoutDashboard },
  { label: 'Transactions',   href: '/transactions', icon: ArrowLeftRight },
  { label: 'Alerts',         href: '/alerts',       icon: Bell,     badgeKey: 'alerts' },
  { label: 'Reports (STRs)', href: '/reports',      icon: FileText },
  { label: 'Settings',       href: '/settings',     icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const unread = mockAlerts.filter((a) => !a.read).length;

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: 'var(--accent-wash)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={17} color="var(--accent)" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              InvoiceX-Ray
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, letterSpacing: '0.04em' }}>
              TBML Compliance
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        <div style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          fontWeight: 600,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          padding: '4px 10px 10px',
        }}>
          Main
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          const badge = item.badgeKey === 'alerts' ? unread : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="sidebar-nav-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 2,
                textDecoration: 'none',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: isActive ? 'var(--accent-wash)' : 'transparent',
                border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                transition: 'all 0.13s ease',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                position: 'relative',
              }}
            >
              {/* Cyan left accent bar for active */}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  left: -1,
                  top: 6,
                  bottom: 6,
                  width: 2,
                  background: 'var(--accent)',
                  borderRadius: '0 2px 2px 0',
                }} />
              )}

              <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>

              {badge > 0 && (
                <span
                  className="animate-pulse-badge"
                  style={{
                    background: 'var(--risk-high-bg)',
                    color: 'var(--risk-high-text)',
                    border: '1px solid var(--risk-high-border)',
                    fontSize: 10,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User footer ──────────────────────────────────────────── */}
      <div style={{ padding: '12px 10px 18px', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-wash)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--accent)',
            flexShrink: 0,
            fontFamily: 'IBM Plex Mono, monospace',
          }}>
            SP
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Sneha Pillai
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Compliance Officer</div>
          </div>
          <ChevronRight size={13} color="var(--text-muted)" />
        </div>
        <div style={{ padding: '6px 10px 0' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.01em' }}>Bank of Bharat · AD License</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>FIU-IND Registered</div>
        </div>
      </div>
    </aside>
  );
}

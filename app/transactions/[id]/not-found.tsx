'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 16,
        padding: '40px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ShieldAlert size={28} color="var(--text-muted)" strokeWidth={1.5} />
      </div>
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}
        >
          Transaction Not Found
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
          The transaction ID you requested doesn&apos;t exist in the current dataset.
          It may have been archived or the ID is incorrect.
        </p>
      </div>
      <Link
        href="/transactions"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '9px 18px',
          background: 'var(--accent-wash)',
          color: 'var(--accent-text)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-sm)',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'IBM Plex Sans, sans-serif',
        }}
      >
        <ArrowLeft size={14} />
        Back to Transactions
      </Link>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { FileWarning, Download, Copy, CheckCircle, Loader2, FileCheck } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { mockSTRTemplate } from '@/lib/mockData';

interface STRPanelProps {
  transaction: Transaction;
  onClose?: () => void;
}

const STREAM_SPEED = 10;
const TICK_MS      = 14;

export default function STRPanel({ transaction, onClose }: STRPanelProps) {
  const [streaming, setStreaming] = useState(false);
  const [displayed, setDisplayed] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filed, setFiled] = useState(false);

  const generateSTR = () => {
    const content = mockSTRTemplate(transaction);
    setFullContent(content);
    setDisplayed('');
    setDone(false);
    setFiled(false);
    setStreaming(true);
  };

  useEffect(() => {
    if (!streaming || !fullContent) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx += STREAM_SPEED;
      if (idx >= fullContent.length) {
        setDisplayed(fullContent);
        setStreaming(false);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(fullContent.slice(0, idx));
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [streaming, fullContent]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Initial / prompt state ─────────────────────────────────── */
  if (!done && !streaming) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 28px', gap: 18, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-sm)', background: 'var(--risk-high-bg)', border: '1px solid var(--risk-high-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileWarning size={24} color="var(--risk-high-text)" />
        </div>

        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Generate Suspicious Transaction Report
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 400 }}>
            The AI reasoning layer will draft a complete STR for FIU-IND submission, incorporating all triggered flags, regulatory basis, and recommended actions.
          </p>
        </div>

        {/* Tool badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['check_price_deviation', 'check_timeline_risk', 'check_counterparty_pattern', 'draft_str'].map((tool, i) => (
            <code key={tool} style={{
              fontSize: 11,
              background: i === 3 ? 'var(--accent-wash)' : 'var(--bg-secondary)',
              color: i === 3 ? 'var(--accent-text)' : 'var(--text-muted)',
              border: `1px solid ${i === 3 ? 'var(--accent-border)' : 'var(--border-default)'}`,
              padding: '3px 9px',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'IBM Plex Mono, monospace',
            }}>
              {tool}()
            </code>
          ))}
        </div>

        <button
          id="str-generate-btn"
          onClick={generateSTR}
          style={{
            background: 'var(--risk-high-bg)',
            color: 'var(--risk-high-text)',
            border: '1px solid var(--risk-high-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'IBM Plex Sans, sans-serif',
            transition: 'opacity 0.13s ease',
          }}
        >
          <FileWarning size={15} />
          Generate STR Draft
        </button>
      </div>
    );
  }

  /* ── Toolbar ─────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {streaming ? (
            <>
              <Loader2 size={13} color="var(--accent)" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Drafting STR…</span>
            </>
          ) : filed ? (
            <>
              <CheckCircle size={13} color="var(--risk-low-text)" />
              <span style={{ fontSize: 13, color: 'var(--risk-low-text)', fontWeight: 600 }}>Filed with FIU-IND</span>
            </>
          ) : (
            <>
              <FileWarning size={13} color="var(--risk-high-text)" />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Draft STR — </span>
              <span className="tabular-nums" style={{ fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--accent-text)' }}>{transaction.id}</span>
              <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--risk-medium-bg)', color: 'var(--risk-medium-text)', border: '1px solid var(--risk-medium-border)', padding: '1px 7px', borderRadius: 'var(--radius-badge)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                DRAFT
              </span>
            </>
          )}
        </div>

        {done && !filed && (
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'str-copy-btn', onClick: handleCopy, icon: copied ? <CheckCircle size={12} /> : <Copy size={12} />, label: copied ? 'Copied!' : 'Copy' },
            ].map(({ id, onClick, icon, label }) => (
              <button key={id} id={id} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'IBM Plex Sans, sans-serif', transition: 'all 0.13s ease' }}>
                {icon}{label}
              </button>
            ))}
            <button
              id="str-download-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'IBM Plex Sans, sans-serif' }}
              onClick={() => { const blob = new Blob([fullContent], { type: 'text/markdown' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `STR-${transaction.id}.md`; a.click(); }}
            >
              <Download size={12} />Export
            </button>
            <button
              id="str-file-btn"
              onClick={() => setFiled(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', background: 'var(--risk-high-bg)', border: '1px solid var(--risk-high-border)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--risk-high-text)', fontFamily: 'IBM Plex Sans, sans-serif', transition: 'opacity 0.13s ease' }}
            >
              <FileCheck size={12} />Mark as Filed
            </button>
          </div>
        )}
      </div>

      {/* ── Document area — paper on lightbox ───────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--bg-secondary)',
        }}
      >
        <div
          className="str-document"
          style={{
            background: 'var(--str-bg)',
            color: 'var(--str-text)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--str-border)',
            padding: '28px 32px',
            minHeight: 400,
          }}
        >
          <pre style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 13,
            lineHeight: 1.75,
            color: 'var(--str-text)',
            background: 'transparent',
          }}>
            {displayed}
            {streaming && (
              <span style={{
                display: 'inline-block',
                width: 2,
                height: '1em',
                background: 'var(--str-muted)',
                marginLeft: 2,
                animation: 'pulse-badge 0.7s ease infinite',
                verticalAlign: 'text-bottom',
              }} />
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

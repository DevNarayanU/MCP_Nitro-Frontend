'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import STRPanel from '@/components/STRPanel';
import type { Transaction } from '@/lib/types';
import { FileText, FileWarning } from 'lucide-react';
import { useInvoiceXRay } from '@/lib/useInvoiceXRay';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  
  // Track audit results locally for selected transactions
  const [auditResults, setAuditResults] = useState<Record<string, any>>({});

  const { evaluateTransaction, loading: auditing, results } = useInvoiceXRay();

  useEffect(() => {
    async function loadTransactions() {
      try {
        const res = await fetch('/api/transactions').then(r => r.json());
        if (res.success) {
          setTransactions(res.data);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  // Sync active hook results into our local audit results cache
  useEffect(() => {
    if (results && results.invoice_id) {
      setAuditResults(prev => ({
        ...prev,
        [results.invoice_id]: results
      }));
    }
  }, [results]);

  // Expose only flagged or suspicious transactions (risk high or medium) for STRs
  const flaggedTxns = transactions.filter((t) => t.riskLevel === 'high' || t.riskLevel === 'medium');
  const selectedTxn = flaggedTxns.find((t) => t.id === selectedTxnId);
  const selectedAuditResult = selectedTxnId ? auditResults[selectedTxnId] : null;

  const handleGenerate = async (invoiceId: string) => {
    try {
      await evaluateTransaction(invoiceId);
    } catch (err) {
      console.error("Failed to generate STR via hook:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        <p>Loading Flagged Transactions...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar
        title="Reports (STRs)"
        subtitle="Suspicious Transaction Reports — FIU-IND Filing"
      />

      <div style={{ padding: '24px', flex: 1 }}>
        {/* Info banner */}
        <div
          style={{
            background: 'var(--accent-wash)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 18px',
            marginBottom: 20,
            fontSize: 14,
            color: 'var(--accent-text)',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ fontWeight: 600 }}>Regulatory Context:</strong> Under PMLA 2002 and RBI EDPMS guidelines, Authorized Dealer banks must file STRs with FIU-IND for transactions exhibiting TBML indicators. InvoiceX-Ray drafts STRs automatically using flagged transaction data.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>
          {/* Transaction list */}
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-default)',
                background: 'var(--bg-secondary)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Transactions Requiring STR
            </div>

            {flaggedTxns.map((txn, idx) => {
              const isSelected = txn.id === selectedTxnId;
              const hasCritical = txn.riskLevel === 'high';

              return (
                <div
                  key={txn.id}
                  id={`str-txn-${txn.id}`}
                  onClick={() => setSelectedTxnId(txn.id)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: idx < flaggedTxns.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--accent-wash)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'all 0.12s ease',
                  }}
                  className="str-row"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: hasCritical ? 'var(--risk-high-bg)' : 'var(--risk-medium-bg)',
                        border: `1px solid ${hasCritical ? 'var(--risk-high-border)' : 'var(--risk-medium-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileWarning
                        size={15}
                        color={hasCritical ? 'var(--risk-high-text)' : 'var(--risk-medium-text)'}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: 12,
                          fontFamily: 'IBM Plex Mono, monospace',
                          color: isSelected ? 'var(--accent-text)' : 'var(--text-muted)',
                          marginBottom: 3,
                          fontWeight: 500,
                        }}
                      >
                        {txn.id}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {txn.exporterName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                        {txn.riskLevel.toUpperCase()} Risk · {auditResults[txn.id] ? "AUDITED" : "Awaiting Audit"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* STR Panel */}
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              minHeight: 500,
            }}
          >
            {selectedTxn ? (
              <STRPanel
                transaction={selectedTxn}
                results={selectedAuditResult}
                onGenerate={() => handleGenerate(selectedTxn.id)}
                auditing={auditing && selectedTxn.id === results?.invoice_id}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 400,
                  gap: 14,
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  padding: '24px',
                }}
              >
                <FileText size={40} strokeWidth={1.3} color="var(--text-muted)" />
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Select a transaction
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 300, lineHeight: 1.6 }}>
                  Choose a flagged transaction from the left panel to generate or view its Suspicious Transaction Report draft.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

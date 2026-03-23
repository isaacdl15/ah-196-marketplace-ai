'use client';

import { useState } from 'react';
import { DollarSign, AlertCircle, TrendingUp, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Sale { id: string; customer_email: string; amount_cents: number; net_cents: number; status: string; created_at: string; }
interface Payout { id: string; amount_cents: number; payout_email: string; status: string; created_at: string; }

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  completed: { bg: '#D1F2E4', color: '#1A6B45' },
  pending:   { bg: '#FEF3C7', color: '#92400E' },
  refunded:  { bg: '#FFE4E4', color: '#9B1C1C' },
  requested: { bg: '#FEF3C7', color: '#92400E' },
  processing:{ bg: '#D1EAE8', color: '#1E6B6B' },
  paid:      { bg: '#D1F2E4', color: '#1A6B45' },
  failed:    { bg: '#FFE4E4', color: '#9B1C1C' },
};

function formatMoney(cents: number) { return '$' + (cents / 100).toFixed(2); }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

export default function EarningsView({ sales, payouts, totalCents, thisMonthCents, pendingCents, creatorId }: {
  sales: Sale[]; payouts: Payout[]; totalCents: number; thisMonthCents: number; pendingCents: number; creatorId: string;
}) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutEmail, setPayoutEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const supabase = createClient();

  const requestPayout = async () => {
    if (pendingCents < 2500) return;
    setSaving(true);
    await supabase.from('sirena_payouts').insert({ creator_id: creatorId, amount_cents: pendingCents, payout_email: payoutEmail, status: 'requested' });
    setSaving(false);
    setShowPayoutModal(false);
  };

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Earned (All time)', value: formatMoney(totalCents), accent: true },
          { label: 'This month', value: formatMoney(thisMonthCents) },
          { label: 'Pending payout', value: formatMoney(pendingCents), warn: pendingCents > 0 },
        ].map(({ label, value, accent, warn }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-elev-1)', position: 'relative', overflow: 'hidden' }}>
            {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#C75B40', borderRadius: '16px 16px 0 0' }} />}
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A', marginBottom: '8px', marginTop: accent ? '8px' : 0 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: accent ? '40px' : '36px', fontWeight: 700, color: warn ? '#E89820' : accent ? '#C75B40' : '#1A1208', lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Payout banner */}
      {pendingCents >= 2500 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #E89820', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#92400E' }}>
            <AlertCircle size={16} color="#E89820" /> You have {formatMoney(pendingCents)} available for payout.
          </div>
          <button onClick={() => setShowPayoutModal(true)} style={{ background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
            Request payout
          </button>
        </div>
      )}

      {/* Sales table */}
      <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', boxShadow: 'var(--shadow-elev-1)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E8DDD2' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208' }}>Sales</h3>
        </div>
        {sales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <DollarSign size={48} strokeWidth={1} color="#9E8B7A" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>No earnings yet</p>
            <p style={{ fontSize: '14px', color: '#9E8B7A' }}>Your revenue will appear here once you start selling.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5EEE6' }}>
                  {['Product', 'Customer', 'Date', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map((s, i) => {
                  const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.pending;
                  return (
                    <tr key={s.id} style={{ borderBottom: i < sales.length - 1 ? '1px solid #E8DDD2' : 'none', background: i % 2 === 0 ? 'white' : '#FDFAF6' }}>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1A1208' }}>—</td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#9E8B7A' }}>{s.customer_email.slice(0, 20)}…</td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#9E8B7A' }}>{formatDate(s.created_at)}</td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#2D9E6B' }}>{formatMoney(s.net_cents)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '9999px' }}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout history */}
      <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-elev-1)' }}>
        <button onClick={() => setHistoryOpen(!historyOpen)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208' }}>Payout history</h3>
          <TrendingUp size={18} color="#9E8B7A" style={{ transform: historyOpen ? 'rotate(180deg)' : 'none', transition: '150ms' }} />
        </button>
        {historyOpen && (
          <div style={{ borderTop: '1px solid #E8DDD2' }}>
            {payouts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: '14px', color: '#9E8B7A' }}>No payout history yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F5EEE6' }}>
                    {['Date', 'Amount', 'Method', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => {
                    const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.requested;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #E8DDD2' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9E8B7A' }}>{formatDate(p.created_at)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#1A1208' }}>{formatMoney(p.amount_cents)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#5A4839' }}>PayPal — {p.payout_email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '9999px' }}>{p.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Payout modal */}
      {showPayoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.50)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} className="modal-overlay-enter">
          <div style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-elev-3)', padding: '32px', maxWidth: '480px', width: '100%' }} className="modal-content-enter">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1208' }}>Request payout</h3>
              <button onClick={() => setShowPayoutModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E8B7A', borderRadius: '8px', padding: '8px' }}><X size={20} /></button>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: '#C75B40', textAlign: 'center', marginBottom: '24px' }}>{formatMoney(pendingCents)}</div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>PayPal email for payout</label>
              <input type="email" value={payoutEmail} onChange={e => setPayoutEmail(e.target.value)} placeholder="you@paypal.com"
                style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 12px', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-ui)' }} />
            </div>
            {pendingCents < 2500 && <p style={{ fontSize: '13px', color: '#D94040', marginBottom: '16px' }}>Minimum payout is $25.00</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #E8DDD2', paddingTop: '20px', marginTop: '8px' }}>
              <button onClick={() => setShowPayoutModal(false)} style={{ padding: '9px 16px', border: '1.5px solid #E8DDD2', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--font-ui)' }}>Cancel</button>
              <button onClick={requestPayout} disabled={saving || !payoutEmail || pendingCents < 2500}
                style={{ padding: '9px 20px', background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-ui)', opacity: (!payoutEmail || pendingCents < 2500) ? 0.6 : 1 }}>
                {saving ? 'Requesting…' : `Request ${formatMoney(pendingCents)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { CreditCard, Check, ExternalLink, AlertCircle, RefreshCw, Wallet, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface Payout {
  id: string;
  amount_cents: number;
  status: string;
  payout_method: string;
  stripe_payout_id: string | null;
  created_at: string;
}

function formatMoney(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  requested: { bg: '#FFF7ED', text: '#EA580C', dot: '#EA580C', label: 'Requested' },
  processing: { bg: '#FEF3C7', text: '#D97706', dot: '#D97706', label: 'Processing' },
  paid: { bg: '#F0FDF4', text: '#16A34A', dot: '#16A34A', label: 'Paid' },
  failed: { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626', label: 'Failed' },
  cancelled: { bg: '#F5F5F4', text: '#57534E', dot: '#A8A29E', label: 'Cancelled' },
};

export default function PayoutsClient({
  stripeOnboarded,
  stripeAccountId,
  payouts,
  availableBalanceCents,
}: {
  stripeOnboarded: boolean;
  stripeAccountId: string | null;
  payouts: Payout[];
  availableBalanceCents: number;
}) {
  const [connected, setConnected] = useState(stripeOnboarded);
  const [connecting, setConnecting] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');

  const handleConnect = async () => {
    setConnecting(true);
    const appUrl = window.location.origin;
    const profileId = ''; // We'd need to pass this from server - using redirect for now
    window.location.href = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID ?? 'ca_test_placeholder'}&scope=read_write&redirect_uri=${encodeURIComponent(appUrl + '/auth/stripe-callback')}&state=${profileId}`;
  };

  const handleRequestPayout = async () => {
    setRequesting(true);
    setRequestMsg('');
    try {
      const res = await fetch('/api/payouts/request', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRequestMsg('Payout requested successfully!');
        window.location.reload();
      } else {
        setRequestMsg(data.error || 'Failed to request payout');
      }
    } catch {
      setRequestMsg('An error occurred');
    }
    setRequesting(false);
  };

  const canRequestPayout = connected && availableBalanceCents >= 2500;

  return (
    <div>
      {/* Stripe connection status */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E7E5E4',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: connected ? '#F0FDF4' : '#F5F5F4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CreditCard size={22} color={connected ? '#16A34A' : '#A8A29E'} />
            </div>
            <div>
              <div style={{
                fontSize: '16px', fontWeight: 700, color: '#1C1917', marginBottom: '4px',
                display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
              }}>
                Stripe Connect
                {connected && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '2px 8px', background: '#F0FDF4', color: '#16A34A',
                    borderRadius: '9999px', fontSize: '12px', fontWeight: 700,
                  }}>
                    <Check size={11} />
                    Connected
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: '#57534E' }}>
                {connected
                  ? `Account: ${stripeAccountId ?? 'acct_••••••••'}`
                  : 'Connect Stripe to receive payouts directly to your bank account.'}
              </p>
            </div>
          </div>

          {!connected ? (
            <button
              onClick={handleConnect}
              disabled={connecting}
              style={{
                padding: '10px 20px',
                background: connecting ? '#A8A29E' : '#635BFF',
                color: '#FFFFFF', border: 'none', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600,
                cursor: connecting ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-family-ui)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {connecting ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ExternalLink size={14} />}
              {connecting ? 'Connecting...' : 'Connect Stripe'}
            </button>
          ) : (
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '10px 16px',
                background: 'transparent',
                color: '#4F46E5',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-family-ui)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ExternalLink size={13} />
              Manage in Stripe
            </a>
          )}
        </div>
      </div>

      {/* Available balance + request payout */}
      <div style={{
        background: 'linear-gradient(135deg, #0C0A09, #1C1917)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '20px',
        color: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
              Available Balance
            </p>
            <p style={{ fontSize: '44px', fontWeight: 800, fontFamily: 'var(--font-family-display)', lineHeight: 1 }}>
              {formatMoney(availableBalanceCents)}
            </p>
            {availableBalanceCents < 2500 && availableBalanceCents > 0 && (
              <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '8px' }}>
                ${((2500 - availableBalanceCents) / 100).toFixed(2)} more until minimum payout threshold
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Wallet size={24} color="rgba(255,255,255,0.4)" style={{ marginTop: '4px' }} />
          </div>
        </div>

        {canRequestPayout && (
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleRequestPayout}
              disabled={requesting}
              style={{
                padding: '10px 20px',
                background: '#FFFFFF',
                color: '#1C1917',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: requesting ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-family-ui)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: requesting ? 0.7 : 1,
              }}
            >
              {requesting ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {requesting ? 'Requesting...' : 'Request Payout'}
            </button>
            {requestMsg && (
              <p style={{ fontSize: '13px', color: requestMsg.includes('success') ? '#86EFAC' : '#FCA5A5', marginTop: '10px' }}>
                {requestMsg}
              </p>
            )}
          </div>
        )}

        {!connected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <AlertCircle size={16} color="#F59E0B" />
            <p style={{ fontSize: '13px', color: '#A8A29E' }}>
              Connect Stripe above to request payouts
            </p>
          </div>
        )}
      </div>

      {/* Payout history */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Payout History</h3>
        </div>

        {payouts.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <Wallet size={40} color="#E7E5E4" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#57534E', marginBottom: '8px' }}>No payouts yet</p>
            <p style={{ fontSize: '14px', color: '#A8A29E' }}>
              {connected
                ? 'Request your first payout once you have earnings'
                : 'Connect Stripe to start receiving payouts'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F5F4' }}>
                  {['Date', 'Amount', 'Method', 'Status', 'ID'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, i) => {
                  const sc = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.requested;
                  const StatusIcon = p.status === 'paid' ? CheckCircle2 : p.status === 'failed' ? XCircle : Clock;
                  return (
                    <tr key={p.id} style={{ borderBottom: i < payouts.length - 1 ? '1px solid #E7E5E4' : 'none' }}>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#57534E' }}>
                        {formatDate(p.created_at)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>
                        {formatMoney(p.amount_cents)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#57534E' }}>
                          <CreditCard size={14} color="#635BFF" />
                          Stripe
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          background: sc.bg,
                          color: sc.text,
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}>
                          <StatusIcon size={11} />
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#A8A29E' }}>
                        {p.stripe_payout_id ? p.stripe_payout_id.slice(0, 16) + '...' : p.id.slice(0, 8) + '...'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

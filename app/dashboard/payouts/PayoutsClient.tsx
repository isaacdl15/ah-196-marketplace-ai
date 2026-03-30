'use client';

import { useState } from 'react';
import { CreditCard, Check, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

export default function PayoutsClient({
  stripeOnboarded,
  stripeAccountId,
}: {
  stripeOnboarded: boolean;
  stripeAccountId: string | null;
}) {
  const [connected, setConnected] = useState(stripeOnboarded);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    // Simulate Stripe Connect onboarding
    await new Promise(r => setTimeout(r, 1500));
    setConnected(true);
    setConnecting(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
          Payouts
        </h2>
        <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>
          Manage your Stripe connection and payout settings.
        </p>
      </div>

      {/* Stripe connection status */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: connected ? '#F0FDF4' : '#F5F5F4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CreditCard size={22} color={connected ? '#16A34A' : '#A8A29E'} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Stripe Connect
                {connected && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#F0FDF4', color: '#16A34A', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
                    <Check size={11} />
                    Connected
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: '#57534E' }}>
                {connected
                  ? `Account ID: ${stripeAccountId ?? 'acct_••••••••'}`
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
                fontSize: '13px', fontWeight: 600, cursor: connecting ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-family-ui)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {connecting ? <RefreshCw size={14} className="spin" /> : <ExternalLink size={14} />}
              {connecting ? 'Connecting...' : 'Connect Stripe'}
            </button>
          ) : (
            <button style={{
              padding: '10px 20px',
              background: '#FFFFFF', color: '#57534E',
              border: '1px solid #E7E5E4', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-family-ui)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <ExternalLink size={14} />
              Manage in Stripe
            </button>
          )}
        </div>

        {!connected && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.5 }}>
              You need to connect Stripe before you can receive payouts. Templates can still be sold, but earnings will be held until you connect.
            </p>
          </div>
        )}
      </div>

      {/* Payout info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Payout Schedule', value: 'Weekly', desc: 'Every Monday' },
          { label: 'Minimum Payout', value: '$10', desc: 'After fees' },
          { label: 'Your Rate', value: '70%', desc: 'Of each sale' },
        ].map(({ label, value, desc }) => (
          <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '12px', padding: '18px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E', marginBottom: '6px' }}>{label}</p>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#1C1917', fontFamily: 'var(--font-family-display)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '12px', color: '#A8A29E', marginTop: '4px' }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Payout history */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Payout History</h3>
        </div>
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <CreditCard size={32} color="#E7E5E4" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: '#A8A29E' }}>No payouts yet.</p>
          <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '4px' }}>
            Payouts will appear here once you start making sales.
          </p>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function EarningsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('mp_profiles')
    .select('id, stripe_onboarded')
    .eq('user_id', user.id)
    .single();

  // Get all purchases for seller's templates
  const { data: sellerTemplates } = profile
    ? await supabase.from('mp_templates').select('id').eq('seller_id', profile.id)
    : { data: [] };

  const templateIds = (sellerTemplates ?? []).map(t => t.id);

  const { data: purchases } = templateIds.length
    ? await supabase
        .from('mp_purchases')
        .select('id, amount_cents, status, created_at, template_id')
        .in('template_id', templateIds)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
    : { data: [] };

  const list = purchases ?? [];
  const totalRevenue = list.reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const platformFee = Math.round(totalRevenue * 0.3);
  const netEarnings = totalRevenue - platformFee;

  // Monthly grouping
  const monthly: Record<string, number> = {};
  list.forEach(p => {
    const month = p.created_at.slice(0, 7);
    monthly[month] = (monthly[month] ?? 0) + (p.amount_cents ?? 0);
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
          Earnings
        </h2>
        <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>
          Your revenue breakdown and transaction history.
        </p>
      </div>

      {/* Balance card */}
      <div style={{
        background: 'linear-gradient(135deg, #0C0A09, #1C1917)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '20px',
        color: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
              Total Net Earnings
            </p>
            <p style={{ fontSize: '44px', fontWeight: 800, fontFamily: 'var(--font-family-display)', lineHeight: 1 }}>
              ${(netEarnings / 100).toFixed(2)}
            </p>
            <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '8px' }}>
              ${(totalRevenue / 100).toFixed(2)} gross · ${(platformFee / 100).toFixed(2)} platform fee (30%)
            </p>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} color="#FFFFFF" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
          {[
            { label: 'This Month', value: `$${((monthly[new Date().toISOString().slice(0, 7)] ?? 0) / 100).toFixed(2)}` },
            { label: 'Transactions', value: list.length.toString() },
            { label: 'Your Rate', value: '70%' },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '14px', background: 'rgba(255,255,255,0.07)', borderRadius: '10px' }}>
              <p style={{ fontSize: '11px', color: '#A8A29E', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-family-display)' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly breakdown */}
      {Object.keys(monthly).length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '16px' }}>Monthly Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(monthly).sort(([a], [b]) => b.localeCompare(a)).slice(0, 6).map(([month, amount]) => {
              const maxAmount = Math.max(...Object.values(monthly));
              const pct = (amount / maxAmount) * 100;
              return (
                <div key={month} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '70px', fontSize: '12px', color: '#57534E', flexShrink: 0 }}>
                    {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <div style={{ flex: 1, height: '6px', background: '#F5F5F4', borderRadius: '3px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#4F46E5', borderRadius: '3px', transition: '400ms ease' }} />
                  </div>
                  <span style={{ width: '64px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                    ${(amount / 100).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Transaction History</h3>
        </div>

        {list.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <TrendingUp size={32} color="#E7E5E4" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#A8A29E' }}>No transactions yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F5F4' }}>
                  {['Date', 'Template', 'Gross', 'Your Earnings', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((p, i) => {
                  const gross = p.amount_cents ?? 0;
                  const net = Math.round(gross * 0.7);
                  return (
                    <tr key={p.id} style={{ borderBottom: i < list.length - 1 ? '1px solid #E7E5E4' : 'none' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#57534E' }}>{formatDate(p.created_at)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1C1917', fontWeight: 500 }}>Template sale</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1C1917' }}>${(gross / 100).toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowUpRight size={13} />
                        ${(net / 100).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', background: '#F0FDF4', color: '#16A34A', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                          Completed
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
    </div>
  );
}

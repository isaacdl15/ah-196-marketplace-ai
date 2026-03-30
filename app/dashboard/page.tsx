export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { DollarSign, Package, ShoppingBag, Star, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('mp_profiles')
    .select('id, kyc_status, stripe_onboarded, stripe_account_id')
    .eq('user_id', user.id)
    .single();

  const profileId = profile?.id;
  const kycStatus = profile?.kyc_status ?? 'pending';
  const stripeOnboarded = profile?.stripe_onboarded ?? false;
  const stripeAccountId = profile?.stripe_account_id;

  const [{ data: templates }, { data: purchases }] = await Promise.all([
    profileId
      ? supabase.from('mp_templates').select('id, title, slug, price_cents, downloads, rating_avg, status').eq('seller_id', profileId)
      : { data: [] },
    profileId
      ? supabase.from('mp_purchases').select('id, amount_cents, created_at, template_id').eq('status', 'completed').order('created_at', { ascending: false }).limit(10)
      : { data: [] },
  ]);

  const templateList = templates ?? [];
  const purchaseList = purchases ?? [];

  const totalRevenue = purchaseList.reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const totalTemplates = templateList.length;
  const totalSales = purchaseList.length;
  const avgRating = templateList.length
    ? templateList.reduce((s, t) => s + Number(t.rating_avg ?? 0), 0) / templateList.length
    : 0;

  const stats = [
    { label: 'Total Revenue', value: `$${(totalRevenue / 100).toFixed(2)}`, icon: DollarSign, color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Templates', value: totalTemplates.toString(), icon: Package, color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Total Sales', value: totalSales.toString(), icon: ShoppingBag, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Avg Rating', value: avgRating > 0 ? avgRating.toFixed(1) : '—', icon: Star, color: '#9333EA', bg: '#FAF5FF' },
  ];

  return (
    <div>
      {/* KYC Status Banner */}
      {kycStatus === 'pending' && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>Account under review</div>
            <div style={{ fontSize: '13px', color: '#B45309', marginTop: '2px' }}>
              Your seller account is being reviewed. You&apos;ll be notified once approved. Publishing is disabled until review is complete.
            </div>
          </div>
        </div>
      )}
      {kycStatus === 'rejected' && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#B91C1C' }}>Account verification failed</div>
            <div style={{ fontSize: '13px', color: '#DC2626', marginTop: '2px' }}>Your seller application was not approved. Contact support for more information.</div>
          </div>
        </div>
      )}
      {kycStatus === 'approved' && !stripeOnboarded && (
        <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#3730A3' }}>Complete your Stripe setup to receive payouts</div>
            <div style={{ fontSize: '13px', color: '#4F46E5', marginTop: '2px' }}>Connect your bank account to start earning from template sales.</div>
          </div>
          <a
            href={`https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID ?? 'ca_demo'}&scope=read_write&redirect_uri=${encodeURIComponent((process.env.NEXT_PUBLIC_APP_URL ?? 'https://marketplace.ai') + '/auth/stripe-callback')}&state=${profileId}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#4F46E5', color: '#FFFFFF', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const, flexShrink: 0 }}
          >
            <ExternalLink size={14} />
            Complete Stripe Setup
          </a>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{
            background: '#FFFFFF',
            border: '1px solid #E7E5E4',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(28,25,23,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E', marginBottom: '8px' }}>
                  {label}
                </p>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#1C1917', fontFamily: 'var(--font-family-display)', lineHeight: 1 }}>
                  {value}
                </p>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Sales */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Recent Sales</h3>
          </div>
          {purchaseList.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <ShoppingBag size={32} color="#E7E5E4" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', color: '#A8A29E' }}>No sales yet.</p>
              <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '4px' }}>
                <Link href="/dashboard/templates/new" style={{ color: '#4F46E5' }}>Upload a template</Link> to start selling.
              </p>
            </div>
          ) : (
            <div>
              {purchaseList.map((p, i) => (
                <div key={p.id} style={{
                  padding: '14px 20px',
                  borderBottom: i < purchaseList.length - 1 ? '1px solid #E7E5E4' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                      Template sale
                    </p>
                    <p style={{ fontSize: '12px', color: '#A8A29E', marginTop: '2px' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#16A34A' }}>
                    +${((p.amount_cents ?? 0) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Templates overview */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Your Templates</h3>
            <Link href="/dashboard/templates" style={{ fontSize: '13px', color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
          </div>
          {templateList.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <Package size={32} color="#E7E5E4" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', color: '#A8A29E' }}>No templates yet.</p>
              <button
                disabled={kycStatus !== 'approved'}
                onClick={() => { if (kycStatus === 'approved') window.location.href = '/dashboard/templates/new'; }}
                style={{
                  display: 'inline-block', marginTop: '12px',
                  padding: '8px 16px',
                  background: kycStatus !== 'approved' ? '#E7E5E4' : '#4F46E5',
                  color: kycStatus !== 'approved' ? '#A8A29E' : '#FFFFFF',
                  borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  border: 'none', cursor: kycStatus !== 'approved' ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-family-ui)',
                }}
                title={kycStatus !== 'approved' ? 'Account must be approved before publishing' : undefined}
              >
                Publish
              </button>
            </div>
          ) : (
            <div>
              {templateList.slice(0, 5).map((t, i) => {
                const statusColors: Record<string, { bg: string; text: string }> = {
                  published: { bg: '#F0FDF4', text: '#16A34A' },
                  draft: { bg: '#F5F5F4', text: '#57534E' },
                  under_review: { bg: '#FEF3C7', text: '#D97706' },
                  rejected: { bg: '#FEF2F2', text: '#DC2626' },
                };
                const sc = statusColors[t.status] ?? statusColors.draft;
                return (
                  <div key={t.id} style={{
                    padding: '12px 20px',
                    borderBottom: i < Math.min(templateList.length, 5) - 1 ? '1px solid #E7E5E4' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </p>
                      <p style={{ fontSize: '12px', color: '#A8A29E', marginTop: '2px' }}>
                        {t.downloads} downloads · ${((t.price_cents ?? 0) / 100).toFixed(0)}
                      </p>
                    </div>
                    <span style={{
                      padding: '3px 8px',
                      background: sc.bg,
                      color: sc.text,
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'capitalize' as const,
                      flexShrink: 0,
                    }}>
                      {t.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

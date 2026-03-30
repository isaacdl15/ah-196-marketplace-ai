export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { Users, Package, DollarSign, Clock, ShoppingBag, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard — marketplace.ai',
};

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [
    { data: profiles },
    { data: templates },
    { data: purchases },
    { data: pendingTemplates },
  ] = await Promise.all([
    supabase.from('mp_profiles').select('id, display_name, is_seller, kyc_status, created_at').order('created_at', { ascending: false }),
    supabase.from('mp_templates').select('id, status'),
    supabase.from('mp_purchases').select('amount_cents, status'),
    supabase.from('mp_templates').select('id').eq('status', 'under_review'),
  ]);

  const allProfiles = profiles ?? [];
  const allTemplates = templates ?? [];
  const allPurchases = purchases ?? [];

  const sellerCount = allProfiles.filter(p => p.is_seller).length;
  const buyerCount = allProfiles.filter(p => !p.is_seller).length;
  const pendingSellers = allProfiles.filter(p => p.kyc_status === 'pending').length;
  const activeListings = allTemplates.filter(t => t.status === 'published').length;
  const completedPurchases = allPurchases.filter(p => p.status === 'completed');
  const totalGMV = completedPurchases.reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const platformRevenue = Math.round(totalGMV * 0.15);

  const recentSellers = allProfiles
    .filter(p => p.is_seller || p.kyc_status === 'pending')
    .slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>Platform Overview</h2>
        <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>Marketplace health & KPIs</p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total GMV', value: `$${(totalGMV / 100).toFixed(0)}`, icon: DollarSign, color: '#16A34A', bg: '#F0FDF4', testId: 'total-gmv' },
          { label: 'Pending Sellers', value: pendingSellers.toString(), icon: Clock, color: '#D97706', bg: '#FEF3C7', testId: 'pending-sellers' },
          { label: 'Seller Count', value: sellerCount.toString(), icon: Users, color: '#4F46E5', bg: '#EEF2FF', testId: 'seller-count' },
          { label: 'Active Listings', value: activeListings.toString(), icon: Package, color: '#0EA5E9', bg: '#F0F9FF', testId: 'active-listings' },
        ].map(({ label, value, icon: Icon, color, bg, testId }) => (
          <div key={label} data-testid={testId} style={{
            background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#A8A29E', marginBottom: '8px' }}>{label}</p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#1C1917', fontFamily: 'var(--font-family-display)', lineHeight: 1 }}>{value}</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={color} />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Platform Revenue (15%)', value: `$${(platformRevenue / 100).toFixed(0)}`, icon: DollarSign, color: '#9333EA', bg: '#FAF5FF', testId: 'platform-revenue' },
          { label: 'Total Buyers', value: buyerCount.toString(), icon: ShoppingBag, color: '#16A34A', bg: '#F0FDF4', testId: 'buyer-count' },
          { label: 'Pending Template Review', value: (pendingTemplates?.length ?? 0).toString(), icon: AlertTriangle, color: '#D97706', bg: '#FEF3C7', testId: 'pending-templates' },
        ].map(({ label, value, icon: Icon, color, bg, testId }) => (
          <div key={label} data-testid={testId} style={{
            background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#A8A29E', marginBottom: '8px' }}>{label}</p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#1C1917', fontFamily: 'var(--font-family-display)', lineHeight: 1 }}>{value}</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={color} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Seller Queue', desc: `${pendingSellers} pending`, href: '/admin/sellers', color: '#D97706', bg: '#FEF3C7' },
          { label: 'Template Review', desc: `${pendingTemplates?.length ?? 0} pending`, href: '/admin/templates', color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'User Management', desc: `${allProfiles.length} total`, href: '/admin/users', color: '#16A34A', bg: '#F0FDF4' },
        ].map(({ label, desc, href, color, bg }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '12px', padding: '16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: '150ms ease',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E7E5E4'; }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#A8A29E', marginTop: '2px' }}>{desc}</div>
              </div>
              <span style={{ padding: '4px 10px', background: bg, color, borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                View →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent sellers */}
      {recentSellers.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E7E5E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>Recent Seller Applications</span>
            <Link href="/admin/sellers" style={{ fontSize: '13px', color: '#4F46E5', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
          </div>
          <div>
            {recentSellers.map((s, i) => (
              <div key={s.id} style={{ padding: '12px 20px', borderBottom: i < recentSellers.length - 1 ? '1px solid #F5F5F4' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '9999px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#4F46E5' }}>
                    {(s.display_name ?? 'U').slice(0, 1).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#1C1917' }}>{s.display_name}</span>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                  background: s.kyc_status === 'approved' ? '#F0FDF4' : s.kyc_status === 'rejected' ? '#FEF2F2' : '#FEF3C7',
                  color: s.kyc_status === 'approved' ? '#16A34A' : s.kyc_status === 'rejected' ? '#DC2626' : '#D97706',
                  textTransform: 'capitalize' as const,
                }}>
                  {s.kyc_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

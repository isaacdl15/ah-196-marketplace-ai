export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { BarChart3, DollarSign, Download, Users, TrendingUp, Package } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const supabase = createAdminClient();

  const [
    { data: templates },
    { data: purchases },
    { data: profiles },
    { data: waitlist },
  ] = await Promise.all([
    supabase.from('mp_templates').select('id, title, downloads, price_cents, category, status, rating_avg, rating_count'),
    supabase.from('mp_purchases').select('amount_cents, status, created_at').eq('status', 'completed'),
    supabase.from('mp_profiles').select('id, created_at'),
    supabase.from('mp_waitlist_entries').select('id, created_at'),
  ]);

  const allTemplates = templates ?? [];
  const allPurchases = purchases ?? [];

  const totalRevenue = allPurchases.reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const totalDownloads = allTemplates.reduce((s, t) => s + (t.downloads ?? 0), 0);
  const publishedTemplates = allTemplates.filter(t => t.status === 'published');
  const totalUsers = (profiles ?? []).length;
  const totalWaitlist = (waitlist ?? []).length;

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  allTemplates.forEach(t => {
    if (t.category) categoryCounts[t.category] = (categoryCounts[t.category] ?? 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...categoryData.map(([, c]) => c), 1);

  // Top templates by downloads
  const topByDownloads = [...allTemplates]
    .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
    .slice(0, 10);

  const statsRow = [
    { label: 'Total Revenue', value: `$${(totalRevenue / 100).toFixed(0)}`, icon: DollarSign, color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Total Downloads', value: totalDownloads.toLocaleString(), icon: Download, color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Users', value: totalUsers.toString(), icon: Users, color: '#0EA5E9', bg: '#E0F2FE' },
    { label: 'Waitlist', value: totalWaitlist.toString(), icon: TrendingUp, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Templates', value: allTemplates.length.toString(), icon: Package, color: '#9333EA', bg: '#FAF5FF' },
    { label: 'Purchases', value: allPurchases.length.toString(), icon: BarChart3, color: '#DC2626', bg: '#FEF2F2' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
          Platform Analytics
        </h2>
        <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>
          Overview of marketplace activity and performance.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {statsRow.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{
            background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E', marginBottom: '8px' }}>{label}</p>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#1C1917', fontFamily: 'var(--font-family-display)', lineHeight: 1 }}>{value}</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={color} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Top templates by downloads */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '16px' }}>Top Templates by Downloads</h3>
          {topByDownloads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <BarChart3 size={32} color="#E7E5E4" />
              <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '8px' }}>No template data yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topByDownloads.map((t, i) => {
                const maxDl = Math.max(...topByDownloads.map(x => x.downloads ?? 0), 1);
                const pct = ((t.downloads ?? 0) / maxDl) * 100;
                return (
                  <div key={t.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#1C1917', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '12px' }}>
                        <span style={{ color: '#A8A29E', marginRight: '6px' }}>{i + 1}.</span>{t.title}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#4F46E5', flexShrink: 0 }}>{(t.downloads ?? 0).toLocaleString()}</span>
                    </div>
                    <div style={{ height: '6px', background: '#F5F5F4', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#4F46E5', borderRadius: '9999px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Templates by category */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '16px' }}>Templates by Category</h3>
          {categoryData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Package size={32} color="#E7E5E4" />
              <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '8px' }}>No categories yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categoryData.map(([category, count]) => {
                const pct = (count / maxCategoryCount) * 100;
                return (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#1C1917' }}>{category}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0EA5E9' }}>{count}</span>
                    </div>
                    <div style={{ height: '6px', background: '#F5F5F4', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#0EA5E9', borderRadius: '9999px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full template table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>All Templates — Performance</h3>
        </div>
        {publishedTemplates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Package size={40} color="#E7E5E4" />
            <p style={{ fontSize: '14px', color: '#A8A29E', marginTop: '8px' }}>No published templates yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F5F4' }}>
                  {['Template', 'Category', 'Downloads', 'Rating', 'Revenue'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {publishedTemplates.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0)).map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i < publishedTemplates.length - 1 ? '1px solid #F5F5F4' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>{t.title}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: '#EEF2FF', color: '#4F46E5' }}>
                        {t.category ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#57534E' }}>{(t.downloads ?? 0).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#57534E' }}>
                      {Number(t.rating_avg ?? 0) > 0 ? `${Number(t.rating_avg).toFixed(1)} (${t.rating_count ?? 0})` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#16A34A' }}>
                      ${(((t.price_cents ?? 0) * (t.downloads ?? 0)) / 100).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

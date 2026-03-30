export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { BarChart3, TrendingUp, Eye, Download } from 'lucide-react';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('mp_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const { data: templates } = profile
    ? await supabase
        .from('mp_templates')
        .select('id, title, downloads, rating_avg, rating_count, price_cents')
        .eq('seller_id', profile.id)
        .eq('status', 'published')
    : { data: [] };

  const list = templates ?? [];
  const totalDownloads = list.reduce((s, t) => s + (t.downloads ?? 0), 0);
  const totalViews = totalDownloads * 4; // estimate

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
          Analytics
        </h2>
        <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>
          Insights into your template performance.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Downloads', value: totalDownloads.toLocaleString(), icon: Download, color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Est. Views', value: totalViews.toLocaleString(), icon: Eye, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Conversion', value: totalViews > 0 ? `${((totalDownloads / totalViews) * 100).toFixed(1)}%` : '0%', icon: TrendingUp, color: '#16A34A', bg: '#F0FDF4' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
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

      {/* Chart placeholder */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Downloads Over Time</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['7d', '30d', '90d'].map(p => (
              <button key={p} style={{
                padding: '4px 10px', background: p === '30d' ? '#EEF2FF' : 'transparent',
                border: '1px solid #E7E5E4', borderRadius: '6px',
                fontSize: '12px', color: p === '30d' ? '#4F46E5' : '#57534E', fontWeight: p === '30d' ? 600 : 500,
                cursor: 'pointer', fontFamily: 'var(--font-family-ui)',
              }}>{p}</button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <BarChart3 size={40} color="#E7E5E4" />
            <p style={{ fontSize: '14px', color: '#A8A29E' }}>No data yet. Publish templates to see analytics.</p>
          </div>
        ) : (
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 8px' }}>
            {list.slice(0, 8).map((t, i) => {
              const maxDownloads = Math.max(...list.map(x => x.downloads ?? 0), 1);
              const height = Math.max(((t.downloads ?? 0) / maxDownloads) * 100, 4);
              return (
                <div key={t.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '100%', height: `${height * 1.6}px`, background: '#4F46E5', borderRadius: '4px 4px 0 0', opacity: 0.7 + (i / list.length) * 0.3 }} />
                  <div style={{ fontSize: '10px', color: '#A8A29E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', textAlign: 'center' }}>
                    {t.title.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Template breakdown */}
      {list.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Template Performance</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F5F4' }}>
                  {['Template', 'Downloads', 'Rating', 'Revenue'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0)).map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i < list.length - 1 ? '1px solid #E7E5E4' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>{t.title}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#57534E' }}>{(t.downloads ?? 0).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#57534E' }}>
                      {Number(t.rating_avg ?? 0) > 0 ? `${Number(t.rating_avg).toFixed(1)} (${t.rating_count})` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#16A34A' }}>
                      ${(((t.price_cents ?? 0) * (t.downloads ?? 0)) / 100).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

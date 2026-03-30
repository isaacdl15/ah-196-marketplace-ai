'use client';

import { BarChart3, Eye, MousePointerClick, Users, TrendingUp, Globe } from 'lucide-react';

interface Props {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  topLinks: { id: string; title: string; clicks: number; ctr: number }[];
  countries: { country: string; count: number }[];
  sources: { source: string; count: number }[];
}

const CHART_COLORS = ['#C75B40', '#1E6B6B', '#E89820', '#2D9E6B', '#9E8B7A', '#F5D1C5'];

const FLAG_MAP: Record<string, string> = {
  US: '🇺🇸', MX: '🇲🇽', ES: '🇪🇸', CO: '🇨🇴', AR: '🇦🇷', CL: '🇨🇱',
  PE: '🇵🇪', VE: '🇻🇪', EC: '🇪🇨', BO: '🇧🇴', UY: '🇺🇾', PY: '🇵🇾',
  DO: '🇩🇴', GT: '🇬🇹', HN: '🇭🇳', SV: '🇸🇻', NI: '🇳🇮', CR: '🇨🇷',
  PA: '🇵🇦', PR: '🇵🇷', GB: '🇬🇧', CA: '🇨🇦', BR: '🇧🇷', DE: '🇩🇪',
};

export default function AnalyticsView({ totalViews, totalClicks, ctr, topLinks, countries, sources }: Props) {
  const maxSource = Math.max(...sources.map(s => s.count), 1);

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Page Views', value: totalViews.toLocaleString(), icon: Eye },
          { label: 'Unique Visitors', value: '—', icon: Users },
          { label: 'Link Clicks', value: totalClicks.toLocaleString(), icon: MousePointerClick },
          { label: 'Click-Through Rate', value: ctr + '%', icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-elev-1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A' }}>{label}</span>
              <Icon size={16} strokeWidth={1.5} color="#9E8B7A" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: '#1A1208', lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* No data state */}
      {totalViews === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <BarChart3 size={48} strokeWidth={1} color="#9E8B7A" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>No data yet</h3>
          <p style={{ fontSize: '15px', color: '#9E8B7A' }}>Analytics will populate after your first page visit.</p>
        </div>
      )}

      {totalViews > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Top links */}
          <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-elev-1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208', marginBottom: '20px' }}>Top links</h3>
            {topLinks.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#9E8B7A' }}>No link data yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Link', 'Clicks', 'CTR'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0 0 10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topLinks.map((l, i) => (
                    <tr key={l.id} style={{ borderTop: i > 0 ? '1px solid #F5EEE6' : 'none' }}>
                      <td style={{ padding: '10px 0', fontSize: '14px', color: '#1A1208' }}>{l.title}</td>
                      <td style={{ padding: '10px 0', fontSize: '14px', color: '#1A1208', fontWeight: 600 }}>{l.clicks}</td>
                      <td style={{ padding: '10px 0', fontSize: '14px', color: '#9E8B7A' }}>{l.ctr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Traffic sources */}
          <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-elev-1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208', marginBottom: '20px' }}>Traffic sources</h3>
            {sources.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#9E8B7A' }}>No source data yet.</p>
            ) : (
              <div>
                {sources.map(({ source, count }, i) => (
                  <div key={source} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A1208' }}>{source}</span>
                      </div>
                      <span style={{ fontSize: '13px', color: '#9E8B7A' }}>{Math.round(count / Math.max(sources.reduce((s, x) => s + x.count, 0), 1) * 100)}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#F5EEE6', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: CHART_COLORS[i % CHART_COLORS.length], width: `${Math.round(count / maxSource * 100)}%`, borderRadius: '9999px', transition: '600ms ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visitor geography */}
      {countries.length > 0 && (
        <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-elev-1)' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E8DDD2' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208' }}>Visitor geography</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5EEE6' }}>
                  {['Country', 'Visitors', '% of total'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countries.map(({ country, count }, i) => (
                  <tr key={country} style={{ borderBottom: i < countries.length - 1 ? '1px solid #E8DDD2' : 'none', background: i % 2 === 0 ? 'white' : '#FDFAF6' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#1A1208' }}>
                      {FLAG_MAP[country] ?? <Globe size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />} {country}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1A1208' }}>{count.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9E8B7A' }}>
                      {Math.round(count / Math.max(countries.reduce((s, x) => s + x.count, 0), 1) * 100)}%
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

'use client';

import { TrendingUp } from 'lucide-react';

interface UTMRow { source: string; medium: string; campaign: string; count: number; lastSeen: string; }
interface Source { source: string; count: number; }

const CHART_COLORS = ['#C75B40', '#1E6B6B', '#E89820', '#2D9E6B', '#9E8B7A', '#F5D1C5'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function UTMView({ total, tracked, organic, topSource, topCampaign, utmRows, sources }: {
  total: number; tracked: number; organic: number; topSource: string; topCampaign: string;
  utmRows: UTMRow[]; sources: Source[];
}) {
  const maxSource = Math.max(...sources.map(s => s.count), 1);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Tracked Signups', value: tracked.toLocaleString() },
          { label: 'Organic (no UTM)', value: organic.toLocaleString() },
          { label: 'Top Source', value: topSource },
          { label: 'Top Campaign', value: topCampaign || '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-elev-1)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: '#1A1208', lineHeight: 1, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* UTM table */}
        <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-elev-1)' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E8DDD2' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208' }}>UTM breakdown</h3>
          </div>
          {utmRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <TrendingUp size={48} strokeWidth={1} color="#9E8B7A" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>No UTM data yet</h3>
              <p style={{ fontSize: '14px', color: '#9E8B7A', marginBottom: '16px' }}>Add UTM parameters to your shared links to track sources.</p>
              <div style={{ background: '#F5EEE6', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#5A4839', maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
                ?utm_source=instagram&utm_medium=bio&utm_campaign=launch
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F5EEE6' }}>
                    {['Source', 'Medium', 'Campaign', 'Signups', '% of total', 'Last seen'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {utmRows.map((row, i) => (
                    <tr key={`${row.source}-${row.campaign}-${i}`} style={{ borderBottom: i < utmRows.length - 1 ? '1px solid #E8DDD2' : 'none', background: i % 2 === 0 ? 'white' : '#FDFAF6' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#FDF0EC', color: '#C75B40', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '9999px' }}>{row.source}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', color: row.medium ? '#1A1208' : '#9E8B7A' }}>{row.medium || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', color: row.campaign ? '#1A1208' : '#9E8B7A' }}>{row.campaign || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#1A1208' }}>{row.count}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9E8B7A' }}>{Math.round(row.count / Math.max(total, 1) * 100)}%</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9E8B7A' }}>{formatDate(row.lastSeen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sources chart */}
        <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-elev-1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208', marginBottom: '20px' }}>Traffic sources</h3>
          {sources.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#9E8B7A' }}>No data yet.</p>
          ) : (
            sources.map(({ source, count }, i) => (
              <div key={source} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A1208', textTransform: 'capitalize' }}>{source}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#9E8B7A' }}>{count}</span>
                </div>
                <div style={{ height: '6px', background: '#F5EEE6', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: CHART_COLORS[i % CHART_COLORS.length], width: `${Math.round(count / maxSource * 100)}%`, borderRadius: '9999px' }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

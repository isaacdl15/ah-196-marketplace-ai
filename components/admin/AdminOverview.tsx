'use client';

import { Users, Calendar, Globe, TrendingUp } from 'lucide-react';

interface Signup { waitlist_id: string; email: string; niche: string; locale: string; ip_country: string; created_at: string; }

const NICHE_BADGES: Record<string, string> = {
  fitness: '#FFE4E4', lifestyle: '#FDF0EC', content_creation: '#D1EAE8',
  beauty: '#F5D1C5', food: '#D1F2E4', travel: '#FEF3C7',
  fashion: '#E8D8FF', business: '#E8DDD2', wellness: '#D1F2E4',
  education: '#D1EAE8', other: '#F5EEE6',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdminOverview({ total, last7d, topNiche, countries, recentSignups }: {
  total: number; last7d: number; topNiche: string; countries: number; recentSignups: Signup[];
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Signups', value: total.toLocaleString(), icon: Users },
          { label: 'Last 7 Days', value: last7d.toLocaleString(), icon: Calendar },
          { label: 'Top Niche', value: topNiche.replace('_', ' '), icon: TrendingUp },
          { label: 'Countries', value: countries.toLocaleString(), icon: Globe },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-elev-1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A' }}>{label}</span>
              <Icon size={16} strokeWidth={1.5} color="#9E8B7A" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: '#1A1208', lineHeight: 1, textTransform: 'capitalize' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-elev-1)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E8DDD2' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208' }}>Recent signups</h3>
        </div>
        {recentSignups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9E8B7A', fontSize: '14px' }}>No signups yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5EEE6' }}>
                  {['#', 'Email', 'Niche', 'Locale', 'Country', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSignups.map((s, i) => (
                  <tr key={s.waitlist_id} style={{ borderBottom: i < recentSignups.length - 1 ? '1px solid #E8DDD2' : 'none', background: i % 2 === 0 ? 'white' : '#FDFAF6' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9E8B7A' }}>{i + 1}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1A1208' }}>{s.email.length > 30 ? s.email.slice(0, 30) + '…' : s.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: NICHE_BADGES[s.niche] ?? '#F5EEE6', color: '#C75B40', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '9999px' }}>
                        {s.niche.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#E8DDD2', color: '#5A4839', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '9999px' }}>
                        {s.locale?.toUpperCase() ?? 'EN'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9E8B7A' }}>{s.ip_country ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9E8B7A' }}>{formatDate(s.created_at)}</td>
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

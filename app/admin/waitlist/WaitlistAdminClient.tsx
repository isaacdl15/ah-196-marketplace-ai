'use client';

import { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  email: string;
  status: string;
  is_creator: boolean;
  utm_source: string | null;
  utm_campaign: string | null;
  referral_code: string | null;
  created_at: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function WaitlistAdminClient({ entries }: { entries: WaitlistEntry[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'creator' | 'pending' | 'confirmed'>('all');

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (search && !e.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === 'creator' && !e.is_creator) return false;
      if (filter === 'pending' && e.status !== 'pending') return false;
      if (filter === 'confirmed' && e.status !== 'confirmed') return false;
      return true;
    });
  }, [entries, search, filter]);

  const exportCSV = () => {
    const header = ['Email', 'Status', 'Creator', 'UTM Source', 'Campaign', 'Joined'].join(',');
    const rows = filtered.map(e => [e.email, e.status, e.is_creator, e.utm_source ?? '', e.utm_campaign ?? '', e.created_at].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'waitlist.csv';
    a.click();
  };

  const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#FEF3C7', text: '#D97706' },
    confirmed: { bg: '#F0FDF4', text: '#16A34A' },
    unsubscribed: { bg: '#F5F5F4', text: '#A8A29E' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
            Waitlist
          </h2>
          <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>{entries.length} total entries</p>
        </div>
        <button
          onClick={exportCSV}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', border: '1px solid #E7E5E4', borderRadius: '10px',
            background: '#FFFFFF', color: '#57534E', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-family-ui)',
          }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="#A8A29E" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email..."
            style={{
              padding: '7px 12px 7px 30px',
              border: '1px solid #E7E5E4',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#1C1917',
              background: '#FFFFFF',
              outline: 'none',
              width: '220px',
              fontFamily: 'var(--font-family-ui)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'creator', 'pending', 'confirmed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px', borderRadius: '8px',
                border: `1px solid ${filter === f ? '#4F46E5' : '#E7E5E4'}`,
                background: filter === f ? '#EEF2FF' : '#FFFFFF',
                color: filter === f ? '#4F46E5' : '#57534E',
                fontSize: '12px', fontWeight: 500,
                cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-family-ui)',
              }}
            >
              {f} {f === 'all' ? `(${entries.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F5F4' }}>
                {['#', 'Email', 'Status', 'Creator', 'UTM Source', 'Campaign', 'Joined'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.07em', color: '#A8A29E',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#A8A29E', fontSize: '14px' }}>
                    No entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((e, i) => {
                  const sc = STATUS_STYLES[e.status] ?? STATUS_STYLES.pending;
                  return (
                    <tr key={e.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E7E5E4' : 'none' }}>
                      <td style={{ padding: '11px 16px', fontSize: '13px', color: '#A8A29E' }}>{i + 1}</td>
                      <td style={{ padding: '11px 16px', fontSize: '13px', color: '#1C1917', fontWeight: 500 }}>{e.email}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ padding: '2px 8px', background: sc.bg, color: sc.text, borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        {e.is_creator && (
                          <span style={{ padding: '2px 8px', background: '#EEF2FF', color: '#4F46E5', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                            Creator
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12px', color: '#57534E' }}>{e.utm_source ?? '—'}</td>
                      <td style={{ padding: '11px 16px', fontSize: '12px', color: '#57534E' }}>{e.utm_campaign ?? '—'}</td>
                      <td style={{ padding: '11px 16px', fontSize: '12px', color: '#A8A29E' }}>{formatDate(e.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

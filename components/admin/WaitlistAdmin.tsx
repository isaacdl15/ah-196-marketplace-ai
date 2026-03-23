'use client';

import { useState, useMemo } from 'react';
import { Download, Users } from 'lucide-react';

interface Item { waitlist_id: string; email: string; niche: string; locale: string; ip_country: string; utm_source: string | null; created_at: string; }

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
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function WaitlistAdmin({ items }: { items: Item[] }) {
  const [nicheFilter, setNicheFilter] = useState('');
  const [localeFilter, setLocaleFilter] = useState('');
  const [page, setPage] = useState(0);
  const PER_PAGE = 25;

  const niches = useMemo(() => [...new Set(items.map(i => i.niche))].sort(), [items]);

  const filtered = useMemo(() => items.filter(i => {
    if (nicheFilter && i.niche !== nicheFilter) return false;
    if (localeFilter && i.locale !== localeFilter) return false;
    return true;
  }), [items, nicheFilter, localeFilter]);

  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const exportCsv = () => {
    const rows = [['Email', 'Niche', 'Locale', 'Country', 'UTM Source', 'Joined']];
    filtered.forEach(i => rows.push([i.email, i.niche, i.locale, i.ip_country ?? '', i.utm_source ?? '', i.created_at]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sirena-waitlist.csv'; a.click();
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select value={nicheFilter} onChange={e => { setNicheFilter(e.target.value); setPage(0); }}
              style={{ height: '36px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 28px 0 10px', fontSize: '13px', outline: 'none', appearance: 'none', fontFamily: 'var(--font-ui)', background: 'white' }}>
              <option value="">All niches</option>
              {niches.map(n => <option key={n} value={n}>{n.replace('_', ' ')}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9E8B7A" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {['', 'en', 'es'].map(l => (
            <button key={l} onClick={() => { setLocaleFilter(l); setPage(0); }}
              style={{ padding: '6px 14px', borderRadius: '9999px', border: localeFilter === l ? '1.5px solid #C75B40' : '1px solid #E8DDD2', background: localeFilter === l ? '#FDF0EC' : 'white', color: localeFilter === l ? '#C75B40' : '#5A4839', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
              {l === '' ? 'All' : l.toUpperCase()}
            </button>
          ))}
        </div>
        <button onClick={exportCsv} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1.5px solid #E8DDD2', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1A1208', fontFamily: 'var(--font-ui)' }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          `Total: ${filtered.length}`,
          `EN: ${filtered.filter(i => i.locale === 'en').length}`,
          `ES: ${filtered.filter(i => i.locale === 'es').length}`,
        ].map(label => (
          <span key={label} style={{ background: '#F5EEE6', color: '#5A4839', fontSize: '13px', fontWeight: 500, padding: '4px 12px', borderRadius: '9999px' }}>{label}</span>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-elev-1)' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Users size={48} strokeWidth={1} color="#9E8B7A" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>No signups yet</h3>
            <p style={{ fontSize: '15px', color: '#9E8B7A' }}>Waitlist signups will appear here.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#F5EEE6' }}>
                    {['#', 'Email', 'Niche', 'Locale', 'Country', 'UTM Source', 'Joined'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((s, i) => (
                    <tr key={s.waitlist_id} style={{ borderBottom: '1px solid #E8DDD2', background: i % 2 === 0 ? 'white' : '#FDFAF6' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5EEE6'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'white' : '#FDFAF6'; }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9E8B7A' }}>{page * PER_PAGE + i + 1}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1A1208' }}>{s.email.length > 30 ? s.email.slice(0, 30) + '…' : s.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: NICHE_BADGES[s.niche] ?? '#F5EEE6', color: '#C75B40', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>
                          {s.niche.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#E8DDD2', color: '#5A4839', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px' }}>{(s.locale ?? 'en').toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9E8B7A' }}>{s.ip_country ?? '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: s.utm_source ? '#1A1208' : '#9E8B7A' }}>{s.utm_source ?? '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#9E8B7A' }}>{formatDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div style={{ height: '52px', borderTop: '1px solid #E8DDD2', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#9E8B7A' }}>{page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['‹', '›'].map((sym, j) => (
                  <button key={sym} onClick={() => setPage(p => j === 0 ? Math.max(0, p - 1) : Math.min(totalPages - 1, p + 1))} disabled={(j === 0 && page === 0) || (j === 1 && page >= totalPages - 1)}
                    style={{ width: '32px', height: '32px', border: '1.5px solid #E8DDD2', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '16px', color: '#1A1208', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ((j === 0 && page === 0) || (j === 1 && page >= totalPages - 1)) ? 0.4 : 1 }}>
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

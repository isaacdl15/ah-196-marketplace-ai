'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Check, X, ExternalLink } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  price_cents: number;
  is_free: boolean;
  status: string;
  downloads: number;
  rating_avg: number | null;
  created_at: string;
  mp_profiles: { display_name: string; username: string | null } | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  published: { bg: '#F0FDF4', text: '#16A34A' },
  draft: { bg: '#F5F5F4', text: '#57534E' },
  under_review: { bg: '#FEF3C7', text: '#D97706' },
  rejected: { bg: '#FEF2F2', text: '#DC2626' },
};

export default function AdminTemplatesClient({ templates: initialTemplates }: { templates: Template[] }) {
  const supabase = createClient();
  const [templates, setTemplates] = useState(initialTemplates);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? templates : templates.filter(t => t.status === filter);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('mp_templates').update({ status }).eq('id', id);
    setTemplates(ts => ts.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
          All Templates
        </h2>
        <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>{templates.length} total</p>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'published', 'under_review', 'draft', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 12px', borderRadius: '8px',
              border: `1px solid ${filter === s ? '#4F46E5' : '#E7E5E4'}`,
              background: filter === s ? '#EEF2FF' : '#FFFFFF',
              color: filter === s ? '#4F46E5' : '#57534E',
              fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', textTransform: s === 'under_review' ? 'none' : 'capitalize',
              fontFamily: 'var(--font-family-ui)',
            }}
          >
            {s.replace('_', ' ')} ({s === 'all' ? templates.length : templates.filter(t => t.status === s).length})
          </button>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F5F4' }}>
                {['Template', 'Seller', 'Category', 'Price', 'Status', 'Downloads', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#A8A29E', fontSize: '14px' }}>
                    No templates.
                  </td>
                </tr>
              ) : (
                filtered.map((t, i) => {
                  const sc = STATUS_STYLES[t.status] ?? STATUS_STYLES.draft;
                  return (
                    <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E7E5E4' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>{t.title}</div>
                        <div style={{ fontSize: '11px', color: '#A8A29E' }}>{t.slug}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#57534E' }}>
                        {t.mp_profiles?.display_name ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', background: '#F5F5F4', color: '#57534E', borderRadius: '6px', fontSize: '11px' }}>
                          {t.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                        {t.is_free ? <span style={{ color: '#16A34A' }}>Free</span> : `$${((t.price_cents ?? 0) / 100).toFixed(0)}`}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', background: sc.bg, color: sc.text, borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#57534E' }}>
                        {(t.downloads ?? 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {t.status === 'under_review' && (
                            <>
                              <button
                                onClick={() => updateStatus(t.id, 'published')}
                                style={{ padding: '4px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '6px', cursor: 'pointer' }}
                                title="Approve"
                              >
                                <Check size={13} color="#16A34A" />
                              </button>
                              <button
                                onClick={() => updateStatus(t.id, 'rejected')}
                                style={{ padding: '4px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer' }}
                                title="Reject"
                              >
                                <X size={13} color="#DC2626" />
                              </button>
                            </>
                          )}
                          {t.status === 'published' && (
                            <Link href={`/template/${t.slug}`} target="_blank" style={{ color: '#A8A29E' }}>
                              <ExternalLink size={14} />
                            </Link>
                          )}
                        </div>
                      </td>
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

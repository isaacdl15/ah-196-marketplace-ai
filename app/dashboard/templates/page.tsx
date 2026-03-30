import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, ExternalLink, Edit, Package } from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  published: { bg: '#F0FDF4', text: '#16A34A' },
  draft: { bg: '#F5F5F4', text: '#57534E' },
  under_review: { bg: '#FEF3C7', text: '#D97706' },
  rejected: { bg: '#FEF2F2', text: '#DC2626' },
};

export default async function TemplatesPage() {
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
        .select('id, title, slug, category, price_cents, is_free, status, downloads, rating_avg, rating_count, created_at')
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const list = templates ?? [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
            My Templates
          </h2>
          <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>{list.length} template{list.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/dashboard/templates/new" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 16px', background: '#4F46E5', color: '#FFFFFF',
          borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
        }}>
          <Plus size={15} /> New Template
        </Link>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
        {list.length === 0 ? (
          <div style={{ padding: '72px 24px', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><Package size={40} color="#A8A29E" /></div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1C1917', marginBottom: '8px' }}>No templates yet</h3>
            <p style={{ fontSize: '14px', color: '#57534E', marginBottom: '20px' }}>
              Upload your first template and start earning today.
            </p>
            <Link href="/dashboard/templates/new" style={{
              padding: '10px 20px', background: '#4F46E5', color: '#FFFFFF',
              borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
            }}>
              Upload template
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F5F4' }}>
                  {['Template', 'Category', 'Price', 'Status', 'Downloads', 'Rating', 'Actions'].map(h => (
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
                {list.map((t, i) => {
                  const sc = STATUS_STYLES[t.status] ?? STATUS_STYLES.draft;
                  return (
                    <tr key={t.id} style={{
                      borderBottom: i < list.length - 1 ? '1px solid #E7E5E4' : 'none',
                    }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>{t.title}</div>
                        <div style={{ fontSize: '12px', color: '#A8A29E', marginTop: '2px' }}>{t.slug}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '12px', color: '#57534E', padding: '3px 8px', background: '#F5F5F4', borderRadius: '6px' }}>
                          {t.category}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>
                        {t.is_free ? <span style={{ color: '#16A34A' }}>Free</span> : `$${((t.price_cents ?? 0) / 100).toFixed(0)}`}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px',
                          background: sc.bg,
                          color: sc.text,
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'capitalize' as const,
                        }}>
                          {t.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#57534E' }}>
                        {t.downloads?.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#57534E' }}>
                        {Number(t.rating_avg ?? 0) > 0 ? `${Number(t.rating_avg).toFixed(1)} (${t.rating_count})` : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link href={`/template/${t.slug}`} target="_blank"
                            style={{ color: '#A8A29E', display: 'flex', alignItems: 'center' }}>
                            <ExternalLink size={14} />
                          </Link>
                          <Link href={`/dashboard/templates/${t.id}/edit`}
                            style={{ color: '#4F46E5', display: 'flex', alignItems: 'center' }}>
                            <Edit size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

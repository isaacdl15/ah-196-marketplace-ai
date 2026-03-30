export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Users, Package, DollarSign, Clock } from 'lucide-react';

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function AdminPage() {
  const supabase = createAdminClient();

  const [
    { data: profiles },
    { data: waitlist },
    { data: templates },
    { data: purchases },
    { data: pendingTemplates },
  ] = await Promise.all([
    supabase.from('mp_profiles').select('id, display_name, username, created_at, is_seller', { count: 'exact' }),
    supabase.from('mp_waitlist_entries').select('id', { count: 'exact' }),
    supabase.from('mp_templates').select('id', { count: 'exact' }),
    supabase.from('mp_purchases').select('amount_cents').eq('status', 'completed'),
    supabase.from('mp_templates').select('id, title, slug, category, price_cents, created_at, mp_profiles!seller_id(display_name)').eq('status', 'under_review').order('created_at', { ascending: false }).limit(10),
  ]);

  const totalUsers = profiles?.length ?? 0;
  const totalWaitlist = waitlist?.length ?? 0;
  const totalTemplates = templates?.length ?? 0;
  const totalRevenue = (purchases ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0);

  const recentUsers = (profiles ?? []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Users', value: totalUsers.toString(), icon: Users, color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Waitlist', value: totalWaitlist.toString(), icon: Clock, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Templates', value: totalTemplates.toString(), icon: Package, color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Revenue', value: `$${(totalRevenue / 100).toFixed(0)}`, icon: DollarSign, color: '#9333EA', bg: '#FAF5FF' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent signups */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Recent Signups</h3>
          </div>
          {recentUsers.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#A8A29E', fontSize: '14px' }}>No users yet.</div>
          ) : (
            <div>
              {recentUsers.map((u, i) => (
                <div key={u.id} style={{
                  padding: '12px 20px',
                  borderBottom: i < recentUsers.length - 1 ? '1px solid #E7E5E4' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '9999px',
                      background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, color: '#4F46E5',
                    }}>
                      {(u.display_name ?? 'U').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>{u.display_name}</div>
                      <div style={{ fontSize: '11px', color: '#A8A29E' }}>@{u.username ?? '—'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {u.is_seller && (
                      <span style={{ padding: '2px 8px', background: '#EEF2FF', color: '#4F46E5', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>
                        SELLER
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#A8A29E' }}>{formatDate(u.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending reviews */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Pending Reviews</h3>
            {(pendingTemplates?.length ?? 0) > 0 && (
              <span style={{ padding: '2px 8px', background: '#FEF3C7', color: '#D97706', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
                {pendingTemplates?.length}
              </span>
            )}
          </div>
          {(!pendingTemplates || pendingTemplates.length === 0) ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#A8A29E', fontSize: '14px' }}>
              No templates pending review.
            </div>
          ) : (
            <div>
              {pendingTemplates.map((t, i) => (
                <div key={t.id} style={{
                  padding: '12px 20px',
                  borderBottom: i < pendingTemplates.length - 1 ? '1px solid #E7E5E4' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>{t.title}</div>
                    <div style={{ fontSize: '11px', color: '#A8A29E', marginTop: '2px' }}>
                      {t.category} · {formatDate(t.created_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{
                      padding: '4px 10px', background: '#F0FDF4', color: '#16A34A',
                      border: '1px solid #86EFAC', borderRadius: '6px',
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family-ui)',
                    }}>
                      Approve
                    </button>
                    <button style={{
                      padding: '4px 10px', background: '#FEF2F2', color: '#DC2626',
                      border: '1px solid #FECACA', borderRadius: '6px',
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family-ui)',
                    }}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

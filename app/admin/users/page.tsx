export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { Users } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from('mp_profiles')
    .select('id, user_id, display_name, username, is_seller, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const list = profiles ?? [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
          Users
        </h2>
        <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>{list.length} registered users</p>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
        {list.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <Users size={32} color="#E7E5E4" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#A8A29E' }}>No users yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F5F4' }}>
                  {['User', 'Username', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < list.length - 1 ? '1px solid #E7E5E4' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
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
                          <div style={{ fontSize: '11px', color: '#A8A29E' }}>{u.user_id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#57534E' }}>
                      @{u.username ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {u.is_admin && (
                          <span style={{ padding: '2px 8px', background: '#EEF2FF', color: '#4F46E5', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>
                            ADMIN
                          </span>
                        )}
                        {u.is_seller && (
                          <span style={{ padding: '2px 8px', background: '#F0FDF4', color: '#16A34A', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>
                            SELLER
                          </span>
                        )}
                        {!u.is_admin && !u.is_seller && (
                          <span style={{ padding: '2px 8px', background: '#F5F5F4', color: '#A8A29E', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>
                            USER
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#57534E' }}>
                      {formatDate(u.created_at)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button style={{
                        padding: '4px 10px', background: '#F5F5F4', border: '1px solid #E7E5E4',
                        borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#57534E',
                        cursor: 'pointer', fontFamily: 'var(--font-family-ui)',
                      }}>
                        View
                      </button>
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

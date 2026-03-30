export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { Gift, Users, Link, TrendingUp } from 'lucide-react';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export default async function AdminReferralsPage() {
  const supabase = createAdminClient();

  // Get all waitlist entries with referral codes
  const { data: allEntries } = await supabase
    .from('mp_waitlist_entries')
    .select('id, email, referral_code, created_at, is_creator, utm_source')
    .order('created_at', { ascending: false });

  const entries = allEntries ?? [];

  // Build referral leaderboard from referral_code field
  // Entries with a non-null referral_code were referred by someone
  const referralCounts: Record<string, number> = {};
  entries.forEach(e => {
    if (e.referral_code) {
      referralCounts[e.referral_code] = (referralCounts[e.referral_code] ?? 0) + 1;
    }
  });

  // Also check mp_referrals table
  const { data: referralRows } = await supabase
    .from('mp_referrals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const referrals = referralRows ?? [];

  // Leaderboard: group by referrer code
  const leaderboard = Object.entries(referralCounts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);

  const totalReferred = Object.values(referralCounts).reduce((s, c) => s + c, 0);
  const uniqueReferrers = Object.keys(referralCounts).length;

  // Recent referrals = entries that came via a referral code
  const recentReferred = entries
    .filter(e => e.referral_code)
    .slice(0, 20);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
          Referrals
        </h2>
        <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>
          Track referral activity and leaderboard standings.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Referred', value: totalReferred.toString(), icon: Users, color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Unique Referrers', value: uniqueReferrers.toString(), icon: Link, color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Referrals (Table)', value: referrals.length.toString(), icon: TrendingUp, color: '#D97706', bg: '#FEF3C7' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Leaderboard */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Referral Leaderboard</h3>
          </div>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <Gift size={40} strokeWidth={1} color="#E7E5E4" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#57534E' }}>No referrals yet</p>
              <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '4px' }}>Referrals will appear here as users share their links.</p>
            </div>
          ) : (
            <div>
              {leaderboard.map(({ code, count }, i) => (
                <div key={code} style={{
                  display: 'flex', alignItems: 'center', padding: '14px 20px',
                  borderBottom: i < leaderboard.length - 1 ? '1px solid #F5F5F4' : 'none',
                }}>
                  <div style={{
                    width: '28px', fontSize: '14px', fontWeight: 700,
                    color: i === 0 ? '#F59E0B' : i === 1 ? '#A8A29E' : i === 2 ? '#CD7F32' : '#1C1917',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '9999px',
                    background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginRight: '12px',
                  }}>
                    <Link size={16} color="#4F46E5" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {code}
                    </p>
                  </div>
                  <div style={{ flexShrink: 0, marginLeft: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#4F46E5' }}>{count}</span>
                    <span style={{ fontSize: '12px', color: '#A8A29E', marginLeft: '4px' }}>referrals</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent referrals */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Recent Referred Signups</h3>
          </div>
          {recentReferred.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <Users size={40} strokeWidth={1} color="#E7E5E4" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#57534E' }}>No referred signups yet</p>
              <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '4px' }}>Users referred via a link will appear here.</p>
            </div>
          ) : (
            <div>
              {recentReferred.map((entry, i) => (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', padding: '12px 20px',
                  borderBottom: i < recentReferred.length - 1 ? '1px solid #F5F5F4' : 'none',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '9999px',
                    background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: '#4F46E5',
                    flexShrink: 0, marginRight: '12px',
                  }}>
                    {entry.email[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.email}
                    </p>
                    <p style={{ fontSize: '11px', color: '#A8A29E' }}>
                      via <span style={{ fontFamily: 'monospace', color: '#57534E' }}>{entry.referral_code}</span>
                    </p>
                  </div>
                  <div style={{ flexShrink: 0, marginLeft: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#A8A29E' }}>{formatRelative(entry.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All referral rows if table has data */}
      {referrals.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Referral Records</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F5F4' }}>
                  {['Referrer', 'Referred', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {referrals.map((r: Record<string, unknown>, i: number) => (
                  <tr key={String(r.id)} style={{ borderBottom: i < referrals.length - 1 ? '1px solid #F5F5F4' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1C1917', fontFamily: 'monospace' }}>{String(r.referrer_id ?? '—')}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#57534E', fontFamily: 'monospace' }}>{String(r.referred_id ?? r.referred_email ?? '—')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px',
                        background: '#F0FDF4', color: '#16A34A',
                      }}>
                        {String(r.status ?? 'pending')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#A8A29E' }}>
                      {r.created_at ? formatDate(String(r.created_at)) : '—'}
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

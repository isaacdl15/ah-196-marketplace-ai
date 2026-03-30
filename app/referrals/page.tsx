import { createClient } from '@/lib/supabase/server';
import { Trophy, Users, Gift, Zap, Crown } from 'lucide-react';

export const metadata = {
  title: 'Referral Leaderboard — marketplace.ai',
};

export default async function ReferralsPage() {
  const supabase = await createClient();

  // Get top referrers
  const { data: referrals } = await supabase
    .from('mp_referrals')
    .select('referrer_id, mp_profiles!referrer_id(display_name, username, avatar_url)')
    .order('created_at', { ascending: false });

  // Group by referrer
  const grouped: Record<string, { count: number; display_name: string; username: string | null }> = {};
  (referrals ?? []).forEach(r => {
    const id = r.referrer_id;
    const rawProfile = r.mp_profiles;
    const profile = Array.isArray(rawProfile) ? rawProfile[0] ?? null : rawProfile as { display_name: string; username: string | null } | null;
    if (!grouped[id]) {
      grouped[id] = { count: 0, display_name: profile?.display_name ?? 'Unknown', username: profile?.username ?? null };
    }
    grouped[id].count++;
  });

  const leaderboard = Object.entries(grouped)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);

  const { data: { user } } = await supabase.auth.getUser();

  let myCount = 0;
  let myRank = 0;

  if (user) {
    const { data: profile } = await supabase
      .from('mp_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      const { data: myReferrals } = await supabase
        .from('mp_referrals')
        .select('id')
        .eq('referrer_id', profile.id);
      myCount = myReferrals?.length ?? 0;
      myRank = leaderboard.findIndex(l => l.id === profile.id) + 1;
    }
  }

  const medals = ['1st', '2nd', '3rd'];

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', padding: '0' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#FFFFFF', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><Trophy size={48} color="rgba(255,255,255,0.9)" /></div>
          <h1 style={{
            fontSize: '36px', fontWeight: 800, marginBottom: '12px',
            fontFamily: 'var(--font-family-display)', lineHeight: 1.2,
          }}>
            Referral Leaderboard
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.85, lineHeight: 1.5 }}>
            Refer friends and earn exclusive perks. The more you refer, the higher you rank.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
            {[
              { icon: <Gift size={22} />, label: '1+ referrals', desc: 'Early access' },
              { icon: <Zap size={22} />, label: '5+ referrals', desc: 'Free Pro template' },
              { icon: <Crown size={22} />, label: '10+ referrals', desc: 'Lifetime discount' },
            ].map(({ icon, label, desc }) => (
              <div key={label} style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', minWidth: '130px' }}>
                <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        {/* My stats (if logged in) */}
        {user && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E7E5E4',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '9999px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: '#4F46E5', flexShrink: 0 }}>
              {user.email?.slice(0, 1).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '4px' }}>Your Referral Stats</p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: '#57534E' }}><strong style={{ color: '#4F46E5' }}>{myCount}</strong> referrals</span>
                {myRank > 0 && <span style={{ fontSize: '13px', color: '#57534E' }}>Rank: <strong style={{ color: '#4F46E5' }}>#{myRank}</strong></span>}
              </div>
            </div>
            <div>
              <button style={{
                padding: '9px 16px',
                background: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-family-ui)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Gift size={14} />
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E5E4', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} color="#4F46E5" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917' }}>Top Referrers</h2>
          </div>

          {leaderboard.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <Users size={32} color="#E7E5E4" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', color: '#A8A29E' }}>No referrals yet. Be the first!</p>
              {!user && (
                <a href="/auth/signup" style={{ display: 'inline-block', marginTop: '12px', padding: '8px 16px', background: '#4F46E5', color: '#FFFFFF', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  Join & start referring
                </a>
              )}
            </div>
          ) : (
            <div>
              {leaderboard.map((entry, i) => {
                const medal = medals[i] ?? null;
                const isPodium = i < 3;
                return (
                  <div key={entry.id} style={{
                    padding: '14px 20px',
                    borderBottom: i < leaderboard.length - 1 ? '1px solid #E7E5E4' : 'none',
                    background: isPodium ? '#FAFAFA' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}>
                    <div style={{ width: '28px', textAlign: 'center', fontSize: isPodium ? '22px' : '14px', fontWeight: 600, color: '#A8A29E' }}>
                      {medal ?? `#${i + 1}`}
                    </div>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '9999px',
                      background: '#EEF2FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 700, color: '#4F46E5',
                    }}>
                      {entry.display_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: isPodium ? 700 : 600, color: '#1C1917' }}>
                        {entry.display_name}
                      </div>
                      {entry.username && (
                        <div style={{ fontSize: '12px', color: '#A8A29E' }}>@{entry.username}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#4F46E5', fontFamily: 'var(--font-family-display)' }}>
                        {entry.count}
                      </div>
                      <div style={{ fontSize: '11px', color: '#A8A29E' }}>referrals</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

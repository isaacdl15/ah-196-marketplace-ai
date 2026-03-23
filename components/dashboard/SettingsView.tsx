'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const TABS = ['Profile', 'Page', 'Account', 'Payouts', 'Notifications'];
const COLORS = ['#C75B40', '#1E6B6B', '#7C3AED', '#E89820', '#2D9E6B', '#1A1208'];
const BG_OPTIONS = [
  { value: 'warm-cream', label: 'Warm cream', color: '#FDFAF6' },
  { value: 'white', label: 'White', color: '#FFFFFF' },
  { value: 'dark', label: 'Dark', color: '#1A1208' },
];

interface Creator {
  id: string; username: string; display_name: string; bio: string | null; niche: string | null;
  locale: string; plan: string; page_theme_color: string; page_bg: string; payout_email: string | null;
  payout_threshold: number;
}
interface Prefs {
  new_sale: boolean; payout_processed: boolean; new_follower: boolean; monthly_summary: boolean; tips_updates: boolean;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: '40px', height: '22px', borderRadius: '9999px', background: checked ? '#C75B40' : '#E8DDD2', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: '150ms ease' }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '9999px', background: 'white', position: 'absolute', top: '2px', left: checked ? '20px' : '2px', transition: '150ms cubic-bezier(0.16,1,0.3,1)' }} />
    </div>
  );
}

export default function SettingsView({ creator: initial, prefs: initialPrefs, userEmail }: { creator: Creator | null; prefs: Prefs | null; userEmail: string }) {
  const [tab, setTab] = useState(0);
  const [creator, setCreator] = useState(initial);
  const [prefs, setPrefs] = useState<Prefs>(initialPrefs ?? { new_sale: true, payout_processed: true, new_follower: true, monthly_summary: true, tips_updates: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  if (!creator) return <div style={{ color: '#9E8B7A', padding: '40px', textAlign: 'center' }}>No creator profile found.</div>;

  const save = async (data: Partial<Creator>) => {
    setSaving(true);
    await supabase.from('sirena_creators').update({ ...data, updated_at: new Date().toISOString() }).eq('id', creator.id);
    setCreator(c => c ? { ...c, ...data } : c);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const savePrefs = async (data: Partial<Prefs>) => {
    const newPrefs = { ...prefs, ...data };
    setPrefs(newPrefs);
    await supabase.from('sirena_notification_prefs').upsert({ creator_id: creator.id, ...newPrefs }, { onConflict: 'creator_id' });
  };

  const inputStyle = { width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 12px', fontSize: '14px', color: '#1A1208', outline: 'none', fontFamily: 'var(--font-ui)' as const, background: 'white' };

  return (
    <div>
      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E8DDD2', marginBottom: '24px' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ background: 'none', border: 'none', borderBottom: i === tab ? '2px solid #C75B40' : '2px solid transparent', color: i === tab ? '#C75B40' : '#9E8B7A', fontSize: '14px', fontWeight: 600, padding: '0 0 12px', cursor: 'pointer', fontFamily: 'var(--font-ui)', transition: '120ms' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', padding: '32px', maxWidth: '640px', boxShadow: 'var(--shadow-elev-1)' }}>

        {/* Profile tab */}
        {tab === 0 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Display name</label>
              <input type="text" style={inputStyle} value={creator.display_name} onChange={e => setCreator(c => c ? { ...c, display_name: e.target.value } : c)} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9E8B7A' }}>@</span>
                <input type="text" style={{ ...inputStyle, paddingLeft: '28px' }} value={creator.username} onChange={e => setCreator(c => c ? { ...c, username: e.target.value } : c)} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Bio</label>
              <textarea style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' as const, lineHeight: '1.6' }} rows={3} value={creator.bio ?? ''} onChange={e => setCreator(c => c ? { ...c, bio: e.target.value } : c)} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Locale</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['en', 'es'].map(l => (
                  <button key={l} onClick={() => setCreator(c => c ? { ...c, locale: l } : c)}
                    style={{ padding: '8px 20px', border: creator.locale === l ? '1.5px solid #C75B40' : '1px solid #E8DDD2', borderRadius: '8px', background: creator.locale === l ? '#FDF0EC' : 'white', color: creator.locale === l ? '#C75B40' : '#5A4839', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => save({ display_name: creator.display_name, username: creator.username, bio: creator.bio, locale: creator.locale })} style={{ background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>
        )}

        {/* Page tab */}
        {tab === 1 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>Accent color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setCreator(cr => cr ? { ...cr, page_theme_color: c } : cr)}
                    style={{ width: '32px', height: '32px', borderRadius: '9999px', background: c, border: 'none', cursor: 'pointer', outline: creator.page_theme_color === c ? `2px solid white` : 'none', boxShadow: creator.page_theme_color === c ? `0 0 0 4px ${c}` : 'none', transform: creator.page_theme_color === c ? 'scale(1.15)' : 'scale(1)', transition: '120ms' }} />
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>Background</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {BG_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setCreator(c => c ? { ...c, page_bg: opt.value } : c)}
                    style={{ flex: 1, height: '48px', border: creator.page_bg === opt.value ? '2px solid #C75B40' : '1px solid #E8DDD2', borderRadius: '8px', background: opt.color, cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: opt.value === 'dark' ? 'white' : '#1A1208', fontFamily: 'var(--font-ui)' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => save({ page_theme_color: creator.page_theme_color, page_bg: creator.page_bg })} style={{ background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>
        )}

        {/* Account tab */}
        {tab === 2 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Email address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="email" value={userEmail} readOnly style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} />
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#C75B40', whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)' }}>Change email</button>
              </div>
            </div>
            <div style={{ border: '1px solid rgba(217,64,64,0.30)', borderRadius: '12px', padding: '20px', marginTop: '32px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#D94040', marginBottom: '8px' }}>Danger zone</h4>
              <p style={{ fontSize: '13px', color: '#9E8B7A', marginBottom: '16px' }}>Permanently delete your account and all data.</p>
              <button style={{ background: '#D94040', color: 'white', border: 'none', borderRadius: '10px', padding: '9px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                Delete account
              </button>
            </div>
          </div>
        )}

        {/* Payouts tab */}
        {tab === 3 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>PayPal email</label>
              <input type="email" style={inputStyle} value={creator.payout_email ?? ''} onChange={e => setCreator(c => c ? { ...c, payout_email: e.target.value } : c)} placeholder="you@paypal.com" />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>Payout threshold</label>
              {[25, 50, 100].map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="threshold" checked={creator.payout_threshold === t} onChange={() => setCreator(c => c ? { ...c, payout_threshold: t } : c)} style={{ accentColor: '#C75B40' }} />
                  <span style={{ fontSize: '14px', color: '#1A1208' }}>${t}.00</span>
                </label>
              ))}
            </div>
            <button onClick={() => save({ payout_email: creator.payout_email, payout_threshold: creator.payout_threshold })} style={{ background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>
        )}

        {/* Notifications tab */}
        {tab === 4 && (
          <div>
            {[
              { key: 'new_sale', label: 'New sale', sub: 'Get notified when someone purchases a product' },
              { key: 'payout_processed', label: 'Payout processed', sub: 'When your payout is sent' },
              { key: 'new_follower', label: 'New follower', sub: 'When someone follows your page' },
              { key: 'monthly_summary', label: 'Monthly summary email', sub: 'Monthly stats and insights' },
              { key: 'tips_updates', label: 'Tips and updates from Sirena', sub: 'Product updates and creator tips' },
            ].map(({ key, label, sub }, i) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '52px', borderBottom: i < 4 ? '1px solid #F5EEE6' : 'none' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#1A1208' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#9E8B7A' }}>{sub}</div>
                </div>
                <Toggle checked={prefs[key as keyof Prefs]} onChange={() => savePrefs({ [key]: !prefs[key as keyof Prefs] })} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

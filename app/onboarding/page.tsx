'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Check, Camera, Link2, Instagram, Youtube, Video } from 'lucide-react';

const COLORS = ['#C75B40', '#1E6B6B', '#7C3AED', '#E89820', '#2D9E6B', '#1A1208'];
const BG_OPTIONS = [
  { value: 'warm-cream', label: 'Warm cream', color: '#FDFAF6' },
  { value: 'white', label: 'White', color: '#FFFFFF' },
  { value: 'dark', label: 'Dark', color: '#1A1208' },
];
const LINK_TYPES = [
  { value: 'link', label: 'Link', icon: Link2 },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'tiktok', label: 'TikTok', icon: Video },
  { value: 'other', label: 'Other', icon: Link2 },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [themeColor, setThemeColor] = useState('#C75B40');
  const [pageBg, setPageBg] = useState('warm-cream');
  const [linkType, setLinkType] = useState('link');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle'|'checking'|'available'|'taken'>('idle');
  const router = useRouter();
  const supabase = createClient();

  // Load creator data
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
      supabase.from('sirena_creators').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || '');
          setUsername(data.username || '');
          setBio(data.bio || '');
        }
      });
    });
  }, []);

  const checkUsername = async (val: string) => {
    if (!val || val.length < 3) return;
    setUsernameStatus('checking');
    const { data } = await supabase.from('sirena_creators').select('id').eq('username', val).single();
    const { data: { user } } = await supabase.auth.getUser();
    if (data && data.id !== user?.id) setUsernameStatus('taken');
    else setUsernameStatus('available');
  };

  const saveStep1 = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('sirena_creators').upsert({ id: user.id, display_name: displayName, username, bio }, { onConflict: 'id' });
    setLoading(false);
    setStep(2);
  };

  const saveStep2 = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('sirena_creators').upsert({ id: user.id, page_theme_color: themeColor, page_bg: pageBg }, { onConflict: 'id' });
    setLoading(false);
    setStep(3);
  };

  const saveStep3 = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (linkTitle && linkUrl) {
      await supabase.from('sirena_links').insert({ creator_id: user.id, link_type: linkType, title: linkTitle, url: linkUrl, position: 0 });
    }
    await supabase.from('sirena_creators').upsert({ id: user.id, onboarding_done: true }, { onConflict: 'id' });
    setLoading(false);
    router.push('/dashboard');
  };

  const stepLabels = ['Profile', 'Your page', 'First link'];

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF6', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      {/* Logo */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#1A1208', fontStyle: 'italic', marginBottom: '32px' }}>
        <span style={{ color: '#C75B40' }}>S</span>irena
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '48px' }}>
        {stepLabels.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? '#2D9E6B' : active ? '#C75B40' : 'white',
                  border: done ? 'none' : active ? 'none' : '1px solid #E8DDD2',
                  fontSize: '13px', fontWeight: 700, color: done || active ? 'white' : '#9E8B7A'
                }}>
                  {done ? <Check size={14} strokeWidth={3} /> : n}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: active ? '#C75B40' : '#9E8B7A' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width: '60px', height: '2px', background: done ? '#C75B40' : '#E8DDD2', margin: '0 8px', marginBottom: '20px' }} />}
            </div>
          );
        })}
      </div>

      {/* Step card */}
      <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '20px', boxShadow: 'var(--shadow-elev-2)', padding: '40px', maxWidth: '520px', width: '100%' }}>
        {/* Step 1 — Profile */}
        {step === 1 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 700, color: '#1A1208', marginBottom: '6px' }}>Set up your profile</h2>
            <p style={{ fontSize: '15px', color: '#9E8B7A', marginBottom: '24px' }}>This is how creators and fans find you.</p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '9999px', border: '2px dashed #E8DDD2', background: '#F5EEE6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={28} color="#9E8B7A" strokeWidth={1.5} />
              </div>
            </div>

            {[
              { label: 'Creator name', value: displayName, onChange: setDisplayName, placeholder: 'Sofia Reyes' },
            ].map(({ label, value, onChange, placeholder }) => (
              <div key={label} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>{label}</label>
                <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                  style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 12px', fontSize: '14px', color: '#1A1208', outline: 'none', fontFamily: 'var(--font-ui)' }}
                  onFocus={e => Object.assign(e.target.style, { borderColor: '#C75B40', boxShadow: '0 0 0 3px rgba(199,91,64,0.15)' })}
                  onBlur={e => Object.assign(e.target.style, { borderColor: '#E8DDD2', boxShadow: 'none' })}
                />
              </div>
            ))}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Username (@handle)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9E8B7A', fontFamily: 'var(--font-ui)' }}>@</span>
                <input type="text" value={username} onChange={e => { setUsername(e.target.value); setUsernameStatus('idle'); }} onBlur={() => checkUsername(username)}
                  placeholder="sofia_creates"
                  style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 40px 0 28px', fontSize: '14px', color: '#1A1208', outline: 'none', fontFamily: 'var(--font-ui)' }}
                  onFocus={e => Object.assign(e.target.style, { borderColor: '#C75B40', boxShadow: '0 0 0 3px rgba(199,91,64,0.15)' })}
                />
                {usernameStatus === 'available' && <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#2D9E6B' }}><Check size={16} /></span>}
                {usernameStatus === 'taken' && <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#D94040', fontSize: '12px' }}>✗</span>}
              </div>
              {usernameStatus === 'taken' && <p style={{ fontSize: '12px', color: '#D94040', marginTop: '4px' }}>Username taken</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Bio <span style={{ color: '#9E8B7A', fontWeight: 400 }}>(optional)</span></label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell your story…" rows={3}
                style={{ width: '100%', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#1A1208', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-ui)', lineHeight: '1.6' }}
                onFocus={e => Object.assign(e.target.style, { borderColor: '#C75B40', boxShadow: '0 0 0 3px rgba(199,91,64,0.15)' })}
                onBlur={e => Object.assign(e.target.style, { borderColor: '#E8DDD2', boxShadow: 'none' })}
              />
            </div>

            <button onClick={saveStep1} disabled={loading || !displayName || !username}
              style={{ width: '100%', height: '46px', background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)', opacity: (!displayName || !username) ? 0.6 : 1 }}>
              {loading ? 'Saving…' : 'Continue'}
            </button>
          </>
        )}

        {/* Step 2 — Page */}
        {step === 2 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 700, color: '#1A1208', marginBottom: '6px' }}>Customize your page</h2>
            <p style={{ fontSize: '15px', color: '#9E8B7A', marginBottom: '24px' }}>Make it yours.</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>Page accent color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setThemeColor(c)} style={{ width: '32px', height: '32px', borderRadius: '9999px', background: c, border: 'none', cursor: 'pointer', outline: themeColor === c ? `2px solid white` : 'none', boxShadow: themeColor === c ? `0 0 0 4px ${c}` : 'none', transition: 'all 120ms', transform: themeColor === c ? 'scale(1.15)' : 'scale(1)' }} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>Page background</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {BG_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setPageBg(opt.value)}
                    style={{ flex: 1, height: '48px', border: pageBg === opt.value ? '2px solid #C75B40' : '1px solid #E8DDD2', borderRadius: '8px', background: opt.color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 500, color: opt.value === 'dark' ? 'white' : '#1A1208', fontFamily: 'var(--font-ui)' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setStep(3)} style={{ width: '100%', height: '46px', background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                {loading ? 'Saving…' : 'Continue'}
              </button>
            </div>
            <button onClick={() => { void saveStep2(); }} style={{ width: '100%', marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#9E8B7A', fontFamily: 'var(--font-ui)' }}>
              Skip for now
            </button>
          </>
        )}

        {/* Step 3 — First link */}
        {step === 3 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 700, color: '#1A1208', marginBottom: '6px' }}>Add your first link</h2>
            <p style={{ fontSize: '15px', color: '#9E8B7A', marginBottom: '24px' }}>Start building your page.</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {LINK_TYPES.map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => setLinkType(value)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9999px', border: linkType === value ? '1.5px solid #C75B40' : '1px solid #E8DDD2', background: linkType === value ? '#FDF0EC' : 'white', color: linkType === value ? '#C75B40' : '#5A4839', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                  <Icon size={14} strokeWidth={2} /> {label}
                </button>
              ))}
            </div>

            {[
              { label: 'Link title', value: linkTitle, onChange: setLinkTitle, placeholder: 'My Instagram' },
              { label: 'URL', value: linkUrl, onChange: setLinkUrl, placeholder: 'https://' },
            ].map(({ label, value, onChange, placeholder }) => (
              <div key={label} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>{label}</label>
                <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                  style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 12px', fontSize: '14px', color: '#1A1208', outline: 'none', fontFamily: 'var(--font-ui)' }}
                  onFocus={e => Object.assign(e.target.style, { borderColor: '#C75B40', boxShadow: '0 0 0 3px rgba(199,91,64,0.15)' })}
                  onBlur={e => Object.assign(e.target.style, { borderColor: '#E8DDD2', boxShadow: 'none' })}
                />
              </div>
            ))}

            <button onClick={saveStep3} disabled={loading}
              style={{ width: '100%', height: '46px', background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)', marginTop: '8px' }}>
              {loading ? 'Saving…' : 'Add link & finish'}
            </button>
            <button onClick={() => { supabase.from('sirena_creators').upsert({ id: undefined, onboarding_done: true }, { onConflict: 'id' }); router.push('/dashboard'); }}
              style={{ width: '100%', marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#9E8B7A', fontFamily: 'var(--font-ui)' }}>
              Skip
            </button>
          </>
        )}
      </div>
    </div>
  );
}

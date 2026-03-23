'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NICHES = [
  { value: 'fitness', label: 'Fitness' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'content_creation', label: 'Content Creation' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'business', label: 'Business' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

function getPasswordStrength(p: string) {
  if (p.length === 0) return 0;
  if (p.length < 6) return 1;
  if (p.length < 10) return 2;
  return 3;
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [niche, setNiche] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const strength = getPasswordStrength(password);
  const strengthColors = ['transparent', '#D94040', '#E89820', '#2D9E6B'];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, niche } }
      });
      if (error) { setError(error.message); return; }
      router.push('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused: boolean = false) => ({
    width: '100%', height: '40px', border: focused ? '1.5px solid #C75B40' : '1px solid #E8DDD2',
    borderRadius: '8px', padding: '0 12px', fontSize: '14px', color: '#1A1208', outline: 'none',
    background: 'white', boxShadow: focused ? '0 0 0 3px rgba(199,91,64,0.15)' : 'none', fontFamily: 'var(--font-ui)'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel */}
      <div style={{
        width: '40%', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '48px', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(255,200,180,0.20) 0%, transparent 50%), linear-gradient(160deg, #C75B40 0%, #8B3A25 100%)'
      }} className="hidden-mobile">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: 'white', fontStyle: 'italic', marginBottom: '12px' }}>Sirena</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontStyle: 'italic', color: 'rgba(255,255,255,0.80)' }}>Your creator business, elevated.</p>
        </div>
        <div style={{ position: 'absolute', top: '120px', right: '32px', transform: 'rotate(-8deg)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '9999px', padding: '8px 14px', color: 'white', fontSize: '13px', fontWeight: 600 }}>2,400+ creators</div>
        <div style={{ position: 'absolute', top: '45%', left: '20px', transform: 'rotate(6deg)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '9999px', padding: '8px 14px', color: 'white', fontSize: '13px', fontWeight: 600 }}>11 niches</div>
        <div style={{ position: 'absolute', bottom: '140px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '9999px', padding: '8px 14px', color: 'white', fontSize: '13px', fontWeight: 600 }}>EN · ES</div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', background: '#FDFAF6' }}>
        <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '20px', boxShadow: 'var(--shadow-elev-1)', padding: '40px', maxWidth: '420px', width: '100%' }}>
          <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 700, color: '#1A1208', marginBottom: '6px' }}>Create your account</h1>
          <p style={{ fontSize: '14px', color: '#5A4839', marginBottom: '24px' }}>Join 2,400+ Hispanic creators</p>

          <form onSubmit={handleSignup}>
            {[
              { label: 'Your name', value: fullName, onChange: setFullName, type: 'text', placeholder: 'Sofia Reyes' },
              { label: 'Email', value: email, onChange: setEmail, type: 'email', placeholder: 'you@example.com' },
            ].map(({ label, value, onChange, type, placeholder }) => (
              <div key={label} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>{label}</label>
                <input type={type} value={value} onChange={e => onChange(e.target.value)} required placeholder={placeholder}
                  style={inputStyle()}
                  onFocus={e => Object.assign(e.target.style, { borderColor: '#C75B40', boxShadow: '0 0 0 3px rgba(199,91,64,0.15)', borderWidth: '1.5px' })}
                  onBlur={e => Object.assign(e.target.style, { borderColor: '#E8DDD2', boxShadow: 'none', borderWidth: '1px' })}
                />
              </div>
            ))}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                style={inputStyle()}
                onFocus={e => Object.assign(e.target.style, { borderColor: '#C75B40', boxShadow: '0 0 0 3px rgba(199,91,64,0.15)', borderWidth: '1.5px' })}
                onBlur={e => Object.assign(e.target.style, { borderColor: '#E8DDD2', boxShadow: 'none', borderWidth: '1px' })}
              />
              {password.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: '4px', borderRadius: '9999px', background: i <= strength ? strengthColors[strength] : '#E8DDD2', transition: 'background 200ms' }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Your creator niche</label>
              <div style={{ position: 'relative' }}>
                <select value={niche} onChange={e => setNiche(e.target.value)}
                  style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 36px 0 12px', fontSize: '14px', color: niche ? '#1A1208' : '#9E8B7A', outline: 'none', background: 'white', appearance: 'none', fontFamily: 'var(--font-ui)' }}>
                  <option value="">Select a niche</option>
                  {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9E8B7A" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            {error && <div style={{ background: '#FFE4E4', border: '1px solid rgba(217,64,64,0.30)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#D94040' }}>{error}</div>}

            <button type="submit" disabled={loading}
              style={{ width: '100%', height: '46px', background: loading ? '#E0A090' : '#C75B40', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)' }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ marginTop: '12px', fontSize: '12px', color: '#9E8B7A', textAlign: 'center' }}>
            By continuing, you agree to our Terms and Privacy Policy
          </p>
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#9E8B7A' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#C75B40', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 767px) { .hidden-mobile { display: none !important; } }`}</style>
    </div>
  );
}

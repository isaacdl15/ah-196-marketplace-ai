'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel */}
      <div style={{
        width: '40%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '48px', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(255,200,180,0.20) 0%, transparent 50%), linear-gradient(160deg, #C75B40 0%, #8B3A25 100%)'
      }} className="hidden-mobile">
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: 'white', fontStyle: 'italic', marginBottom: '12px' }}>
            Sirena
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontStyle: 'italic', color: 'rgba(255,255,255,0.80)', marginBottom: '48px' }}>
            Your creator business, elevated.
          </p>
        </div>
        {/* Floating pills */}
        <div style={{ position: 'absolute', top: '120px', right: '32px', transform: 'rotate(-8deg)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '9999px', padding: '8px 14px', color: 'white', fontSize: '13px', fontWeight: 600 }}>
          2,400+ creators
        </div>
        <div style={{ position: 'absolute', top: '45%', left: '20px', transform: 'rotate(6deg)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '9999px', padding: '8px 14px', color: 'white', fontSize: '13px', fontWeight: 600 }}>
          11 niches
        </div>
        <div style={{ position: 'absolute', bottom: '140px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '9999px', padding: '8px 14px', color: 'white', fontSize: '13px', fontWeight: 600 }}>
          EN · ES
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', background: '#FDFAF6' }}>
        <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '20px', boxShadow: 'var(--shadow-elev-1)', padding: '40px', maxWidth: '420px', width: '100%' }}>
          <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 700, color: '#1A1208', marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: '#5A4839', marginBottom: '24px' }}>
            Sign in to your creator dashboard
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 12px', fontSize: '14px', color: '#1A1208', outline: 'none', background: 'white', transition: 'border-color 150ms, box-shadow 150ms' }}
                onFocus={e => { e.target.style.borderColor = '#C75B40'; e.target.style.boxShadow = '0 0 0 3px rgba(199,91,64,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#E8DDD2'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#5A4839' }}>Password</label>
                <a href="#" style={{ fontSize: '13px', color: '#C75B40', textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 12px', fontSize: '14px', color: '#1A1208', outline: 'none', background: 'white' }}
                onFocus={e => { e.target.style.borderColor = '#C75B40'; e.target.style.boxShadow = '0 0 0 3px rgba(199,91,64,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#E8DDD2'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <div style={{ background: '#FFE4E4', border: '1px solid rgba(217,64,64,0.30)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#D94040' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '46px', background: loading ? '#E0A090' : '#C75B40', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 150ms, box-shadow 150ms', fontFamily: 'var(--font-ui)' }}
              onMouseEnter={e => { if (!loading) { (e.target as HTMLButtonElement).style.background = '#A64330'; (e.target as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(199,91,64,0.30)'; } }}
              onMouseLeave={e => { if (!loading) { (e.target as HTMLButtonElement).style.background = '#C75B40'; (e.target as HTMLButtonElement).style.boxShadow = 'none'; } }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#9E8B7A' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: '#C75B40', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

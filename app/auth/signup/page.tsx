'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Github, Mail, Lock, User, Store } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wantToSell, setWantToSell] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          is_seller: wantToSell,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/onboarding');
  };

  const handleGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=/onboarding` },
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '26px',
              fontWeight: 700,
              color: '#1C1917',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ color: '#4F46E5' }}>marketplace</span>
              <span style={{ color: '#A8A29E' }}>.ai</span>
            </div>
          </Link>
          <p style={{ marginTop: '8px', fontSize: '15px', color: '#57534E' }}>
            Create your account
          </p>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E7E5E4',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)',
        }}>
          {/* GitHub */}
          <button
            onClick={handleGithub}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '11px 16px',
              background: '#1C1917',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--font-family-ui)',
              cursor: 'pointer',
              transition: '120ms ease',
              marginBottom: '20px',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0C0A09')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1C1917')}
          >
            <Github size={18} />
            Continue with GitHub
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E7E5E4' }} />
            <span style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 500 }}>or sign up with email</span>
            <div style={{ flex: 1, height: '1px', background: '#E7E5E4' }} />
          </div>

          {error && (
            <div style={{
              padding: '12px 14px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#DC2626',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                Full name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#A8A29E" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Chen"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: '1px solid #E7E5E4',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#1C1917',
                    background: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-family-ui)',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                  onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#A8A29E" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: '1px solid #E7E5E4',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#1C1917',
                    background: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-family-ui)',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                  onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#A8A29E" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: '1px solid #E7E5E4',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#1C1917',
                    background: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-family-ui)',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                  onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
                />
              </div>
            </div>

            {/* Sell checkbox */}
            <button
              type="button"
              onClick={() => setWantToSell(v => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                background: wantToSell ? '#EEF2FF' : '#F5F5F4',
                border: `1px solid ${wantToSell ? '#4F46E5' : '#E7E5E4'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                marginBottom: '24px',
                textAlign: 'left',
                transition: '120ms ease',
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                border: `2px solid ${wantToSell ? '#4F46E5' : '#D6D3D1'}`,
                background: wantToSell ? '#4F46E5' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: '120ms ease',
              }}>
                {wantToSell && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <Store size={16} color={wantToSell ? '#4F46E5' : '#A8A29E'} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', fontFamily: 'var(--font-family-ui)' }}>
                  I want to sell templates
                </div>
                <div style={{ fontSize: '12px', color: '#57534E', marginTop: '2px' }}>
                  Set up your seller profile and start earning
                </div>
              </div>
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 16px',
                background: loading ? '#A8A29E' : '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-family-ui)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: '120ms ease',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = '#3730A3'); }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = '#4F46E5'); }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#57534E' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

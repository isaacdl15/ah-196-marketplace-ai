
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SellerSignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({ email: '', password: '', display_name: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { display_name: form.display_name, is_seller: true },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/onboarding`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/seller/verify-email');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-family-display)', fontSize: '26px', fontWeight: 700, color: '#1C1917' }}>
              <span style={{ color: '#4F46E5' }}>marketplace</span><span style={{ color: '#A8A29E' }}>.ai</span>
            </div>
          </Link>
          <p style={{ marginTop: '12px', fontSize: '15px', color: '#57534E' }}>Create your seller account</p>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', marginBottom: '24px', fontFamily: 'var(--font-family-display)' }}>
            Start selling templates
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Email address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                style={{ width: '100%', height: '44px', border: '1px solid #E7E5E4', borderRadius: '10px', padding: '0 12px', fontSize: '15px', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="At least 8 characters"
                style={{ width: '100%', height: '44px', border: '1px solid #E7E5E4', borderRadius: '10px', padding: '0 12px', fontSize: '15px', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Display name</label>
              <input
                name="display_name"
                type="text"
                value={form.display_name}
                onChange={handleChange}
                required
                placeholder="Your name or brand"
                style={{ width: '100%', height: '44px', border: '1px solid #E7E5E4', borderRadius: '10px', padding: '0 12px', fontSize: '15px', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>
                Bio <span style={{ color: '#A8A29E', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Tell buyers about yourself..."
                style={{ width: '100%', border: '1px solid #E7E5E4', borderRadius: '10px', padding: '10px 12px', fontSize: '15px', background: '#FAFAF9', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'var(--font-family-ui)' }}
              />
            </div>

            {error && (
              <div style={{ marginBottom: '16px', padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '14px', color: '#DC2626' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: '44px',
                background: loading ? '#A8A29E' : '#4F46E5',
                color: '#FFFFFF', border: 'none', borderRadius: '10px',
                fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-family-ui)',
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#A8A29E' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

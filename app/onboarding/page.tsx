'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Check, ChevronRight, Globe, User, Tag, CreditCard, Rocket } from 'lucide-react';

const CATEGORIES = ['Next.js', 'React', 'SaaS Starter', 'E-commerce', 'Dashboard', 'Landing Page', 'Mobile', 'API/Backend'];

const STEPS = [
  { id: 1, label: 'About You', icon: User },
  { id: 2, label: 'Specialties', icon: Tag },
  { id: 3, label: 'Payments', icon: CreditCard },
  { id: 4, label: 'Launch', icon: Rocket },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    website: '',
    categories: [] as string[],
  });

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    await supabase
      .from('mp_profiles')
      .update({
        display_name: form.display_name || user.email?.split('@')[0] || 'User',
        bio: form.bio,
        website: form.website,
        categories: form.categories,
        is_seller: true,
        stripe_onboarded: stripeConnected,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    router.push('/dashboard');
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 13px',
    border: '1px solid #E7E5E4',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1C1917',
    background: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'var(--font-family-ui)',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', padding: '40px 24px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-family-display)', fontSize: '24px', fontWeight: 700 }}>
            <span style={{ color: '#4F46E5' }}>marketplace</span>
            <span style={{ color: '#A8A29E' }}>.ai</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            {STEPS.map(s => {
              const done = s.id < step;
              const active = s.id === step;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9999px',
                    background: done ? '#4F46E5' : active ? '#EEF2FF' : '#F5F5F4',
                    border: `2px solid ${done || active ? '#4F46E5' : '#E7E5E4'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: '120ms ease',
                  }}>
                    {done
                      ? <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                      : <s.icon size={16} color={active ? '#4F46E5' : '#A8A29E'} />
                    }
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: active ? 600 : 400, color: active ? '#4F46E5' : '#A8A29E' }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ height: '3px', background: '#E7E5E4', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: '#4F46E5',
              borderRadius: '9999px',
              width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
              transition: '400ms ease',
            }} />
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E7E5E4',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 1px 3px rgba(28,25,23,0.06)',
        }}>
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1C1917', marginBottom: '8px', fontFamily: 'var(--font-family-display)' }}>
                Tell us about yourself
              </h2>
              <p style={{ fontSize: '14px', color: '#57534E', marginBottom: '28px' }}>
                This information will appear on your seller profile.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                  Display name
                </label>
                <input
                  value={form.display_name}
                  onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                  placeholder="Alex Chen"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                  onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                  Bio <span style={{ color: '#A8A29E', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell buyers about yourself and your work..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' as const }}
                  onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                  onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                  Website <span style={{ color: '#A8A29E', fontWeight: 400 }}>(optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Globe size={15} color="#A8A29E" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://yoursite.com"
                    style={{ ...inputStyle, paddingLeft: '36px' }}
                    onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                    onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1C1917', marginBottom: '8px', fontFamily: 'var(--font-family-display)' }}>
                What types of templates do you build?
              </h2>
              <p style={{ fontSize: '14px', color: '#57534E', marginBottom: '24px' }}>
                Select all that apply. This helps buyers find your templates.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {CATEGORIES.map(cat => {
                  const selected = form.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        border: `2px solid ${selected ? '#4F46E5' : '#E7E5E4'}`,
                        background: selected ? '#EEF2FF' : '#FFFFFF',
                        color: selected ? '#4F46E5' : '#57534E',
                        fontSize: '13px',
                        fontWeight: selected ? 600 : 500,
                        cursor: 'pointer',
                        transition: '120ms ease',
                        fontFamily: 'var(--font-family-ui)',
                      }}
                    >
                      {selected && <Check size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1C1917', marginBottom: '8px', fontFamily: 'var(--font-family-display)' }}>
                Set up payments
              </h2>
              <p style={{ fontSize: '14px', color: '#57534E', marginBottom: '28px' }}>
                Connect Stripe to receive payouts when you sell templates. We use Stripe Connect for secure, direct payouts.
              </p>

              <div style={{
                padding: '20px',
                background: '#F5F5F4',
                borderRadius: '12px',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  {['70%', '30%', '0%'].map((pct, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: i === 0 ? '#4F46E5' : '#1C1917', fontFamily: 'var(--font-family-display)' }}>{pct}</div>
                      <div style={{ fontSize: '11px', color: '#57534E', marginTop: '2px' }}>
                        {i === 0 ? 'Your cut' : i === 1 ? 'Platform fee' : 'Hidden fees'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {stripeConnected ? (
                <div style={{
                  padding: '16px',
                  background: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '9999px', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#166534' }}>Stripe connected</div>
                    <div style={{ fontSize: '12px', color: '#166534' }}>You&apos;re ready to receive payments</div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setStripeConnected(true)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#635BFF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family-ui)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <CreditCard size={16} />
                  Connect with Stripe
                </button>
              )}

              <p style={{ marginTop: '12px', fontSize: '12px', color: '#A8A29E', textAlign: 'center' }}>
                You can also do this later from your dashboard settings.
              </p>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '9999px',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Rocket size={32} color="white" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1C1917', marginBottom: '12px', fontFamily: 'var(--font-family-display)' }}>
                You&apos;re all set!
              </h2>
              <p style={{ fontSize: '15px', color: '#57534E', marginBottom: '28px', lineHeight: 1.6 }}>
                Your seller profile is ready. Head to your dashboard to upload your first template and start earning.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginBottom: '28px' }}>
                {[
                  ['Profile', form.display_name || 'Set'],
                  ['Categories', form.categories.length > 0 ? form.categories.slice(0, 2).join(', ') + (form.categories.length > 2 ? '...' : '') : 'Not set'],
                  ['Payments', stripeConnected ? 'Stripe connected' : 'Not connected'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F5F5F4', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#57534E' }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #E7E5E4',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#57534E',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family-ui)',
                }}
              >
                Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                style={{
                  padding: '10px 24px',
                  background: '#4F46E5',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family-ui)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                style={{
                  padding: '10px 28px',
                  background: loading ? '#A8A29E' : '#4F46E5',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-family-ui)',
                }}
              >
                {loading ? 'Launching...' : 'Launch my profile'}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#A8A29E' }}>
          Step {step} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WaitlistSignupProps {
  dark?: boolean;
}

function WaitlistSignupInner({ dark = false }: WaitlistSignupProps) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const utmSource = searchParams.get('utm_source') || undefined;
  const utmMedium = searchParams.get('utm_medium') || undefined;
  const utmCampaign = searchParams.get('utm_campaign') || undefined;
  const referralCode = searchParams.get('ref') || undefined;

  const inputBg = dark ? '#1C1917' : '#FFFFFF';
  const inputBorder = dark ? 'rgba(255,255,255,0.12)' : '#E7E5E4';
  const inputColor = dark ? '#F5F5F4' : '#1C1917';
  const inputPlaceholder = dark ? '#57534E' : '#A8A29E';
  const labelColor = dark ? '#A8A29E' : '#57534E';
  const checkboxBg = dark ? '#1C1917' : '#FFFFFF';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/waitlist/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          isCreator,
          utmSource,
          utmMedium,
          utmCampaign,
          referralCode,
        }),
      });

      if (res.status === 409) {
        setStatus('duplicate');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '24px',
          borderRadius: '12px',
          backgroundColor: dark ? 'rgba(22, 163, 74, 0.1)' : '#F0FDF4',
          border: `1px solid ${dark ? 'rgba(22, 163, 74, 0.3)' : '#BBF7D0'}`,
          textAlign: 'center',
        }}
      >
        <CheckCircle size={32} color="#16A34A" />
        <div>
          <p style={{ fontWeight: 700, fontSize: '16px', color: dark ? '#F5F5F4' : '#1C1917', marginBottom: '4px' }}>
            Welcome to the waitlist!
          </p>
          <p style={{ fontSize: '14px', color: dark ? '#A8A29E' : '#57534E' }}>
            We&apos;ll be in touch when we launch.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'duplicate') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '24px',
          borderRadius: '12px',
          backgroundColor: dark ? 'rgba(79, 70, 229, 0.1)' : '#EEF2FF',
          border: `1px solid ${dark ? 'rgba(79, 70, 229, 0.3)' : '#C7D2FE'}`,
          textAlign: 'center',
        }}
      >
        <CheckCircle size={32} color="#4F46E5" />
        <div>
          <p style={{ fontWeight: 700, fontSize: '16px', color: dark ? '#F5F5F4' : '#1C1917', marginBottom: '4px' }}>
            You&apos;re already on the list!
          </p>
          <p style={{ fontSize: '14px', color: dark ? '#A8A29E' : '#57534E' }}>
            We&apos;ll notify you when we launch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '480px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === 'loading'}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '10px',
            border: `1px solid ${inputBorder}`,
            backgroundColor: inputBg,
            color: inputColor,
            fontSize: '15px',
            outline: 'none',
            transition: 'border-color 150ms ease',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#4F46E5')}
          onBlur={(e) => (e.currentTarget.style.borderColor = inputBorder)}
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          style={{
            backgroundColor: '#4F46E5',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: status === 'loading' || !email.trim() ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' || !email.trim() ? 0.7 : 1,
            transition: 'background-color 150ms ease, opacity 150ms ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (status !== 'loading') e.currentTarget.style.backgroundColor = '#3730A3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4F46E5';
          }}
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Joining...
            </>
          ) : (
            'Join Waitlist'
          )}
        </button>
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: '13px',
          color: labelColor,
          marginBottom: status === 'error' ? '8px' : '0',
        }}
      >
        <input
          type="checkbox"
          checked={isCreator}
          onChange={(e) => setIsCreator(e.target.checked)}
          style={{
            width: '16px',
            height: '16px',
            cursor: 'pointer',
            accentColor: '#4F46E5',
            backgroundColor: checkboxBg,
          }}
        />
        I&apos;m a template creator / builder
      </label>

      {status === 'error' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            color: '#DC2626',
            fontSize: '13px',
          }}
        >
          <AlertCircle size={14} />
          {errorMsg}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}

export default function WaitlistSignup(props: WaitlistSignupProps) {
  return (
    <Suspense fallback={
      <div style={{ width: '100%', maxWidth: '480px', height: '52px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
    }>
      <WaitlistSignupInner {...props} />
    </Suspense>
  );
}

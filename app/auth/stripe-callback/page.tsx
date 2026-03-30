'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function StripeCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code');
      const state = searchParams.get('state'); // profile ID
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(searchParams.get('error_description') || 'Stripe connection failed.');
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Invalid callback parameters.');
        return;
      }

      try {
        const res = await fetch('/api/stripe/connect-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, profileId: state }),
        });

        if (res.ok) {
          setStatus('success');
          setMessage('Stripe connected successfully! Redirecting to dashboard...');
          setTimeout(() => router.push('/dashboard/payouts'), 2000);
        } else {
          const data = await res.json();
          setStatus('error');
          setMessage(data.error || 'Failed to connect Stripe account.');
        }
      } catch {
        setStatus('error');
        setMessage('An unexpected error occurred.');
      }
    }

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E7E5E4',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
      }}>
        {status === 'loading' && (
          <>
            <Loader2 size={40} color="#4F46E5" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', marginBottom: '8px' }}>
              Connecting Stripe...
            </h2>
            <p style={{ fontSize: '14px', color: '#57534E' }}>
              Please wait while we connect your Stripe account.
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={40} color="#16A34A" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', marginBottom: '8px' }}>
              Stripe Connected!
            </h2>
            <p style={{ fontSize: '14px', color: '#57534E' }}>{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle size={40} color="#DC2626" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', marginBottom: '8px' }}>
              Connection Failed
            </h2>
            <p style={{ fontSize: '14px', color: '#57534E', marginBottom: '20px' }}>{message}</p>
            <button
              onClick={() => router.push('/dashboard/payouts')}
              style={{
                padding: '10px 20px',
                background: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-family-ui)',
              }}
            >
              Back to Payouts
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function StripeCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="#4F46E5" />
      </div>
    }>
      <StripeCallbackContent />
    </Suspense>
  );
}

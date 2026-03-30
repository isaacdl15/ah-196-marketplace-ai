'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Lock, AlertCircle } from 'lucide-react';

interface TemplateInfo {
  id: string;
  title: string;
  price_cents: number;
  is_free: boolean;
  description: string | null;
  category: string | null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get('templateId');

  const [template, setTemplate] = useState<TemplateInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    if (!templateId) return;
    fetch(`/api/templates/${templateId}`)
      .then(r => r.json())
      .then(d => { if (d.template) setTemplate(d.template); })
      .catch(() => setError('Failed to load template'));
  }, [templateId]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        router.push('/checkout/success?templateId=' + templateId);
      } else {
        // Stripe not configured — show success for free templates or demo flow
        if (template?.is_free) {
          router.push('/checkout/success?templateId=' + templateId);
        } else {
          setError(data.error || 'Payment processing unavailable. Please try again later.');
          setLoading(false);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const price = template ? (template.is_free ? 'Free' : `$${(template.price_cents / 100).toFixed(2)}`) : '...';

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
      {/* Nav */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E7E5E4', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/templates" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-family-display)', fontSize: '20px', fontWeight: 700 }}>
            <span style={{ color: '#4F46E5' }}>marketplace</span><span style={{ color: '#A8A29E' }}>.ai</span>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#57534E' }}>
          <Lock size={14} />
          Secure checkout
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '48px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1C1917', marginBottom: '8px', fontFamily: 'var(--font-family-display)' }}>
          Complete your purchase
        </h1>

        {template && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917' }}>{template.title}</div>
              <div style={{ fontSize: '12px', color: '#A8A29E', marginTop: '2px' }}>{template.category}</div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: template.is_free ? '#16A34A' : '#1C1917' }}>{price}</div>
          </div>
        )}

        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '28px' }}>
          <form onSubmit={handlePurchase}>
            {!template?.is_free && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Card number</label>
                  <input
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    style={{ width: '100%', height: '44px', border: '1px solid #E7E5E4', borderRadius: '10px', padding: '0 12px', fontSize: '15px', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Expiry</label>
                    <input
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      placeholder="MM / YY"
                      style={{ width: '100%', height: '44px', border: '1px solid #E7E5E4', borderRadius: '10px', padding: '0 12px', fontSize: '15px', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>CVC</label>
                    <input
                      value={cvc}
                      onChange={e => setCvc(e.target.value)}
                      placeholder="123"
                      style={{ width: '100%', height: '44px', border: '1px solid #E7E5E4', borderRadius: '10px', padding: '0 12px', fontSize: '15px', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div style={{ marginBottom: '16px', padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '14px', color: '#DC2626' }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !templateId}
              style={{
                width: '100%', padding: '14px 16px', background: loading ? '#A8A29E' : '#4F46E5',
                color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-family-ui)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <ShoppingCart size={16} />
              {loading ? 'Processing...' : template?.is_free ? 'Get for Free' : `Pay ${price}`}
            </button>
          </form>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#A8A29E' }}>
            <Lock size={12} />
            Secured by Stripe. We never store card details.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

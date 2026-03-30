import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Verify Email — marketplace.ai',
};

export default function VerifyEmailPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        <div style={{ marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-family-display)', fontSize: '26px', fontWeight: 700, color: '#1C1917', display: 'inline-flex' }}>
              <span style={{ color: '#4F46E5' }}>marketplace</span><span style={{ color: '#A8A29E' }}>.ai</span>
            </div>
          </Link>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '40px 32px', boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '9999px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Mail size={28} color="#4F46E5" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle size={20} color="#16A34A" />
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#16A34A' }}>Verification email sent</span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1C1917', marginBottom: '12px', fontFamily: 'var(--font-family-display)' }}>
            Check your inbox
          </h1>

          <p style={{ fontSize: '15px', color: '#57534E', lineHeight: 1.6, marginBottom: '24px' }}>
            We&apos;ve sent a verification link to your email. Click the link to verify your account and get started.
          </p>

          <div style={{ padding: '16px', background: '#F5F5F4', borderRadius: '10px', marginBottom: '24px', textAlign: 'left' }}>
            <p style={{ fontSize: '13px', color: '#57534E', lineHeight: 1.5, margin: 0 }}>
              <strong>What happens next:</strong><br />
              1. Verify your email<br />
              2. Complete your seller profile<br />
              3. Account reviewed (within 24h)<br />
              4. Connect Stripe and start publishing
            </p>
          </div>

          <Link
            href="/auth/login"
            style={{ display: 'inline-block', padding: '10px 24px', background: '#4F46E5', color: '#FFFFFF', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
          >
            Go to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

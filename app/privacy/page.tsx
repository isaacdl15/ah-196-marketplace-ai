import type { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — marketplace.ai',
  description: 'Learn how marketplace.ai collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <>
      <main
        style={{
          backgroundColor: '#FAFAF9',
          minHeight: '100vh',
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
              fontSize: '40px',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#1C1917',
              marginBottom: '8px',
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: '14px', color: '#A8A29E', marginBottom: '48px' }}>
            Last updated: March 29, 2026
          </p>

          {[
            {
              title: '1. Information We Collect',
              body: 'We collect information you provide directly to us, including your email address and whether you are a template creator. We also collect usage information, UTM parameters from the URL, and referral codes to understand how you found us.',
            },
            {
              title: '2. How We Use Your Information',
              body: 'We use the information we collect to: send you updates about marketplace.ai, notify you when we launch, provide early access and discounts to waitlist members, and improve our platform.',
            },
            {
              title: '3. Information Sharing',
              body: 'We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating the platform, provided they agree to keep your information confidential.',
            },
            {
              title: '4. Data Retention',
              body: 'We retain your email address and related information for as long as you are on our waitlist or until you request deletion. You may request removal from our waitlist at any time by contacting us.',
            },
            {
              title: '5. Security',
              body: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
            },
            {
              title: '6. Your Rights',
              body: 'You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at hello@marketplace.ai.',
            },
            {
              title: '7. Changes to This Policy',
              body: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated date.',
            },
            {
              title: '8. Contact',
              body: 'If you have questions about this Privacy Policy, please contact us at hello@marketplace.ai.',
            },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1C1917',
                  marginBottom: '8px',
                }}
              >
                {section.title}
              </h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#57534E', margin: 0 }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

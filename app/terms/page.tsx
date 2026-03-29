import type { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service — marketplace.ai',
  description: 'Terms and conditions for using marketplace.ai.',
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ fontSize: '14px', color: '#A8A29E', marginBottom: '48px' }}>
            Last updated: March 29, 2026
          </p>

          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By joining the marketplace.ai waitlist or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.',
            },
            {
              title: '2. Description of Service',
              body: 'marketplace.ai is a marketplace for production-ready Next.js application templates. We provide a platform for developers to buy and sell templates. Currently, we are operating a waitlist for early access.',
            },
            {
              title: '3. Waitlist',
              body: 'By joining our waitlist, you consent to receive email communications about marketplace.ai, including launch announcements and early access offers. You may unsubscribe at any time.',
            },
            {
              title: '4. Intellectual Property',
              body: 'Purchased templates are licensed for use in unlimited personal and commercial projects. You may not resell, redistribute, or sublicense template source code as a standalone product.',
            },
            {
              title: '5. Creator Program',
              body: 'Template creators retain ownership of their work and grant marketplace.ai a license to distribute their templates through our platform. Creator commission rates and terms will be provided upon acceptance into the creator program.',
            },
            {
              title: '6. Limitation of Liability',
              body: 'marketplace.ai is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.',
            },
            {
              title: '7. Changes to Terms',
              body: 'We reserve the right to modify these terms at any time. We will notify users of material changes via email or prominent notice on our website.',
            },
            {
              title: '8. Contact',
              body: 'For questions about these Terms of Service, contact us at hello@marketplace.ai.',
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

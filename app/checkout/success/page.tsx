import Link from 'next/link';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Purchase Complete — marketplace.ai',
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let template = null;
  if (params.templateId) {
    const { data } = await supabase
      .from('mp_templates')
      .select('id, title, slug, file_url, github_url')
      .eq('id', params.templateId)
      .single();
    template = data;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-family-display)', fontSize: '26px', fontWeight: 700, display: 'inline-flex' }}>
              <span style={{ color: '#4F46E5' }}>marketplace</span><span style={{ color: '#A8A29E' }}>.ai</span>
            </div>
          </Link>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '40px 32px', boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '9999px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={32} color="#16A34A" />
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1C1917', marginBottom: '8px', fontFamily: 'var(--font-family-display)' }}>
            Purchase complete!
          </h1>

          {template && (
            <p style={{ fontSize: '15px', color: '#57534E', marginBottom: '24px' }}>
              You now have access to <strong>{template.title}</strong>.
            </p>
          )}

          {(template?.file_url || template?.github_url) ? (
            <a
              href={template.file_url ?? template.github_url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="download-link"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', background: '#4F46E5', color: '#FFFFFF',
                borderRadius: '10px', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
                marginBottom: '16px',
              }}
            >
              <Download size={16} />
              Download Template
            </a>
          ) : (
            <div
              data-testid="download-link"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', background: '#4F46E5', color: '#FFFFFF',
                borderRadius: '10px', fontSize: '15px', fontWeight: 700,
                marginBottom: '16px', cursor: 'default',
              }}
            >
              <Download size={16} />
              Access your template
            </div>
          )}

          <div style={{ marginTop: '8px' }}>
            <Link
              href="/templates"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#57534E', textDecoration: 'none', fontWeight: 500 }}
            >
              Browse more templates <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ marginTop: '24px', padding: '12px', background: '#F5F5F4', borderRadius: '10px' }}>
            <p style={{ fontSize: '13px', color: '#57534E', margin: 0 }}>
              A receipt has been sent to your email. Access your purchases anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

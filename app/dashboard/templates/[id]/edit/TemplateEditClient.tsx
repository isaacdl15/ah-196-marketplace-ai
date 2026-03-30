'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Check, Loader2, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Next.js', 'React', 'SaaS Starter', 'E-commerce', 'Dashboard', 'Landing Page', 'Mobile', 'API/Backend'];
const TECH_OPTIONS = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Stripe', 'Prisma', 'Node.js', 'Express', 'GraphQL', 'PostgreSQL', 'React Native', 'Expo', 'Framer Motion', 'Redis'];

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price_cents: number;
  is_free: boolean;
  status: string;
  demo_url: string | null;
  github_url: string | null;
  tech_stack: string[] | null;
  features: string[] | null;
  tags: string[] | null;
}

interface Props {
  template: Template;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  border: '1px solid #E7E5E4',
  borderRadius: '10px',
  fontSize: '14px',
  color: '#1C1917',
  background: '#FAFAF9',
  fontFamily: 'var(--font-family-ui)',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  color: '#57534E',
  marginBottom: '6px',
};

export default function TemplateEditClient({ template }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: template.title ?? '',
    description: template.description ?? '',
    category: template.category ?? '',
    price_cents: template.price_cents ?? 0,
    is_free: template.is_free ?? false,
    demo_url: template.demo_url ?? '',
    github_url: template.github_url ?? '',
    tech_stack: template.tech_stack ?? [],
    features: (template.features ?? []).join('\n'),
    tags: (template.tags ?? []).join(', '),
  });

  const toggleTech = (tech: string) => {
    setForm(f => ({
      ...f,
      tech_stack: f.tech_stack.includes(tech)
        ? f.tech_stack.filter(t => t !== tech)
        : [...f.tech_stack, tech],
    }));
  };

  const handleSubmit = async (e: React.FormEvent, newStatus?: string) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.title || !form.category) {
      setError('Title and category are required');
      setLoading(false);
      return;
    }

    const updatePayload: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      category: form.category,
      price_cents: form.is_free ? 0 : form.price_cents,
      is_free: form.is_free,
      demo_url: form.demo_url || null,
      github_url: form.github_url || null,
      tech_stack: form.tech_stack,
      features: form.features.split('\n').filter(Boolean),
      tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    if (newStatus) {
      updatePayload.status = newStatus;
    }

    const { error: updateError } = await supabase
      .from('mp_templates')
      .update(updatePayload)
      .eq('id', template.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/dashboard/templates'), 1500);
  };

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href="/dashboard/templates" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#A8A29E', textDecoration: 'none', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Templates
          </Link>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
            Edit Template
          </h2>
          <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>
            Update your template details and settings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading}
            style={{
              padding: '10px 20px', background: 'white', border: '1px solid #E7E5E4',
              borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#1C1917',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-family-ui)',
              opacity: loading ? 0.6 : 1,
            }}
          >
            Save Draft
          </button>
          <button
            onClick={(e) => handleSubmit(e, 'under_review')}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: '#4F46E5', border: 'none',
              borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-family-ui)',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : success ? <Check size={15} /> : null}
            {success ? 'Saved!' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <X size={16} color="#DC2626" />
          <span style={{ fontSize: '14px', color: '#DC2626' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '20px' }}>Basic Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Template name</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="My Awesome Template"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what your template does..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={inputStyle}
                required
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="nextjs, typescript, dashboard"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '20px' }}>Pricing</h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '16px' }}>
            {[{ label: 'Free', value: true }, { label: 'Paid', value: false }].map(opt => (
              <label key={String(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#1C1917' }}>
                <input
                  type="radio"
                  name="pricing"
                  checked={form.is_free === opt.value}
                  onChange={() => setForm(f => ({ ...f, is_free: opt.value }))}
                  style={{ accentColor: '#4F46E5' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
          {!form.is_free && (
            <div>
              <label style={labelStyle}>Price (USD)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                <span style={{
                  padding: '10px 12px', background: '#F5F5F4', border: '1px solid #E7E5E4',
                  borderRight: 'none', borderRadius: '10px 0 0 10px', fontSize: '14px', color: '#57534E',
                }}>$</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={Math.round(form.price_cents / 100)}
                  onChange={e => setForm(f => ({ ...f, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                  placeholder="49"
                  style={{ ...inputStyle, borderRadius: '0 10px 10px 0', width: '120px' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tech Stack */}
        <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '16px' }}>Tech Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TECH_OPTIONS.map(tech => {
              const selected = form.tech_stack.includes(tech);
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTech(tech)}
                  style={{
                    padding: '7px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 500,
                    border: `1px solid ${selected ? '#4F46E5' : '#E7E5E4'}`,
                    background: selected ? '#EEF2FF' : 'white',
                    color: selected ? '#4F46E5' : '#57534E',
                    cursor: 'pointer', fontFamily: 'var(--font-family-ui)',
                    transition: 'all 150ms ease',
                  }}
                >
                  {selected && <Check size={12} style={{ marginRight: '4px', display: 'inline' }} />}
                  {tech}
                </button>
              );
            })}
          </div>
        </div>

        {/* Details */}
        <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '20px' }}>Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Features (one per line)</label>
              <textarea
                value={form.features}
                onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                placeholder={'Supabase auth included\nStripe payments ready\nMobile responsive'}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Demo URL</label>
              <input
                type="url"
                value={form.demo_url}
                onChange={e => setForm(f => ({ ...f, demo_url: e.target.value }))}
                placeholder="https://demo.example.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>GitHub Repository URL</label>
              <input
                type="url"
                value={form.github_url}
                onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
                placeholder="https://github.com/yourname/repo"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

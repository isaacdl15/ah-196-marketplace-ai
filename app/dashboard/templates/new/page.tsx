'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Check } from 'lucide-react';

const CATEGORIES = ['Next.js', 'React', 'SaaS Starter', 'E-commerce', 'Dashboard', 'Landing Page', 'Mobile', 'API/Backend'];
const TECH_OPTIONS = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Stripe', 'Prisma', 'Node.js', 'Express', 'GraphQL', 'PostgreSQL', 'React Native', 'Expo', 'Framer Motion', 'Redis'];

export default function NewTemplatePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price_cents: 0,
    is_free: false,
    demo_url: '',
    github_url: '',
    tech_stack: [] as string[],
    features: '',
    tags: '',
  });

  const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const toggleTech = (tech: string) => {
    setForm(f => ({
      ...f,
      tech_stack: f.tech_stack.includes(tech)
        ? f.tech_stack.filter(t => t !== tech)
        : [...f.tech_stack, tech],
    }));
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'under_review') => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.title || !form.category) {
      setError('Title and category are required');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { data: profile } = await supabase
      .from('mp_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      setError('Profile not found');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('mp_templates')
      .insert({
        seller_id: profile.id,
        title: form.title,
        slug: slug + '-' + Date.now().toString(36),
        description: form.description,
        category: form.category,
        price_cents: form.is_free ? 0 : form.price_cents,
        is_free: form.is_free,
        status,
        demo_url: form.demo_url || null,
        github_url: form.github_url || null,
        tech_stack: form.tech_stack,
        features: form.features.split('\n').filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/dashboard/templates'), 1500);
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

  const labelStyle = {
    display: 'block' as const,
    fontSize: '13px',
    fontWeight: 600 as const,
    color: '#1C1917',
    marginBottom: '6px',
  };

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '9999px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={28} color="#16A34A" strokeWidth={2.5} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917' }}>Template submitted!</h3>
        <p style={{ fontSize: '14px', color: '#57534E' }}>Redirecting to your templates...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
          Upload Template
        </h2>
        <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '4px' }}>
          Fill in the details for your template. It will go through a brief review before publishing.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '14px', color: '#DC2626', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={e => handleSubmit(e, 'under_review')}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '20px' }}>Basic Info</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="My Awesome SaaS Template"
              required
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#4F46E5')}
              onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
            />
            {form.title && (
              <p style={{ fontSize: '11px', color: '#A8A29E', marginTop: '4px' }}>
                Slug: <span style={{ fontWeight: 600 }}>{slug}</span>
              </p>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="A concise description of what your template includes and who it's for..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' as const }}
              onFocus={e => (e.target.style.borderColor = '#4F46E5')}
              onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                required
                style={{ ...inputStyle, appearance: 'none' as const }}
                onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="saas, nextjs, stripe"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
              />
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '20px' }}>Pricing</h3>

          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, is_free: !f.is_free }))}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', background: form.is_free ? '#EEF2FF' : '#F5F5F4',
                border: `1px solid ${form.is_free ? '#4F46E5' : '#E7E5E4'}`,
                borderRadius: '10px', cursor: 'pointer', width: '100%', textAlign: 'left',
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '4px',
                border: `2px solid ${form.is_free ? '#4F46E5' : '#D6D3D1'}`,
                background: form.is_free ? '#4F46E5' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {form.is_free && <Check size={10} color="white" />}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>This template is free</span>
            </button>
          </div>

          {!form.is_free && (
            <div>
              <label style={labelStyle}>Price (USD)</label>
              <div style={{ position: 'relative', maxWidth: '200px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', fontSize: '14px' }}>$</span>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={form.price_cents / 100 || ''}
                  onChange={e => setForm(f => ({ ...f, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                  placeholder="29"
                  style={{ ...inputStyle, paddingLeft: '24px' }}
                  onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                  onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '20px' }}>Tech Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TECH_OPTIONS.map(tech => {
              const sel = form.tech_stack.includes(tech);
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTech(tech)}
                  style={{
                    padding: '5px 12px', borderRadius: '9999px',
                    border: `1.5px solid ${sel ? '#4F46E5' : '#E7E5E4'}`,
                    background: sel ? '#EEF2FF' : '#FFFFFF',
                    color: sel ? '#4F46E5' : '#57534E',
                    fontSize: '12px', fontWeight: sel ? 600 : 500,
                    cursor: 'pointer', transition: '120ms ease',
                    fontFamily: 'var(--font-family-ui)',
                  }}
                >
                  {sel && <Check size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />}
                  {tech}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '20px' }}>Links & Features</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Demo URL</label>
              <input
                value={form.demo_url}
                onChange={e => setForm(f => ({ ...f, demo_url: e.target.value }))}
                placeholder="https://demo.example.com"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
              />
            </div>
            <div>
              <label style={labelStyle}>GitHub URL</label>
              <input
                value={form.github_url}
                onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
                placeholder="https://github.com/user/repo"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#4F46E5')}
                onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Features (one per line)</label>
            <textarea
              value={form.features}
              onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
              placeholder="Authentication system&#10;Stripe billing&#10;Admin dashboard&#10;Email templates"
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' as const }}
              onFocus={e => (e.target.style.borderColor = '#4F46E5')}
              onBlur={e => (e.target.style.borderColor = '#E7E5E4')}
            />
          </div>

          {/* File upload placeholder */}
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Template Files</label>
            <div style={{
              border: '2px dashed #E7E5E4', borderRadius: '10px', padding: '32px',
              textAlign: 'center', background: '#FAFAF9',
            }}>
              <Upload size={24} color="#A8A29E" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', color: '#57534E', marginBottom: '4px' }}>Drop files here or click to upload</p>
              <p style={{ fontSize: '12px', color: '#A8A29E' }}>ZIP file, max 100MB</p>
              <button
                type="button"
                style={{
                  marginTop: '12px', padding: '8px 16px',
                  border: '1px solid #E7E5E4', borderRadius: '8px',
                  background: '#FFFFFF', color: '#57534E', fontSize: '13px',
                  fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-family-ui)',
                }}
              >
                Choose file
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={e => handleSubmit(e as unknown as React.FormEvent, 'draft')}
            disabled={loading}
            style={{
              padding: '11px 20px', border: '1px solid #E7E5E4', borderRadius: '10px',
              background: '#FFFFFF', color: '#57534E', fontSize: '14px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-family-ui)',
            }}
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '11px 24px', background: loading ? '#A8A29E' : '#4F46E5',
              border: 'none', borderRadius: '10px', color: '#FFFFFF',
              fontSize: '14px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-family-ui)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <Upload size={15} />
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

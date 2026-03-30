'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Star, Download, ArrowUpDown } from 'lucide-react';

const CATEGORIES = ['All', 'Next.js', 'React', 'SaaS Starter', 'E-commerce', 'Dashboard', 'Landing Page', 'Mobile', 'API/Backend'];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

interface Template {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  price_cents: number;
  is_free: boolean;
  downloads: number;
  rating_avg: number | null;
  rating_count: number;
  tech_stack: string[] | null;
  mp_profiles: { display_name: string; username: string | null; avatar_url: string | null } | null;
}

function getPreviewColor(category: string | null): { bg: string; accent: string; text: string } {
  const map: Record<string, { bg: string; accent: string; text: string }> = {
    'SaaS Starter': { bg: '#EEF2FF', accent: '#4F46E5', text: '#3730A3' },
    'Dashboard': { bg: '#F0FDF4', accent: '#16A34A', text: '#166534' },
    'Landing Page': { bg: '#FEF3C7', accent: '#D97706', text: '#92400E' },
    'E-commerce': { bg: '#FDF4FF', accent: '#9333EA', text: '#6B21A8' },
    'Next.js': { bg: '#F0F9FF', accent: '#0284C7', text: '#075985' },
    'React': { bg: '#ECFDF5', accent: '#059669', text: '#065F46' },
    'Mobile': { bg: '#FFF7ED', accent: '#EA580C', text: '#9A3412' },
    'API/Backend': { bg: '#1C1917', accent: '#A8A29E', text: '#D6D3D1' },
  };
  return map[category ?? ''] ?? { bg: '#F5F5F4', accent: '#4F46E5', text: '#1C1917' };
}

function BrowserMockup({ template }: { template: Template }) {
  const colors = getPreviewColor(template.category);
  return (
    <div style={{
      background: '#E7E5E4',
      borderRadius: '10px 10px 0 0',
      overflow: 'hidden',
      aspectRatio: '16/9',
      position: 'relative',
    }}>
      {/* Browser chrome */}
      <div style={{
        background: '#F5F5F4',
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderBottom: '1px solid #E7E5E4',
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: '#F87171' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: '#FCD34D' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: '#4ADE80' }} />
        <div style={{
          flex: 1,
          background: '#FFFFFF',
          borderRadius: '4px',
          padding: '3px 8px',
          fontSize: '10px',
          color: '#A8A29E',
          marginLeft: '6px',
        }}>
          marketplace.ai/template/{template.slug}
        </div>
      </div>
      {/* Content preview */}
      <div style={{
        background: colors.bg,
        flex: 1,
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        height: 'calc(100% - 33px)',
      }}>
        {/* Simulated nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '6px', background: colors.accent, borderRadius: '3px', opacity: 0.7 }} />
          <div style={{ display: 'flex', gap: '6px' }}>
            {[40, 30, 50].map((w, i) => (
              <div key={i} style={{ width: `${w}px`, height: '4px', background: colors.text, borderRadius: '2px', opacity: 0.2 }} />
            ))}
          </div>
        </div>
        {/* Hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
          <div style={{ width: '70%', height: '8px', background: colors.text, borderRadius: '4px', opacity: 0.7 }} />
          <div style={{ width: '50%', height: '6px', background: colors.text, borderRadius: '3px', opacity: 0.4 }} />
          <div style={{ width: '35%', height: '6px', background: colors.text, borderRadius: '3px', opacity: 0.3 }} />
          <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
            <div style={{ width: '70px', height: '22px', background: colors.accent, borderRadius: '6px' }} />
            <div style={{ width: '70px', height: '22px', background: 'transparent', border: `1px solid ${colors.accent}`, borderRadius: '6px' }} />
          </div>
        </div>
        {/* Category badge */}
        <div style={{
          display: 'inline-block',
          alignSelf: 'flex-start',
          padding: '3px 8px',
          background: colors.accent,
          color: '#FFFFFF',
          borderRadius: '4px',
          fontSize: '9px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {template.category}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const seller = template.mp_profiles;
  const rating = Number(template.rating_avg ?? 0);

  return (
    <Link href={`/template/${template.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E7E5E4',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: '200ms ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 40px rgba(28,25,23,0.10), 0 2px 8px rgba(28,25,23,0.06)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        <BrowserMockup template={template} />

        <div style={{ padding: '16px' }}>
          {/* Title + price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', lineHeight: 1.3, flex: 1, marginRight: '8px' }}>
              {template.title}
            </h3>
            <div style={{
              fontSize: '15px',
              fontWeight: 700,
              color: template.is_free ? '#16A34A' : '#1C1917',
              flexShrink: 0,
            }}>
              {template.is_free ? 'Free' : `$${(template.price_cents / 100).toFixed(0)}`}
            </div>
          </div>

          {/* Description */}
          <p style={{ fontSize: '13px', color: '#57534E', lineHeight: 1.5, marginBottom: '12px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            {template.description}
          </p>

          {/* Tech stack pills */}
          {template.tech_stack && template.tech_stack.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
              {template.tech_stack.slice(0, 3).map(tech => (
                <span key={tech} style={{
                  padding: '2px 8px',
                  background: '#F5F5F4',
                  color: '#57534E',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 500,
                }}>
                  {tech}
                </span>
              ))}
              {template.tech_stack.length > 3 && (
                <span style={{ padding: '2px 8px', background: '#F5F5F4', color: '#A8A29E', borderRadius: '6px', fontSize: '11px' }}>
                  +{template.tech_stack.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer: creator + stats */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '9999px',
                background: '#EEF2FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: '#4F46E5',
              }}>
                {(seller?.display_name ?? 'U').slice(0, 1).toUpperCase()}
              </div>
              <span style={{ fontSize: '12px', color: '#57534E', fontWeight: 500 }}>
                {seller?.display_name ?? 'Unknown'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#57534E' }}>
                <Star size={12} fill="#D97706" color="#D97706" />
                <span style={{ fontWeight: 600 }}>{rating.toFixed(1)}</span>
                <span style={{ color: '#A8A29E' }}>({template.rating_count})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#A8A29E' }}>
                <Download size={11} />
                {template.downloads >= 1000 ? `${(template.downloads / 1000).toFixed(1)}k` : template.downloads}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BrowseClient({
  templates,
  initialCategory,
  initialSort,
  initialQ,
}: {
  templates: Template[];
  initialCategory?: string;
  initialSort?: string;
  initialQ?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(initialQ ?? '');
  const [activeCategory, setActiveCategory] = useState(initialCategory ?? 'All');
  const [sort, setSort] = useState(initialSort ?? 'popular');

  const navigate = (cat: string, s: string, q: string) => {
    const params = new URLSearchParams();
    if (cat !== 'All') params.set('category', cat);
    if (s !== 'popular') params.set('sort', s);
    if (q) params.set('q', q);
    startTransition(() => {
      router.push('/browse' + (params.toString() ? '?' + params.toString() : ''));
    });
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    navigate(cat, sort, search);
  };

  const handleSortChange = (s: string) => {
    setSort(s);
    navigate(activeCategory, s, search);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(activeCategory, sort, search);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E7E5E4', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ fontFamily: 'var(--font-family-display)', fontSize: '20px', fontWeight: 700 }}>
                <span style={{ color: '#4F46E5' }}>marketplace</span>
                <span style={{ color: '#A8A29E' }}>.ai</span>
              </div>
            </Link>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/auth/login" style={{
                padding: '8px 16px',
                border: '1px solid #E7E5E4',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#57534E',
                textDecoration: 'none',
              }}>Sign in</Link>
              <Link href="/auth/signup" style={{
                padding: '8px 16px',
                background: '#4F46E5',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                textDecoration: 'none',
              }}>Get started</Link>
            </div>
          </div>

          {/* Filters row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: `1.5px solid ${activeCategory === cat ? '#4F46E5' : '#E7E5E4'}`,
                    background: activeCategory === cat ? '#4F46E5' : '#FFFFFF',
                    color: activeCategory === cat ? '#FFFFFF' : '#57534E',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: '120ms ease',
                    fontFamily: 'var(--font-family-ui)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} color="#57534E" />
              <select
                value={sort}
                onChange={e => handleSortChange(e.target.value)}
                style={{
                  padding: '6px 28px 6px 8px',
                  border: '1px solid #E7E5E4',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#57534E',
                  background: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family-ui)',
                  appearance: 'none' as const,
                }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#A8A29E" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search templates..."
                  style={{
                    padding: '6px 12px 6px 30px',
                    border: '1px solid #E7E5E4',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#1C1917',
                    background: '#FFFFFF',
                    outline: 'none',
                    width: '180px',
                    fontFamily: 'var(--font-family-ui)',
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  background: '#4F46E5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family-ui)',
                }}
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
            {activeCategory === 'All' ? 'All Templates' : activeCategory}
            <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 400, color: '#A8A29E' }}>
              {templates.length} results
            </span>
          </h1>
        </div>

        {templates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1C1917', marginBottom: '8px' }}>No templates found</h3>
            <p style={{ fontSize: '14px', color: '#57534E' }}>Try a different category or search term.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}>
            {templates.map(t => <TemplateCard key={t.id} template={t} />)}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .template-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .template-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

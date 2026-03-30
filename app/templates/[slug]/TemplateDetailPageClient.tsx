'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Download, Check, ArrowLeft, Globe, Github, ShoppingCart } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

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
  features: string[] | null;
  demo_url: string | null;
  github_url: string | null;
  mp_profiles: {
    display_name: string;
    username: string | null;
    bio: string | null;
    avatar_url: string | null;
    categories: string[] | null;
  } | null;
}

function BrowserPreview({ template }: { template: Template }) {
  const colorMap: Record<string, string> = {
    'SaaS Starter': '#4F46E5', 'Dashboard': '#16A34A', 'Landing Page': '#D97706',
    'E-commerce': '#9333EA', 'Next.js': '#0284C7', 'React': '#059669',
    'Mobile': '#EA580C', 'API/Backend': '#1C1917',
  };
  const accent = colorMap[template.category ?? ''] ?? '#4F46E5';

  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ background: '#F5F5F4', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #E7E5E4' }}>
        {['#F87171', '#FCD34D', '#4ADE80'].map((c, i) => (
          <div key={i} style={{ width: '10px', height: '10px', borderRadius: '9999px', background: c }} />
        ))}
        <div style={{ flex: 1, background: '#FFFFFF', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#A8A29E' }}>
          marketplace.ai/templates/{template.slug}
        </div>
        {template.demo_url && (
          <a href={template.demo_url} target="_blank" rel="noopener noreferrer" data-testid="demo-link" style={{ color: '#57534E' }}>
            <Globe size={14} />
          </a>
        )}
      </div>
      <div style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}08)`, padding: '48px 32px', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <span style={{ padding: '4px 12px', background: accent, color: '#FFFFFF', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const }}>
            {template.category}
          </span>
          {template.is_free && (
            <span style={{ padding: '4px 12px', background: '#16A34A', color: '#FFFFFF', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const }}>
              Free
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1C1917', fontFamily: 'var(--font-family-display)', lineHeight: 1.2 }}>{template.title}</h1>
        <p style={{ fontSize: '16px', color: '#57534E', maxWidth: '480px', lineHeight: 1.6 }}>{template.description}</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {template.tech_stack?.map(tech => (
            <span key={tech} style={{ padding: '4px 12px', background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: '#57534E' }}>{tech}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TemplateDetailPageClient({ template, reviews, isLoggedIn }: { template: Template; reviews: Review[]; isLoggedIn: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [purchasing, setPurchasing] = useState(false);

  const seller = template.mp_profiles;
  const rating = Number(template.rating_avg ?? 0);
  const price = template.is_free ? 'Free' : `$${(template.price_cents / 100).toFixed(0)}`;

  const handleBuy = () => {
    if (!isLoggedIn) {
      router.push(`/auth/signup?redirect=/templates/${template.slug}`);
      return;
    }
    setPurchasing(true);
    router.push(`/checkout?templateId=${template.id}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9' }}>
      {/* Nav */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E7E5E4', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/templates" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#57534E', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
          <ArrowLeft size={16} />
          Templates
        </Link>
        <div style={{ flex: 1, fontFamily: 'var(--font-family-display)', fontSize: '18px', fontWeight: 700 }}>
          <span style={{ color: '#4F46E5' }}>marketplace</span><span style={{ color: '#A8A29E' }}>.ai</span>
        </div>
        {!isLoggedIn && (
          <Link href="/auth/login" style={{ padding: '7px 16px', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#57534E', textDecoration: 'none' }}>Sign in</Link>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>
        <div>
          <BrowserPreview template={template} />

          <div style={{ display: 'flex', gap: '0', marginTop: '28px', borderBottom: '2px solid #E7E5E4' }}>
            {(['overview', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? '#4F46E5' : 'transparent'}`,
                  color: activeTab === tab ? '#4F46E5' : '#57534E',
                  fontSize: '14px', fontWeight: activeTab === tab ? 600 : 500, cursor: 'pointer',
                  marginBottom: '-2px', fontFamily: 'var(--font-family-ui)', textTransform: 'capitalize' as const,
                }}
              >
                {tab} {tab === 'reviews' && `(${template.rating_count})`}
              </button>
            ))}
          </div>

          <div style={{ padding: '28px 0' }}>
            {activeTab === 'overview' && (
              <div>
                {template.features && template.features.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1C1917', marginBottom: '16px' }}>What&apos;s included</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {template.features.map(feature => (
                        <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '9999px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check size={12} color="#4F46E5" strokeWidth={2.5} />
                          </div>
                          <span style={{ fontSize: '14px', color: '#57534E' }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {seller && (
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1C1917', marginBottom: '16px' }}>About the seller</h3>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '20px', background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '9999px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#4F46E5', flexShrink: 0 }}>
                        {seller.display_name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>{seller.display_name}</div>
                        {seller.bio && <p style={{ fontSize: '13px', color: '#57534E', marginTop: '4px', lineHeight: 1.5 }}>{seller.bio}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#A8A29E', fontSize: '14px' }}>No reviews yet. Be the first to review!</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviews.map(r => (
                      <div key={r.id} style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} size={14} fill={n <= r.rating ? '#D97706' : 'none'} color={n <= r.rating ? '#D97706' : '#E7E5E4'} />
                          ))}
                        </div>
                        {r.review_text && <p style={{ fontSize: '14px', color: '#57534E', lineHeight: 1.5 }}>{r.review_text}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right sticky card */}
        <div>
          <div style={{ position: 'sticky', top: '24px', background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: template.is_free ? '#16A34A' : '#1C1917', fontFamily: 'var(--font-family-display)' }}>{price}</div>
              {!template.is_free && <p style={{ fontSize: '12px', color: '#A8A29E', marginTop: '2px' }}>One-time purchase, lifetime access</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: '#F5F5F4', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Star size={14} fill="#D97706" color="#D97706" />
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917' }}>{rating.toFixed(1)}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#A8A29E' }}>{template.rating_count} reviews</div>
              </div>
              <div style={{ padding: '12px', background: '#F5F5F4', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Download size={14} color="#57534E" />
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917' }}>
                    {template.downloads >= 1000 ? `${(template.downloads / 1000).toFixed(1)}k` : template.downloads}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#A8A29E' }}>downloads</div>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={purchasing}
              style={{
                width: '100%', padding: '14px 16px', background: purchasing ? '#A8A29E' : '#4F46E5',
                color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700,
                cursor: purchasing ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-family-ui)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginBottom: '12px',
              }}
            >
              <ShoppingCart size={16} />
              {purchasing ? 'Processing...' : template.is_free ? 'Get for Free' : 'Buy Now'}
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {template.demo_url && (
                <a href={template.demo_url} target="_blank" rel="noopener noreferrer" data-testid="demo-link"
                  style={{ flex: 1, padding: '9px', border: '1px solid #E7E5E4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: '#57534E', textDecoration: 'none' }}>
                  <Globe size={13} /> Live Demo
                </a>
              )}
              {template.github_url && (
                <a href={template.github_url} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, padding: '9px', border: '1px solid #E7E5E4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: '#57534E', textDecoration: 'none' }}>
                  <Github size={13} /> Source
                </a>
              )}
            </div>
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#A8A29E', textAlign: 'center', lineHeight: 1.5 }}>
              Secure payment via Stripe. Instant access after purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

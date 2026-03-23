'use client';

import { useEffect } from 'react';
import { Link2, Instagram, Youtube, Video, Mail, Globe, Package, ExternalLink } from 'lucide-react';

interface Creator { id: string; display_name: string; username: string; bio: string | null; niche: string | null; avatar_url: string | null; page_theme_color: string; page_bg: string; }
interface Link { id: string; link_type: string; title: string; url: string; }
interface Product { id: string; name: string; product_type: string; price_cents: number; is_free: boolean; cover_image_url: string | null; }

const LINK_ICONS: Record<string, React.ElementType> = {
  link: Link2, instagram: Instagram, youtube: Youtube, tiktok: Video, email: Mail, other: Globe,
};

const BG_COLORS: Record<string, string> = {
  'warm-cream': '#FDFAF6',
  'white': '#FFFFFF',
  'dark': '#1A1208',
};

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatMoney(cents: number, isFree: boolean) {
  if (isFree) return 'Free';
  return '$' + (cents / 100).toFixed(2);
}

export default function PublicCreatorPage({ creator, links, products }: { creator: Creator; links: Link[]; products: Product[] }) {
  const accent = creator.page_theme_color ?? '#C75B40';
  const bg = BG_COLORS[creator.page_bg] ?? '#FDFAF6';
  const isDark = creator.page_bg === 'dark';
  const textColor = isDark ? 'rgba(255,255,255,0.90)' : '#1A1208';
  const subColor = isDark ? 'rgba(255,255,255,0.60)' : '#9E8B7A';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E8DDD2';

  useEffect(() => {
    // Fire page view analytics
    fetch('/api/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId: creator.id, referrer: document.referrer }),
    }).catch(() => {});
  }, [creator.id]);

  const handleLinkClick = (linkId: string) => {
    fetch('/api/link-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId: creator.id, linkId, referrer: document.referrer }),
    }).catch(() => {});
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', fontFamily: 'var(--font-ui)' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Profile header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt={creator.display_name} style={{ width: '80px', height: '80px', borderRadius: '9999px', objectFit: 'cover', outline: `3px solid ${accent}`, outlineOffset: '3px' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '9999px', background: isDark ? 'rgba(255,255,255,0.10)' : '#F5D1C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: accent, outline: `3px solid ${accent}`, outlineOffset: '3px', fontFamily: 'var(--font-ui)' }}>
                {initials(creator.display_name)}
              </div>
            )}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: textColor, marginBottom: '6px' }}>{creator.display_name}</h1>
          <p style={{ fontSize: '14px', fontWeight: 500, color: subColor, marginBottom: '8px' }}>@{creator.username}</p>
          {creator.bio && <p style={{ fontSize: '15px', color: isDark ? 'rgba(255,255,255,0.75)' : '#5A4839', maxWidth: '360px', margin: '0 auto 16px', lineHeight: '1.6' }}>{creator.bio}</p>}
          {creator.niche && (
            <span style={{ display: 'inline-block', background: `${accent}20`, color: accent, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 14px', borderRadius: '9999px' }}>
              {creator.niche.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: products.length > 0 ? '0' : '40px' }}>
          {links.map(link => {
            const Icon = LINK_ICONS[link.link_type] ?? Link2;
            const href = link.link_type === 'email' && !link.url.startsWith('mailto:') ? `mailto:${link.url}` : link.url;
            return (
              <a key={link.id} href={href} target="_blank" rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'white',
                  border: `1.5px solid ${borderColor}`, borderRadius: '12px',
                  height: '56px', padding: '0 20px', textDecoration: 'none',
                  color: textColor, fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-ui)',
                  transition: 'all 130ms', cursor: 'pointer',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${accent}10`; (e.currentTarget as HTMLElement).style.borderColor = `${accent}60`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.08)' : 'white'; (e.currentTarget as HTMLElement).style.borderColor = borderColor; }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              >
                <Icon size={20} color={accent} strokeWidth={1.5} />
                {link.title}
              </a>
            );
          })}
        </div>

        {/* Products */}
        {products.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ borderTop: `1px solid ${borderColor}`, marginBottom: '20px' }} />
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: subColor, textAlign: 'center', marginBottom: '12px' }}>
              From {creator.display_name.split(' ')[0]}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'white', border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.10)' : '#F5EEE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={24} color={accent} strokeWidth={1.5} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: subColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {p.product_type.replace('_', ' ')}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: accent, marginBottom: '4px', fontFamily: 'var(--font-display)' }}>{formatMoney(p.price_cents, p.is_free)}</div>
                    <button style={{ background: accent, color: 'white', border: 'none', borderRadius: '8px', padding: '5px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                      Get it
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Powered by */}
        <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: subColor }}>Powered by </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, fontStyle: 'italic', color: accent }}>Sirena</span>
        </div>
      </div>
    </div>
  );
}

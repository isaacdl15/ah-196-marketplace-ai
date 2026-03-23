'use client';

import { DollarSign, Eye, MousePointerClick, Package, Sparkles, X, ExternalLink, Link2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
  creator: { display_name: string; username: string; plan: string } | null;
  totalEarningsCents: number;
  pageViews30d: number;
  linkClicks30d: number;
  productsSold: number;
  recentSales: { net_cents: number; status: string; created_at: string }[];
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ElementType; accent?: boolean }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px',
      padding: '20px', boxShadow: 'var(--shadow-elev-1)', position: 'relative', overflow: 'hidden'
    }}>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#C75B40', borderRadius: '16px 16px 0 0' }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', marginTop: accent ? '8px' : 0 }}>
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A' }}>{label}</span>
        <Icon size={16} strokeWidth={1.5} color="#9E8B7A" />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: accent ? '40px' : '36px', fontWeight: 700, color: accent ? '#C75B40' : '#1A1208', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

function formatMoney(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardHome({ creator, totalEarningsCents, pageViews30d, linkClicks30d, productsSold, recentSales }: Props) {
  return (
    <div>
      {/* Welcome banner (shown for empty stats) */}
      {totalEarningsCents === 0 && pageViews30d === 0 && (
        <div style={{ background: 'linear-gradient(135deg, #FDF0EC 0%, #FDFAF6 100%)', border: '1px solid rgba(199,91,64,0.25)', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Sparkles size={32} color="#C75B40" strokeWidth={1.5} />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208', marginBottom: '4px' }}>Welcome to Sirena, {creator?.display_name?.split(' ')[0] ?? 'Creator'}!</h3>
            <p style={{ fontSize: '14px', color: '#5A4839' }}>Your creator dashboard is ready. Add your first link to start growing.</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Earnings" value={formatMoney(totalEarningsCents)} icon={DollarSign} accent />
        <StatCard label="Page Views (30d)" value={pageViews30d.toLocaleString()} icon={Eye} />
        <StatCard label="Link Clicks (30d)" value={linkClicks30d.toLocaleString()} icon={MousePointerClick} />
        <StatCard label="Products Sold" value={productsSold.toLocaleString()} icon={Package} />
      </div>

      {/* Two-column section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Recent activity */}
        <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-elev-1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208' }}>Recent activity</h3>
            <Link href="/dashboard/earnings" style={{ fontSize: '13px', color: '#C75B40', textDecoration: 'none', fontWeight: 500 }}>View all</Link>
          </div>
          {recentSales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <DollarSign size={48} strokeWidth={1} color="#9E8B7A" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#5A4839', marginBottom: '6px' }}>No activity yet</p>
              <p style={{ fontSize: '14px', color: '#9E8B7A' }}>Share your page to start getting visitors.</p>
            </div>
          ) : (
            recentSales.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', height: '40px', borderBottom: i < recentSales.length - 1 ? '1px solid #F5EEE6' : 'none' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9999px', background: '#F5EEE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', flexShrink: 0 }}>
                  <DollarSign size={16} color="#C75B40" strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A1208' }}>Sale — {formatMoney(s.net_cents)}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#9E8B7A', marginLeft: 'auto' }}>{timeAgo(s.created_at)}</span>
              </div>
            ))
          )}
        </div>

        {/* Quick links */}
        <div style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-elev-1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1208', marginBottom: '16px' }}>My page</h3>
          <div style={{ background: '#F5EEE6', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ flex: 1, fontSize: '13px', fontFamily: 'monospace', color: '#1A1208', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              sirena.fyi/@{creator?.username ?? 'you'}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(`https://sirena.fyi/@${creator?.username ?? ''}`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <Link2 size={14} color="#9E8B7A" />
            </button>
          </div>
          <Link href={`/${creator?.username ?? ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', height: '40px', background: '#C75B40', color: 'white', textDecoration: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            <ExternalLink size={14} /> View page
          </Link>
          <div style={{ borderTop: '1px solid #E8DDD2', margin: '16px 0' }} />
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1208', marginBottom: '8px' }}>Quick add</p>
          {[
            { href: '/dashboard/links', icon: Link2, label: '+ Add link' },
            { href: '/dashboard/products', icon: Package, label: '+ Add product' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', height: '36px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 12px', textDecoration: 'none', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '6px', background: 'white', transition: '120ms ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5EEE6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}>
              <Icon size={14} /> {label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 639px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, Package, DollarSign, BarChart3, Settings,
  ShieldCheck, Users, TrendingUp, CreditCard, X, LogOut, ShoppingBag, Upload,
  Gift, ListChecks
} from 'lucide-react';

interface SidebarProps {
  creator: {
    id: string;
    display_name: string;
    username: string;
    plan: string;
    is_admin: boolean;
  };
  open?: boolean;
  onClose?: () => void;
}

const NAV_MAIN = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/templates', label: 'Templates', icon: Package },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/dashboard/payouts', label: 'Payouts', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const NAV_ADMIN = [
  { href: '/admin', label: 'Admin overview', icon: ShieldCheck },
  { href: '/admin/waitlist', label: 'Waitlist', icon: ListChecks },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/templates', label: 'All Templates', icon: TrendingUp },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/referrals', label: 'Referrals', icon: Gift },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Sidebar({ creator, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const PRIMARY = '#4F46E5';
  const PRIMARY_BG = '#EEF2FF';

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 25 }}
        />
      )}

      <aside
        className={`app-sidebar${open ? ' open' : ''}`}
        style={{ zIndex: 30 }}
      >
        {/* Logo */}
        <div style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E7E5E4' }}>
          <Link href="/browse" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingBag size={18} color={PRIMARY} />
            <div style={{ fontFamily: 'var(--font-family-display)', fontSize: '18px', fontWeight: 700, color: '#1C1917' }}>
              <span style={{ color: PRIMARY }}>marketplace</span>
              <span style={{ color: '#A8A29E' }}>.ai</span>
            </div>
          </Link>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', padding: '4px', display: 'none' }} className="sidebar-close">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Upload CTA */}
        <div style={{ padding: '12px' }}>
          <Link href="/dashboard/templates/new" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 12px', background: PRIMARY, borderRadius: '10px',
              color: '#FFFFFF', fontSize: '13px', fontWeight: 600,
              fontFamily: 'var(--font-family-ui)',
            }}>
              <Upload size={14} />
              Upload Template
            </div>
          </Link>
        </div>

        {/* Main nav */}
        <div style={{ flex: 1, padding: '4px 0', overflowY: 'auto' }}>
          <div style={{ padding: '12px 12px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E' }}>
            Seller
          </div>
          {NAV_MAIN.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', height: '38px',
                padding: '0 12px', margin: '1px 8px', borderRadius: '8px',
                textDecoration: 'none', transition: '120ms ease',
                background: isActive(href) ? PRIMARY_BG : 'transparent',
                color: isActive(href) ? PRIMARY : '#57534E',
                fontWeight: isActive(href) ? 600 : 500,
                fontSize: '13px', fontFamily: 'var(--font-family-ui)',
              }}
              onMouseEnter={e => { if (!isActive(href)) { (e.currentTarget as HTMLElement).style.background = '#F5F5F4'; } }}
              onMouseLeave={e => { if (!isActive(href)) { (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
            >
              <Icon size={16} strokeWidth={isActive(href) ? 2 : 1.5} color={isActive(href) ? PRIMARY : undefined} />
              {label}
            </Link>
          ))}

          {creator.is_admin && (
            <>
              <div style={{ padding: '16px 12px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A8A29E', marginTop: '8px' }}>
                Admin
              </div>
              {NAV_ADMIN.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', height: '38px',
                    padding: '0 12px', margin: '1px 8px', borderRadius: '8px',
                    textDecoration: 'none', transition: '120ms ease',
                    background: isActive(href) ? PRIMARY_BG : 'transparent',
                    color: isActive(href) ? PRIMARY : '#57534E',
                    fontWeight: isActive(href) ? 600 : 500,
                    fontSize: '13px', fontFamily: 'var(--font-family-ui)',
                  }}
                  onMouseEnter={e => { if (!isActive(href)) { (e.currentTarget as HTMLElement).style.background = '#F5F5F4'; } }}
                  onMouseLeave={e => { if (!isActive(href)) { (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                >
                  <Icon size={16} strokeWidth={isActive(href) ? 2 : 1.5} color={isActive(href) ? PRIMARY : undefined} />
                  {label}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Bottom profile */}
        <div style={{ borderTop: '1px solid #E7E5E4', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '9999px',
              background: PRIMARY_BG,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: '13px', fontWeight: 700, color: PRIMARY,
              fontFamily: 'var(--font-family-ui)',
            }}>
              {initials(creator.display_name || creator.username)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {creator.display_name}
              </div>
              <span style={{ display: 'inline-block', background: PRIMARY_BG, color: PRIMARY, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '9999px' }}>
                Seller
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', padding: '4px' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
              onMouseLeave={e => (e.currentTarget.style.color = '#A8A29E')}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        <style>{`
          @media (max-width: 767px) { .sidebar-close { display: flex !important; } }
        `}</style>
      </aside>
    </>
  );
}

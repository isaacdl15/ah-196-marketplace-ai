'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, Link2, Package, DollarSign, BarChart3, Settings,
  ShieldCheck, Users, TrendingUp, ArrowLeft, MoreHorizontal, X
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
  { href: '/dashboard/links', label: 'My links', icon: Link2 },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const NAV_ADMIN = [
  { href: '/admin', label: 'Admin overview', icon: ShieldCheck },
  { href: '/admin/waitlist', label: 'Waitlist', icon: Users },
  { href: '/admin/utm', label: 'UTM Attribution', icon: TrendingUp },
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

  return (
    <>
      {/* Mobile overlay */}
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
        <div style={{ padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E8DDD2' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, fontStyle: 'italic', color: '#1A1208', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#C75B40' }}>S</span>irena
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C75B40" strokeWidth="1.5" opacity="0.8">
              <path d="M12 2 C8 2 4 6 4 10 C4 14 7 17 10 20 C11 21 12 22 12 22 C12 22 13 21 14 20 C17 17 20 14 20 10 C20 6 16 2 12 2Z" />
              <path d="M9 18 C8 20 9 22 12 22" />
              <path d="M15 18 C16 20 15 22 12 22" />
            </svg>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E8B7A', padding: '4px', display: 'none' }} className="sidebar-close">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Main nav */}
        <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          <div style={{ padding: '16px 12px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A' }}>
            Creator
          </div>
          {NAV_MAIN.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', height: '40px',
                padding: '0 12px', margin: '0 8px', borderRadius: '8px',
                textDecoration: 'none', transition: '120ms ease',
                background: isActive(href) ? '#FDF0EC' : 'transparent',
                color: isActive(href) ? '#C75B40' : '#5A4839',
                fontWeight: isActive(href) ? 600 : 500,
                fontSize: '14px', fontFamily: 'var(--font-ui)',
              }}
              onMouseEnter={e => { if (!isActive(href)) { (e.currentTarget as HTMLElement).style.background = '#F5EEE6'; (e.currentTarget as HTMLElement).style.color = '#1A1208'; } }}
              onMouseLeave={e => { if (!isActive(href)) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#5A4839'; } }}
            >
              <Icon size={18} strokeWidth={isActive(href) ? 2 : 1.5} color={isActive(href) ? '#C75B40' : undefined} />
              {label}
            </Link>
          ))}

          {/* Admin section */}
          {creator.is_admin && (
            <>
              <div style={{ padding: '16px 12px 4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9E8B7A', marginTop: '8px' }}>
                Admin
              </div>
              {NAV_ADMIN.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', height: '40px',
                    padding: '0 12px', margin: '0 8px', borderRadius: '8px',
                    textDecoration: 'none', transition: '120ms ease',
                    background: isActive(href) ? '#FDF0EC' : 'transparent',
                    color: isActive(href) ? '#C75B40' : '#5A4839',
                    fontWeight: isActive(href) ? 600 : 500,
                    fontSize: '14px', fontFamily: 'var(--font-ui)',
                  }}>
                  <Icon size={18} strokeWidth={isActive(href) ? 2 : 1.5} color={isActive(href) ? '#C75B40' : undefined} />
                  {label}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Bottom profile */}
        <div style={{ borderTop: '1px solid #E8DDD2', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9999px', background: '#F5D1C5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px', fontWeight: 700, color: '#C75B40', fontFamily: 'var(--font-ui)' }}>
              {initials(creator.display_name || creator.username)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1208', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{creator.display_name}</div>
              <span style={{ display: 'inline-block', background: '#F5EEE6', color: '#C75B40', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '9999px' }}>
                {creator.plan === 'pro' ? 'Pro' : 'Creator'}
              </span>
            </div>
            <button onClick={handleLogout} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E8B7A', padding: '4px' }}>
              <MoreHorizontal size={16} />
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

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface Creator {
  id: string;
  display_name: string;
  username: string;
  plan: string;
  is_admin: boolean;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/links': 'My links',
  '/dashboard/products': 'Products',
  '/dashboard/earnings': 'Earnings',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
  '/admin': 'Admin Overview',
  '/admin/waitlist': 'Waitlist',
  '/admin/utm': 'UTM Attribution',
};

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function DashboardShell({ creator, children }: { creator: Creator; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'Dashboard';

  return (
    <div className="app-layout">
      <Sidebar creator={creator} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="app-main">
        {/* Header */}
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-only"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1208', padding: '4px', display: 'none' }}
            >
              <Menu size={20} />
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1208', fontFamily: 'var(--font-ui)', margin: 0 }}>{title}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A4839', padding: '8px', position: 'relative', borderRadius: '8px', transition: '120ms ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5EEE6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <Bell size={20} strokeWidth={1.5} />
            </button>
            <div style={{ width: '32px', height: '32px', borderRadius: '9999px', background: '#F5D1C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#C75B40', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
              {initials(creator.display_name || creator.username)}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="dot-grid" style={{ flex: 1 }}>
          <div className="app-content page-enter">
            {children}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 767px) {
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

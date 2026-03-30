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
  '/dashboard': 'Overview',
  '/dashboard/templates': 'My Templates',
  '/dashboard/templates/new': 'New Template',
  '/dashboard/earnings': 'Earnings',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/payouts': 'Payouts',
  '/dashboard/settings': 'Settings',
  '/admin': 'Admin Overview',
  '/admin/waitlist': 'Waitlist',
  '/admin/users': 'Users',
  '/admin/templates': 'All Templates',
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1C1917', padding: '4px', display: 'none' }}
            >
              <Menu size={20} />
            </button>
            <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-ui)', margin: 0 }}>
              {title}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57534E', padding: '8px', position: 'relative', borderRadius: '8px', transition: '120ms ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F5F4'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Bell size={18} strokeWidth={1.5} />
            </button>
            <div style={{
              width: '32px', height: '32px', borderRadius: '9999px',
              background: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#4F46E5',
              cursor: 'pointer', fontFamily: 'var(--font-family-ui)',
            }}>
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy } from 'lucide-react';

const navLinks = [
  { href: '/rankings', label: 'Rankings' },
  { href: '/events', label: 'Events' },
  { href: '/rules', label: 'Rules' },
];

export default function PublicHeader() {
  const pathname = usePathname();

  return (
    <header style={{ backgroundColor: 'var(--color-primary)' }} className="text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">USATKD Rankings</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="ml-4 px-4 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              Admin Login
            </Link>
          </nav>

          {/* Mobile nav */}
          <nav className="md:hidden flex items-center gap-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

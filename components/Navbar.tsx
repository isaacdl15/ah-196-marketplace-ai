'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Templates', href: '#templates' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          zIndex: 50,
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          backgroundColor: scrolled ? 'rgba(12, 10, 9, 0.85)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          transition: 'background-color 200ms ease, border-color 200ms ease',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <a
            href="/"
            style={{
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: '20px',
              color: '#F5F5F4',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            marketplace.ai
          </a>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: '#A8A29E',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F5F4')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#A8A29E')}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#waitlist"
              style={{
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                padding: '8px 18px',
                borderRadius: '8px',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3730A3')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4F46E5')}
            >
              Join Waitlist
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="md:hidden"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#F5F5F4',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              backgroundColor: '#0C0A09',
              display: 'flex',
              flexDirection: 'column',
              padding: '0 24px',
            }}
          >
            <div
              style={{
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: "'Instrument Sans', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#F5F5F4',
                  letterSpacing: '-0.02em',
                }}
              >
                marketplace.ai
              </span>
              <button
                onClick={closeMenu}
                aria-label="Close menu"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#F5F5F4',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} />
              </button>
            </div>

            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                marginTop: '24px',
              }}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  style={{
                    color: '#F5F5F4',
                    textDecoration: 'none',
                    fontSize: '24px',
                    fontWeight: 600,
                    padding: '12px 0',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ marginTop: '32px' }}>
                <a
                  href="#waitlist"
                  onClick={closeMenu}
                  style={{
                    backgroundColor: '#4F46E5',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    padding: '14px 24px',
                    borderRadius: '10px',
                    display: 'inline-block',
                    minHeight: '48px',
                    lineHeight: '20px',
                  }}
                >
                  Join Waitlist
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

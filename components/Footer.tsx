export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: '#0C0A09',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontFamily: "'Instrument Sans', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: '17px',
            color: '#F5F5F4',
            letterSpacing: '-0.02em',
          }}
        >
          marketplace.ai
        </span>

        {/* Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a
            href="/privacy"
            style={{ color: '#57534E', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#A8A29E')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#57534E')}
          >
            Privacy
          </a>
          <a
            href="/terms"
            style={{ color: '#57534E', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#A8A29E')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#57534E')}
          >
            Terms
          </a>
        </nav>

        {/* Copyright */}
        <p style={{ fontSize: '13px', color: '#57534E', margin: 0 }}>
          &copy; {year} marketplace.ai. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

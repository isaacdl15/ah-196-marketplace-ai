'use client';

import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote:
      "I saved two weeks of setup time using marketplace.ai templates. The SaaS Starter Kit had everything — auth, billing, dashboard — all wired up. I just customized and shipped.",
    name: 'Sarah K.',
    role: 'Indie Hacker',
    avatar: 'SK',
    avatarColor: '#4F46E5',
  },
  {
    quote:
      "As a freelancer, having battle-tested templates means I can deliver client projects faster and with higher quality. marketplace.ai is exactly what I've been looking for.",
    name: 'Marcus T.',
    role: 'Freelance Developer',
    avatar: 'MT',
    avatarColor: '#0EA5E9',
  },
  {
    quote:
      "Our startup moved from idea to beta in 3 weeks. The templates gave us a solid foundation so we could focus on our unique features instead of reinventing the wheel.",
    name: 'Priya R.',
    role: 'CTO, EarlyStage.io',
    avatar: 'PR',
    avatarColor: '#16A34A',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TestimonialsSection() {
  return (
    <section
      style={{
        backgroundColor: '#FAFAF9',
        padding: '96px 24px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#4F46E5',
              marginBottom: '12px',
            }}
          >
            FROM THE COMMUNITY
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#1C1917',
              margin: 0,
            }}
          >
            What builders are saying
          </h2>
        </div>

        {/* Testimonials grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E7E5E4',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: '3px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#F59E0B">
                    <path d="M8 1l1.854 3.764L14 5.528l-3 2.924.707 4.126L8 10.527l-3.707 2.051L5 8.452 2 5.528l4.146-.764L8 1z" />
                  </svg>
                ))}
              </div>

              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.65,
                  color: '#57534E',
                  margin: 0,
                  flex: 1,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: t.avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: '#A8A29E', margin: 0 }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

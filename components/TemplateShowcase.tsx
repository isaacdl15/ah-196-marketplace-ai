'use client';

import { motion } from 'framer-motion';

const TEMPLATES = [
  {
    category: 'SaaS',
    title: 'SaaS Starter Kit',
    description:
      'Full authentication, billing with Stripe, team management, and a beautiful dashboard. Everything to launch your SaaS.',
    accentColor: '#4F46E5',
    bgColor: '#EEF2FF',
    previewBlocks: [
      { w: '60%', h: '12px', color: '#C7D2FE' },
      { w: '80%', h: '8px', color: '#E0E7FF' },
      { w: '40%', h: '8px', color: '#E0E7FF' },
    ],
  },
  {
    category: 'E-Commerce',
    title: 'Digital Products Store',
    description:
      'Sell digital downloads, courses, and licenses. Includes checkout flows, license management, and customer portal.',
    accentColor: '#0EA5E9',
    bgColor: '#F0F9FF',
    previewBlocks: [
      { w: '70%', h: '12px', color: '#BAE6FD' },
      { w: '50%', h: '8px', color: '#E0F2FE' },
      { w: '90%', h: '8px', color: '#E0F2FE' },
    ],
  },
  {
    category: 'Community',
    title: 'Creator Platform',
    description:
      'Build a paid community with member profiles, content gating, discussion threads, and newsletter integration.',
    accentColor: '#16A34A',
    bgColor: '#F0FDF4',
    previewBlocks: [
      { w: '55%', h: '12px', color: '#BBF7D0' },
      { w: '75%', h: '8px', color: '#DCFCE7' },
      { w: '45%', h: '8px', color: '#DCFCE7' },
    ],
  },
  {
    category: 'Analytics',
    title: 'Analytics Dashboard',
    description:
      'Track users, revenue, and events with beautiful charts. Integrates with Posthog, Mixpanel, or your custom events.',
    accentColor: '#D97706',
    bgColor: '#FFFBEB',
    previewBlocks: [
      { w: '65%', h: '12px', color: '#FDE68A' },
      { w: '85%', h: '8px', color: '#FEF3C7' },
      { w: '50%', h: '8px', color: '#FEF3C7' },
    ],
  },
  {
    category: 'Marketing',
    title: 'Landing Page Builder',
    description:
      'High-converting landing pages with A/B testing, waitlist management, and analytics. Ship your MVP in hours.',
    accentColor: '#7C3AED',
    bgColor: '#F5F3FF',
    previewBlocks: [
      { w: '75%', h: '12px', color: '#DDD6FE' },
      { w: '55%', h: '8px', color: '#EDE9FE' },
      { w: '80%', h: '8px', color: '#EDE9FE' },
    ],
  },
  {
    category: 'API',
    title: 'API Backend Starter',
    description:
      'REST and tRPC API template with rate limiting, authentication, Zod validation, and comprehensive error handling.',
    accentColor: '#DC2626',
    bgColor: '#FFF1F2',
    previewBlocks: [
      { w: '50%', h: '12px', color: '#FECDD3' },
      { w: '70%', h: '8px', color: '#FFE4E6' },
      { w: '60%', h: '8px', color: '#FFE4E6' },
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TemplateShowcase() {
  return (
    <section
      id="templates"
      style={{
        backgroundColor: '#F5F5F4',
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
            TEMPLATE GALLERY
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#1C1917',
              marginBottom: '16px',
            }}
          >
            Built for every use case
          </h2>
          <p style={{ fontSize: '16px', color: '#57534E', maxWidth: '480px', margin: '0 auto' }}>
            50+ templates planned at launch. Each one production-tested and ready to customize.
          </p>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {TEMPLATES.map((template) => (
            <motion.div
              key={template.title}
              variants={cardVariants}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E7E5E4',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)',
              }}
            >
              {/* Mock UI preview */}
              <div
                style={{
                  backgroundColor: template.bgColor,
                  padding: '24px 24px 20px',
                  borderBottom: '1px solid #E7E5E4',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Mock toolbar */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FECACA' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FEF08A' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#BBF7D0' }} />
                  <div style={{ flex: 1, height: '6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.6)', marginLeft: '8px' }} />
                </div>
                {/* Mock content blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                  {template.previewBlocks.map((block, i) => (
                    <div
                      key={i}
                      style={{
                        width: block.w,
                        height: block.h,
                        borderRadius: '4px',
                        backgroundColor: block.color,
                      }}
                    />
                  ))}
                </div>
                {/* Mock button */}
                <div
                  style={{
                    width: '80px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: template.accentColor,
                    opacity: 0.85,
                    marginTop: '4px',
                  }}
                />
              </div>

              {/* Card body */}
              <div style={{ padding: '20px 24px 24px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: template.accentColor,
                      backgroundColor: template.bgColor,
                      border: `1px solid ${template.accentColor}33`,
                      borderRadius: '9999px',
                      padding: '2px 10px',
                    }}
                  >
                    {template.category}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#1C1917',
                    marginBottom: '8px',
                    lineHeight: 1.3,
                  }}
                >
                  {template.title}
                </h3>
                <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#57534E', margin: 0 }}>
                  {template.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

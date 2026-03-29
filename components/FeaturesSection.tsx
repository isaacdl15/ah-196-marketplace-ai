'use client';

import { motion } from 'framer-motion';
import { Code2, Shield, Zap, Layers, Monitor, RefreshCw } from 'lucide-react';

const FEATURES = [
  {
    icon: Code2,
    title: 'Clean, Typed Code',
    description:
      'Every template ships with TypeScript, ESLint, and consistent architecture so your team can onboard instantly.',
  },
  {
    icon: Shield,
    title: 'Auth & Security Built-In',
    description:
      'Supabase authentication, RLS policies, and middleware already configured. Your users are protected from day one.',
  },
  {
    icon: Zap,
    title: 'Deploy in Minutes',
    description:
      'One-click Vercel deployment with all environment variables documented. From clone to production in under 3 minutes.',
  },
  {
    icon: Layers,
    title: 'Full-Stack Ready',
    description:
      'API routes, database schemas, and frontend all included. No integration headaches, no stitching packages together.',
  },
  {
    icon: Monitor,
    title: 'Responsive by Default',
    description:
      'Every template is mobile-first with Tailwind v4. Looks great on any device without extra work.',
  },
  {
    icon: RefreshCw,
    title: 'Continuously Updated',
    description:
      'Templates stay current with the latest Next.js, React, and ecosystem updates. Buy once, benefit forever.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        backgroundColor: '#FAFAF9',
        padding: '96px 24px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section header */}
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
            WHY MARKETPLACE.AI
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
            Everything you need to ship fast
          </h2>
        </div>

        {/* Features grid */}
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
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -3, boxShadow: '0 10px 40px rgba(28,25,23,0.10), 0 2px 8px rgba(28,25,23,0.06)' }}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E7E5E4',
                  borderRadius: '16px',
                  padding: '28px',
                  cursor: 'default',
                  boxShadow: '0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)',
                  transition: 'box-shadow 200ms ease',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    backgroundColor: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={24} color="#4F46E5" />
                </div>
                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: '#1C1917',
                    marginBottom: '8px',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: '#57534E',
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

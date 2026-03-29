'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'What is marketplace.ai?',
    answer:
      'marketplace.ai is a curated marketplace of production-ready Next.js templates. Each template is built by expert developers and includes everything you need to launch: auth, database schemas, API routes, and polished UI.',
  },
  {
    question: 'When will marketplace.ai launch?',
    answer:
      "We're currently in early access. Join the waitlist to be notified at launch and get early-bird pricing. We're aiming to launch with 50+ templates across SaaS, e-commerce, community, and analytics categories.",
  },
  {
    question: 'How are templates priced?',
    answer:
      'Templates will be available as one-time purchases, with lifetime updates included. Pricing will vary by complexity, typically ranging from $29 to $299. Waitlist members will receive exclusive early-bird discounts.',
  },
  {
    question: 'Can I sell my own templates?',
    answer:
      "Yes! We're building a creator program for developers who want to sell their templates on the platform. Check the \"I'm a template creator\" box when joining the waitlist to get priority access to our creator dashboard.",
  },
  {
    question: 'What tech stack do the templates use?',
    answer:
      'All templates are built with Next.js 15+, TypeScript, Tailwind CSS v4, and Supabase. Additional integrations vary by template (Stripe, Resend, etc.) and are clearly documented.',
  },
  {
    question: 'Do I own the code after purchasing?',
    answer:
      'Absolutely. You get full ownership of the source code. Use it for unlimited personal and commercial projects. No attribution required, no recurring fees.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderBottom: '1px solid #E7E5E4',
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '20px 0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#1C1917',
            lineHeight: 1.4,
          }}
        >
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={18} color="#A8A29E" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.7,
                color: '#57534E',
                paddingBottom: '20px',
                margin: 0,
              }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  return (
    <section
      id="faq"
      style={{
        backgroundColor: '#F5F5F4',
        padding: '96px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '48px',
        }}
      >
        {/* On larger screens: 40/60 split */}
        <style>{`
          @media (min-width: 768px) {
            .faq-grid {
              grid-template-columns: 2fr 3fr !important;
            }
          }
        `}</style>
        <div
          className="faq-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '48px',
          }}
        >
          {/* Left: header */}
          <div>
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
              FAQ
            </p>
            <h2
              style={{
                fontFamily: "'Instrument Sans', system-ui, sans-serif",
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#1C1917',
                marginBottom: '16px',
              }}
            >
              Common questions
            </h2>
            <p style={{ fontSize: '15px', color: '#57534E', lineHeight: 1.6, margin: 0 }}>
              Can&apos;t find what you&apos;re looking for?{' '}
              <a
                href="mailto:hello@marketplace.ai"
                style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}
              >
                Drop us a line.
              </a>
            </p>
          </div>

          {/* Right: FAQ items */}
          <div>
            {FAQS.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

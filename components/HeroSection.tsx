'use client';

import { motion } from 'framer-motion';
import WaitlistSignup from './WaitlistSignup';

const AVATAR_COLORS = ['#4F46E5', '#0EA5E9', '#16A34A'];
const AVATAR_INITIALS = ['A', 'B', 'C'];

export default function HeroSection() {
  return (
    <section
      id="waitlist"
      style={{
        backgroundColor: '#0C0A09',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 24px 80px',
      }}
    >
      {/* Background gradient orbs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '760px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '32px',
        }}
      >
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(79, 70, 229, 0.15)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#A5B4FC',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#16A34A',
              flexShrink: 0,
              boxShadow: '0 0 0 0 rgba(22, 163, 74, 0.4)',
              animation: 'pulse-green 2s infinite',
            }}
          />
          Early Access — Join 1,200+ builders
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: "'Instrument Sans', system-ui, sans-serif",
            fontSize: 'clamp(40px, 7vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#F5F5F4',
            margin: 0,
          }}
        >
          Ship Faster with{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #818CF8 0%, #4F46E5 50%, #0EA5E9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            App-Ready
          </span>{' '}
          Templates
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: '18px',
            lineHeight: 1.6,
            color: '#A8A29E',
            maxWidth: '560px',
            margin: 0,
          }}
        >
          Browse production-ready Next.js templates built by expert developers.
          Deploy in minutes, not weeks. Focus on your product, not boilerplate.
        </motion.p>

        {/* Waitlist signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <WaitlistSignup dark />
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex' }}>
            {AVATAR_COLORS.map((color, i) => (
              <div
                key={i}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '2px solid #0C0A09',
                  marginLeft: i > 0 ? '-10px' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                {AVATAR_INITIALS[i]}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: '#A8A29E', margin: 0 }}>
            Join{' '}
            <strong style={{ color: '#F5F5F4' }}>1,200+ developers</strong>{' '}
            already on the waitlist
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
          100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
      `}</style>
    </section>
  );
}

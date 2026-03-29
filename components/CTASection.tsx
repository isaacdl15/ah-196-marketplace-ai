'use client';

import { motion } from 'framer-motion';
import WaitlistSignup from './WaitlistSignup';

export default function CTASection() {
  return (
    <section
      style={{
        backgroundColor: '#0C0A09',
        padding: '96px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orb */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(79,70,229,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#818CF8',
              marginBottom: '16px',
            }}
          >
            GET EARLY ACCESS
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#F5F5F4',
              marginBottom: '16px',
            }}
          >
            Ready to ship faster?
          </h2>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#A8A29E',
              margin: 0,
            }}
          >
            Join 1,200+ developers on the waitlist. Get early-bird pricing and be the first to access our template library.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ width: '100%' }}
        >
          <WaitlistSignup dark />
        </motion.div>
      </div>
    </section>
  );
}

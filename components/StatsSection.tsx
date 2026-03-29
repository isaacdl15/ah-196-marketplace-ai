'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform, animate } from 'framer-motion';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  sublabel?: string;
}

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/waitlist/count')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.total === 'number') setWaitlistCount(data.total);
      })
      .catch(() => {});
  }, []);

  const stats: StatItem[] = [
    {
      value: waitlistCount !== null ? waitlistCount : 1200,
      suffix: '+',
      label: 'On the Waitlist',
      sublabel: 'developers & builders',
    },
    {
      value: 50,
      suffix: '+',
      label: 'Templates Planned',
      sublabel: 'at launch',
    },
    {
      value: 3,
      suffix: 'min',
      label: 'Deploy Time',
      sublabel: 'from clone to production',
    },
  ];

  return (
    <section
      style={{
        backgroundColor: '#0C0A09',
        padding: '80px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{
              padding: '48px 40px',
              backgroundColor: '#0C0A09',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Instrument Sans', system-ui, sans-serif",
                fontSize: 'clamp(40px, 5vw, 56px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#F5F5F4',
                lineHeight: 1,
                marginBottom: '8px',
              }}
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <p
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#F5F5F4',
                marginBottom: '4px',
              }}
            >
              {stat.label}
            </p>
            {stat.sublabel && (
              <p style={{ fontSize: '13px', color: '#57534E', margin: 0 }}>
                {stat.sublabel}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Users, Calendar, AlertTriangle, Upload, Trophy } from 'lucide-react';
import { DashboardStats as DashboardStatsType } from '@/types';

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    { label: 'Total Athletes', value: stats.totalAthletes.toLocaleString(), icon: Users, color: '#0C4A6E' },
    { label: 'Total Events', value: stats.totalEvents.toLocaleString(), icon: Calendar, color: '#0284c7' },
    { label: 'Pending Resolutions', value: stats.pendingResolutions.toLocaleString(), icon: AlertTriangle, color: stats.pendingResolutions > 0 ? '#D97706' : '#16A34A' },
    { label: 'Recent Uploads', value: stats.recentUploads.toLocaleString(), icon: Upload, color: '#7c3aed' },
    { label: 'Athletes Ranked', value: stats.athletesRanked.toLocaleString(), icon: Trophy, color: '#16A34A' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl p-5"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {card.value}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {card.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

import { createAdminClient } from '@/lib/supabase/admin';
import DashboardStats from '@/components/admin/DashboardStats';
import { DashboardStats as DashboardStatsType } from '@/types';
import { Upload, AlertCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import RecalculateButton from '@/components/admin/RecalculateButton';

async function getStats(): Promise<DashboardStatsType> {
  const supabase = createAdminClient();

  const [athletes, events, pending, uploads, ranked] = await Promise.all([
    supabase.from('athletes').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('match_results').select('id', { count: 'exact', head: true }).eq('resolution_status', 'UNRESOLVED'),
    supabase.from('csv_uploads').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('rankings').select('athlete_id', { count: 'exact', head: true }),
  ]);

  return {
    totalAthletes: athletes.count || 0,
    totalEvents: events.count || 0,
    pendingResolutions: pending.count || 0,
    recentUploads: uploads.count || 0,
    athletesRanked: ranked.count || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const quickActions = [
    { href: '/admin/uploads', label: 'Upload Daedo CSV', icon: Upload, desc: 'Process match results from tournaments', alert: false },
    { href: '/admin/resolution-queue', label: 'Review Queue', icon: AlertCircle, desc: `${stats.pendingResolutions} matches need identity resolution`, alert: stats.pendingResolutions > 0 },
    { href: '/admin/events', label: 'Manage Events', icon: Trophy, desc: 'Set event grades and tiers', alert: false },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>USATKD Rankings Admin Panel</p>
      </div>

      <div className="mb-8">
        <DashboardStats stats={stats} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-xl p-5 transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: action.alert ? '1px solid #fed7aa' : '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: action.alert ? '#fff7ed' : '#0C4A6E15' }}
              >
                <Icon className="w-5 h-5" style={{ color: action.alert ? '#c2410c' : 'var(--color-primary)' }} />
              </div>
              <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{action.label}</div>
              <div className="text-xs mt-1" style={{ color: action.alert ? '#c2410c' : 'var(--color-text-muted)' }}>{action.desc}</div>
            </Link>
          );
        })}
      </div>

      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Rankings Recalculation</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Manually trigger a full recalculation of all rankings from match results.
        </p>
        <RecalculateButton />
      </div>
    </div>
  );
}

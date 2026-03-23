import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import AdminOverview from '@/components/admin/AdminOverview';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  noStore();
  const supabase = await createClient();
  const { data: waitlist } = await supabase.from('sirena_waitlist').select('*').order('created_at', { ascending: false });
  const items = waitlist ?? [];
  const total = items.length;
  const last7d = items.filter(w => new Date(w.created_at) > new Date(Date.now() - 7 * 86400000)).length;
  const nicheCounts: Record<string, number> = {};
  items.forEach(w => { nicheCounts[w.niche] = (nicheCounts[w.niche] || 0) + 1; });
  const topNiche = Object.entries(nicheCounts).sort(([,a],[,b]) => b - a)[0]?.[0] ?? '—';
  const countryCounts: Record<string, number> = {};
  items.forEach(w => { if (w.ip_country) { countryCounts[w.ip_country] = (countryCounts[w.ip_country] || 0) + 1; } });
  const countries = Object.keys(countryCounts).length;

  return (
    <AdminOverview
      total={total}
      last7d={last7d}
      topNiche={topNiche}
      countries={countries}
      recentSignups={items.slice(0, 10)}
    />
  );
}

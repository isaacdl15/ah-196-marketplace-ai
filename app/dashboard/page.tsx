import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import DashboardHome from '@/components/dashboard/DashboardHome';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [creatorRes, salesRes, viewsRes, clicksRes, linksRes] = await Promise.all([
    supabase.from('sirena_creators').select('*').eq('id', user.id).single(),
    supabase.from('sirena_sales').select('net_cents, status, created_at').eq('creator_id', user.id),
    supabase.from('sirena_page_views').select('created_at').eq('creator_id', user.id).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase.from('sirena_link_clicks').select('created_at').eq('creator_id', user.id).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase.from('sirena_links').select('id, title, url').eq('creator_id', user.id).order('position').limit(1),
  ]);

  const creator = creatorRes.data;
  const sales = salesRes.data ?? [];
  const views = viewsRes.data ?? [];
  const clicks = clicksRes.data ?? [];

  const totalEarningsCents = sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.net_cents, 0);
  const productsSold = sales.filter(s => s.status === 'completed').length;

  return (
    <DashboardHome
      creator={creator}
      totalEarningsCents={totalEarningsCents}
      pageViews30d={views.length}
      linkClicks30d={clicks.length}
      productsSold={productsSold}
      recentSales={sales.slice(0, 5)}
    />
  );
}

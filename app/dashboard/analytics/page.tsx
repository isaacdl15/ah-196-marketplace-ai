import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import AnalyticsView from '@/components/dashboard/AnalyticsView';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [viewsRes, clicksRes, linksRes] = await Promise.all([
    supabase.from('sirena_page_views').select('created_at, ip_country, referrer, utm_source').eq('creator_id', user.id).gte('created_at', thirtyDaysAgo).order('created_at'),
    supabase.from('sirena_link_clicks').select('created_at, link_id').eq('creator_id', user.id).gte('created_at', thirtyDaysAgo),
    supabase.from('sirena_links').select('id, title').eq('creator_id', user.id).eq('visible', true),
  ]);

  const views = viewsRes.data ?? [];
  const clicks = clicksRes.data ?? [];
  const links = linksRes.data ?? [];

  // Aggregate clicks by link
  const clicksByLink = links.map(l => ({
    ...l,
    clicks: clicks.filter(c => c.link_id === l.id).length,
    ctr: views.length > 0 ? Math.round(clicks.filter(c => c.link_id === l.id).length / views.length * 100) : 0,
  })).sort((a, b) => b.clicks - a.clicks);

  // Country breakdown
  const countryCounts: Record<string, number> = {};
  views.forEach(v => { if (v.ip_country) { countryCounts[v.ip_country] = (countryCounts[v.ip_country] || 0) + 1; } });
  const countries = Object.entries(countryCounts).sort(([,a],[,b]) => b - a).slice(0, 10).map(([country, count]) => ({ country, count }));

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  views.forEach(v => { const src = v.utm_source || (v.referrer ? new URL(v.referrer.startsWith('http') ? v.referrer : 'https://' + v.referrer).hostname.replace('www.', '') : 'Direct'); sourceCounts[src] = (sourceCounts[src] || 0) + 1; });
  const sources = Object.entries(sourceCounts).sort(([,a],[,b]) => b - a).slice(0, 6).map(([source, count]) => ({ source, count }));

  return (
    <AnalyticsView
      totalViews={views.length}
      totalClicks={clicks.length}
      ctr={views.length > 0 ? Math.round(clicks.length / views.length * 100) : 0}
      topLinks={clicksByLink.slice(0, 5)}
      countries={countries}
      sources={sources}
    />
  );
}

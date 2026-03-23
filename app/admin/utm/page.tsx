import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import UTMView from '@/components/admin/UTMView';

export const dynamic = 'force-dynamic';

export default async function UTMPage() {
  noStore();
  const supabase = await createClient();

  const { data: waitlist } = await supabase
    .from('sirena_waitlist')
    .select('utm_source, utm_medium, utm_campaign, created_at')
    .order('created_at', { ascending: false });

  const items = waitlist ?? [];
  const tracked = items.filter(i => i.utm_source);
  const organic = items.filter(i => !i.utm_source).length;

  // Group by source + medium + campaign
  const groups: Record<string, { source: string; medium: string; campaign: string; count: number; lastSeen: string }> = {};
  tracked.forEach(i => {
    const key = `${i.utm_source}|${i.utm_medium ?? ''}|${i.utm_campaign ?? ''}`;
    if (!groups[key]) groups[key] = { source: i.utm_source!, medium: i.utm_medium ?? '', campaign: i.utm_campaign ?? '', count: 0, lastSeen: i.created_at };
    groups[key].count++;
    if (i.created_at > groups[key].lastSeen) groups[key].lastSeen = i.created_at;
  });

  const utmRows = Object.values(groups).sort((a, b) => b.count - a.count);

  // Top source
  const topSource = utmRows[0]?.source ?? '—';

  // Sources for donut
  const sourceCounts: Record<string, number> = {};
  tracked.forEach(i => { sourceCounts[i.utm_source!] = (sourceCounts[i.utm_source!] || 0) + 1; });
  const sources = Object.entries(sourceCounts).sort(([,a],[,b]) => b - a).map(([source, count]) => ({ source, count }));

  return (
    <UTMView
      total={items.length}
      tracked={tracked.length}
      organic={organic}
      topSource={topSource}
      topCampaign={utmRows[0]?.campaign ?? '—'}
      utmRows={utmRows}
      sources={sources}
    />
  );
}

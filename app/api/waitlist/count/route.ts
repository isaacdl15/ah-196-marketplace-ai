export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore } from 'next/cache';

export async function GET() {
  unstable_noStore();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { count: total } = await supabase
    .from('mp_waitlist_entries')
    .select('*', { count: 'exact', head: true });

  const { count: creators } = await supabase
    .from('mp_waitlist_entries')
    .select('*', { count: 'exact', head: true })
    .eq('is_creator', true);

  return Response.json(
    {
      total: total || 0,
      creators: creators || 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' },
    }
  );
}

import { createAdminClient } from '@/lib/supabase/admin';
import ResolutionQueueClientPage from './ResolutionQueueClientPage';

async function getQueueItems() {
  const supabase = createAdminClient();
  const { data, count } = await supabase
    .from('match_results')
    .select('*, events(name, start_date)', { count: 'exact' })
    .eq('resolution_status', 'UNRESOLVED')
    .order('created_at', { ascending: false })
    .limit(50);
  return { items: data || [], total: count || 0 };
}

export default async function ResolutionQueuePage() {
  const { items, total } = await getQueueItems();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Resolution Queue</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {total} match{total !== 1 ? 'es' : ''} require manual identity resolution.
        </p>
      </div>

      <ResolutionQueueClientPage initialItems={items as Parameters<typeof ResolutionQueueClientPage>[0]['initialItems']} />
    </div>
  );
}

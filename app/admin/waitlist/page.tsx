import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import WaitlistAdmin from '@/components/admin/WaitlistAdmin';

export const dynamic = 'force-dynamic';

export default async function WaitlistPage() {
  noStore();
  const supabase = await createClient();
  const { data: waitlist } = await supabase
    .from('sirena_waitlist')
    .select('*')
    .order('created_at', { ascending: false });

  return <WaitlistAdmin items={waitlist ?? []} />;
}

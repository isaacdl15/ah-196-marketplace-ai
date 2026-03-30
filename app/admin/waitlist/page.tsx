import { createAdminClient } from '@/lib/supabase/admin';
import WaitlistAdminClient from './WaitlistAdminClient';

export default async function AdminWaitlistPage() {
  const supabase = createAdminClient();

  const { data: entries } = await supabase
    .from('mp_waitlist_entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return <WaitlistAdminClient entries={entries ?? []} />;
}

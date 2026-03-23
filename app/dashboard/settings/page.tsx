import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import SettingsView from '@/components/dashboard/SettingsView';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: creator } = await supabase.from('sirena_creators').select('*').eq('id', user.id).single();
  const { data: prefs } = await supabase.from('sirena_notification_prefs').select('*').eq('creator_id', user.id).single();

  return <SettingsView creator={creator} prefs={prefs} userEmail={user.email ?? ''} />;
}

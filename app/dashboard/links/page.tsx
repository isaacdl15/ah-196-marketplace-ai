import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import LinksManager from '@/components/dashboard/LinksManager';

export const dynamic = 'force-dynamic';

export default async function LinksPage() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: creator } = await supabase.from('sirena_creators').select('username').eq('id', user.id).single();
  const { data: links } = await supabase.from('sirena_links').select('*').eq('creator_id', user.id).order('position');

  return <LinksManager links={links ?? []} creatorId={user.id} username={creator?.username ?? ''} />;
}

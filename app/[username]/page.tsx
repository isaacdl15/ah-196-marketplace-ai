import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PublicCreatorPage from '@/components/creator/PublicCreatorPage';

export const dynamic = 'force-dynamic';

export default async function CreatorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: creator } = await supabase
    .from('sirena_creators')
    .select('id, display_name, username, bio, niche, avatar_url, page_theme_color, page_bg')
    .eq('username', username)
    .single();

  if (!creator) notFound();

  const { data: links } = await supabase
    .from('sirena_links')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('visible', true)
    .order('position');

  const { data: products } = await supabase
    .from('sirena_products')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('status', 'active');

  // Fire page view (server-side, no client fingerprint needed here)
  const origin = 'server';

  return (
    <PublicCreatorPage
      creator={creator}
      links={links ?? []}
      products={products ?? []}
    />
  );
}

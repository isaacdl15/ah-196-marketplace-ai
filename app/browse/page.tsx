import { createClient } from '@/lib/supabase/server';
import BrowseClient from './BrowseClient';

export const metadata = {
  title: 'Browse Templates — marketplace.ai',
  description: 'Discover production-ready Next.js templates from top builders.',
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('mp_templates')
    .select(`
      id, title, slug, description, category, tags, price_cents, is_free,
      downloads, rating_avg, rating_count, tech_stack, features,
      seller_id,
      mp_profiles!seller_id (display_name, username, avatar_url)
    `)
    .eq('status', 'published')
    .order('downloads', { ascending: false })
    .limit(12);

  if (params.category) {
    query = query.eq('category', params.category);
  }
  if (params.q) {
    query = query.ilike('title', `%${params.q}%`);
  }
  if (params.sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (params.sort === 'price_low') {
    query = query.order('price_cents', { ascending: true });
  } else if (params.sort === 'price_high') {
    query = query.order('price_cents', { ascending: false });
  } else if (params.sort === 'rating') {
    query = query.order('rating_avg', { ascending: false });
  }

  const { data: rawTemplates } = await query;

  // Normalize joined profile data
  const templates = (rawTemplates ?? []).map(t => ({
    ...t,
    mp_profiles: Array.isArray(t.mp_profiles) ? (t.mp_profiles[0] ?? null) : t.mp_profiles,
  }));

  return <BrowseClient templates={templates} initialCategory={params.category} initialSort={params.sort} initialQ={params.q} />;
}

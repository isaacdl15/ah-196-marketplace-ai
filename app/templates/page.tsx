import { createClient } from '@/lib/supabase/server';
import TemplatesCatalogClient from './TemplatesCatalogClient';

export const metadata = {
  title: 'Templates — marketplace.ai',
  description: 'Discover production-ready templates from top builders.',
};

export default async function TemplatesPage({
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
    .limit(50);

  if (params.category && params.category !== 'all') {
    const catMap: Record<string, string> = {
      nextjs: 'Next.js', react: 'React', saas: 'SaaS Starter',
      ecommerce: 'E-commerce', dashboard: 'Dashboard',
      landing: 'Landing Page', mobile: 'Mobile', api: 'API/Backend',
    };
    const cat = catMap[params.category] ?? params.category;
    query = query.eq('category', cat);
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

  const templates = (rawTemplates ?? []).map(t => ({
    ...t,
    mp_profiles: Array.isArray(t.mp_profiles) ? (t.mp_profiles[0] ?? null) : t.mp_profiles,
  }));

  return (
    <TemplatesCatalogClient
      templates={templates}
      initialCategory={params.category}
      initialSort={params.sort}
      initialQ={params.q}
    />
  );
}

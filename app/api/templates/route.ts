export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const sort = searchParams.get('sort') ?? 'popular';
  const limit = parseInt(searchParams.get('limit') ?? '12');
  const offset = parseInt(searchParams.get('offset') ?? '0');

  const supabase = adminClient();
  let query = supabase
    .from('mp_templates')
    .select(`
      id, title, slug, description, category, tags, price_cents, is_free,
      downloads, rating_avg, rating_count, tech_stack,
      mp_profiles!seller_id (display_name, username, avatar_url)
    `)
    .eq('status', 'published');

  if (category) query = query.eq('category', category);
  if (q) query = query.ilike('title', `%${q}%`);

  switch (sort) {
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    case 'price_low': query = query.order('price_cents', { ascending: true }); break;
    case 'price_high': query = query.order('price_cents', { ascending: false }); break;
    case 'rating': query = query.order('rating_avg', { ascending: false }); break;
    default: query = query.order('downloads', { ascending: false });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ templates: data, count });
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, category, price_cents, is_free, tech_stack, features, tags, demo_url, github_url } = body;

  if (!title || !category) {
    return Response.json({ error: 'title and category are required' }, { status: 400 });
  }

  const admin = adminClient();
  const { data: profile } = await admin
    .from('mp_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return Response.json({ error: 'Profile not found' }, { status: 404 });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

  const { data, error } = await admin
    .from('mp_templates')
    .insert({
      seller_id: profile.id,
      title,
      slug,
      description,
      category,
      price_cents: is_free ? 0 : (price_cents ?? 0),
      is_free: is_free ?? false,
      tech_stack: tech_stack ?? [],
      features: Array.isArray(features) ? features : (features ?? '').split('\n').filter(Boolean),
      tags: Array.isArray(tags) ? tags : (tags ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
      demo_url: demo_url ?? null,
      github_url: github_url ?? null,
      status: 'under_review',
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ template: data }, { status: 201 });
}

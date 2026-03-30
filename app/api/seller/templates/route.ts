export const runtime = 'nodejs';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSellerProfile() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', status: 401, user: null, profile: null, admin: null };
  const admin = adminClient();
  const { data: profile } = await admin.from('mp_profiles').select('*').eq('user_id', user.id).single();
  if (!profile) return { error: 'Profile not found', status: 404, user, profile: null, admin };
  if (!profile.is_seller) return { error: 'Forbidden', status: 403, user, profile: null, admin };
  return { error: null, status: 200, user, profile, admin };
}

export async function GET() {
  const { error, status, profile, admin } = await getSellerProfile();
  if (error) return Response.json({ error }, { status });

  const { data: templates, error: dbError } = await admin!
    .from('mp_templates')
    .select('*')
    .eq('seller_id', profile!.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });
  return Response.json({ templates });
}

export async function POST(request: Request) {
  const { error, status, profile, admin } = await getSellerProfile();
  if (error) return Response.json({ error }, { status });

  const body = await request.json();
  const { title, description, category, price_cents, tags, tech_stack, demo_url, github_url, features } = body;

  if (!title || !description || !category || price_cents === undefined) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const suffix = Math.random().toString(36).slice(2, 6);
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + suffix;

  const { data: template, error: dbError } = await admin!
    .from('mp_templates')
    .insert({
      seller_id: profile!.id,
      title,
      slug,
      description,
      category,
      price_cents,
      is_free: price_cents === 0,
      tags: tags ?? [],
      tech_stack: tech_stack ?? [],
      demo_url: demo_url ?? null,
      github_url: github_url ?? null,
      features: features ?? [],
      status: 'draft',
    })
    .select()
    .single();

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });
  return Response.json({ template }, { status: 201 });
}

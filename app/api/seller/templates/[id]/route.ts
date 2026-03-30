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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, profile, admin } = await getSellerProfile();
  if (error) return Response.json({ error }, { status });

  const { data: template, error: dbError } = await admin!
    .from('mp_templates')
    .select('*')
    .eq('id', id)
    .eq('seller_id', profile!.id)
    .is('deleted_at', null)
    .single();

  if (dbError || !template) return Response.json({ error: 'Template not found' }, { status: 404 });
  return Response.json({ template });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, profile, admin } = await getSellerProfile();
  if (error) return Response.json({ error }, { status });

  const { data: existing } = await admin!
    .from('mp_templates')
    .select('id')
    .eq('id', id)
    .eq('seller_id', profile!.id)
    .is('deleted_at', null)
    .single();

  if (!existing) return Response.json({ error: 'Template not found' }, { status: 404 });

  const body = await request.json();
  const allowed = ['title', 'description', 'category', 'price_cents', 'tags', 'tech_stack', 'demo_url', 'github_url', 'features', 'file_url', 'preview_images'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }
  if ('price_cents' in updates) {
    updates.is_free = updates.price_cents === 0;
  }

  const { data: template, error: dbError } = await admin!
    .from('mp_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });
  return Response.json({ template });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, profile, admin } = await getSellerProfile();
  if (error) return Response.json({ error }, { status });

  const { data: existing } = await admin!
    .from('mp_templates')
    .select('id')
    .eq('id', id)
    .eq('seller_id', profile!.id)
    .is('deleted_at', null)
    .single();

  if (!existing) return Response.json({ error: 'Template not found' }, { status: 404 });

  const { error: dbError } = await admin!
    .from('mp_templates')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });
  return Response.json({ success: true });
}

export const runtime = 'nodejs';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = adminClient();
  const { data: profile } = await admin.from('mp_profiles').select('*').eq('user_id', user.id).single();
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
  if (!profile.is_seller) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { data: template } = await admin
    .from('mp_templates')
    .select('*')
    .eq('id', id)
    .eq('seller_id', profile.id)
    .is('deleted_at', null)
    .single();

  if (!template) return Response.json({ error: 'Template not found' }, { status: 404 });
  if (template.status !== 'draft') return Response.json({ error: 'Only draft templates can be published' }, { status: 400 });

  const { data: updated, error: dbError } = await admin
    .from('mp_templates')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });
  return Response.json({ template: updated });
}

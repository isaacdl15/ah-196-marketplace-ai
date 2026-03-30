export const runtime = 'nodejs';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = adminClient();
  const { data: profile } = await admin.from('mp_profiles').select('*').eq('user_id', user.id).single();
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
  if (!profile.is_admin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { data: sellers, error } = await admin
    .from('mp_profiles')
    .select('*')
    .eq('is_seller', true)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const sellerIds = (sellers ?? []).map(s => s.id);
  let templateCounts: Record<string, number> = {};

  if (sellerIds.length > 0) {
    const { data: templates } = await admin
      .from('mp_templates')
      .select('seller_id')
      .in('seller_id', sellerIds)
      .is('deleted_at', null);

    for (const t of templates ?? []) {
      templateCounts[t.seller_id] = (templateCounts[t.seller_id] ?? 0) + 1;
    }
  }

  const sellersWithCounts = (sellers ?? []).map(s => ({
    ...s,
    template_count: templateCounts[s.id] ?? 0,
  }));

  return Response.json({ sellers: sellersWithCounts });
}

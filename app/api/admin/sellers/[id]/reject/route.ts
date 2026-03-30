export const runtime = 'nodejs';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('mp_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();
  if (!profile?.is_admin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await admin
    .from('mp_profiles')
    .update({ kyc_status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true, kyc_status: 'rejected' });
}

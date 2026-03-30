export const runtime = 'nodejs';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify admin
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
    .update({ kyc_status: 'approved', is_seller: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Log email notification (if mp_email_logs exists)
  try {
    await admin.from('mp_email_logs').insert({
      email: 'seller@example.com',
      email_type: 'kyc_approved',
      status: 'sent',
      metadata: { seller_id: id },
    });
  } catch {
    // best-effort
  }

  return Response.json({ success: true, kyc_status: 'approved' });
}

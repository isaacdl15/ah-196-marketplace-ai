export const runtime = 'nodejs';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAdminProfile() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', status: 401, profile: null, admin: null };
  const admin = adminClient();
  const { data: profile } = await admin.from('mp_profiles').select('*').eq('user_id', user.id).single();
  if (!profile) return { error: 'Profile not found', status: 404, profile: null, admin };
  if (!profile.is_admin) return { error: 'Forbidden', status: 403, profile: null, admin };
  return { error: null, status: 200, profile, admin };
}

export async function GET() {
  const { error, status, admin } = await getAdminProfile();
  if (error) return Response.json({ error }, { status });

  const { data: payouts, error: dbError } = await admin!
    .from('mp_payouts')
    .select('*, profile:mp_profiles(id, user_id, display_name, username, stripe_account_id)')
    .order('created_at', { ascending: false });

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });
  return Response.json({ payouts });
}

export async function POST(request: Request) {
  const { error, status, admin } = await getAdminProfile();
  if (error) return Response.json({ error }, { status });

  const body = await request.json();
  const { payout_id, action } = body;

  if (!payout_id || !action) {
    return Response.json({ error: 'Missing payout_id or action' }, { status: 400 });
  }

  if (action !== 'approve' && action !== 'reject') {
    return Response.json({ error: 'Action must be approve or reject' }, { status: 400 });
  }

  const newStatus = action === 'approve' ? 'processing' : 'cancelled';

  const { data: payout, error: dbError } = await admin!
    .from('mp_payouts')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', payout_id)
    .select()
    .single();

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });
  return Response.json({ payout });
}

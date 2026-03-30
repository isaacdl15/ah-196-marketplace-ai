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
  if (!user) return { error: 'Unauthorized', status: 401, profile: null, admin: null };
  const admin = adminClient();
  const { data: profile } = await admin.from('mp_profiles').select('*').eq('user_id', user.id).single();
  if (!profile) return { error: 'Profile not found', status: 404, profile: null, admin };
  if (!profile.is_seller) return { error: 'Forbidden', status: 403, profile: null, admin };
  return { error: null, status: 200, profile, admin };
}

export async function GET() {
  const { error, status, profile, admin } = await getSellerProfile();
  if (error) return Response.json({ error }, { status });

  const { data: payouts, error: dbError } = await admin!
    .from('mp_payouts')
    .select('*')
    .eq('profile_id', profile!.id)
    .order('created_at', { ascending: false });

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });
  return Response.json({ payouts });
}

export async function POST() {
  const { error, status, profile, admin } = await getSellerProfile();
  if (error) return Response.json({ error }, { status });

  if (!profile!.stripe_onboarded) {
    return Response.json({ error: 'Stripe not connected' }, { status: 400 });
  }

  const { data: sellerTemplates } = await admin!
    .from('mp_templates')
    .select('id')
    .eq('seller_id', profile!.id);

  const templateIds = (sellerTemplates ?? []).map(t => t.id);
  if (!templateIds.length) {
    return Response.json({ error: 'No earnings to payout' }, { status: 400 });
  }

  const { data: completedPurchases } = await admin!
    .from('mp_purchases')
    .select('amount_cents')
    .in('template_id', templateIds)
    .eq('status', 'completed');

  const { data: existingPayouts } = await admin!
    .from('mp_payouts')
    .select('amount_cents')
    .eq('profile_id', profile!.id)
    .in('status', ['requested', 'processing', 'paid']);

  const totalEarnings = (completedPurchases ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const netEarnings = Math.round(totalEarnings * 0.7);
  const alreadyPaid = (existingPayouts ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const availableBalance = netEarnings - alreadyPaid;

  if (availableBalance < 2500) {
    return Response.json({ error: 'Minimum payout is $25.00' }, { status: 400 });
  }

  const { data: payout, error: dbError } = await admin!
    .from('mp_payouts')
    .insert({
      profile_id: profile!.id,
      amount_cents: availableBalance,
      stripe_account_id: profile!.stripe_account_id,
      status: 'requested',
      payout_method: 'stripe',
    })
    .select()
    .single();

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });
  return Response.json({ success: true, payout });
}

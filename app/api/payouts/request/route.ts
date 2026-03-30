export const runtime = 'nodejs';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = adminClient();

  // Get profile
  const { data: profile } = await admin
    .from('mp_profiles')
    .select('id, stripe_account_id, stripe_onboarded')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return Response.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (!profile.stripe_onboarded) {
    return Response.json({ error: 'Stripe not connected' }, { status: 400 });
  }

  // Calculate available balance (total earnings minus paid out)
  const { data: sellerTemplates } = await admin
    .from('mp_templates')
    .select('id')
    .eq('seller_id', profile.id);

  const templateIds = (sellerTemplates ?? []).map(t => t.id);

  if (!templateIds.length) {
    return Response.json({ error: 'No earnings to payout' }, { status: 400 });
  }

  const { data: completedPurchases } = await admin
    .from('mp_purchases')
    .select('amount_cents')
    .in('template_id', templateIds)
    .eq('status', 'completed');

  const { data: existingPayouts } = await admin
    .from('mp_payouts')
    .select('amount_cents')
    .eq('profile_id', profile.id)
    .in('status', ['requested', 'processing', 'paid']);

  const totalEarnings = (completedPurchases ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const netEarnings = Math.round(totalEarnings * 0.7); // 70% to seller
  const alreadyPaid = (existingPayouts ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const availableBalance = netEarnings - alreadyPaid;

  if (availableBalance < 2500) { // $25 minimum
    return Response.json({ error: 'Minimum payout is $25.00' }, { status: 400 });
  }

  // Create payout record
  const { data: payout, error } = await admin
    .from('mp_payouts')
    .insert({
      profile_id: profile.id,
      amount_cents: availableBalance,
      stripe_account_id: profile.stripe_account_id,
      status: 'requested',
      payout_method: 'stripe',
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, payout });
}

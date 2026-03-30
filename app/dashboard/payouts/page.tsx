export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import PayoutsClient from './PayoutsClient';

export const metadata = {
  title: 'Payouts — marketplace.ai',
};

export default async function PayoutsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('mp_profiles')
    .select('id, stripe_account_id, stripe_onboarded')
    .eq('user_id', user.id)
    .single();

  const admin = createAdminClient();

  // Get payout history — graceful fallback if mp_payouts table not yet migrated
  const payoutsResult = profile
    ? await admin
        .from('mp_payouts')
        .select('id, amount_cents, status, payout_method, stripe_payout_id, created_at')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [], error: null };
  const payouts = payoutsResult.data ?? [];

  // Calculate available balance
  const { data: sellerTemplates } = profile
    ? await admin.from('mp_templates').select('id').eq('seller_id', profile.id)
    : { data: [] };

  const templateIds = (sellerTemplates ?? []).map((t: { id: string }) => t.id);

  const [completedPurchasesResult, paidOutResult] = await Promise.all([
    templateIds.length
      ? admin.from('mp_purchases').select('amount_cents').in('template_id', templateIds).eq('status', 'completed')
      : Promise.resolve({ data: [], error: null }),
    profile
      ? admin.from('mp_payouts').select('amount_cents').eq('profile_id', profile.id).in('status', ['requested', 'processing', 'paid'])
      : Promise.resolve({ data: [], error: null }),
  ]);

  const completedPurchases = completedPurchasesResult.data ?? [];
  const paidOut = paidOutResult.data ?? [];

  const totalEarnings = completedPurchases.reduce((s: number, p: { amount_cents: number }) => s + (p.amount_cents ?? 0), 0);
  const netEarnings = Math.round(totalEarnings * 0.7);
  const alreadyPaidOut = paidOut.reduce((s: number, p: { amount_cents: number }) => s + (p.amount_cents ?? 0), 0);
  const availableBalance = Math.max(0, netEarnings - alreadyPaidOut);

  return (
    <PayoutsClient
      stripeOnboarded={profile?.stripe_onboarded ?? false}
      stripeAccountId={profile?.stripe_account_id ?? null}
      payouts={payouts ?? []}
      availableBalanceCents={availableBalance}
    />
  );
}

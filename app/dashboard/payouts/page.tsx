import { createClient } from '@/lib/supabase/server';
import PayoutsClient from './PayoutsClient';

export default async function PayoutsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('mp_profiles')
    .select('id, stripe_account_id, stripe_onboarded')
    .eq('user_id', user.id)
    .single();

  return <PayoutsClient stripeOnboarded={profile?.stripe_onboarded ?? false} stripeAccountId={profile?.stripe_account_id ?? null} />;
}

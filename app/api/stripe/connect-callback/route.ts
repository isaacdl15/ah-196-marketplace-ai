export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { code, profileId } = await request.json();

  if (!code || !profileId) {
    return Response.json({ error: 'Missing code or profileId' }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    // Dev mode: mark as connected with stub account ID
    const admin = adminClient();
    await admin
      .from('mp_profiles')
      .update({
        stripe_account_id: 'acct_dev_' + Math.random().toString(36).substr(2, 9),
        stripe_onboarded: true,
      })
      .eq('id', profileId);

    return Response.json({ success: true, stub: true });
  }

  try {
    const stripe = require('stripe')(stripeKey);

    // Exchange code for access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const connectedAccountId = response.stripe_user_id;

    // Save to database
    const admin = adminClient();
    await admin
      .from('mp_profiles')
      .update({
        stripe_account_id: connectedAccountId,
        stripe_onboarded: true,
      })
      .eq('id', profileId);

    return Response.json({ success: true, accountId: connectedAccountId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stripe OAuth error';
    return Response.json({ error: msg }, { status: 500 });
  }
}

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

  const { templateId } = await request.json();
  if (!templateId) {
    return Response.json({ error: 'templateId is required' }, { status: 400 });
  }

  const admin = adminClient();
  const { data: template } = await admin
    .from('mp_templates')
    .select('id, title, price_cents, is_free, status')
    .eq('id', templateId)
    .single();

  if (!template) {
    return Response.json({ error: 'Template not found' }, { status: 404 });
  }

  if (template.status !== 'published') {
    return Response.json({ error: 'Template not available' }, { status: 400 });
  }

  if (template.is_free) {
    // For free templates, create purchase record directly
    await admin.from('mp_purchases').insert({
      buyer_id: user.id,
      template_id: templateId,
      amount_cents: 0,
      status: 'completed',
    });
    return Response.json({ success: true, free: true });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    // Stub: return dummy session for development
    const dummyClientSecret = 'pi_stub_' + Math.random().toString(36).substr(2, 9) + '_secret_stub';
    return Response.json({
      clientSecret: dummyClientSecret,
      amount: template.price_cents,
      stub: true,
    });
  }

  try {
    const stripe = require('stripe')(stripeKey);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: template.title },
          unit_amount: template.price_cents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/dashboard?purchase=success`,
      cancel_url: `${baseUrl}/template/${templateId}`,
      metadata: {
        templateId: template.id,
        buyerId: user.id,
      },
    });

    return Response.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stripe error';
    return Response.json({ error: msg }, { status: 500 });
  }
}

export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret || !sig) {
    // Development mode: parse body directly
    try {
      const event = JSON.parse(body);
      if (event.type === 'payment_intent.succeeded') {
        await handlePaymentSuccess(event.data.object);
      }
      return Response.json({ received: true });
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }
  }

  try {
    const stripe = require('stripe')(stripeKey);
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentSuccess(event.data.object);
    } else if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { templateId, buyerId } = session.metadata ?? {};
      if (templateId && buyerId) {
        await handleCheckoutSuccess(session.payment_intent, templateId, buyerId, session.amount_total ?? 0);
      }
    }

    return Response.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return Response.json({ error: msg }, { status: 400 });
  }
}

async function handlePaymentSuccess(paymentIntent: { id: string; metadata?: { templateId?: string; buyerId?: string }; amount?: number }) {
  const { templateId, buyerId } = paymentIntent.metadata ?? {};
  if (!templateId || !buyerId) return;

  await handleCheckoutSuccess(paymentIntent.id, templateId, buyerId, paymentIntent.amount ?? 0);
}

async function handleCheckoutSuccess(paymentIntentId: string, templateId: string, buyerId: string, amountCents: number) {
  const admin = adminClient();

  // Create purchase record
  await admin.from('mp_purchases').upsert({
    buyer_id: buyerId,
    template_id: templateId,
    amount_cents: amountCents,
    stripe_payment_intent_id: paymentIntentId,
    status: 'completed',
  }, { onConflict: 'stripe_payment_intent_id' });

  // Increment download count
  const { data: template } = await admin
    .from('mp_templates')
    .select('downloads')
    .eq('id', templateId)
    .single();

  if (template) {
    await admin
      .from('mp_templates')
      .update({ downloads: (template.downloads ?? 0) + 1 })
      .eq('id', templateId);
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as import('stripe').Stripe.Subscription
      const userId = sub.metadata?.user_id
      if (userId) {
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          plan: (sub.items.data[0]?.price?.metadata?.plan as string) ?? 'pro',
          status: sub.status,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id' })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as import('stripe').Stripe.Subscription
      const userId = sub.metadata?.user_id
      if (userId) {
        await supabase.from('subscriptions').update({
          status: 'canceled',
          stripe_subscription_id: null,
        }).eq('user_id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  typescript: true,
})

export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  // Check if customer already exists in Supabase
  const { createAdminClient } = await import('./supabase/admin')
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (data?.stripe_customer_id) return data.stripe_customer_id

  // Create new Stripe customer
  const customer = await stripe.customers.create({ email, metadata: { user_id: userId } })

  // Upsert to subscriptions table
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customer.id,
    plan: 'free',
    status: 'active',
  }, { onConflict: 'user_id' })

  return customer.id
}

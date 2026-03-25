import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', user.id)
    .single()

  const plan = sub?.plan ?? 'free'
  const status = sub?.status ?? 'active'

  return (
    <main style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Billing</h1>

      <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280', marginBottom: '8px' }}>Current plan</p>
        <p style={{ fontSize: '28px', fontWeight: 700, textTransform: 'capitalize' }}>{plan}</p>
        <p style={{ color: '#6B7280', marginTop: '4px' }}>Status: {status}</p>
        {sub?.current_period_end && (
          <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '14px' }}>
            Renews: {new Date(sub.current_period_end).toLocaleDateString()}
          </p>
        )}
      </div>

      {plan === 'free' ? (
        <form action="/api/stripe/create-checkout" method="POST">
          <input type="hidden" name="priceId" value="__STRIPE_PRICE_ID_MONTHLY__" />
          <button type="submit" style={{ background: '#2563EB', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Upgrade to Pro
          </button>
        </form>
      ) : (
        <form action="/api/stripe/portal" method="POST">
          <button type="submit" style={{ background: '#F3F4F6', color: '#111827', padding: '12px 24px', borderRadius: '8px', border: '1px solid #E5E7EB', cursor: 'pointer', fontWeight: 600 }}>
            Manage subscription
          </button>
        </form>
      )}
    </main>
  )
}

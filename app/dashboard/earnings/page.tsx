import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import EarningsView from '@/components/dashboard/EarningsView';

export const dynamic = 'force-dynamic';

export default async function EarningsPage() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [salesRes, payoutsRes] = await Promise.all([
    supabase.from('sirena_sales').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }),
    supabase.from('sirena_payouts').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }),
  ]);

  const sales = salesRes.data ?? [];
  const payouts = payoutsRes.data ?? [];
  const totalCents = sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.net_cents, 0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonthCents = sales.filter(s => s.status === 'completed' && s.created_at >= startOfMonth).reduce((sum, s) => sum + s.net_cents, 0);
  const paidOutCents = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0);
  const pendingCents = totalCents - paidOutCents;

  return (
    <EarningsView
      sales={sales}
      payouts={payouts}
      totalCents={totalCents}
      thisMonthCents={thisMonthCents}
      pendingCents={Math.max(0, pendingCents)}
      creatorId={user.id}
    />
  );
}

import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import ProductsManager from '@/components/dashboard/ProductsManager';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: products } = await supabase
    .from('sirena_products')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  return <ProductsManager products={products ?? []} creatorId={user.id} />;
}

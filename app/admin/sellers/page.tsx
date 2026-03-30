export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import AdminSellersClient from './AdminSellersClient';

export const metadata = {
  title: 'Seller Approvals — Admin',
};

export default async function AdminSellersPage() {
  const supabase = createAdminClient();

  const { data: sellers } = await supabase
    .from('mp_profiles')
    .select('id, user_id, display_name, username, bio, kyc_status, is_seller, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  // Fetch emails from auth.users via admin
  const sellerList = sellers ?? [];

  return <AdminSellersClient sellers={sellerList} />;
}

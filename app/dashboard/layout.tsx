import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('mp_profiles')
    .select('id, display_name, username, is_admin, is_seller')
    .eq('user_id', user.id)
    .single();

  const creator = {
    id: profile?.id ?? user.id,
    display_name: profile?.display_name ?? user.email?.split('@')[0] ?? 'User',
    username: profile?.username ?? '',
    plan: 'seller',
    is_admin: profile?.is_admin ?? false,
  };

  return (
    <DashboardShell creator={creator}>
      {children}
    </DashboardShell>
  );
}

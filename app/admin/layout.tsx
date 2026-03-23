import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: creator } = await supabase.from('sirena_creators').select('id, display_name, username, plan, is_admin').eq('id', user.id).single();
  if (!creator || !creator.is_admin) redirect('/dashboard');

  return <DashboardShell creator={creator}>{children}</DashboardShell>;
}

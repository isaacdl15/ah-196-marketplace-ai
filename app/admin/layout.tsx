import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('mp_profiles')
    .select('id, display_name, username, is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  const creator = {
    id: profile.id,
    display_name: profile.display_name ?? user.email?.split('@')[0] ?? 'Admin',
    username: profile.username ?? '',
    plan: 'admin',
    is_admin: true,
  };

  return (
    <DashboardShell creator={creator}>
      {children}
    </DashboardShell>
  );
}

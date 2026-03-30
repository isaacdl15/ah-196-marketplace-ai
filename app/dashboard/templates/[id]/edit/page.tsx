export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import TemplateEditClient from './TemplateEditClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('mp_profiles')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/dashboard');

  // Fetch the template — seller must own it (or admin)
  const query = supabase
    .from('mp_templates')
    .select('*')
    .eq('id', id);

  if (!profile.is_admin) {
    query.eq('seller_id', profile.id);
  }

  const { data: template } = await query.single();
  if (!template) notFound();

  return <TemplateEditClient template={template} />;
}

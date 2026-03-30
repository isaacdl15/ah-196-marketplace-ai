export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import AdminTemplatesClient from './AdminTemplatesClient';

export default async function AdminTemplatesPage() {
  const supabase = createAdminClient();

  const { data: rawTemplates } = await supabase
    .from('mp_templates')
    .select(`
      id, title, slug, category, price_cents, is_free, status, downloads, rating_avg, created_at,
      mp_profiles!seller_id (display_name, username)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  // Normalize joined data (supabase returns array for joins)
  const templates = (rawTemplates ?? []).map(t => ({
    ...t,
    mp_profiles: Array.isArray(t.mp_profiles) ? (t.mp_profiles[0] ?? null) : t.mp_profiles,
  }));

  return <AdminTemplatesClient templates={templates} />;
}

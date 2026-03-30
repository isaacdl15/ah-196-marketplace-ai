export const runtime = 'nodejs';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = adminClient();
  const { data: profile } = await admin.from('mp_profiles').select('*').eq('user_id', user.id).single();
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });
  if (!profile.is_seller) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { data: templates } = await admin
    .from('mp_templates')
    .select('id, status, downloads, rating_avg')
    .eq('seller_id', profile.id)
    .is('deleted_at', null);

  const allTemplates = templates ?? [];
  const total_templates = allTemplates.length;
  const published_templates = allTemplates.filter(t => t.status === 'published').length;
  const total_downloads = allTemplates.reduce((s, t) => s + (t.downloads ?? 0), 0);

  const publishedTemplates = allTemplates.filter(t => t.status === 'published');
  const ratingsWithValues = publishedTemplates.filter(t => t.rating_avg != null);
  const avg_rating = ratingsWithValues.length > 0
    ? ratingsWithValues.reduce((s, t) => s + (t.rating_avg ?? 0), 0) / ratingsWithValues.length
    : null;

  const templateIds = allTemplates.map(t => t.id);
  let total_revenue_cents = 0;
  let recent_purchases: unknown[] = [];

  if (templateIds.length > 0) {
    const { data: purchases } = await admin
      .from('mp_purchases')
      .select('id, template_id, amount_cents, status, created_at')
      .in('template_id', templateIds)
      .eq('status', 'completed');

    total_revenue_cents = (purchases ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0);

    const { data: recentPurchases } = await admin
      .from('mp_purchases')
      .select('id, buyer_id, template_id, amount_cents, status, created_at')
      .in('template_id', templateIds)
      .order('created_at', { ascending: false })
      .limit(5);

    recent_purchases = recentPurchases ?? [];
  }

  return Response.json({
    total_templates,
    published_templates,
    total_downloads,
    total_revenue_cents,
    avg_rating,
    recent_purchases,
  });
}

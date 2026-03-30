import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TemplateDetailPageClient from './TemplateDetailPageClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('mp_templates')
    .select('title, description')
    .eq('slug', slug)
    .single();

  if (!data) return {};
  return {
    title: `${data.title} — marketplace.ai`,
    description: data.description ?? '',
  };
}

export default async function TemplatesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from('mp_templates')
    .select(`
      *,
      mp_profiles!seller_id (id, display_name, username, bio, avatar_url, categories)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!template) notFound();

  const normalizedTemplate = {
    ...template,
    mp_profiles: Array.isArray(template.mp_profiles) ? (template.mp_profiles[0] ?? null) : template.mp_profiles,
  };

  const { data: reviews } = await supabase
    .from('mp_reviews')
    .select('id, rating, review_text, created_at')
    .eq('template_id', template.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: { user } } = await supabase.auth.getUser();

  return <TemplateDetailPageClient template={normalizedTemplate} reviews={reviews ?? []} isLoggedIn={!!user} />;
}

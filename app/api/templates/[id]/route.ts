export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = adminClient();

  const { data, error } = await supabase
    .from('mp_templates')
    .select('id, title, slug, description, category, price_cents, is_free, status, file_url, github_url, demo_url')
    .eq('id', id)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Template not found' }, { status: 404 });
  }

  return Response.json({ template: data });
}

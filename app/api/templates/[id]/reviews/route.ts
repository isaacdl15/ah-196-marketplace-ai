export const runtime = 'nodejs';
import { createClient as createServerClient } from '@/lib/supabase/server';
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
  const admin = adminClient();

  const { data: reviews, error } = await admin
    .from('mp_reviews')
    .select('id, buyer_id, rating, review_text, created_at')
    .eq('template_id', id)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ reviews });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = adminClient();
  const { data: profile } = await admin.from('mp_profiles').select('*').eq('user_id', user.id).single();
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

  const body = await request.json();
  const { rating, review_text } = body;

  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  // Verify purchase
  const { data: purchase } = await admin
    .from('mp_purchases')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('template_id', id)
    .single();

  if (!purchase) return Response.json({ error: 'You must purchase this template before reviewing' }, { status: 403 });

  // Check for existing review
  const { data: existingReview } = await admin
    .from('mp_reviews')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('template_id', id)
    .single();

  if (existingReview) return Response.json({ error: 'You have already reviewed this template' }, { status: 409 });

  const { data: review, error: insertError } = await admin
    .from('mp_reviews')
    .insert({ buyer_id: user.id, template_id: id, rating, review_text: review_text ?? null })
    .select()
    .single();

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 });

  // Recalculate rating on template
  const { data: allReviews } = await admin
    .from('mp_reviews')
    .select('rating')
    .eq('template_id', id);

  const ratings = (allReviews ?? []).map(r => r.rating);
  const rating_count = ratings.length;
  const rating_avg = rating_count > 0 ? ratings.reduce((s, r) => s + r, 0) / rating_count : 0;

  await admin
    .from('mp_templates')
    .update({ rating_avg, rating_count })
    .eq('id', id);

  return Response.json({ review }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const division = searchParams.get('division');
  const ageCategory = searchParams.get('ageCategory');
  const gender = searchParams.get('gender');
  const state = searchParams.get('state');
  const search = searchParams.get('search');
  const qualifiedOnly = searchParams.get('qualifiedOnly') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  let query = supabase.from('rankings').select('*', { count: 'exact' });

  if (division) query = query.eq('division', division);
  if (ageCategory) query = query.eq('age_category', ageCategory);
  if (gender) query = query.eq('gender', gender);
  if (state) query = query.eq('state', state);
  if (qualifiedOnly) query = query.eq('is_qualified', true);
  if (search) {
    query = query.or(`athlete_name.ilike.%${search}%,club.ilike.%${search}%,division.ilike.%${search}%`);
  }

  query = query.order('rank', { ascending: true }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    pageSize: limit,
  });

  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return response;
}

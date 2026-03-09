import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const newId = crypto.randomUUID();
  const { data: athlete, error } = await supabase.from('athletes').insert({
    id: newId,
    sport80_uuid: newId,
    first_name: body.firstName,
    last_name: body.lastName,
    dob: body.dob || null,
    gender: body.gender || null,
    state: body.state || null,
    club_name: body.clubName || null,
  }).select().single();

  if (error || !athlete) {
    return NextResponse.json({ error: 'Failed to create athlete' }, { status: 500 });
  }

  const { data: match } = await supabase.from('match_results').select('*').eq('id', id).single();
  if (match) {
    const corner = !match.blue_athlete_id ? 'blue' : 'red';
    const updates: Record<string, unknown> = { resolution_status: 'RESOLVED' };
    if (corner === 'blue') updates.blue_athlete_id = newId;
    else updates.red_athlete_id = newId;
    await supabase.from('match_results').update(updates).eq('id', id);
  }

  return NextResponse.json({ success: true, athleteId: newId });
}

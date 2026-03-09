import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const { athleteId, corner } = await request.json();
  const supabase = createAdminClient();

  const { data: match } = await supabase.from('match_results').select('*').eq('id', id).single();
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

  const updates: Record<string, unknown> = { resolution_status: 'RESOLVED' };
  if (corner === 'blue' || !corner) updates.blue_athlete_id = athleteId;
  if (corner === 'red') updates.red_athlete_id = athleteId;

  await supabase.from('match_results').update(updates).eq('id', id);

  const rawName = corner === 'red' ? match.red_athlete_raw_name : match.blue_athlete_raw_name;
  const state = corner === 'red' ? match.red_athlete_state : match.blue_athlete_state;
  const wtfId = corner === 'red' ? match.red_athlete_wtf_id : match.blue_athlete_wtf_id;

  if (rawName) {
    await supabase.from('identity_mappings').upsert({
      daedo_name: rawName,
      daedo_wtf_id: wtfId,
      daedo_state: state,
      athlete_id: athleteId,
      confidence: 1.0,
      resolution_method: 'MANUAL',
      resolved_by: auth.user.email,
    }, { onConflict: 'daedo_name,daedo_state' });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseDaedoCsv } from '@/lib/daedo/parser';
import { resolveIdentity } from '@/lib/identity/resolver';
import { BUCKETS } from '@/lib/storage';
import { recalculateRankings } from '@/lib/ranking/recalculate';

export async function POST(request: NextRequest, { params }: { params: Promise<{ uploadId: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { uploadId } = await params;
  const supabase = createAdminClient();

  const { data: upload, error: uploadError } = await supabase
    .from('csv_uploads')
    .select('*, events(id, grade, grade_tier, start_date)')
    .eq('id', uploadId)
    .single();

  if (uploadError || !upload) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }

  try {
    await supabase.from('csv_uploads').update({ status: 'PARSING' }).eq('id', uploadId);

    const { data: fileData, error: fileError } = await supabase.storage
      .from(BUCKETS.daedoCsvs)
      .download(upload.storage_path);

    if (fileError || !fileData) {
      throw new Error('Failed to download CSV file');
    }

    const csvContent = await fileData.text();
    const parseResult = parseDaedoCsv(csvContent);

    await supabase.from('csv_uploads').update({
      status: 'RESOLVING',
      total_rows: parseResult.totalRows,
      parsed_count: parseResult.rows.length,
      error_count: parseResult.errorRows.length,
      error_details: parseResult.errorRows.length > 0 ? { rows: parseResult.errorRows } : null,
    }).eq('id', uploadId);

    for (const row of parseResult.rows) {
      let blueAthleteId: string | null = null;
      if (row.blueAthleteRawName && upload.event_id) {
        const resolution = await resolveIdentity(supabase, {
          daedoName: row.blueAthleteRawName,
          daedoWtfId: row.blueAthleteWtfId,
          daedoState: row.blueAthleteState,
          eventId: upload.event_id,
          divisionName: row.divisionName,
        });
        blueAthleteId = resolution.athleteId;

        if (resolution.athleteId && !resolution.needsManualReview) {
          await supabase.from('identity_mappings').upsert({
            daedo_name: row.blueAthleteRawName,
            daedo_wtf_id: row.blueAthleteWtfId,
            daedo_state: row.blueAthleteState,
            athlete_id: resolution.athleteId,
            confidence: resolution.confidence,
            resolution_method: resolution.method,
            resolved_by: 'system',
          }, { onConflict: 'daedo_name,daedo_state' });
        }
      }

      let redAthleteId: string | null = null;
      if (row.redAthleteRawName && upload.event_id) {
        const resolution = await resolveIdentity(supabase, {
          daedoName: row.redAthleteRawName,
          daedoWtfId: row.redAthleteWtfId,
          daedoState: row.redAthleteState,
          eventId: upload.event_id,
          divisionName: row.divisionName,
        });
        redAthleteId = resolution.athleteId;

        if (resolution.athleteId && !resolution.needsManualReview) {
          await supabase.from('identity_mappings').upsert({
            daedo_name: row.redAthleteRawName,
            daedo_wtf_id: row.redAthleteWtfId,
            daedo_state: row.redAthleteState,
            athlete_id: resolution.athleteId,
            confidence: resolution.confidence,
            resolution_method: resolution.method,
            resolved_by: 'system',
          }, { onConflict: 'daedo_name,daedo_state' });
        }
      }

      const resolutionStatus =
        blueAthleteId && redAthleteId ? 'RESOLVED' :
        blueAthleteId || redAthleteId ? 'PARTIAL' :
        'UNRESOLVED';

      if (upload.event_id) {
        await supabase.from('match_results').upsert({
          event_id: upload.event_id,
          upload_id: uploadId,
          daedo_match_number: row.daedoMatchNumber,
          phase_name: row.phaseName,
          division_name: row.divisionName,
          age_category: row.ageCategory,
          gender: row.gender,
          blue_athlete_id: blueAthleteId,
          blue_athlete_raw_name: row.blueAthleteRawName,
          blue_athlete_wtf_id: row.blueAthleteWtfId,
          blue_athlete_state: row.blueAthleteState,
          red_athlete_id: redAthleteId,
          red_athlete_raw_name: row.redAthleteRawName,
          red_athlete_wtf_id: row.redAthleteWtfId,
          red_athlete_state: row.redAthleteState,
          winner: row.winner,
          win_method: row.winMethod,
          score: row.score,
          resolution_status: resolutionStatus,
        }, { onConflict: 'event_id,upload_id,daedo_match_number' });
      }
    }

    await supabase.from('csv_uploads').update({ status: 'CALCULATING' }).eq('id', uploadId);
    await recalculateRankings(supabase);

    await supabase.from('csv_uploads').update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    }).eq('id', uploadId);

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    await supabase.from('csv_uploads').update({
      status: 'FAILED',
      error_details: { error: errorMessage },
    }).eq('id', uploadId);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

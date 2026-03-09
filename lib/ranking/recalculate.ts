import type { SupabaseClient } from '@supabase/supabase-js';
import { derivePlacements, getBracketSize } from '@/lib/daedo/placements';
import { rawPoints, bracketModifier, placementMultiplier, effectivePoints } from '@/lib/ranking/formula';
import { getTierCap } from '@/lib/ranking/caps';
import { getExpiryDate, isResultActive } from '@/lib/ranking/expiry';
import { compareAthletes } from '@/lib/ranking/tiebreaker';

export async function recalculateRankings(supabase: SupabaseClient): Promise<void> {
  // Step 1: Derive placements from match_results and write athlete_results
  const { data: matchGroups } = await supabase
    .from('match_results')
    .select('event_id, division_name, age_category, gender, id, phase_name, blue_athlete_id, red_athlete_id, winner')
    .eq('resolution_status', 'RESOLVED');

  if (matchGroups && matchGroups.length > 0) {
    const groups = new Map<string, typeof matchGroups>();
    for (const match of matchGroups) {
      const key = `${match.event_id}|${match.division_name}|${match.age_category}|${match.gender}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(match);
    }

    const eventIds = [...new Set(matchGroups.map((m: Record<string, string>) => m.event_id))];
    const { data: events } = await supabase
      .from('events')
      .select('id, grade, grade_tier, start_date')
      .in('id', eventIds);

    const eventMap = new Map((events || []).map((e: Record<string, unknown>) => [e.id, e]));

    for (const [key, matches] of groups) {
      const [eventId, divisionName, ageCategory, gender] = key.split('|');
      const event = eventMap.get(eventId) as Record<string, unknown> | undefined;
      if (!event) continue;

      const mappedMatches = matches.map(m => ({
        id: m.id as string,
        phaseName: m.phase_name as string | null,
        blueAthleteId: m.blue_athlete_id as string | null,
        redAthleteId: m.red_athlete_id as string | null,
        winner: m.winner as string | null,
      }));

      const placements = derivePlacements(mappedMatches);
      const bracketSize = getBracketSize(mappedMatches);
      const modifier = bracketModifier(bracketSize);
      const eventDate = event.start_date ? new Date(event.start_date as string) : new Date();

      for (const [athleteId, placement] of placements) {
        const mult = placementMultiplier(placement);
        const rawPts = rawPoints((event.grade as number) || 1, placement, bracketSize);
        const effPts = effectivePoints(rawPts, 1.0);
        const expiryDate = getExpiryDate(eventDate);

        await supabase.from('athlete_results').upsert({
          athlete_id: athleteId,
          event_id: eventId,
          division_name: divisionName,
          age_category: ageCategory || null,
          gender: gender || null,
          placement,
          bracket_size: bracketSize,
          bracket_modifier: modifier,
          placement_multiplier: mult,
          event_grade: event.grade,
          grade_tier: event.grade_tier,
          raw_points: rawPts,
          is_active: isResultActive(eventDate),
          is_counted: true,
          carryover_multiplier: 1.0,
          effective_points: effPts,
          event_date: event.start_date,
          expires_at: expiryDate.toISOString().split('T')[0],
        }, { onConflict: 'athlete_id,event_id,division_name,age_category' });
      }
    }
  }

  // Step 2: Apply caps
  const { data: allResults } = await supabase
    .from('athlete_results')
    .select('id, athlete_id, division_name, age_category, gender, grade_tier, effective_points, is_active')
    .eq('is_active', true);

  if (allResults && allResults.length > 0) {
    const capGroups = new Map<string, typeof allResults>();
    for (const r of allResults) {
      const key = `${r.athlete_id}|${r.division_name}|${r.age_category}|${r.gender}|${r.grade_tier}`;
      if (!capGroups.has(key)) capGroups.set(key, []);
      capGroups.get(key)!.push(r);
    }

    for (const [key, results] of capGroups) {
      const tier = key.split('|')[4];
      const cap = getTierCap(tier || 'LOCAL');
      const sorted = [...results].sort((a, b) => ((b.effective_points as number) || 0) - ((a.effective_points as number) || 0));

      for (let i = 0; i < sorted.length; i++) {
        await supabase
          .from('athlete_results')
          .update({ is_counted: i < cap })
          .eq('id', sorted[i].id);
      }
    }
  }

  // Step 3: Rebuild rankings table
  const { data: countedResults } = await supabase
    .from('athlete_results')
    .select(`
      athlete_id, division_name, age_category, gender,
      effective_points, event_grade, bracket_modifier,
      athletes!inner(id, first_name, last_name, state, club_name, dob)
    `)
    .eq('is_active', true)
    .eq('is_counted', true);

  if (!countedResults || countedResults.length === 0) return;

  const rankGroups = new Map<string, { athleteId: string; division: string; ageCategory: string; gender: string; results: Record<string, unknown>[]; athlete: Record<string, unknown> }>();

  for (const r of countedResults) {
    const key = `${r.athlete_id}|${r.division_name}|${r.age_category}|${r.gender}`;
    if (!rankGroups.has(key)) {
      rankGroups.set(key, {
        athleteId: r.athlete_id as string,
        division: r.division_name as string,
        ageCategory: r.age_category as string,
        gender: r.gender as string,
        results: [],
        athlete: r.athletes as unknown as Record<string, unknown>,
      });
    }
    rankGroups.get(key)!.results.push(r as Record<string, unknown>);
  }

  const rankingEntries = Array.from(rankGroups.values()).map(group => {
    const totalPoints = group.results.reduce((sum, r) => sum + ((r.effective_points as number) || 0), 0);
    return {
      athleteId: group.athleteId,
      division: group.division,
      ageCategory: group.ageCategory,
      gender: group.gender,
      totalPoints,
      eventsCounted: group.results.length,
      athlete: group.athlete,
      results: group.results,
    };
  });

  const divisionGroups = new Map<string, typeof rankingEntries>();
  for (const entry of rankingEntries) {
    const key = `${entry.division}|${entry.ageCategory}|${entry.gender}`;
    if (!divisionGroups.has(key)) divisionGroups.set(key, []);
    divisionGroups.get(key)!.push(entry);
  }

  const rankingRows: Record<string, unknown>[] = [];
  for (const [, entries] of divisionGroups) {
    entries.sort((a, b) => compareAthletes(
      {
        athleteId: a.athleteId,
        totalPoints: a.totalPoints,
        results: a.results.map(r => ({
          effectivePoints: (r.effective_points as number) || 0,
          eventGrade: (r.event_grade as number) || 1,
          winner: false,
          bracketModifier: (r.bracket_modifier as number) || 1.0,
        })),
        dob: (a.athlete as Record<string, string>)?.dob,
      },
      {
        athleteId: b.athleteId,
        totalPoints: b.totalPoints,
        results: b.results.map(r => ({
          effectivePoints: (r.effective_points as number) || 0,
          eventGrade: (r.event_grade as number) || 1,
          winner: false,
          bracketModifier: (r.bracket_modifier as number) || 1.0,
        })),
        dob: (b.athlete as Record<string, string>)?.dob,
      }
    ));

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const athlete = e.athlete as Record<string, string> | null;
      rankingRows.push({
        athlete_id: e.athleteId,
        division: e.division,
        age_category: e.ageCategory,
        gender: e.gender,
        rank: i + 1,
        total_points: e.totalPoints,
        events_counted: e.eventsCounted,
        athlete_name: athlete ? `${athlete.first_name} ${athlete.last_name}` : null,
        state: athlete?.state,
        club: athlete?.club_name,
        is_qualified: i < 3,
        qualification_method: i < 3 ? 'Top National Ranked' : null,
        last_calculated_at: new Date().toISOString(),
      });
    }
  }

  if (rankingRows.length > 0) {
    await supabase.from('rankings').delete().neq('athlete_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('rankings').insert(rankingRows);
  }
}

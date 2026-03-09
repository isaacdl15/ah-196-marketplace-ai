import type { SupabaseClient } from '@supabase/supabase-js';

export type ResolutionMethod = 'DIRECT_ID' | 'EVENT_MATCH' | 'FUZZY' | 'MANUAL';

export interface ResolutionResult {
  athleteId: string | null;
  confidence: number;
  method: ResolutionMethod | null;
  needsManualReview: boolean;
}

/**
 * 3-tier identity resolution
 * AC-IDENT-001.1-5
 */
export async function resolveIdentity(
  supabase: SupabaseClient,
  params: {
    daedoName: string;
    daedoWtfId?: string;
    daedoState?: string;
    eventId: string;
    divisionName?: string;
  }
): Promise<ResolutionResult> {
  const { daedoName, daedoWtfId, daedoState, eventId } = params;

  // Check identity_mappings cache first
  if (daedoName && daedoState) {
    const { data: cached } = await supabase
      .from('identity_mappings')
      .select('athlete_id, confidence, resolution_method')
      .eq('daedo_name', daedoName)
      .eq('daedo_state', daedoState)
      .single();

    if (cached) {
      return {
        athleteId: cached.athlete_id,
        confidence: cached.confidence,
        method: cached.resolution_method as ResolutionMethod,
        needsManualReview: false,
      };
    }
  }

  // Tier 1: Direct WTF ID match
  if (daedoWtfId) {
    const { data: byMembership } = await supabase
      .from('athletes')
      .select('id')
      .eq('membership_number', daedoWtfId)
      .single();

    if (byMembership) {
      return {
        athleteId: byMembership.id,
        confidence: 1.0,
        method: 'DIRECT_ID',
        needsManualReview: false,
      };
    }
  }

  // Tier 2: Event-scoped name + state match
  const nameParts = daedoName?.split(',').map(p => p.trim()) || [];
  if (nameParts.length >= 2) {
    const lastName = nameParts[0];
    const firstInitial = nameParts[1]?.[0];

    if (lastName && firstInitial && daedoState) {
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('athlete_id, athletes!inner(id, first_name, last_name, state)')
        .eq('event_id', eventId)
        .filter('athletes.last_name', 'ilike', lastName)
        .filter('athletes.state', 'eq', daedoState);

      const candidates = (registrations || []).filter((r: Record<string, unknown>) => {
        const athlete = r.athletes as Record<string, string> | null;
        return athlete?.first_name?.[0]?.toUpperCase() === firstInitial.toUpperCase();
      });

      if (candidates.length === 1) {
        return {
          athleteId: ((candidates[0] as unknown) as Record<string, string>).athlete_id,
          confidence: 0.9,
          method: 'EVENT_MATCH',
          needsManualReview: false,
        };
      }
    }
  }

  // Tier 3: Fuzzy - queue for manual review
  return {
    athleteId: null,
    confidence: 0,
    method: null,
    needsManualReview: true,
  };
}

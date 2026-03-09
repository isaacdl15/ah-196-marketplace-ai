/**
 * Derive placements from match-level bracket data
 */
export function derivePlacements(
  matchResults: Array<{
    id: string;
    phaseName: string | null;
    blueAthleteId: string | null;
    redAthleteId: string | null;
    winner: string | null;
  }>
): Map<string, number> {
  const placements = new Map<string, number>();

  const phaseToLoserPlacement: Record<string, number> = {
    'finals': 2,
    'final': 2,
    'semifinals': 3,
    'semifinal': 3,
    'quarterfinals': 5,
    'quarterfinal': 5,
    'round of 8': 5,
    'round of 16': 9,
    'r16': 9,
    'round of 32': 17,
    'r32': 17,
    'round of 64': 33,
    'r64': 33,
  };

  const finalsMatch = matchResults.find(m =>
    m.phaseName?.toLowerCase() === 'finals' || m.phaseName?.toLowerCase() === 'final'
  );

  if (finalsMatch) {
    const winner = finalsMatch.winner === 'BLUE' ? finalsMatch.blueAthleteId : finalsMatch.redAthleteId;
    const loser = finalsMatch.winner === 'BLUE' ? finalsMatch.redAthleteId : finalsMatch.blueAthleteId;
    if (winner) placements.set(winner, 1);
    if (loser) placements.set(loser, 2);
  }

  for (const match of matchResults) {
    const phaseLower = (match.phaseName || '').toLowerCase();
    const loserPlacement = phaseToLoserPlacement[phaseLower];

    if (loserPlacement && loserPlacement > 2) {
      const loser = match.winner === 'BLUE' ? match.redAthleteId : match.blueAthleteId;
      if (loser && !placements.has(loser)) {
        placements.set(loser, loserPlacement);
      }
    }
  }

  return placements;
}

export function getBracketSize(matchResults: Array<{ blueAthleteId: string | null; redAthleteId: string | null }>): number {
  const athletes = new Set<string>();
  for (const m of matchResults) {
    if (m.blueAthleteId) athletes.add(m.blueAthleteId);
    if (m.redAthleteId) athletes.add(m.redAthleteId);
  }
  return athletes.size;
}

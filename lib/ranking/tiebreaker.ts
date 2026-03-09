interface AthleteRankData {
  athleteId: string;
  totalPoints: number;
  results: {
    effectivePoints: number;
    eventGrade: number;
    winner: boolean;
    bracketModifier: number;
  }[];
  dob?: string;
}

/**
 * 4-level tiebreaker cascade
 * AC-CALC-003.1-4
 */
export function compareAthletes(a: AthleteRankData, b: AthleteRankData): number {
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;

  const grades = [30, 20, 10, 5, 2, 1];
  for (const grade of grades) {
    const aWins = a.results.filter(r => r.eventGrade === grade && r.winner).length;
    const bWins = b.results.filter(r => r.eventGrade === grade && r.winner).length;
    if (bWins !== aWins) return bWins - aWins;
  }

  const aBest = Math.max(...a.results.map(r => r.effectivePoints), 0);
  const bBest = Math.max(...b.results.map(r => r.effectivePoints), 0);
  if (bBest !== aBest) return bBest - aBest;

  const aBracketSum = a.results.reduce((sum, r) => sum + r.bracketModifier, 0);
  const bBracketSum = b.results.reduce((sum, r) => sum + r.bracketModifier, 0);
  if (bBracketSum !== aBracketSum) return bBracketSum - aBracketSum;

  if (a.dob && b.dob) {
    return new Date(a.dob).getTime() - new Date(b.dob).getTime();
  }

  return 0;
}

/**
 * Placement multiplier: 1st = 10.0, then 0.6 decay for places 2-4, 0.7 decay for places 5+
 * AC-CALC-001.2
 */
export function placementMultiplier(placement: number): number {
  if (placement === 1) return 10.0;
  if (placement <= 4) {
    return 10.0 * Math.pow(0.6, placement - 1);
  }
  const place4Value = 10.0 * Math.pow(0.6, 3);
  return place4Value * Math.pow(0.7, placement - 4);
}

/**
 * Bracket modifier: 0.75 for 1-4 athletes, 1.00 for 5+
 * AC-CALC-001.3
 */
export function bracketModifier(bracketSize: number): number {
  return bracketSize >= 5 ? 1.0 : 0.75;
}

/**
 * Raw points formula: (grade * 10) * placementMultiplier * bracketModifier
 * AC-CALC-001.1
 */
export function rawPoints(grade: number, placement: number, bracketSize: number): number {
  const mult = placementMultiplier(placement);
  const mod = bracketModifier(bracketSize);
  return (grade * 10) * mult * mod;
}

/**
 * Effective points after carryover multiplier
 * AC-CALC-001.5
 */
export function effectivePoints(rawPts: number, carryoverMultiplier: number = 1.0): number {
  return rawPts * carryoverMultiplier;
}

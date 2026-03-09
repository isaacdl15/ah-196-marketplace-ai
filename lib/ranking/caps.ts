/**
 * Per-tier best-of-N caps
 * AC-CALC-002.1
 */
export const TIER_CAPS: Record<string, number> = {
  LOCAL: 2,
  STATE: 2,
  REGIONAL: 2,
  NATIONALS: 1,
  FINALS: 1,
  US_OPEN: 1,
};

export function getTierCap(gradeTier: string): number {
  return TIER_CAPS[gradeTier] ?? 2;
}

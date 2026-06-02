/**
 * ScoringEngine
 * 
 * Currently contains the original calcVitality logic.
 * Will be extended with pluggable scorers for Exercise, Nutrition, Habits (negative), Toxins, etc.
 */

export function calcVitality(supplement) {
  if (!supplement) return 0;
  const l = supplement.longevity ?? 70;
  const q = supplement.qol ?? 70;
  return Math.round(l * 0.65 + q * 0.35);
}

// Placeholder for future multi-domain scoring
export function createScoringEngine() {
  return {
    calcVitality,
    // TODO: registerDomainScorer('exercise', fn)
    // TODO: calculateTotalImpact(organ, contributions[])
  };
}

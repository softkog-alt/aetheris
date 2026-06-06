/**
 * ScoringEngine
 * 
 * calcVitality: overall node vitality from longevity + QoL.
 * personalizedScore: 0-100 "how good is this for YOU" based on local personal metrics.
 *   - Pure function, works offline, manually curated rules (research-aligned, no hallucinated advice).
 *   - Used by HoverPopup, inspector, and modals for the green match badge (#7).
 */

export function calcVitality(supplement) {
  if (!supplement) return 0;
  const l = supplement.longevity ?? 70;
  const q = supplement.qol ?? 70;
  return Math.round(l * 0.65 + q * 0.35);
}

/**
 * Compute a personalized 0-100 match score for a node given the user's personalData.
 * Factors (lightweight, deterministic, client-side):
 * - Organ overlap with known user needs (BP, sleep, age/muscle, mood, digestion)
 * - Category / node flags that commonly help specific profiles
 * - Penalties for contraindicated areas when detectable from profile
 * Base is around the node's vitality, nudged by profile fit.
 */
export function personalizedScore(node, p = {}) {
  if (!node) return 0;
  const base = Math.max(30, Math.min(95, node.vitality ?? calcVitality(node) ?? 60));

  let delta = 0;

  const age = parseInt(p.age, 10) || 0;
  const sys = parseInt(p.systolic, 10) || 0;
  const dia = parseInt(p.diastolic, 10) || 0;
  const sleep = (p.sleep || '').toLowerCase();
  const push = parseInt(p.pushups, 10) || 0;
  const mood = (p.mood || '').toLowerCase();
  const digestion = (p.digestion || '').toLowerCase();
  const gender = (p.gender || '').toLowerCase();

  const organs = new Set((node.organs || []).map(o => String(o).toLowerCase()));
  const cat = (node.cat || '').toLowerCase();
  const name = (node.name || '').toLowerCase();
  const isNeg = !!(node.impact === 'negative' || node._isNegative);

  if (isNeg) {
    // Harm nodes rarely get high personal "match" scores; at best neutral-low
    return Math.max(15, Math.round(base * 0.35));
  }

  // BP / cardio / endothelial
  if ((sys > 130 || dia > 85) && (organs.has('heart') || organs.has('mito') || cat.includes('cardio') || /omega|citru|coq|beet|garlic|taurine/.test(name))) {
    delta += 9;
  }
  if ((sys > 130 || dia > 85) && (organs.has('heart') || /l-citrulline|coenzyme|omega-3/.test(name))) {
    delta += 4; // extra emphasis
  }

  // Sleep / recovery / inhibitory
  if ((sleep === 'poor' || sleep === 'fair') && (organs.has('brain') || organs.has('nerves') || /magnes|taurine|glycine|lthean|apigenin|ashwagandha/.test(name) || cat.includes('sleep'))) {
    delta += 11;
  }

  // Age + sarcopenia / muscle / bone
  if (age >= 45 && (organs.has('muscle') || organs.has('bones') || /creatine|protein|vit d|collagen|beta|leucine/.test(name) || cat.includes('muscle'))) {
    delta += (age > 55 ? 10 : 7);
  }
  if (age > 50 && push < 20 && (organs.has('muscle') || /creatine/.test(name))) {
    delta += 6;
  }

  // Mood / low energy
  if (mood === 'low' && (organs.has('brain') || /omega|vit d|d3|magnes|rhodiola|sam|5htp|lthean/.test(name))) {
    delta += 8;
  }

  // Digestion / gut
  if (digestion === 'poor' && (organs.has('gut') || /fiber|probiot|butyr|glutam|curcum|ginger/.test(name) || cat.includes('gut'))) {
    delta += 7;
  }

  // General foundational boosters for most profiles
  if (/vit d|omega|magnes/.test(name)) delta += 3;

  // Gender nuance (light): women often benefit from iron/ferritin awareness but we don't push supps here; slight tilt to bone/heart for post-menopausal hint
  if (gender === 'female' && age > 45 && (organs.has('bones') || organs.has('heart'))) {
    delta += 3;
  }

  // Cap the nudge so we don't claim magic; keep believable
  const score = Math.round(Math.max(25, Math.min(98, base + delta)));
  return score;
}

// Placeholder for future multi-domain scoring
export function createScoringEngine() {
  return {
    calcVitality,
    personalizedScore,
    // TODO: registerDomainScorer('exercise', fn)
  };
}

import type { FounderIntentInput, GenomeAlignment } from './types.js';

function tokenOverlap(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const wordsB = b.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  if (!wordsA.size || !wordsB.length) return 0;
  let hits = 0;
  for (const w of wordsB) if (wordsA.has(w)) hits += 1;
  return hits / Math.max(wordsB.length, 1);
}

export function evaluateGenomeAlignment(intent: FounderIntentInput): GenomeAlignment {
  const genome = intent.genome_snapshot;
  if (!genome) {
    return {
      score: 65,
      aligned_traits: [],
      misaligned_traits: ['genome_snapshot_not_provided'],
      summary: 'Company Genome™ not supplied — using neutral alignment baseline.',
    };
  }

  const intentText = [
    intent.raw_intent,
    intent.category,
    ...(intent.tags ?? []),
    ...(intent.materials ?? []),
    intent.lighting_profile,
  ]
    .filter(Boolean)
    .join(' ');

  const references = [
    { key: 'material_language', value: genome.material_language },
    { key: 'editorial_direction', value: genome.editorial_direction },
    { key: 'lighting_style', value: genome.lighting_style },
    { key: 'photography_direction', value: genome.photography_direction },
    { key: 'brand_dna', value: genome.brand_dna },
  ].filter((r) => r.value?.trim());

  const aligned_traits: string[] = [];
  const misaligned_traits: string[] = [];
  let total = 0;
  let hits = 0;

  for (const ref of references) {
    const overlap = tokenOverlap(ref.value!, intentText);
    total += 1;
    if (overlap >= 0.15) {
      hits += overlap;
      aligned_traits.push(ref.key);
    } else if (overlap < 0.05 && intentText.length > 20) {
      misaligned_traits.push(ref.key);
    }
  }

  const confidenceBoost =
    ((genome.creative_dna_confidence ?? 70) + (genome.visual_dna_confidence ?? 70)) / 200;
  const rawScore = total > 0 ? (hits / total) * 100 : 50;
  const score = Math.round(Math.min(98, Math.max(35, rawScore * 0.7 + confidenceBoost * 30)));

  let summary: string;
  if (score >= 80) {
    summary = 'This concept is highly aligned with your Company Genome™.';
  } else if (score >= 60) {
    summary = 'Reasonably aligned with Company Genome™ — minor creative drift possible.';
  } else {
    summary = 'Low genome alignment — consider adjusting materials, lighting, or editorial direction.';
  }

  return { score, aligned_traits, misaligned_traits, summary };
}

import type { CreativeConceptFuture, CreativeDirectorOrbRecommendation } from './creative-pipeline-types';
import type { ConceptReuseAnalysis } from './concept-reuse';

function uid(): string {
  return `cds-orb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Orb™ Creative Director — guides vision selection, never generates first. */
export function buildCreativeDirectorOrbRecommendations(
  concepts: CreativeConceptFuture[],
  activeConcept: CreativeConceptFuture | undefined,
  reuseAnalysis: ConceptReuseAnalysis | null,
  mergeLabActive: boolean
): CreativeDirectorOrbRecommendation[] {
  const recs: CreativeDirectorOrbRecommendation[] = [];

  if (concepts.length === 0) {
    recs.push({
      id: uid(),
      message: 'Share your Founder Intent™ — I will generate complete Scene Stack™ concepts, not individual assets.',
      priority: 'high',
      reasoning: 'Vision-first pipeline begins with possibilities.',
    });
    return recs;
  }

  const bestGenome = [...concepts].sort(
    (a, b) => b.analysis.brandGenomeAlignment - a.analysis.brandGenomeAlignment
  )[0];

  if (bestGenome) {
    recs.push({
      id: uid(),
      message: `${bestGenome.tagline} aligns most closely with your Company Genome™ (${bestGenome.analysis.brandGenomeAlignment}% match).`,
      priority: 'high',
      reasoning: 'Brand consistency predicts long-term creative equity.',
    });
  }

  const bestReuse = [...concepts].sort((a, b) => b.analysis.reusePct - a.analysis.reusePct)[0];
  if (bestReuse && bestReuse.analysis.reusePct >= 60) {
    recs.push({
      id: uid(),
      message: `${bestReuse.tagline} will save approximately ${bestReuse.analysis.reusePct}% through asset reuse.`,
      priority: 'medium',
      reasoning: 'Asset Registry™ and Golden Builds™ reduce generation cost.',
    });
  }

  if (mergeLabActive) {
    recs.push({
      id: uid(),
      message: 'I recommend merging the architecture from Concept A with the lighting from Concept B.',
      priority: 'high',
      reasoning: 'Hybrid concepts often outperform single-archetype visions in navigation and genome alignment.',
    });
  }

  const bestMarket = [...concepts].sort((a, b) => {
    const av = parseFloat(a.analysis.marketplacePotential.replace(/[^0-9.]/g, '')) || 0;
    const bv = parseFloat(b.analysis.marketplacePotential.replace(/[^0-9.]/g, '')) || 0;
    return bv - av;
  })[0];

  if (bestMarket) {
    recs.push({
      id: uid(),
      message: `${bestMarket.tagline} has strong Marketplace potential (${bestMarket.analysis.marketplacePotential}).`,
      priority: 'medium',
      reasoning: 'Complete Scene Stacks™ export as marketplace candidates after Golden Build™.',
    });
  }

  if (activeConcept?.isMerged) {
    recs.push({
      id: uid(),
      message: 'Your merged master concept is ready for Concept Approval™ — reverse engineering begins only after you approve.',
      priority: 'high',
      reasoning: 'Production truth follows vision approval, not the reverse.',
    });
  }

  if (reuseAnalysis && reuseAnalysis.overallReusePct > 0) {
    recs.push({
      id: uid(),
      message: reuseAnalysis.summary,
      priority: 'low',
      reasoning: 'Warehouse™ auto-populates from approved concepts — no manual uploads.',
    });
  }

  recs.push({
    id: uid(),
    message: 'I guide creative direction — you approve visions. Studio OS reverse-engineers what you choose.',
    priority: 'low',
    reasoning: 'Orb Creative Director role: recommend with WHY, never generate assets first.',
  });

  return recs.slice(0, 5);
}

export function primaryOrbCreativeDirectorLine(
  recs: CreativeDirectorOrbRecommendation[]
): string {
  return recs.find((r) => r.priority === 'high')?.message ?? recs[0]?.message ?? '';
}

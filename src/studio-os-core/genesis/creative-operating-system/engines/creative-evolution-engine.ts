import { scoreAudienceFit } from '../../studio-intelligence-layer/engines/audience-intelligence-engine';
import { scoreTasteFit } from '../../studio-intelligence-layer/engines/taste-learning-engine';
import { evaluateBrandIntelligence } from '../../brand-discovery-engine/engines/brand-intelligence-layer';
import type { XpsProductionPackage } from '../../studio-production-system/types';
import { getBoardMeetingForPackage } from './board-meeting-engine';
import { recordLessonLearned, recordPerformanceMemory } from './creative-memory-engine';
import { registerEconomyAssetsFromProduction } from './creative-economy-registry';
import { mutateCreativeOperatingSystemStore, readCreativeOperatingSystemStore, setCreativeOrgState } from '../persistence';
import type { XcosEvolutionProposal } from '../types';
import type { XcosEvolutionTarget } from '../constants';

/** Creative Evolution Engine™ — compare predictions vs outcomes and propose improvements */
export function runPostPublicationEvolution(pkg: XpsProductionPackage): XcosEvolutionProposal[] {
  const meeting = getBoardMeetingForPackage(pkg.packageId);
  const brandIntel = evaluateBrandIntelligence({
    brandId: pkg.brandId,
    artifactType: 'campaign-card',
    artifactSummary: pkg.topic,
  });
  const audienceScore = scoreAudienceFit(pkg.brandId, pkg.topic);
  const tasteScore = scoreTasteFit(pkg.brandId, pkg.topic);

  const perf = pkg.performance ?? {
    completionRate: 0.62,
    ctaRate: 0.08,
    watchThrough: 0.55,
    notes: ['Simulated post-publication review'],
  };

  const predictedEngagement = meeting?.expectedOutcomes[0] ?? 'Strong audience comprehension';
  const actualEngagement =
    perf.completionRate && perf.completionRate > 0.6
      ? 'Audience comprehension met prediction'
      : 'Audience comprehension below prediction';

  const proposals: Omit<XcosEvolutionProposal, 'proposalId' | 'createdAt'>[] = [
    {
      target: 'narrative-intelligence',
      brandId: pkg.brandId,
      packageId: pkg.packageId,
      summary: 'Refine narrative opening patterns for this audience segment',
      predictedOutcome: predictedEngagement,
      actualOutcome: actualEngagement,
      delta: actualEngagement.includes('below') ? 'Opening clarity needs improvement' : 'Narrative opening validated',
      recommendation: 'Update Narrative Blueprint hook templates for similar topics',
      confidence: 78,
      status: 'proposed',
    },
    {
      target: 'audience-intelligence',
      brandId: pkg.brandId,
      packageId: pkg.packageId,
      summary: 'Audience segment response calibration',
      predictedOutcome: `Audience fit baseline`,
      actualOutcome: `Observed audience fit ${audienceScore}/100`,
      delta: `${audienceScore >= 75 ? 'Audience model accurate' : 'Audience objections underestimated'}`,
      recommendation: audienceScore >= 75 ? 'Preserve audience model' : 'Expand objection handling in Audience DNA™',
      confidence: audienceScore,
      status: 'proposed',
    },
    {
      target: 'brand-intelligence',
      brandId: pkg.brandId,
      packageId: pkg.packageId,
      summary: 'Brand consistency post-publication review',
      predictedOutcome: 'Brand alignment maintained',
      actualOutcome: `Brand score ${brandIntel.consistency.overallScore}/100`,
      delta: brandIntel.consistency.overallScore >= 75 ? 'Brand expression held' : 'Brand drift detected',
      recommendation: brandIntel.rationale[0] ?? 'Review brand signature usage',
      confidence: brandIntel.consistency.overallScore,
      status: 'proposed',
    },
    {
      target: 'taste-genome',
      brandId: pkg.brandId,
      packageId: pkg.packageId,
      summary: 'Founder taste alignment learning',
      predictedOutcome: 'Creative direction matches founder taste',
      actualOutcome: `Taste fit ${tasteScore}/100`,
      delta: tasteScore >= 80 ? 'Taste model accurate' : 'Founder preference signal needs refinement',
      recommendation: 'Feed approval/rejection signals into Taste Genome™',
      confidence: tasteScore,
      status: 'proposed',
    },
    {
      target: 'production-genome',
      brandId: pkg.brandId,
      packageId: pkg.packageId,
      summary: 'Production Genome rhythm and department sequencing',
      predictedOutcome: 'Efficient department workflow',
      actualOutcome: `Stage ${pkg.currentStage} with ${pkg.blockingIssues.length} issues logged`,
      delta: pkg.blockingIssues.length === 0 ? 'Production flow validated' : 'Department bottlenecks identified',
      recommendation: 'Adjust Production Genome department defaults for this platform',
      confidence: 70,
      status: 'proposed',
    },
    {
      target: 'decision-dna',
      brandId: pkg.brandId,
      packageId: pkg.packageId,
      summary: 'Founder decision pattern learning',
      predictedOutcome: meeting?.unifiedRecommendation ?? 'Board recommendation accepted',
      actualOutcome: meeting?.founderDecision ?? 'pending',
      delta: 'Compare board recommendation vs founder final decision',
      recommendation: 'Update Decision DNA trade-off weighting for future council sessions',
      confidence: 74,
      status: 'proposed',
    },
    {
      target: 'creative-patterns',
      brandId: pkg.brandId,
      packageId: pkg.packageId,
      summary: 'Reusable creative pattern extraction',
      predictedOutcome: 'Reusable assets identified',
      actualOutcome: `${pkg.assets.filter((a) => a.status === 'approved').length} approved assets`,
      delta: 'Patterns ready for Creative Economy™ registration',
      recommendation: 'Promote high-performing assets to reusable company resources',
      confidence: 82,
      status: 'proposed',
    },
  ];

  const now = new Date().toISOString();
  const saved = proposals.map((p, i) => ({
    ...p,
    proposalId: `evo-${pkg.packageId}-${i}`,
    createdAt: now,
  }));

  mutateCreativeOperatingSystemStore((store) => ({
    ...store,
    orgState: 'learning-cycle',
    evolutionProposals: [...saved, ...store.evolutionProposals.filter((e) => e.packageId !== pkg.packageId)].slice(0, 100),
  }));

  recordPerformanceMemory(pkg, perf.notes);
  recordLessonLearned(
    pkg.brandId,
    `Evolution cycle for ${pkg.topic}`,
    saved.map((s) => s.recommendation).join(' · '),
    pkg.packageId
  );
  registerEconomyAssetsFromProduction(pkg);

  setCreativeOrgState('evolved');
  return saved;
}

export function listEvolutionProposals(brandId?: string): XcosEvolutionProposal[] {
  const proposals = readCreativeOperatingSystemStore().evolutionProposals;
  return brandId ? proposals.filter((p) => p.brandId === brandId) : proposals;
}

export function approveEvolutionProposal(proposalId: string): void {
  mutateCreativeOperatingSystemStore((store) => ({
    ...store,
    evolutionProposals: store.evolutionProposals.map((p) =>
      p.proposalId === proposalId ? { ...p, status: 'approved' } : p
    ),
  }));
}

export function getEvolutionRecommendationsByTarget(target: XcosEvolutionTarget): XcosEvolutionProposal[] {
  return listEvolutionProposals().filter((p) => p.target === target && p.status === 'proposed');
}

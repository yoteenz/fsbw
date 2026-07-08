/**
 * Studio World Responsibility Framework™
 *
 * Every flagship destination has ONE primary mission.
 * No overlap. No duplicate functionality.
 * Canon: docs/studio-os/studio-world-responsibility-framework.md
 */

import type { StudioWorldFlagshipId } from './types';

export type StudioWorldResponsibilityId =
  | 'founder-intent'
  | 'story-table'
  | 'mood-wall'
  | 'creative-strategy'
  | 'parallel-futures'
  | 'future-tournament'
  | 'future-merge'
  | 'creative-reviews'
  | 'concept-approval'
  | 'creative-briefs'
  | 'vision-development'
  | 'narrative-building'
  | 'art-direction'
  | 'scene-planning'
  | 'creative-budget-planning'
  | 'scene-deconstruction'
  | 'asset-registry'
  | 'asset-generation'
  | 'lighting-packs'
  | 'environment-shells'
  | 'furniture'
  | 'materials'
  | 'textures'
  | 'atmosphere'
  | 'particles'
  | 'animation'
  | 'audio'
  | 'assembly'
  | 'versioning'
  | 'reuse'
  | 'production-cost'
  | 'manufacturing-pipeline'
  | 'golden-builds'
  | 'museum'
  | 'hall-of-innovation'
  | 'blueprint-archive'
  | 'company-genome-vault'
  | 'version-history'
  | 'creative-timeline'
  | 'replay'
  | 'historic-headquarters'
  | 'legacy'
  | 'knowledge'
  | 'blueprint-marketplace'
  | 'workspace-marketplace'
  | 'department-marketplace'
  | 'scene-marketplace'
  | 'marketplace-lighting-packs'
  | 'asset-packs'
  | 'genome-presets'
  | 'company-templates'
  | 'premium-headquarters'
  | 'licensing'
  | 'creator-royalties'
  | 'revenue-analytics'
  | 'executive-atrium'
  | 'organization-registry'
  | 'architecture-observatory'
  | 'experience-observatory'
  | 'system-health'
  | 'ai-coordination'
  | 'notifications'
  | 'global-priorities'
  | 'studio-world-atlas'
  | 'master-planner'
  | 'company-switching'
  | 'executive-briefings'
  | 'mission-planning'
  | 'business-execution'
  | 'guided-expedition'
  | 'continuous-learning';

export type StudioWorldPipelineStepId =
  | 'founder-intent'
  | 'creative-direction-imagine'
  | 'future-tournament-evaluate'
  | 'future-merge-refine'
  | 'concept-approval'
  | 'warehouse-manufacture'
  | 'scene-assembly'
  | 'golden-build'
  | 'archives-preserve'
  | 'marketplace-share'
  | 'headquarters-execute'
  | 'studio-world-learn';

export type FlagshipResponsibilityLaw = {
  id: StudioWorldFlagshipId;
  displayName: string;
  mission: string;
  missionVerbs: [string, string, string, string];
  oneQuestion: string;
  successPhrase: string;
  exclusiveResponsibilities: StudioWorldResponsibilityId[];
  forbiddenActions: string[];
  outputArtifact: string;
  receivesFrom: StudioWorldFlagshipId | 'founder' | null;
  handsTo: StudioWorldFlagshipId | null;
};

export const STUDIO_WORLD_ECOSYSTEM_MISSION =
  'Studio World™ is the ecosystem — every flagship hands work to the next in one continuous workflow.';

export const FLAGSHIP_RESPONSIBILITY_LAWS: Record<StudioWorldFlagshipId, FlagshipResponsibilityLaw> = {
  'creative-direction-studio': {
    id: 'creative-direction-studio',
    displayName: 'Creative Direction Studio™',
    mission: 'Imagine · Invent · Explore · Direct',
    missionVerbs: ['Imagine', 'Invent', 'Explore', 'Direct'],
    oneQuestion: 'What happens here that cannot happen anywhere else?',
    successPhrase: 'I create ideas here.',
    exclusiveResponsibilities: [
      'founder-intent',
      'story-table',
      'mood-wall',
      'creative-strategy',
      'parallel-futures',
      'future-tournament',
      'future-merge',
      'creative-reviews',
      'concept-approval',
      'creative-briefs',
      'vision-development',
      'narrative-building',
      'art-direction',
      'scene-planning',
      'creative-budget-planning',
    ],
    forbiddenActions: ['manufacture', 'archive', 'sell', 'orchestrate-company'],
    outputArtifact: 'Approved creative vision — not assets.',
    receivesFrom: 'founder',
    handsTo: 'studio-warehouse',
  },
  'studio-warehouse': {
    id: 'studio-warehouse',
    displayName: 'Studio Warehouse™',
    mission: 'Manufacture · Assemble · Reuse · Produce',
    missionVerbs: ['Manufacture', 'Assemble', 'Reuse', 'Produce'],
    oneQuestion: 'What happens here that cannot happen anywhere else?',
    successPhrase: 'I manufacture ideas here.',
    exclusiveResponsibilities: [
      'scene-deconstruction',
      'asset-registry',
      'asset-generation',
      'lighting-packs',
      'environment-shells',
      'furniture',
      'materials',
      'textures',
      'atmosphere',
      'particles',
      'animation',
      'audio',
      'assembly',
      'versioning',
      'reuse',
      'production-cost',
      'manufacturing-pipeline',
    ],
    forbiddenActions: ['invent', 'archive-permanently', 'sell', 'orchestrate'],
    outputArtifact: 'Reusable building blocks and assembled scenes.',
    receivesFrom: 'creative-direction-studio',
    handsTo: 'studio-archives',
  },
  'studio-archives': {
    id: 'studio-archives',
    displayName: 'Studio Archives™',
    mission: 'Remember · Preserve · Teach · Celebrate',
    missionVerbs: ['Remember', 'Preserve', 'Teach', 'Celebrate'],
    oneQuestion: 'What happens here that cannot happen anywhere else?',
    successPhrase: 'I preserve ideas here.',
    exclusiveResponsibilities: [
      'golden-builds',
      'museum',
      'hall-of-innovation',
      'blueprint-archive',
      'company-genome-vault',
      'version-history',
      'creative-timeline',
      'replay',
      'historic-headquarters',
      'legacy',
      'knowledge',
    ],
    forbiddenActions: ['generate', 'manufacture', 'sell', 'orchestrate'],
    outputArtifact: 'Institutional memory — preserved forever.',
    receivesFrom: 'studio-warehouse',
    handsTo: 'marketplace',
  },
  marketplace: {
    id: 'marketplace',
    displayName: 'Marketplace™',
    mission: 'Share · Exchange · License · Monetize',
    missionVerbs: ['Share', 'Exchange', 'License', 'Monetize'],
    oneQuestion: 'What happens here that cannot happen anywhere else?',
    successPhrase: 'I share ideas here.',
    exclusiveResponsibilities: [
      'blueprint-marketplace',
      'workspace-marketplace',
      'department-marketplace',
      'scene-marketplace',
      'marketplace-lighting-packs',
      'asset-packs',
      'genome-presets',
      'company-templates',
      'premium-headquarters',
      'licensing',
      'creator-royalties',
      'revenue-analytics',
    ],
    forbiddenActions: ['generate', 'create', 'manufacture', 'archive-origin'],
    outputArtifact: 'Licensed and monetized distribution of existing work.',
    receivesFrom: 'studio-archives',
    handsTo: 'headquarters',
  },
  'studio-command-center': {
    id: 'studio-command-center',
    displayName: 'Command Center™',
    mission: 'Operate · Observe · Coordinate',
    missionVerbs: ['Operate', 'Observe', 'Coordinate', 'Command'],
    oneQuestion: 'What happens here that cannot happen anywhere else?',
    successPhrase: 'I oversee everything here.',
    exclusiveResponsibilities: [
      'executive-atrium',
      'organization-registry',
      'architecture-observatory',
      'experience-observatory',
      'system-health',
      'ai-coordination',
      'notifications',
      'global-priorities',
      'studio-world-atlas',
      'master-planner',
      'company-switching',
      'executive-briefings',
      'mission-planning',
    ],
    forbiddenActions: ['create', 'manufacture', 'archive', 'sell'],
    outputArtifact: 'Orchestration intelligence — the brain of Studio World™.',
    receivesFrom: null,
    handsTo: null,
  },
  headquarters: {
    id: 'headquarters',
    displayName: 'Headquarters™',
    mission: 'Execute · Operate · Grow',
    missionVerbs: ['Execute', 'Operate', 'Grow', 'Run'],
    oneQuestion: 'What happens here that cannot happen anywhere else?',
    successPhrase: 'I run my company here.',
    exclusiveResponsibilities: ['business-execution'],
    forbiddenActions: ['invent-vision', 'manufacture-assets', 'archive-golden-builds', 'marketplace-listing'],
    outputArtifact: 'Actual business work across every department.',
    receivesFrom: 'marketplace',
    handsTo: null,
  },
  'expedition-hub': {
    id: 'expedition-hub',
    displayName: 'Expedition Hub™',
    mission: 'Transform · Guide · Coach',
    missionVerbs: ['Transform', 'Guide', 'Coach', 'Journey'],
    oneQuestion: 'What happens here that cannot happen anywhere else?',
    successPhrase: 'I transform my company here.',
    exclusiveResponsibilities: ['guided-expedition'],
    forbiddenActions: ['replace-flagship-mission', 'duplicate-production', 'duplicate-archives'],
    outputArtifact: 'Guided multi-destination journeys.',
    receivesFrom: null,
    handsTo: null,
  },
};

export const STUDIO_WORLD_PIPELINE: Array<{
  id: StudioWorldPipelineStepId;
  label: string;
  verb: string;
  flagshipId: StudioWorldFlagshipId;
}> = [
  { id: 'founder-intent', label: 'Founder Intent™', verb: 'Declare', flagshipId: 'creative-direction-studio' },
  { id: 'creative-direction-imagine', label: 'Creative Direction Studio™', verb: 'Imagine', flagshipId: 'creative-direction-studio' },
  { id: 'future-tournament-evaluate', label: 'Future Tournament™', verb: 'Evaluate', flagshipId: 'creative-direction-studio' },
  { id: 'future-merge-refine', label: 'Future Merge™', verb: 'Refine', flagshipId: 'creative-direction-studio' },
  { id: 'concept-approval', label: 'Concept Approval™', verb: 'Approve', flagshipId: 'creative-direction-studio' },
  { id: 'warehouse-manufacture', label: 'Studio Warehouse™', verb: 'Manufacture', flagshipId: 'studio-warehouse' },
  { id: 'scene-assembly', label: 'Scene Assembly™', verb: 'Build', flagshipId: 'studio-warehouse' },
  { id: 'golden-build', label: 'Golden Build™', verb: 'Complete', flagshipId: 'studio-warehouse' },
  { id: 'archives-preserve', label: 'Studio Archives™', verb: 'Preserve', flagshipId: 'studio-archives' },
  { id: 'marketplace-share', label: 'Marketplace™', verb: 'Share', flagshipId: 'marketplace' },
  { id: 'headquarters-execute', label: 'Headquarters™', verb: 'Execute', flagshipId: 'headquarters' },
  { id: 'studio-world-learn', label: 'Studio World™', verb: 'Continuously Learn', flagshipId: 'studio-command-center' },
];

/** Route / module hints → owning flagship (exclusive responsibility law) */
const RESPONSIBILITY_OWNERS: Record<string, StudioWorldFlagshipId> = {
  'founder-intent': 'creative-direction-studio',
  'story-table': 'creative-direction-studio',
  'parallel-futures': 'creative-direction-studio',
  'future-tournament': 'creative-direction-studio',
  'future-merge': 'creative-direction-studio',
  'concept-approval': 'creative-direction-studio',
  'scene-deconstruction': 'studio-warehouse',
  'asset-registry': 'studio-warehouse',
  'asset-factory': 'studio-warehouse',
  'asset-library': 'studio-warehouse',
  'asset-director': 'studio-warehouse',
  'generation-bay': 'studio-warehouse',
  'golden-build': 'studio-warehouse',
  'scene-assembly': 'studio-warehouse',
  museum: 'studio-archives',
  'hall-of-innovation': 'studio-archives',
  'blueprint-archive': 'studio-archives',
  'company-genome': 'studio-archives',
  legacy: 'studio-archives',
  marketplace: 'marketplace',
  licensing: 'marketplace',
  'world-atlas': 'studio-command-center',
  'architecture-observatory': 'studio-command-center',
  'experience-observatory': 'studio-command-center',
  'master-planner': 'studio-command-center',
  'expedition-hub': 'expedition-hub',
  'expansion-center': 'expedition-hub',
};

export function getFlagshipResponsibilityLaw(
  flagshipId: StudioWorldFlagshipId
): FlagshipResponsibilityLaw {
  return FLAGSHIP_RESPONSIBILITY_LAWS[flagshipId];
}

export function resolveFlagshipForResponsibility(
  responsibilityId: StudioWorldResponsibilityId | string
): StudioWorldFlagshipId | null {
  for (const law of Object.values(FLAGSHIP_RESPONSIBILITY_LAWS)) {
    if (law.exclusiveResponsibilities.includes(responsibilityId as StudioWorldResponsibilityId)) {
      return law.id;
    }
  }
  return RESPONSIBILITY_OWNERS[responsibilityId] ?? null;
}

export function assertFeatureBelongsToFlagship(
  featureSlug: string,
  expectedFlagshipId: StudioWorldFlagshipId
): { ok: true } | { ok: false; owner: StudioWorldFlagshipId | null; message: string } {
  const owner =
    RESPONSIBILITY_OWNERS[featureSlug] ?? resolveFlagshipForResponsibility(featureSlug);
  if (!owner || owner === expectedFlagshipId) return { ok: true };
  const expected = FLAGSHIP_RESPONSIBILITY_LAWS[expectedFlagshipId].displayName;
  const actual = FLAGSHIP_RESPONSIBILITY_LAWS[owner].displayName;
  return {
    ok: false,
    owner,
    message: `${featureSlug} belongs to ${actual}, not ${expected}.`,
  };
}

export type ResponsibilityOverlapViolation = {
  responsibilityId: StudioWorldResponsibilityId;
  flagships: StudioWorldFlagshipId[];
};

/** Audit exclusive responsibility lists — should return empty when canon is clean */
export function auditResponsibilityOverlap(): ResponsibilityOverlapViolation[] {
  const index = new Map<StudioWorldResponsibilityId, StudioWorldFlagshipId[]>();
  for (const law of Object.values(FLAGSHIP_RESPONSIBILITY_LAWS)) {
    for (const r of law.exclusiveResponsibilities) {
      const list = index.get(r) ?? [];
      list.push(law.id);
      index.set(r, list);
    }
  }
  const violations: ResponsibilityOverlapViolation[] = [];
  for (const [responsibilityId, flagships] of index) {
    if (flagships.length > 1) violations.push({ responsibilityId, flagships });
  }
  return violations;
}

export function getPipelineHandoff(
  fromFlagshipId: StudioWorldFlagshipId
): { to: StudioWorldFlagshipId; artifact: string } | null {
  const law = FLAGSHIP_RESPONSIBILITY_LAWS[fromFlagshipId];
  if (!law.handsTo) return null;
  return {
    to: law.handsTo,
    artifact: law.outputArtifact,
  };
}

export function formatFlagshipMission(flagshipId: StudioWorldFlagshipId): string {
  const law = FLAGSHIP_RESPONSIBILITY_LAWS[flagshipId];
  return `${law.displayName} — ${law.mission}`;
}

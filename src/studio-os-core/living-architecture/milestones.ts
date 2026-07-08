/**
 * Architectural Milestones™ — earned thresholds per district.
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';
import type { ArchitecturalMilestone, LivingArchitectureTier } from './types';

export type MilestoneThreshold = {
  id: string;
  districtId: DistrictThemeId;
  tier: LivingArchitectureTier;
  title: string;
  architecturalChange: string;
  /** Returns true when milestone is earned */
  test: (signals: import('./types').LivingArchitectureSignals) => boolean;
  causedBy: string;
};

export const ARCHITECTURAL_MILESTONE_THRESHOLDS: MilestoneThreshold[] = [
  // ── Warehouse™ ──
  {
    id: 'wh-first-bay',
    districtId: 'warehouse',
    tier: 1,
    title: 'First Production Bay™',
    architecturalChange: 'Generation Bay™ commissioned — asset production physically begins.',
    test: (s) => s.warehouseAssetCount >= 4,
    causedBy: 'First reusable assets registered to Asset Registry™',
  },
  {
    id: 'wh-material-wing',
    districtId: 'warehouse',
    tier: 2,
    title: 'Material Library Expansion™',
    architecturalChange: 'Material Library™ wing grows — new swatch halls illuminated.',
    test: (s) => s.warehouseAssetCount >= 12,
    causedBy: 'Production catalog reached critical reuse mass',
  },
  {
    id: 'wh-vault-expansion',
    districtId: 'warehouse',
    tier: 3,
    title: 'Asset Vault Expansion™',
    architecturalChange: 'Hero Object Vault™ and restoration bays expand — automation systems advance.',
    test: (s) => s.warehouseGoldenBuildTotal >= 8 || s.warehouseReuseTotal >= 40,
    causedBy: 'Golden Builds™ and reuse efficiency crossed architectural threshold',
  },
  {
    id: 'wh-industrial-campus',
    districtId: 'warehouse',
    tier: 4,
    title: 'Industrial Design Campus™ Matured',
    architecturalChange: 'Full production campus online — blueprint glass, precision lighting, holographic measurement rails.',
    test: (s) => s.warehouseAssetCount >= 24 && s.warehouseReuseTotal >= 80,
    causedBy: 'Sustained asset production and reuse intelligence',
  },
  // ── Museum™ ──
  {
    id: 'mus-first-gallery',
    districtId: 'museum',
    tier: 1,
    title: 'First Exhibition Hall™',
    architecturalChange: 'Legacy Hall opens — first Golden Build™ receives permanent exhibit.',
    test: (s) => s.warehouseGoldenBuildTotal >= 2,
    causedBy: 'Historic breakthrough preserved in Museum Wing™',
  },
  {
    id: 'mus-legacy-wing',
    districtId: 'museum',
    tier: 2,
    title: 'Legacy Wing Expansion™',
    architecturalChange: 'Gallery hallways extend — bronze accents and shadow gaps deepen.',
    test: (s) => s.campusMuseumGalleries >= 2 || s.warehouseGoldenBuildTotal >= 6,
    causedBy: 'Company memory milestones accumulated',
  },
  {
    id: 'mus-monument',
    districtId: 'museum',
    tier: 3,
    title: 'Innovation Monument™',
    architecturalChange: 'Permanent monument commissioned — flagship breakthrough enshrined.',
    test: (s) => s.campusMuseumGalleries >= 4 || s.campusEarnedSpacesActive >= 5,
    causedBy: 'Major company achievement memorialized',
  },
  // ── Knowledge Library™ ──
  {
    id: 'kl-first-shelves',
    districtId: 'knowledge-library',
    tier: 1,
    title: 'Archive Shelves Appear™',
    architecturalChange: 'Warm walnut shelving extends — first knowledge objects catalogued.',
    test: (s) => s.campusKnowledgeTriggers >= 1,
    causedBy: 'Knowledge created and institutionalized',
  },
  {
    id: 'kl-wing-unlock',
    districtId: 'knowledge-library',
    tier: 2,
    title: 'Archive Wing Unlocked™',
    architecturalChange: 'Additional archive halls open — floating holographic books densify.',
    test: (s) => s.campusKnowledgeTriggers >= 2 || s.campusEarnedSpacesActive >= 4,
    causedBy: 'Knowledge Library earned through Campus Evolution™',
  },
  {
    id: 'kl-institute',
    districtId: 'knowledge-library',
    tier: 3,
    title: 'Knowledge Institute Annex™',
    architecturalChange: 'Projection walls activate — drafting tables illuminate new wings.',
    test: (s) => s.campusKnowledgeTriggers >= 4,
    causedBy: 'Living Knowledge Archive™ maturity',
  },
  // ── Marketplace™ ──
  {
    id: 'mp-showcase',
    districtId: 'marketplace',
    tier: 1,
    title: 'Premium Showcase Room™',
    architecturalChange: 'Crystal acrylic showcase unlocks — first innovation exhibited.',
    test: (s) => s.warehouseFavoriteCount >= 2,
    causedBy: 'Marketplace-ready assets flagged for exhibition',
  },
  {
    id: 'mp-pavilion-expand',
    districtId: 'marketplace',
    tier: 2,
    title: 'Pavilion Expansion™',
    architecturalChange: 'Kinetic display walls rotate — community highlights featured.',
    test: (s) => s.campusEarnedSpacesActive >= 3,
    causedBy: 'Marketplace influence and earned campus spaces',
  },
  // ── Innovation District™ ──
  {
    id: 'inv-first-lab',
    districtId: 'innovation-district',
    tier: 1,
    title: 'First Laboratory Appears™',
    architecturalChange: 'Experimental tower rises — prototype space commissioned.',
    test: (s) => s.campusInnovationPct >= 40,
    causedBy: 'Innovation activity crossed activation threshold',
  },
  {
    id: 'inv-campus-expand',
    districtId: 'innovation-district',
    tier: 2,
    title: 'Innovation District Expands™',
    architecturalChange: 'Reactive glass wings extend — kinetic walls respond to new Blueprints.',
    test: (s) => s.campusInnovationPct >= 65 || s.campusOrganicEvolutionCount >= 4,
    causedBy: 'Blueprint breakthroughs and innovation publishing',
  },
  {
    id: 'inv-monument-row',
    districtId: 'innovation-district',
    tier: 3,
    title: 'Innovation Monument Row™',
    architecturalChange: 'Monument row opens — each invention physically commemorated.',
    test: (s) => s.campusInnovationPct >= 80 && s.campusOrganicEvolutionCount >= 5,
    causedBy: 'Sustained innovation lineage and collaborative invention',
  },
  // ── Command Center™ ──
  {
    id: 'scc-operations-floor',
    districtId: 'command-center',
    tier: 1,
    title: 'Operations Floor Unlocked™',
    architecturalChange: 'Command console expands — holographic world map activates.',
    test: (s) => s.campusEarnedSpacesActive >= 2,
    causedBy: 'Organizational maturity milestone',
  },
  {
    id: 'scc-skybridge',
    districtId: 'command-center',
    tier: 2,
    title: 'Skybridge Connected™',
    architecturalChange: 'Skybridge links Headquarters™ — campus density increases.',
    test: (s) => s.campusEarnedSpacesActive >= 6,
    causedBy: 'Multiple departments unlocked across campus',
  },
];

export const TIER_LABELS: Record<LivingArchitectureTier, string> = {
  0: 'Foundational',
  1: 'Emerging',
  2: 'Growing',
  3: 'Mature',
  4: 'Legendary',
};

export function milestonesForDistrict(
  districtId: DistrictThemeId,
  earned: ArchitecturalMilestone[]
): ArchitecturalMilestone[] {
  return earned.filter((m) => m.districtId === districtId);
}

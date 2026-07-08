/**
 * Studio World™ — seven flagship destinations on one connected campus.
 * Responsibility Framework™: docs/studio-os/studio-world-responsibility-framework.md
 */

import type { StudioWorldFlagshipId, StudioWorldLocation } from './types';
import { FLAGSHIP_RESPONSIBILITY_LAWS } from './responsibility-framework';

export const STUDIO_WORLD_CAMPUS_NAME = 'Studio World™';

export type FlagshipDestination = {
  id: StudioWorldFlagshipId;
  displayName: string;
  purpose: string;
  worldEntryPath: string;
  legacyEntryPath: string;
  physicalType: 'command-center' | 'studio' | 'building' | 'headquarters' | 'workshop' | 'pavilion';
};

export const FLAGSHIP_DESTINATIONS: FlagshipDestination[] = [
  {
    id: 'studio-command-center',
    displayName: 'Command Center™',
    purpose: FLAGSHIP_RESPONSIBILITY_LAWS['studio-command-center'].mission,
    worldEntryPath: '/admin/studio/world/command-center',
    legacyEntryPath: '/admin/studio/overview',
    physicalType: 'command-center',
  },
  {
    id: 'creative-direction-studio',
    displayName: 'Creative Direction Studio™',
    purpose: FLAGSHIP_RESPONSIBILITY_LAWS['creative-direction-studio'].mission,
    worldEntryPath: '/admin/studio/world/creative-direction-studio',
    legacyEntryPath: '/admin/studio/department/creative-direction',
    physicalType: 'studio',
  },
  {
    id: 'studio-warehouse',
    displayName: 'Studio Warehouse™',
    purpose: FLAGSHIP_RESPONSIBILITY_LAWS['studio-warehouse'].mission,
    worldEntryPath: '/admin/studio/world/warehouse',
    legacyEntryPath: '/admin/studio/studio-warehouse',
    physicalType: 'workshop',
  },
  {
    id: 'studio-archives',
    displayName: 'Studio Archives™',
    purpose: FLAGSHIP_RESPONSIBILITY_LAWS['studio-archives'].mission,
    worldEntryPath: '/admin/studio/world/archives',
    legacyEntryPath: '/admin/studio/studio-archives',
    physicalType: 'building',
  },
  {
    id: 'marketplace',
    displayName: 'Marketplace™',
    purpose: FLAGSHIP_RESPONSIBILITY_LAWS.marketplace.mission,
    worldEntryPath: '/admin/studio/world/marketplace',
    legacyEntryPath: '/admin/studio/marketplace',
    physicalType: 'pavilion',
  },
  {
    id: 'headquarters',
    displayName: 'Headquarters™',
    purpose: FLAGSHIP_RESPONSIBILITY_LAWS.headquarters.mission,
    worldEntryPath: '/admin/studio/world/headquarters',
    legacyEntryPath: '/admin/headquarters',
    physicalType: 'headquarters',
  },
  {
    id: 'expedition-hub',
    displayName: 'Expedition Hub™',
    purpose: FLAGSHIP_RESPONSIBILITY_LAWS['expedition-hub'].mission,
    worldEntryPath: '/admin/studio/world/expedition-hub',
    legacyEntryPath: '/admin/studio/expansion-center',
    physicalType: 'building',
  },
];

/** District / wing skeleton inside each flagship — rooms hang off these nodes. */
export const FLAGSHIP_DISTRICTS: StudioWorldLocation[] = [
  // Command Center™
  {
    id: 'scc-executive-district',
    displayName: 'Executive District™',
    physicalType: 'district',
    flagshipId: 'studio-command-center',
    worldPath: 'command-center/executive-district',
    teaching: 'Strategic command rooms — briefings, council, timeline.',
  },
  {
    id: 'scc-operations-wing',
    displayName: 'Operations Wing™',
    physicalType: 'wing',
    flagshipId: 'studio-command-center',
    parentId: 'scc-executive-district',
    worldPath: 'command-center/operations-wing',
  },
  {
    id: 'scc-finance-command',
    displayName: 'Finance Command™',
    physicalType: 'command-center',
    flagshipId: 'studio-command-center',
    worldPath: 'command-center/finance-command',
  },
  {
    id: 'scc-performance-observatory',
    displayName: 'Performance Observatory™',
    physicalType: 'observatory',
    flagshipId: 'studio-command-center',
    worldPath: 'command-center/performance-observatory',
  },
  {
    id: 'scc-security-center',
    displayName: 'Security Center™',
    physicalType: 'room',
    flagshipId: 'studio-command-center',
    worldPath: 'command-center/security-center',
  },
  {
    id: 'scc-constitution-hall',
    displayName: 'Constitution Hall™',
    physicalType: 'theater',
    flagshipId: 'studio-command-center',
    worldPath: 'command-center/constitution-hall',
    teaching: 'Permanent governance — eight foundational laws of Studio World™.',
  },
  // Creative Direction Studio™
  {
    id: 'cds-story-table',
    displayName: 'Story Table™',
    physicalType: 'studio',
    flagshipId: 'creative-direction-studio',
    worldPath: 'creative-direction-studio/story-table',
  },
  {
    id: 'cds-scene-stack',
    displayName: 'Scene Stack™ Assembly',
    physicalType: 'workshop',
    flagshipId: 'creative-direction-studio',
    worldPath: 'creative-direction-studio/scene-stack',
  },
  // Studio Warehouse™
  {
    id: 'warehouse-production-wing',
    displayName: 'Production Wing™',
    physicalType: 'wing',
    flagshipId: 'studio-warehouse',
    worldPath: 'warehouse/production-wing',
    teaching: 'Manufacture · Assemble · Reuse — production only, never invention.',
  },
  {
    id: 'warehouse-assembly-bay',
    displayName: 'Assembly Bay™',
    physicalType: 'workshop',
    flagshipId: 'studio-warehouse',
    parentId: 'warehouse-production-wing',
    worldPath: 'warehouse/production-wing/assembly-bay',
  },
  // Studio Archives™
  {
    id: 'archives-grand-entrance',
    displayName: 'Grand Entrance™',
    physicalType: 'atrium',
    flagshipId: 'studio-archives',
    worldPath: 'archives/grand-entrance',
  },
  {
    id: 'archives-orientation-atrium',
    displayName: 'Orientation Atrium™',
    physicalType: 'atrium',
    flagshipId: 'studio-archives',
    parentId: 'archives-grand-entrance',
    worldPath: 'archives/orientation-atrium',
  },
  {
    id: 'archives-museum-wing',
    displayName: 'Museum Wing™',
    physicalType: 'museum',
    flagshipId: 'studio-archives',
    worldPath: 'archives/museum-wing',
    teaching: 'Preserved masterpieces — Innovation Lineage Gallery™ celebrates collective invention.',
  },
  {
    id: 'archives-innovation-hall',
    displayName: 'Hall of Innovation™',
    physicalType: 'gallery',
    flagshipId: 'studio-archives',
    worldPath: 'archives/hall-of-innovation',
  },
  {
    id: 'archives-innovation-district',
    displayName: 'Innovation District™',
    physicalType: 'district',
    flagshipId: 'studio-archives',
    worldPath: 'archives/innovation-district',
    teaching: 'Collaborative invention campus — co-invent, publish joint IP, distribute royalties.',
  },
  {
    id: 'archives-genome-vault',
    displayName: 'Company Genome Vault™',
    physicalType: 'vault',
    flagshipId: 'studio-archives',
    worldPath: 'archives/genome-vault',
  },
  {
    id: 'archives-blueprint-archive',
    displayName: 'Blueprint Archive™',
    physicalType: 'library',
    flagshipId: 'studio-archives',
    worldPath: 'archives/blueprint-archive',
  },
  // Marketplace™
  {
    id: 'marketplace-pavilion',
    displayName: 'Marketplace Pavilion™',
    physicalType: 'pavilion',
    flagshipId: 'marketplace',
    worldPath: 'marketplace/pavilion',
    teaching: 'Share · Exchange · License — everything here originated elsewhere.',
  },
  {
    id: 'marketplace-licensing-hall',
    displayName: 'Licensing Hall™',
    physicalType: 'gallery',
    flagshipId: 'marketplace',
    parentId: 'marketplace-pavilion',
    worldPath: 'marketplace/pavilion/licensing-hall',
  },
  // Headquarters™
  {
    id: 'hq-marketing-headquarters',
    displayName: 'Marketing Headquarters™',
    physicalType: 'headquarters',
    flagshipId: 'headquarters',
    worldPath: 'headquarters/marketing',
  },
  {
    id: 'hq-distribution-headquarters',
    displayName: 'Distribution Headquarters™',
    physicalType: 'headquarters',
    flagshipId: 'headquarters',
    worldPath: 'headquarters/distribution',
  },
  {
    id: 'hq-intelligence-headquarters',
    displayName: 'Intelligence Headquarters™',
    physicalType: 'headquarters',
    flagshipId: 'headquarters',
    worldPath: 'headquarters/intelligence',
  },
  {
    id: 'hq-operations-headquarters',
    displayName: 'Operations Headquarters™',
    physicalType: 'headquarters',
    flagshipId: 'headquarters',
    worldPath: 'headquarters/operations',
  },
  // Expedition Hub™
  {
    id: 'exp-discovery-atrium',
    displayName: 'Discovery Atrium™',
    physicalType: 'atrium',
    flagshipId: 'expedition-hub',
    worldPath: 'expedition-hub/discovery-atrium',
  },
  {
    id: 'exp-growth-corridor',
    displayName: 'Growth Corridor™',
    physicalType: 'wing',
    flagshipId: 'expedition-hub',
    worldPath: 'expedition-hub/growth-corridor',
  },
];

export function getFlagship(id: StudioWorldFlagshipId): FlagshipDestination {
  const f = FLAGSHIP_DESTINATIONS.find((d) => d.id === id);
  if (!f) throw new Error(`Unknown flagship: ${id}`);
  return f;
}

/**
 * Studio World™ V4 — five flagship destinations on one connected campus.
 */

import type { StudioWorldFlagshipId, StudioWorldLocation } from './types';

export const STUDIO_WORLD_CAMPUS_NAME = 'Studio World™';

export type FlagshipDestination = {
  id: StudioWorldFlagshipId;
  displayName: string;
  purpose: string;
  worldEntryPath: string;
  legacyEntryPath: string;
  physicalType: 'command-center' | 'studio' | 'building' | 'headquarters' | 'building';
};

export const FLAGSHIP_DESTINATIONS: FlagshipDestination[] = [
  {
    id: 'studio-command-center',
    displayName: 'Studio Command Center™',
    purpose: 'Operate · Monitor · Decide · Coordinate',
    worldEntryPath: '/admin/studio/world/command-center',
    legacyEntryPath: '/admin/studio/overview',
    physicalType: 'command-center',
  },
  {
    id: 'creative-direction-studio',
    displayName: 'Creative Direction Studio™',
    purpose: 'Invent · Create · Imagine · Generate · Direct',
    worldEntryPath: '/admin/studio/world/creative-direction-studio',
    legacyEntryPath: '/admin/studio/department/creative-direction',
    physicalType: 'studio',
  },
  {
    id: 'studio-archives',
    displayName: 'Studio Archives™',
    purpose: 'Memory · Reuse · Legacy · Knowledge · Marketplace',
    worldEntryPath: '/admin/studio/world/archives',
    legacyEntryPath: '/admin/studio/studio-archives',
    physicalType: 'building',
  },
  {
    id: 'headquarters',
    displayName: 'Headquarters™',
    purpose: 'Run the company — every department is an immersive office',
    worldEntryPath: '/admin/studio/world/headquarters',
    legacyEntryPath: '/admin/headquarters',
    physicalType: 'headquarters',
  },
  {
    id: 'expedition-hub',
    displayName: 'Expedition Hub™',
    purpose: 'Transformation · Learning · Guided implementation · Business evolution',
    worldEntryPath: '/admin/studio/world/expedition-hub',
    legacyEntryPath: '/admin/studio/expansion-center',
    physicalType: 'building',
  },
];

/** District / wing skeleton inside each flagship — rooms hang off these nodes. */
export const FLAGSHIP_DISTRICTS: StudioWorldLocation[] = [
  // Studio Command Center™
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
    id: 'archives-warehouse-wing',
    displayName: 'Warehouse Wing™',
    physicalType: 'wing',
    flagshipId: 'studio-archives',
    worldPath: 'archives/warehouse-wing',
  },
  {
    id: 'archives-museum-wing',
    displayName: 'Museum Wing™',
    physicalType: 'museum',
    flagshipId: 'studio-archives',
    worldPath: 'archives/museum-wing',
  },
  {
    id: 'archives-innovation-hall',
    displayName: 'Hall of Innovation™',
    physicalType: 'gallery',
    flagshipId: 'studio-archives',
    worldPath: 'archives/hall-of-innovation',
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
  {
    id: 'archives-marketplace-pavilion',
    displayName: 'Marketplace Pavilion™',
    physicalType: 'pavilion',
    flagshipId: 'studio-archives',
    worldPath: 'archives/marketplace-pavilion',
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

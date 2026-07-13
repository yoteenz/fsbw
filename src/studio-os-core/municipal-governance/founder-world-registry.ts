import type { DepartmentOccupancyState } from './contract';

export const FOUNDER_WORLD_REGISTRY_VERSION = 'founder-world-registry.v1' as const;

export type FounderDepartmentInstallation = {
  sceneId: string;
  sourceSceneId: string;
  forkLineage: string | null;
  blueprintRevision: number;
  founderRenderUrl: string | null;
  occupancyState: DepartmentOccupancyState;
  activePermitId: string | null;
  occupancyPermitId: string | null;
  installedAt: string;
  lastModifiedAt: string;
};

export type FounderWorldRecord = {
  registryVersion: typeof FOUNDER_WORLD_REGISTRY_VERSION;
  organizationId: string;
  headquartersId: string;
  installedDefaults: FounderDepartmentInstallation[];
  customAssets: string[];
  blueprintHistory: Array<{ blueprintId: string; revision: number; approvedAt: string }>;
  marketplaceMods: string[];
  healthScore: number;
  dependencyGraphVersion: string | null;
};

export function createFounderWorldRecord(organizationId: string, headquartersId: string): FounderWorldRecord {
  return {
    registryVersion: FOUNDER_WORLD_REGISTRY_VERSION,
    organizationId,
    headquartersId,
    installedDefaults: [],
    customAssets: [],
    blueprintHistory: [],
    marketplaceMods: [],
    healthScore: 100,
    dependencyGraphVersion: null,
  };
}

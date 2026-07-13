import type { MunicipalZone } from './contract';

export const STUDIO_WORLD_REGISTRY_VERSION = 'studio-world-registry.v1' as const;
export type StudioWorldSceneRecord = {
  sceneId: string;
  displayName: string;
  purpose: string;
  zone: MunicipalZone;
  flagshipId: string;
  routeRegistryId: string | null;
  blueprintId: string | null;
  founderRenderRequired: boolean;
  constructionPlanRequired: boolean;
  requiredCapabilities: string[];
  dependencies: string[];
  socketIds: string[];
  lightingProfileId: string | null;
  materialLibraryId: string | null;
  version: string;
  compatibility: string[];
  marketplaceEligible: boolean;
  registryVersion: typeof STUDIO_WORLD_REGISTRY_VERSION;
};

export type StudioWorldRegistry = {
  registryVersion: typeof STUDIO_WORLD_REGISTRY_VERSION;
  campusId: string;
  campusDisplayName: string;
  scenes: StudioWorldSceneRecord[];
};

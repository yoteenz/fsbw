import type { StudioWorldRegistry, StudioWorldSceneRecord } from './studio-world-registry';

export function getStudioWorldScene(registry: StudioWorldRegistry, sceneId: string): StudioWorldSceneRecord | null {
  return registry.scenes.find((s) => s.sceneId === sceneId) ?? null;
}

export function listStudioWorldScenes(registry: StudioWorldRegistry): StudioWorldSceneRecord[] {
  return [...registry.scenes];
}

export function listMarketplaceEligibleScenes(registry: StudioWorldRegistry): StudioWorldSceneRecord[] {
  return registry.scenes.filter((s) => s.marketplaceEligible);
}

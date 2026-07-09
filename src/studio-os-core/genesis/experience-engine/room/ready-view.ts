import { XEE_DEMO_BRAND_IDS, XEE_ROOM_PATHS, type XeeRoomPath } from '../constants';
import { readExperienceEngineDnaStore } from '../persistence';
import { buildXeeOrbNote, getExperienceEnginePlatformStats } from '../engines/registries';
import { resolveExperienceProfile } from '../engines/experience-generator';
import type { XeeReadyView, XeeRuntimeInput } from '../types';

export function isValidXeeRoomPath(slug: string): slug is XeeRoomPath {
  return (XEE_ROOM_PATHS as readonly string[]).includes(slug);
}

export function xeeRoomPathFromSlug(slug?: string): XeeRoomPath {
  if (slug && isValidXeeRoomPath(slug)) return slug;
  return 'experience-engine';
}

export function buildExperienceEngineReadyView(input?: XeeRuntimeInput): XeeReadyView {
  const store = readExperienceEngineDnaStore();
  const activeRoom = xeeRoomPathFromSlug(input?.pathname?.split('/').pop());
  const playground = input?.playground ? { ...store.playground, ...input.playground } : store.playground;
  const experienceProfile = resolveExperienceProfile({
    brandId: playground.brandId,
    departmentId: playground.departmentId,
    sceneId: playground.sceneId,
    motionDnaId: playground.motionDnaId,
  });

  return {
    activeRoom,
    stats: getExperienceEnginePlatformStats(),
    brands: store.brands,
    departments: store.departments.filter((d) => d.brandId === playground.brandId),
    scenes: store.scenes,
    components: store.components.filter((c) => c.brandId === playground.brandId),
    motions: store.motions.filter((m) => m.brandId === playground.brandId),
    interactions: store.interactions.filter((i) => i.brandId === playground.brandId),
    playground,
    experienceProfile,
    cssPreview: experienceProfile.cssText,
    constitutionLocked: store.constitutionLocked,
    orbNote: buildXeeOrbNote(),
    demoBrandIds: [...XEE_DEMO_BRAND_IDS],
  };
}

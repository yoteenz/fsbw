import {
  DDNA_ROOM_PATHS,
  type DdnaRoomPath,
} from '../constants';
import { readStudioOsDesignDnaStore } from '../persistence';
import {
  buildDdnaOrbArchitectNote,
  buildDdnaOrbRecommendations,
  getStudioOsDesignDnaPlatformStats,
  resolveDepartmentTheme,
  resolveDesignDnaSceneProfile,
} from '../engines/registry-engines';
import type { DdnaReadyView, DdnaRuntimeInput } from '../types';

export function isValidDdnaRoomPath(slug: string): slug is DdnaRoomPath {
  return (DDNA_ROOM_PATHS as readonly string[]).includes(slug);
}

export function ddnaRoomPathFromSlug(slug?: string): DdnaRoomPath {
  if (slug && isValidDdnaRoomPath(slug)) return slug;
  return 'design-dna';
}

export function buildStudioOsDesignDnaReadyView(input?: DdnaRuntimeInput): DdnaReadyView {
  const store = readStudioOsDesignDnaStore();
  const activeRoom = ddnaRoomPathFromSlug(input?.pathname?.split('/').pop());
  const departmentId = input?.departmentId ?? store.activeDepartmentId;
  const activeDepartment = resolveDepartmentTheme(departmentId)!;
  const sceneProfile = resolveDesignDnaSceneProfile(departmentId);
  const recommendations = buildDdnaOrbRecommendations();

  return {
    activeRoom,
    stats: getStudioOsDesignDnaPlatformStats(),
    tokens: store.tokens,
    departmentThemes: store.departmentThemes,
    sceneTemplate: store.sceneTemplate,
    glassMaterials: store.glassMaterials,
    lightingPresets: store.lightingPresets,
    motionPresets: store.motionPresets,
    animationHooks: store.animationHooks,
    typographyScale: store.typographyScale,
    components: store.components,
    navigationRules: store.navigationRules,
    iconTreatments: store.iconTreatments,
    recommendations,
    activeDepartmentId: departmentId,
    activeDepartment,
    sceneProfile,
    cssPreview: sceneProfile.cssText,
    constitutionLocked: store.constitutionLocked,
    orbArchitectNote: buildDdnaOrbArchitectNote(),
  };
}

import { XER_DEMO_BRAND_IDS, XER_ROOM_PATHS, type XerRoomPath } from '../constants';
import { readExperienceRuntimeStore } from '../persistence';
import { assembleExperienceRuntime } from '../runtime-engine/experience-runtime';
import { buildRuntimeInspectorView } from '../runtime-preview/inspector-view';
import type { XerReadyView, XerRuntimeInput } from '../types';

export function isValidXerRoomPath(slug: string): slug is XerRoomPath {
  return (XER_ROOM_PATHS as readonly string[]).includes(slug);
}

export function xerRoomPathFromSlug(slug?: string): XerRoomPath {
  if (slug && isValidXerRoomPath(slug)) return slug;
  return 'experience-runtime';
}

export function buildXerOrbNote(): string {
  return 'Experience Runtime™ assembles every branded environment from layered DNA — no hardcoded styles, no page rebuilds on brand switch.';
}

export function buildExperienceRuntimeReadyView(input?: XerRuntimeInput): XerReadyView {
  const store = readExperienceRuntimeStore();
  const activeRoom = xerRoomPathFromSlug(input?.pathname?.split('/').pop());
  const selection = input?.selection ? { ...store.selection, ...input.selection } : store.selection;

  const runtimeGraph = assembleExperienceRuntime({
    brandId: selection.brandId,
    departmentId: selection.departmentId,
    sceneId: selection.sceneId,
    motionDnaId: selection.motionDnaId,
  });

  const inspector = buildRuntimeInspectorView(runtimeGraph);

  return {
    activeRoom,
    selection,
    runtimeGraph,
    inspector,
    platformDna: store.platformDna,
    stateDna: runtimeGraph.stateDna,
    demoBrandIds: [...XER_DEMO_BRAND_IDS],
    orbNote: buildXerOrbNote(),
    constitutionLocked: store.constitutionLocked,
  };
}

import type { AtlasNode } from '../studio-world-atlas/types';
import type { ContinuousScaleLevel } from './types';

/** Primary Mission Control™ zoom lenses — civilization, district, building. */
export type HolographicViewId = 'civilization' | 'district' | 'building' | 'interior';

export type HolographicViewState = {
  id: HolographicViewId;
  label: string;
  narrative: string;
  tableClass: string;
  ambientClass: string;
  showDistrictOrbits: boolean;
  showBuildingDetail: boolean;
  annotationDensity: 'sparse' | 'normal' | 'rich';
};

const VIEW_BY_SCALE: Partial<Record<ContinuousScaleLevel, HolographicViewState>> = {
  civilization: {
    id: 'civilization',
    label: 'Civilization View™',
    narrative: 'The entire Studio World civilization breathes beneath you.',
    tableClass: 'is-view-civilization',
    ambientClass: 'mc-view-civilization',
    showDistrictOrbits: true,
    showBuildingDetail: false,
    annotationDensity: 'sparse',
  },
  industry: {
    id: 'civilization',
    label: 'Civilization View™',
    narrative: 'Industry continents pulse across the hologram.',
    tableClass: 'is-view-civilization',
    ambientClass: 'mc-view-civilization',
    showDistrictOrbits: true,
    showBuildingDetail: false,
    annotationDensity: 'sparse',
  },
  constellation: {
    id: 'civilization',
    label: 'Constellation View™',
    narrative: 'Headquarters shine as stars; departments orbit in light.',
    tableClass: 'is-view-civilization',
    ambientClass: 'mc-view-constellation',
    showDistrictOrbits: true,
    showBuildingDetail: false,
    annotationDensity: 'normal',
  },
  district: {
    id: 'district',
    label: 'District View™',
    narrative: 'Districts reveal their rhythm — commerce, knowledge, creation.',
    tableClass: 'is-view-district',
    ambientClass: 'mc-view-district',
    showDistrictOrbits: true,
    showBuildingDetail: true,
    annotationDensity: 'normal',
  },
  campus: {
    id: 'district',
    label: 'District View™',
    narrative: 'Campus corridors connect; the civilization feels walkable.',
    tableClass: 'is-view-district',
    ambientClass: 'mc-view-district',
    showDistrictOrbits: false,
    showBuildingDetail: true,
    annotationDensity: 'normal',
  },
  building: {
    id: 'building',
    label: 'Building View™',
    narrative: 'Architecture rises in detail — enter through the hologram itself.',
    tableClass: 'is-view-building',
    ambientClass: 'mc-view-building',
    showDistrictOrbits: false,
    showBuildingDetail: true,
    annotationDensity: 'rich',
  },
  floor: {
    id: 'interior',
    label: 'Interior View™',
    narrative: 'Floors stack vertically; rooms await descent.',
    tableClass: 'is-view-interior',
    ambientClass: 'mc-view-interior',
    showDistrictOrbits: false,
    showBuildingDetail: true,
    annotationDensity: 'rich',
  },
  room: {
    id: 'interior',
    label: 'Interior View™',
    narrative: 'Rooms glow with activity — the world is the interface.',
    tableClass: 'is-view-interior',
    ambientClass: 'mc-view-interior',
    showDistrictOrbits: false,
    showBuildingDetail: true,
    annotationDensity: 'rich',
  },
  workspace: {
    id: 'interior',
    label: 'Workspace View™',
    narrative: 'Workspaces hum at the finest scale of the civilization.',
    tableClass: 'is-view-interior',
    ambientClass: 'mc-view-interior',
    showDistrictOrbits: false,
    showBuildingDetail: true,
    annotationDensity: 'rich',
  },
};

const DEFAULT_VIEW = VIEW_BY_SCALE.civilization!;

export function resolveHolographicView(scale: ContinuousScaleLevel, focusNode: AtlasNode): HolographicViewState {
  const base = VIEW_BY_SCALE[scale] ?? DEFAULT_VIEW;
  if (focusNode.level >= 3 && base.id === 'district') {
    return {
      ...base,
      narrative: `${focusNode.displayName} — ${base.narrative}`,
    };
  }
  if (focusNode.level >= 3 && base.id === 'building') {
    return {
      ...base,
      narrative: `${focusNode.displayName} awaits your arrival through the hologram.`,
    };
  }
  return base;
}

export function isCivilizationScale(scale: ContinuousScaleLevel): boolean {
  return scale === 'civilization' || scale === 'industry' || scale === 'constellation';
}

export function isDistrictScale(scale: ContinuousScaleLevel): boolean {
  return scale === 'district' || scale === 'campus';
}

export function isBuildingScale(scale: ContinuousScaleLevel): boolean {
  return scale === 'building' || scale === 'floor' || scale === 'room' || scale === 'workspace';
}

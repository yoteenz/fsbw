/** Mission Control™ — Studio World's nervous system */

export const MISSION_CONTROL_VERSION = '1.0.0';
export const MISSION_CONTROL_STORAGE_KEY = 'studioOsMissionControl_v1';
export const STUDIO_OS_MISSION_CONTROL_UPDATED = 'studio-os-mission-control-updated';

export const MISSION_CONTROL_ACCENT = '#c9e8ff';
export const MISSION_CONTROL_GOLD = '#e8c878';

/** Article-K20 — primary visualization modes (transform hologram, not replace UI) */
export const MISSION_CONTROL_MODES = [
  'architecture',
  'civilization',
  'knowledge',
  'marketplace',
  'expansion',
  'time',
  'energy',
] as const;

export const MISSION_CONTROL_MODE_LABELS: Record<(typeof MISSION_CONTROL_MODES)[number], string> = {
  architecture: 'Architecture™',
  civilization: 'Civilization™',
  knowledge: 'Knowledge™',
  marketplace: 'Marketplace™',
  expansion: 'Expansion™',
  time: 'Time™',
  energy: 'Energy™',
};

/** Activation Sequence™ phases */
export const ACTIVATION_PHASES = [
  'darkening',
  'orb-brightens',
  'light-beam',
  'glass-particles',
  'light-ribbons',
  'holographic-grid',
  'foundations-rise',
  'buildings-assemble',
  'roads-illuminate',
  'energy-flows',
  'knowledge-streams',
  'civilization-alive',
  'navigation-ready',
] as const;

export const ACTIVATION_PHASE_LABELS: Record<(typeof ACTIVATION_PHASES)[number], string> = {
  darkening: 'Room responds…',
  'orb-brightens': 'Orb intelligence core activating…',
  'light-beam': 'Refracted beam projecting downward…',
  'glass-particles': 'Glass particles assembling…',
  'light-ribbons': 'Light ribbons traveling…',
  'holographic-grid': 'Holographic grid materializing…',
  'foundations-rise': 'District foundations rising…',
  'buildings-assemble': 'Buildings assembling from light…',
  'roads-illuminate': 'Transit corridors connecting…',
  'energy-flows': 'Marketplace energy flowing…',
  'knowledge-streams': 'Knowledge streams activating…',
  'civilization-alive': 'Civilization comes alive…',
  'navigation-ready': 'Mission Control™ online',
};

/** Continuous Scale™ — seamless zoom without page transitions */
export const CONTINUOUS_SCALE_LEVELS = [
  'civilization',
  'industry',
  'constellation',
  'district',
  'campus',
  'building',
  'floor',
  'room',
  'workspace',
  'scene',
  'scene-assembly',
  'layer',
] as const;

export const CONTINUOUS_SCALE_LABELS: Record<(typeof CONTINUOUS_SCALE_LEVELS)[number], string> = {
  civilization: 'Civilization™',
  industry: 'Industry™',
  constellation: 'Constellation™',
  district: 'District™',
  campus: 'Campus™',
  building: 'Building™',
  floor: 'Floor™',
  room: 'Room™',
  workspace: 'Workspace™',
  scene: 'Scene™',
  'scene-assembly': 'Scene Assembly™',
  layer: 'Layer™',
};

/** Architectural Navigation™ travel options */
export const MISSION_CONTROL_TRAVEL_OPTIONS = [
  'walk',
  'elevator',
  'fast-travel',
  'guided-tour',
  'observer',
] as const;

export const MISSION_CONTROL_TRAVEL_LABELS: Record<(typeof MISSION_CONTROL_TRAVEL_OPTIONS)[number], string> = {
  walk: 'Walk™',
  elevator: 'Glass Elevator™',
  'fast-travel': 'Fast Travel™',
  'guided-tour': 'Guided Tour™',
  observer: 'Observer Mode™',
};

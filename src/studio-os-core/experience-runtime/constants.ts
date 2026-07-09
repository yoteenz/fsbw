import type { DdnaSceneLayerId } from '../genesis/studio-os-design-dna/constants';
import type { PlaygroundLayerSlot } from './types';

/** Canonical Phase 1 test contract — playground default */
export const CANONICAL_EXPERIENCE_RUNTIME_CONTRACT = {
  brandId: 'studio-os',
  brandDisplayName: 'Studio OS',
  departmentSlug: 'executive',
  departmentDisplayName: 'Executive',
  sceneId: 'executive-headquarters',
  sceneDisplayName: 'Executive Headquarters',
  templateId: 'hq-master-scene-v1',
  designDnaVersion: 'v1',
} as const;

/** Maps designDNA version shorthand to Design DNA subsystem semver */
export const DESIGN_DNA_VERSION_MAP: Record<string, string> = {
  v1: '1.0.0',
};

/** Playground-visible layer slots (template metadata drives z-index + presence) */
export const PLAYGROUND_LAYER_SLOTS: PlaygroundLayerSlot[] = [
  { slotId: 'hero-environment', templateLayerId: 'hero-environment', label: 'Hero Environment' },
  { slotId: 'primary-focal-object', templateLayerId: 'primary-focal-object', label: 'Primary Focal Object' },
  { slotId: 'navigation-layer', templateLayerId: 'navigation-layer', label: 'Navigation Layer' },
  { slotId: 'capability-panels', templateLayerId: 'capability-panels', label: 'Capability Panels' },
  { slotId: 'executive-briefing', templateLayerId: 'executive-header', label: 'Executive Briefing' },
  { slotId: 'orb-layer', templateLayerId: 'orb-layer', label: 'Orb Layer' },
  { slotId: 'footer-flow', templateLayerId: 'footer', label: 'Footer / Flow' },
];

export const EXPERIENCE_RUNTIME_VERSION = '1.0.0';

/** Rough layout regions for placeholder assembly (not production HQ layout) */
export const LAYER_PLACEHOLDER_LAYOUT: Record<
  DdnaSceneLayerId,
  { top?: string; left?: string; right?: string; bottom?: string; width?: string; height?: string }
> = {
  'hero-environment': { top: '0', left: '0', right: '0', bottom: '0' },
  'primary-focal-object': { top: '12%', left: '18%', right: '18%', height: '28%' },
  'executive-header': { top: '0', left: '0', right: '0', height: '10%' },
  'department-identity': { top: '10%', left: '4%', width: '14%', height: '12%' },
  'capability-panels': { top: '42%', left: '18%', right: '22%', bottom: '14%' },
  'navigation-layer': { top: '10%', left: '0', width: '16%', bottom: '8%' },
  'orb-layer': { right: '3%', bottom: '10%', width: '72px', height: '72px' },
  'transition-layer': { top: '0', left: '0', right: '0', bottom: '0' },
  footer: { left: '0', right: '0', bottom: '0', height: '8%' },
  'animation-hooks': { top: '0', left: '0', right: '0', bottom: '0' },
};

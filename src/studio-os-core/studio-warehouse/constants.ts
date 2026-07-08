import type { WarehouseDistrictId } from './types';

export const STUDIO_WAREHOUSE_ACCENT = '#C9A962';
export const STUDIO_WAREHOUSE_STORAGE_KEY = 'adminStudioWarehouse_v1';

export const WAREHOUSE_PHILOSOPHY = [
  'Every generated asset becomes a real object inside Studio Warehouse™.',
  'Founders never ask "where is that image?" — they know exactly where that object lives.',
  'Not folders. Not a database. A luxury creative warehouse your company has built over time.',
] as const;

export type WarehouseDistrictMeta = {
  id: WarehouseDistrictId;
  icon: string;
  label: string;
  tagline: string;
  ambience: string;
  layoutClass: string;
};

export const WAREHOUSE_DISTRICTS: WarehouseDistrictMeta[] = [
  {
    id: 'environment-gallery',
    icon: '🏛',
    label: 'Environment Gallery™',
    tagline: 'Miniature architectural environments in long rows — tap to enter preview.',
    ambience: 'Apple design archive · scaled dioramas',
    layoutClass: 'wh-district--environment',
  },
  {
    id: 'lighting-gallery',
    icon: '💡',
    label: 'Lighting Gallery™',
    tagline: 'Floating illuminated capsules — compare packs in real time.',
    ambience: 'Pixar lighting vault · live lux comparison',
    layoutClass: 'wh-district--lighting',
  },
  {
    id: 'furniture-hall',
    icon: '🪑',
    label: 'Furniture Hall™',
    tagline: 'Luxury showroom — walk around, rotate, inspect, apply.',
    ambience: 'Executive showroom floor',
    layoutClass: 'wh-district--furniture',
  },
  {
    id: 'materials-library',
    icon: '🪨',
    label: 'Materials Library™',
    tagline: 'Physical material walls — marble, glass, wood, chrome, fabric, concrete.',
    ambience: 'Touch-to-preview swatch walls',
    layoutClass: 'wh-district--materials',
  },
  {
    id: 'atmosphere-lab',
    icon: '✨',
    label: 'Atmosphere Lab™',
    tagline: 'Fog, dust, bloom, particles, glass reflections.',
    ambience: 'Ambient FX laboratory',
    layoutClass: 'wh-district--atmosphere',
  },
  {
    id: 'hero-object-vault',
    icon: '🛰',
    label: 'Hero Object Vault™',
    tagline: 'Studio Orbs™, monuments, feature sculptures, interactive landmarks.',
    ambience: 'Secured signature object vault',
    layoutClass: 'wh-district--hero',
  },
  {
    id: 'motion-sound-wing',
    icon: '🎬',
    label: 'Motion & Sound Wing™',
    tagline: 'Animations, runtime loops, audio beds, idle life systems.',
    ambience: 'Unreal Content Browser motion aisle',
    layoutClass: 'wh-district--motion',
  },
  {
    id: 'texture-archive',
    icon: '🧵',
    label: 'Texture Archive™',
    tagline: 'Icons, surface textures, UI chrome, micro-detail libraries.',
    ambience: 'High-resolution texture vault',
    layoutClass: 'wh-district--texture',
  },
];

export const CATEGORY_TO_DISTRICT: Record<string, WarehouseDistrictId> = {
  'environment-shell': 'environment-gallery',
  'scene-stack-layer': 'environment-gallery',
  lighting: 'lighting-gallery',
  'lighting-pack': 'lighting-gallery',
  'lighting-systems': 'lighting-gallery',
  furniture: 'furniture-hall',
  'furniture-objects': 'furniture-hall',
  architecture: 'environment-gallery',
  materials: 'materials-library',
  'surface-materials': 'materials-library',
  texture: 'texture-archive',
  icon: 'texture-archive',
  'hero-object': 'hero-object-vault',
  'signature-landmark': 'hero-object-vault',
  atmosphere: 'atmosphere-lab',
  'atmospheric-systems': 'atmosphere-lab',
  particles: 'atmosphere-lab',
  'ambient-motion': 'atmosphere-lab',
  'runtime-fx': 'motion-sound-wing',
  'runtime-effects': 'motion-sound-wing',
  animation: 'motion-sound-wing',
  audio: 'motion-sound-wing',
};

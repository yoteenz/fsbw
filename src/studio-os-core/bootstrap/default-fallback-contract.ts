/** Default fallback contract — safe assembly when DNA/registries are partial. */
export const STUDIO_DEFAULT_FALLBACK_CONTRACT = {
  brandId: 'studio-os',
  departmentId: 'executive',
  sceneId: 'executive-headquarters',
  templateId: 'hq-master-scene-v1',
  platformDnaVersion: 'v1',
  brandDnaVersion: 'v1',
  departmentDnaVersion: 'v1',
  sceneDnaVersion: 'v1',
  stateDnaVersion: 'v1',
  designDnaVersion: 'v1',
  motionDnaId: 'motion-studio-os',
} as const;

export type StudioDefaultFallbackContract = typeof STUDIO_DEFAULT_FALLBACK_CONTRACT;

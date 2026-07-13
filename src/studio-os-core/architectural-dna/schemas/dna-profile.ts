import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';

export const ARCHITECTURAL_DNA_VERSION = 'architectural-dna.v1' as const;

export type MaterialPalette = {
  floorMaterial: string;
  wallMaterial: string;
  ceilingMaterial: string;
  glassProfile: string;
  metalPalette: string[];
  glassPalette: string[];
  stonePalette: string[];
  woodPalette: string[];
  colorPalette: string[];
};

export type CameraLanguage = {
  desktopComposition: string;
  mobileComposition: string;
  cinematicComposition: string;
  framingRules: string[];
  negativeCompositionRules: string[];
  desktopAspectRatio: '21:9';
  mobileAspectRatio: '9:16';
};

export type LayoutRules = {
  commandDockLayout: string;
  workbenchLayout: string;
  socketRules: string[];
  assetRules: string[];
  brandInjectionZones: string[];
  placeholderZones: string[];
};

export type ArchitecturalDnaProfile = {
  dnaVersion: typeof ARCHITECTURAL_DNA_VERSION;
  profileRevision: number;
  departmentId: CanonicalMainDepartmentId;
  departmentName: string;
  purpose: string;
  architecturalCharter: string;
  visualIdentity: string;
  signatureMood: string;
  architecturalStyle: string;
  signatureGeometry: string;
  spatialComposition: string;
  heroObject: string;
  materials: MaterialPalette;
  lightingProfile: string;
  accentLighting: string;
  cameraLanguage: CameraLanguage;
  signatureFurniture: string[];
  signatureTechnology: string[];
  environmentFX: string[];
  atmosphere: string;
  motionLanguage: string;
  futureExpansionRules: string[];
  layoutRules: LayoutRules;
  referencePackId: string;
  positivePromptTemplate: string;
  negativePromptTemplate: string;
  qualityTargets: string[];
  forbiddenElements: string[];
  promptCompilerVersion: string;
};

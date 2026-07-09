import type {
  DdnaRoomPath,
  DdnaSceneLayerId,
  DdnaTokenCategory,
} from './constants';

export type DdnaDesignToken = {
  tokenId: string;
  name: string;
  category: DdnaTokenCategory;
  value: string;
  cssVariable: string;
  description: string;
  immutable: boolean;
  source: string;
};

export type DdnaDepartmentTheme = {
  departmentId: string;
  officialName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  ambientLighting: string;
  glassTint: string;
  motionStyle: string;
  particleSystem: string;
  notificationStyle: string;
  selectionStyle: string;
  orbVariant: string;
  iconTreatment: string;
  sceneMood: string;
  divisionShade?: string;
  roomAccent?: string;
  animationPersonality: string;
  interactionEffects: string;
};

export type DdnaSceneLayerSpec = {
  layerId: DdnaSceneLayerId;
  zIndex: number;
  required: boolean;
  description: string;
  cssSelector?: string;
  animationHook?: string;
};

export type DdnaSceneTemplate = {
  templateId: string;
  officialName: string;
  version: string;
  layers: DdnaSceneLayerSpec[];
  gridColumns: number;
  maxContentWidthPx: number;
  heroViewportPct: number;
  orbPersistent: boolean;
};

export type DdnaGlassMaterial = {
  materialId: string;
  name: string;
  background: string;
  backdropBlur: string;
  border: string;
  tintDepartmentAware: boolean;
  legibilityRule: string;
};

export type DdnaLightingPreset = {
  presetId: string;
  name: string;
  ambientColor: string;
  horizonGradient: string;
  keyLightDirection: string;
  fillIntensity: number;
  departmentBindable: boolean;
};

export type DdnaMotionPreset = {
  presetId: string;
  name: string;
  entrance: string;
  exit: string;
  hover: string;
  focus: string;
  departmentDerived: boolean;
};

export type DdnaAnimationHook = {
  hookId: string;
  name: string;
  trigger: string;
  durationMs: number;
  easing: string;
  layerTarget: DdnaSceneLayerId;
};

export type DdnaTypographyScale = {
  scaleId: string;
  role: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  letterSpacing: string;
  textTransform: string;
  lineHeight: string;
};

export type DdnaComponentSpec = {
  componentId: string;
  officialName: string;
  category: 'panel' | 'card' | 'button' | 'navigation' | 'header' | 'orb' | 'glass' | 'typography';
  description: string;
  tokenBindings: string[];
  sceneLayer?: DdnaSceneLayerId;
  reuseScore: number;
};

export type DdnaNavigationRule = {
  ruleId: string;
  layer: 'department-color' | 'division-shade' | 'room-accent' | 'interactive-state' | 'notification-state';
  description: string;
  derivation: string;
};

export type DdnaIconTreatment = {
  treatmentId: string;
  name: string;
  style: 'silhouette' | 'line-symbol' | 'department-bound';
  colorRule: string;
  sizeTokens: string[];
};

export type DdnaRecommendation = {
  recommendationId: string;
  title: string;
  reason: string;
  confidence: number;
  targetRoom?: DdnaRoomPath;
  orbNote: string;
};

export type DdnaStore = {
  version: string;
  tokens: DdnaDesignToken[];
  departmentThemes: DdnaDepartmentTheme[];
  sceneTemplate: DdnaSceneTemplate;
  glassMaterials: DdnaGlassMaterial[];
  lightingPresets: DdnaLightingPreset[];
  motionPresets: DdnaMotionPreset[];
  animationHooks: DdnaAnimationHook[];
  typographyScale: DdnaTypographyScale[];
  components: DdnaComponentSpec[];
  navigationRules: DdnaNavigationRule[];
  iconTreatments: DdnaIconTreatment[];
  recommendations: DdnaRecommendation[];
  activeDepartmentId: string;
  constitutionLocked: boolean;
  lastOpenedAt?: string;
  seededAt?: string;
  bootstrappedAt?: string;
};

export type DdnaPlatformStats = {
  tokenCount: number;
  departmentCount: number;
  componentCount: number;
  glassMaterialCount: number;
  lightingPresetCount: number;
  motionPresetCount: number;
  typographyRoleCount: number;
  sceneLayerCount: number;
  complianceScore: number;
};

export type DdnaSceneProfile = {
  departmentId: string;
  departmentTheme: DdnaDepartmentTheme;
  cssVariables: Record<string, string>;
  cssText: string;
  sceneTemplate: DdnaSceneTemplate;
  glassMaterial: DdnaGlassMaterial;
  lightingPreset: DdnaLightingPreset;
  motionPreset: DdnaMotionPreset;
  typographyScale: DdnaTypographyScale[];
  navigationContext: DdnaNavigationContext;
};

export type DdnaNavigationContext = {
  departmentColor: string;
  divisionShade: string;
  roomAccent: string;
  interactiveState: string;
  breadcrumbTone: string;
  activeNavGlow: string;
};

export type DdnaReadyView = {
  activeRoom: DdnaRoomPath;
  stats: DdnaPlatformStats;
  tokens: DdnaDesignToken[];
  departmentThemes: DdnaDepartmentTheme[];
  sceneTemplate: DdnaSceneTemplate;
  glassMaterials: DdnaGlassMaterial[];
  lightingPresets: DdnaLightingPreset[];
  motionPresets: DdnaMotionPreset[];
  animationHooks: DdnaAnimationHook[];
  typographyScale: DdnaTypographyScale[];
  components: DdnaComponentSpec[];
  navigationRules: DdnaNavigationRule[];
  iconTreatments: DdnaIconTreatment[];
  recommendations: DdnaRecommendation[];
  activeDepartmentId: string;
  activeDepartment: DdnaDepartmentTheme;
  sceneProfile: DdnaSceneProfile;
  cssPreview: string;
  constitutionLocked: boolean;
  orbArchitectNote: string;
};

export type DdnaRuntimeInput = {
  pathname?: string;
  departmentId?: string;
  founderDisplayName?: string;
};

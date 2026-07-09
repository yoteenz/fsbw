import type { XeeDemoBrandId, XeeRoomPath } from './constants';

export type XeeBrandDna = {
  brandId: string;
  officialName: string;
  identity: {
    philosophy: string;
    visualPersonality: string[];
    emotionalPersonality: string[];
    executivePersonality: string[];
    environmentalStorytelling: string;
  };
  colorSystem: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
    semanticInfo: string;
    semanticSuccess: string;
    semanticWarning: string;
    semanticRisk: string;
  };
  typography: {
    displayFont: string;
    labelFont: string;
    bodyFont: string;
    displaySize: string;
    labelSize: string;
    bodySize: string;
    labelTransform: string;
  };
  glassStyle: {
    panelBackground: string;
    panelStrong: string;
    backdropBlur: string;
    border: string;
    tintRule: string;
  };
  lighting: {
    ambientGradient: string;
    horizonGlow: string;
    keyLight: string;
    departmentWash: string;
  };
  motion: {
    philosophy: string;
    entrance: string;
    exit: string;
    hover: string;
    timingMs: number;
    easing: string;
  };
  materials: string[];
  particles: string;
  icons: {
    treatment: string;
    style: string;
  };
  writingVoice: {
    tone: string;
    cadence: string;
    sampleGreeting: string;
  };
  orbOverrides: {
    variant: string;
    personality: string;
    glowColor: string;
    recommendationTone: string;
  };
  navigationStyle: {
    tone: string;
    activeIndicator: string;
    breadcrumbStyle: string;
  };
  experienceRules: string[];
};

export type XeeDepartmentDna = {
  departmentDnaId: string;
  brandId: string;
  departmentId: string;
  officialName: string;
  departmentColor: string;
  departmentLighting: string;
  ambientMood: string;
  sceneIdentity: string;
  particleSystem: string;
  notificationStyle: string;
  executiveMood: string;
  knowledgeMood: string;
  creativeMood: string;
  animationPersonality: string;
};

export type XeeSceneDna = {
  sceneId: string;
  officialName: string;
  layoutTemplateId: string;
  heroObject: string;
  capabilityPanels: string[];
  orbPlacement: string;
  environmentalRules: string[];
  sharedAcrossBrands: boolean;
};

export type XeeComponentDna = {
  componentDnaId: string;
  brandId: string;
  componentId: string;
  officialName: string;
  variant: string;
  tokenBindings: string[];
  sceneLayer: string;
};

export type XeeMotionDna = {
  motionDnaId: string;
  brandId: string;
  presetName: string;
  entrance: string;
  transition: string;
  hover: string;
  focus: string;
  loading: string;
  reducedMotionFallback: string;
};

export type XeeInteractionDna = {
  interactionDnaId: string;
  brandId: string;
  hover: string;
  focus: string;
  selected: string;
  success: string;
  warning: string;
  approval: string;
  disabled: string;
};

export type XeePlaygroundSelection = {
  brandId: string;
  departmentId: string;
  sceneId: string;
  componentId: string;
  motionDnaId: string;
  lightingPreset: string;
  materialId: string;
  typographyScale: string;
  orbPersonality: string;
};

export type XeeStore = {
  version: string;
  brands: XeeBrandDna[];
  departments: XeeDepartmentDna[];
  scenes: XeeSceneDna[];
  components: XeeComponentDna[];
  motions: XeeMotionDna[];
  interactions: XeeInteractionDna[];
  playground: XeePlaygroundSelection;
  constitutionLocked: boolean;
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type XeeExperienceProfile = {
  brandId: string;
  departmentId: string;
  sceneId: string;
  brand: XeeBrandDna;
  department: XeeDepartmentDna;
  scene: XeeSceneDna;
  components: XeeComponentDna[];
  motion: XeeMotionDna;
  interaction: XeeInteractionDna;
  cssVariables: Record<string, string>;
  cssText: string;
};

export type XeePlatformStats = {
  brandCount: number;
  departmentCount: number;
  sceneCount: number;
  componentVariantCount: number;
  inheritanceScore: number;
};

export type XeeReadyView = {
  activeRoom: XeeRoomPath;
  stats: XeePlatformStats;
  brands: XeeBrandDna[];
  departments: XeeDepartmentDna[];
  scenes: XeeSceneDna[];
  components: XeeComponentDna[];
  motions: XeeMotionDna[];
  interactions: XeeInteractionDna[];
  playground: XeePlaygroundSelection;
  experienceProfile: XeeExperienceProfile;
  cssPreview: string;
  constitutionLocked: boolean;
  orbNote: string;
  demoBrandIds: XeeDemoBrandId[];
};

export type XeeRuntimeInput = {
  pathname?: string;
  playground?: Partial<XeePlaygroundSelection>;
};

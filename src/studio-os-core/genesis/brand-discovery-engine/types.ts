import type {
  XbdConsumerSystem,
  XbdDemoBrandId,
  XbdPlaygroundAssetType,
  XbdRoomPath,
} from './constants';

export type XbdBrandDnaStatus = 'draft' | 'approved' | 'canonical';

export type XbdWritingVoice = {
  tone: string;
  cadence: string;
  vocabulary: string[];
  forbiddenLanguage: string[];
  sampleLine: string;
};

export type XbdColorSystem = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
};

export type XbdTypography = {
  displayFont: string;
  labelFont: string;
  bodyFont: string;
  displaySize: string;
  labelSize: string;
  bodySize: string;
};

export type XbdAudienceProfile = {
  primaryAudience: string;
  secondaryAudiences: string[];
  psychology: string;
  customerDesire: string;
  identitySignals: string[];
};

/** Canonical Brand DNA record per implementation spec */
export type XbdBrandDnaRecord = {
  brandId: string;
  companyId: string;
  brandName: string;
  brandPhilosophy: string;
  mission: string;
  vision: string;
  values: string[];
  audienceProfile: XbdAudienceProfile;
  emotionalTerritory: string[];
  visualPersonality: string[];
  writingVoice: XbdWritingVoice;
  colorSystem: XbdColorSystem;
  typography: XbdTypography;
  materials: string[];
  photographyStyle: string;
  packagingStyle: string;
  contentStyle: string;
  luxuryLevel: number;
  positioning: string;
  competitors: string[];
  antiPatterns: string[];
  brandRules: string[];
  createdAt: string;
  updatedAt: string;
  version: string;
  status: XbdBrandDnaStatus;
};

export type XbdBrandDirections = {
  audienceProfile: string;
  visualDirection: string;
  packagingDirection: string;
  contentDirection: string;
  websiteDirection: string;
  headquartersDirection: string;
};

export type XbdDiscoveryInput = {
  founderAnswers: Record<string, string>;
  uploadedAssets: string[];
  brandReferences: string[];
  audienceDetails: string;
  competitorReferences: string[];
  visualPreferences: string[];
  copySamples: string[];
  productDetails: string;
};

export type XbdDiscoverySession = {
  sessionId: string;
  companyId: string;
  status: 'intake' | 'interview' | 'synthesis' | 'review' | 'complete';
  stepIndex: number;
  inputs: XbdDiscoveryInput;
  generatedDirections?: XbdBrandDirections;
  draftBrandId?: string;
  orbPrompt: string;
  updatedAt: string;
};

export type XbdConsistencyScore = {
  brandAlignment: number;
  voiceAlignment: number;
  visualAlignment: number;
  audienceFit: number;
  luxuryFit: number;
  positioningFit: number;
  differentiation: number;
  overallScore: number;
  improvementNotes: string[];
  passThreshold: number;
  status: 'pass' | 'revise' | 'fail';
};

export type XbdElevationFinding = {
  findingId: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  summary: string;
  recommendation: string;
};

export type XbdElevationReport = {
  reportId: string;
  brandId: string;
  overallHealth: number;
  findings: XbdElevationFinding[];
  generatedAt: string;
};

export type XbdIntelligenceQuery = {
  brandId: string;
  artifactType: string;
  artifactSummary: string;
  channel?: string;
};

export type XbdIntelligenceResult = {
  matchesBrandDna: boolean;
  strengthensBrand: boolean;
  attractsAudience: boolean;
  contradictsBrand: boolean;
  feelsPremiumEnough: boolean;
  supportsPositioning: boolean;
  rationale: string[];
  consistency: XbdConsistencyScore;
};

export type XbdPlaygroundAsset = {
  assetType: XbdPlaygroundAssetType;
  headline: string;
  body: string;
  visualCue: string;
  colorAccent: string;
};

export type XbdPlaygroundSelection = {
  brandId: string;
  assetType: XbdPlaygroundAssetType;
  sampleArtifactSummary: string;
};

export type XbdStore = {
  version: string;
  brandRegistry: XbdBrandDnaRecord[];
  discoverySession: XbdDiscoverySession;
  playground: XbdPlaygroundSelection;
  elevationReports: XbdElevationReport[];
  constitutionLocked: boolean;
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type XbdReadyView = {
  activeRoom: XbdRoomPath;
  brands: XbdBrandDnaRecord[];
  activeBrand: XbdBrandDnaRecord;
  discoverySession: XbdDiscoverySession;
  directions: XbdBrandDirections;
  playground: XbdPlaygroundSelection;
  playgroundAsset: XbdPlaygroundAsset;
  consistencyPreview: XbdConsistencyScore;
  elevationReport: XbdElevationReport;
  intelligencePreview: XbdIntelligenceResult;
  consumerBindings: { system: XbdConsumerSystem; status: string }[];
  demoBrandIds: XbdDemoBrandId[];
  orbNote: string;
  constitutionLocked: boolean;
};

export type XbdRuntimeInput = {
  pathname?: string;
  brandId?: string;
  playground?: Partial<XbdPlaygroundSelection>;
};

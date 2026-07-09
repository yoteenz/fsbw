import type {
  XniBlueprintStatus,
  XniConsumerSystem,
  XniDemoBrandId,
  XniNarrativeType,
  XniRoomPath,
} from './constants';

export type XniSceneSpec = {
  sceneId: string;
  title: string;
  arcStage: string;
  purpose: string;
  environment: string;
  cameraPlan: string;
  lighting: string;
  motion: string;
  proofRequired?: string;
};

export type XniCharacterSpec = {
  role: string;
  name: string;
  function: string;
};

export type XniDistributionChannel = {
  channelId: string;
  label: string;
  format: string;
  timing: string;
};

export type XniRepurposingItem = {
  itemId: string;
  sourceMoment: string;
  targetFormat: string;
  notes: string;
};

export type XniSuccessMetric = {
  metricId: string;
  label: string;
  target: string;
};

/** Narrative Blueprint™ — canonical creative planning object before any asset production */
export type XniNarrativeBlueprint = {
  blueprintId: string;
  companyId: string;
  brandId: string;
  brandDnaRef: string;
  productDnaRef: string;
  narrativeType: XniNarrativeType;
  status: XniBlueprintStatus;
  topic: string;
  objective: string;
  audience: string;
  desiredEmotion: string;
  storyArc: string[];
  hook: string;
  opening: string;
  scenes: XniSceneSpec[];
  environment: string;
  headquartersRoom: string;
  cameraPlan: string;
  lighting: string;
  music: string;
  characters: XniCharacterSpec[];
  orbRole: string;
  guestRole?: string;
  visualEffects: string[];
  motion: string;
  cta: string;
  repurposingPlan: XniRepurposingItem[];
  distributionPlan: XniDistributionChannel[];
  successMetrics: XniSuccessMetric[];
  requiredAssets: string[];
  approvalNote?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: string;
};

/** Production Genome™ — reusable brand-level production DNA */
export type XniProductionGenome = {
  genomeId: string;
  brandId: string;
  brandDnaRef: string;
  intro: string;
  outro: string;
  themeMusic: string;
  editingStyle: string;
  motionStyle: string;
  cameraStyle: string;
  visualLanguage: string;
  presenterStyle: string;
  orbBehavior: string;
  sceneSelectionRules: string[];
  episodeRhythm: string;
  status: 'draft' | 'canonical';
  updatedAt: string;
  version: string;
};

export type XniEpisodeStructure = {
  structureId: string;
  blueprintId: string;
  title: string;
  acts: { actId: string; label: string; beats: string[] }[];
  estimatedRuntimeMin: number;
  rhythmNotes: string;
};

export type XniSceneFlow = {
  flowId: string;
  blueprintId: string;
  moments: { momentId: string; label: string; arcStage: string; transition: string }[];
};

export type XniHeadquartersEnvironment = {
  environmentId: string;
  blueprintId: string;
  room: string;
  atmosphere: string;
  lightingWash: string;
  focalObject: string;
  orbPlacement: string;
};

export type XniPlaygroundPreview = {
  topic: string;
  brandId: string;
  companyId: string;
  narrativeType: XniNarrativeType;
  blueprint: XniNarrativeBlueprint;
  episodeStructure: XniEpisodeStructure;
  sceneFlow: XniSceneFlow;
  productionGenome: XniProductionGenome;
  headquartersEnvironment: XniHeadquartersEnvironment;
  requiredAssets: string[];
  distributionPlan: XniDistributionChannel[];
  productionGate: { allowed: boolean; reason: string };
};

export type XniPlaygroundInput = {
  topic: string;
  brandId: XniDemoBrandId;
  companyId: XniDemoBrandId;
  narrativeType: XniNarrativeType;
};

export type XniStore = {
  version: string;
  productionGenomeRegistry: XniProductionGenome[];
  blueprintRegistry: XniNarrativeBlueprint[];
  playground: XniPlaygroundInput;
  lastPreview?: XniPlaygroundPreview;
  constitutionLocked: boolean;
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type XniReadyView = {
  activeRoom: XniRoomPath;
  activeBrandId: XniDemoBrandId;
  productionGenomes: XniProductionGenome[];
  activeProductionGenome: XniProductionGenome;
  blueprints: XniNarrativeBlueprint[];
  approvedBlueprints: XniNarrativeBlueprint[];
  playground: XniPlaygroundInput;
  preview?: XniPlaygroundPreview;
  consumerBindings: { system: XniConsumerSystem; status: string; requiresApprovedBlueprint: boolean }[];
  demoBrandIds: XniDemoBrandId[];
  orbNote: string;
  constitutionLocked: boolean;
};

export type XniRuntimeInput = {
  pathname?: string;
  playground?: Partial<XniPlaygroundInput>;
  brandId?: XniDemoBrandId;
};

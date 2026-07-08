/** Department Package — runtime types loaded from Department Definition bundles. */

export type DepartmentZone = {
  id: string;
  type: string;
  displayName: string;
};

export type DepartmentSpatial = {
  layoutTemplate: string;
  envelope: { widthM: number; depthM: number; footprintM2: number; aspectRatio: string };
  zones: DepartmentZone[];
  heroObjectId: string;
  entryZoneId: string;
  exitZoneId: string;
};

export type DepartmentDefinition = {
  id: string;
  version: string;
  displayName: string;
  packageId: string;
  identity: {
    purpose: string;
    personality: string;
    metaphor: string;
    emotionalGoals: string[];
  };
  spatial: DepartmentSpatial;
  roomDnaRef: string;
  assets: { manifestRef: string; count: number; budgetMB: number };
  orb: {
    placement: string;
    assetId: string;
    capabilities: string[];
    position: { x: number; y: number; z: number };
  };
  genome: {
    injectionSlots: string[];
  };
};

export type RoomDnaSliders = Record<string, number>;

export type RoomDna = {
  departmentId: string;
  packageId: string;
  sliders: RoomDnaSliders;
  defaultFeeling: string[];
  forbiddenFeeling: string[];
  promptModifiers: Record<string, string>;
  materialBias: { primary: string[]; accent: string[]; forbidden: string[] };
};

export type AssetManifestEntry = {
  assetId: string;
  category: string;
  objectClass: string;
  generatorPrompt: string;
  dependencies: string[];
  stageOrder: number;
  promptRef?: string;
  outputPath?: string;
};

export type AssetManifest = {
  departmentId: string;
  packageId: string;
  count: number;
  categories: Record<string, string[]>;
  assets: AssetManifestEntry[];
};

export type ProductionGroupPromptTemplate = {
  primary: string;
  negative: string;
  roomDnaModifierKey: string;
  genomeSlots: string[];
};

export type ProductionGroupSpec = {
  displayName: string;
  heroAssetId: string;
  assetIds: string[];
  promptTemplate: ProductionGroupPromptTemplate;
  generation: {
    modelPresetId: string;
    aspectRatio: string;
    outputFormat: string;
  };
};

export type DepartmentProductionGroups = {
  departmentId: string;
  packageId: string;
  groups: Record<string, ProductionGroupSpec>;
  defaultProject: {
    id: string;
    name: string;
    vision: string;
    northStar: string;
    tone: string[];
  };
};

export type DepartmentPackage = {
  departmentId: string;
  packageId: string;
  definition: DepartmentDefinition;
  roomDna: RoomDna;
  assetManifest: AssetManifest;
  productionGroups: DepartmentProductionGroups;
};

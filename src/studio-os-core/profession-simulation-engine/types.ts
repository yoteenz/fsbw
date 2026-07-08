/**
 * ARTICLE-E01 — Profession Simulation Engine™
 *
 * Careers are simulated as living workplaces, not delivered as courses.
 */

export type ProfessionId =
  | 'hair'
  | 'photography'
  | 'marketing'
  | 'architecture'
  | 'construction'
  | 'finance'
  | 'cooking'
  | 'music'
  | 'fashion'
  | 'engineering'
  | 'legal'
  | 'healthcare'
  | 'film'
  | 'hospitality'
  | 'trades'
  | 'business'
  | (string & {});

export type CareerStageUnlockType =
  | 'responsibility'
  | 'client-type'
  | 'environment'
  | 'tool'
  | 'income'
  | 'ai-scenario'
  | 'certification';

export type AICharacterRole =
  | 'mentor'
  | 'manager'
  | 'coworker'
  | 'client'
  | 'inspector'
  | 'supplier'
  | 'student'
  | 'competitor';

export type AICharacterMemoryLayer =
  | 'session'
  | 'relationship'
  | 'reputation'
  | 'competency'
  | 'workplace'
  | 'career';

export type PromotionGateType =
  | 'skill-evidence'
  | 'scenario-performance'
  | 'mentor-approval'
  | 'client-satisfaction'
  | 'safety-compliance'
  | 'mistake-recovery'
  | 'project-completion'
  | 'certification-pass'
  | 'reputation-threshold';

export type WorkplaceLoopStep =
  | 'clock-in'
  | 'review-mentor-notes'
  | 'receive-appointment'
  | 'consult-client'
  | 'perform-service'
  | 'handle-challenge'
  | 'document-result'
  | 'receive-feedback'
  | 'earn-skill-evidence'
  | 'build-reputation'
  | 'unlock-promotion';

export type CareerStageUnlock = {
  type: CareerStageUnlockType;
  label: string;
  summary: string;
};

export type PromotionGateDefinition = {
  type: PromotionGateType;
  label: string;
  evidenceRequired: string;
  passCondition: string;
};

export type AICharacterDefinition = {
  id: string;
  displayName: string;
  role: AICharacterRole;
  summary: string;
  personality: string;
  memoryLayers: AICharacterMemoryLayer[];
  adaptsBy: string[];
};

export type SimulationSceneDefinition = {
  id: string;
  displayName: string;
  sceneType:
    | 'orientation'
    | 'shift'
    | 'client-appointment'
    | 'challenge'
    | 'project'
    | 'inspection'
    | 'promotion-review';
  environment: string;
  learnerAction: string;
  aiCharacters: string[];
  generatedFromProfessionBrain: string[];
  successSignals: string[];
  unexpectedEvents: string[];
};

export type CareerStageDefinition = {
  id: string;
  displayName: string;
  order: number;
  summary: string;
  responsibilities: string[];
  unlockedTools: string[];
  unlockedClientTypes: string[];
  unlockedEnvironments: string[];
  incomeModel: string;
  aiScenarioUnlocks: string[];
  certificationUnlocks: string[];
  promotionGates: PromotionGateDefinition[];
  sceneIds: string[];
  unlocks: CareerStageUnlock[];
};

export type ProfessionDefinition = {
  id: ProfessionId;
  displayName: string;
  worldGraphSlug: string;
  professionBrainId: string;
  summary: string;
  workplaceName: string;
  workplaceLoop: WorkplaceLoopStep[];
  supportedSurfaces: Array<
    'studio-institute' | 'profession-brain' | 'skill-graph' | 'professional-profile' | 'world-graph'
  >;
  aiCharacters: AICharacterDefinition[];
  careerStages: CareerStageDefinition[];
  simulationScenes: SimulationSceneDefinition[];
  tags: string[];
};

export type ProfessionSimulationBlueprint = {
  professionId: ProfessionId;
  entryStageId: string;
  stageIds: string[];
  sceneIds: string[];
  characterIds: string[];
};

export type ProfessionSimulationResolution = {
  profession: ProfessionDefinition;
  activeStage: CareerStageDefinition;
  availableScenes: SimulationSceneDefinition[];
  availableCharacters: AICharacterDefinition[];
  nextPromotionStage?: CareerStageDefinition;
  rationale: string;
};


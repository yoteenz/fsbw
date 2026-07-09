import { readGenesisStore } from './persistence/store';
import { bootstrapGenesisStoreIfEmpty } from './bootstrap/seeds';
import { getGenesisRegistryStats, listGenesisRegistry, searchGenesisRegistry } from './objects/registry';
import {
  createGenesisObject,
  getGenesisObject,
  listGenesisObjects,
  updateGenesisObject,
} from './objects/factory';
import { listGenesisRelationships, addGenesisRelationship, findContradictions } from './relationships/graph';
import {
  submitGenesisProposal,
  listGenesisProposals,
  listOpenProposals,
  advanceProposalStage,
  resolveProposal,
} from './proposals/pipeline';
import {
  createGenesisAdr,
  createAdrFromProposal,
  listGenesisAdrs,
  acceptGenesisAdr,
} from './adr/pipeline';
import {
  beginGenesisReview,
  listPendingReviewSessions,
  completeGenesisReview,
  promoteObjectToCanonical,
  autoRunSchemaReviewGate,
  GENESIS_REVIEW_GATES,
} from './reviews/pipeline';
import {
  compileGenesisTargets,
  getLatestCompileManifest,
  listCompileManifests,
  getCompilePreview,
} from './compiler/pipeline';
import { listCompileTargets } from './compiler/targets';
import {
  GENESIS_KERNEL_DOCTRINE,
  GENESIS_HIERARCHY,
  listPipelineStages,
} from './framework/hierarchy';
import { listGenesisFrameworkModules } from './framework/index';
import { getLifecycleSummary } from './framework/lifecycle';
import { listGenesisObjectSchemaTypes, getGenesisObjectSchemaMeta } from './schemas/object-schemas';
import { validateGenesisObject } from './schemas/validate';
import { formatGenesisVersion, INITIAL_GENESIS_VERSION } from './versioning/semver';
import { createObjectRevision, listHistoricalRevisions } from './versioning/revisions';
import { ensureConstitutionSubsystem } from './constitution/engine';
import { ensureObjectModelSubsystem } from './object-model/engine';
import { ensureInteractionModelSubsystem } from './interaction-model/engine';
import { ensureDecisionEngineSubsystem } from './decision-engine/engine';
import { ensureCoreSystemsSubsystem } from './core-systems/engine';
import { ensureDependencyMapSubsystem } from './dependency-map/engine';
import { ensureBuildOrderSubsystem } from './build-order/engine';
import { ensureIdentityEngineSubsystem } from './identity-engine/engine';
import { ensureExecutiveHeadquartersSubsystem } from './executive-headquarters/engine';
import { ensureOrbSubsystem } from './orb/engine';
import { ensureFounderAcceptanceTestingSubsystem } from './founder-acceptance-testing/engine';
import { ensureLiveValidationSystemSubsystem } from './live-validation-system/engine';
import { ensureEvolutionRoomSubsystem } from './evolution-room/engine';
import { ensureExecutiveReflectionSuiteSubsystem } from './executive-reflection-suite/engine';
import { ensureArchitectsPromptLibrarySubsystem } from './architects-prompt-library/engine';
import { ensureStudioOsDesignDnaSubsystem } from './studio-os-design-dna/engine';
import { ensureExperienceEngineDnaSubsystem } from './experience-engine/engine';
import { ensureExperienceRuntimeSubsystem } from './experience-runtime/engine';
import { ensureBrandDiscoveryEngineSubsystem } from './brand-discovery-engine/engine';
import { ensureStudioIntelligenceLayerSubsystem } from './studio-intelligence-layer/engine';
import { ensureNarrativeIntelligenceSubsystem } from './narrative-intelligence/engine';
import { ensureStudioProductionSystemSubsystem } from './studio-production-system/engine';
import { ensureCreativeOperatingSystemSubsystem } from './creative-operating-system/engine';
import { ensureExperienceLabSubsystem } from './experience-lab/engine';
import { listGenesisArticles } from './articles/registry';
import {
  GENESIS_FRAMEWORK_NAME,
  GENESIS_FRAMEWORK_VERSION,
  GENESIS_CHARTER_PATH,
} from './constants';
import type { GenesisRegistryStats } from './types';

export type GenesisPlatformStats = GenesisRegistryStats & {
  frameworkVersion: string;
  openProposals: number;
  contradictionCount: number;
};

export function ensureGenesisStore() {
  ensureConstitutionSubsystem();
  ensureObjectModelSubsystem();
  ensureInteractionModelSubsystem();
  ensureDecisionEngineSubsystem();
  ensureCoreSystemsSubsystem();
  ensureDependencyMapSubsystem();
  ensureBuildOrderSubsystem();
  ensureIdentityEngineSubsystem();
  ensureExecutiveHeadquartersSubsystem();
  ensureOrbSubsystem();
  ensureFounderAcceptanceTestingSubsystem();
  ensureLiveValidationSystemSubsystem();
  ensureEvolutionRoomSubsystem();
  ensureExecutiveReflectionSuiteSubsystem();
  ensureArchitectsPromptLibrarySubsystem();
  ensureStudioOsDesignDnaSubsystem();
  ensureExperienceEngineDnaSubsystem();
  ensureExperienceRuntimeSubsystem();
  ensureBrandDiscoveryEngineSubsystem();
  ensureStudioIntelligenceLayerSubsystem();
  ensureNarrativeIntelligenceSubsystem();
  ensureExperienceLabSubsystem();
  ensureStudioProductionSystemSubsystem();
  ensureCreativeOperatingSystemSubsystem();
  return readGenesisStore();
}

export function getGenesisPlatformStats(): GenesisPlatformStats {
  const stats = getGenesisRegistryStats();
  const store = readGenesisStore();

  return {
    ...stats,
    frameworkVersion: store.frameworkVersion,
    openProposals: listOpenProposals().length,
    contradictionCount: findContradictions().length,
  };
}

export {
  GENESIS_FRAMEWORK_NAME,
  GENESIS_FRAMEWORK_VERSION,
  GENESIS_CHARTER_PATH,
  GENESIS_KERNEL_DOCTRINE,
  GENESIS_HIERARCHY,
  INITIAL_GENESIS_VERSION,
  GENESIS_REVIEW_GATES,
  readGenesisStore,
  bootstrapGenesisStoreIfEmpty,
  getGenesisRegistryStats,
  listGenesisRegistry,
  searchGenesisRegistry,
  createGenesisObject,
  getGenesisObject,
  listGenesisObjects,
  updateGenesisObject,
  listGenesisRelationships,
  addGenesisRelationship,
  findContradictions,
  submitGenesisProposal,
  listGenesisProposals,
  listOpenProposals,
  advanceProposalStage,
  resolveProposal,
  createGenesisAdr,
  createAdrFromProposal,
  listGenesisAdrs,
  acceptGenesisAdr,
  beginGenesisReview,
  listPendingReviewSessions,
  completeGenesisReview,
  promoteObjectToCanonical,
  autoRunSchemaReviewGate,
  compileGenesisTargets,
  getLatestCompileManifest,
  listCompileManifests,
  getCompilePreview,
  listCompileTargets,
  listPipelineStages,
  listGenesisFrameworkModules,
  getLifecycleSummary,
  listGenesisObjectSchemaTypes,
  getGenesisObjectSchemaMeta,
  validateGenesisObject,
  formatGenesisVersion,
  createObjectRevision,
  listHistoricalRevisions,
  listGenesisArticles,
};

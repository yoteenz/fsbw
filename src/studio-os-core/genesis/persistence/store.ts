import { recordTraceEvent, traceSync } from '../../../platform-stabilization/main-thread-diagnostics';
import {
  GENESIS_FRAMEWORK_VERSION,
  GENESIS_STORAGE_KEY,
  GENESIS_UPDATED_EVENT,
} from '../constants';
import { bootstrapGenesisStoreIfEmpty } from '../bootstrap/seeds';
import { emptyConstitutionStore } from '../constitution/persistence';
import { emptyObjectModelStore } from '../object-model/persistence';
import { emptyInteractionModelStore } from '../interaction-model/persistence';
import { emptyDecisionEngineStore } from '../decision-engine/persistence';
import { emptyCoreSystemsStore } from '../core-systems/persistence';
import { emptyDependencyMapStore } from '../dependency-map/persistence';
import { emptyBuildOrderStore } from '../build-order/persistence';
import { emptyIdentityEngineStore } from '../identity-engine/persistence';
import { emptyExecutiveHeadquartersStore } from '../executive-headquarters/persistence';
import { emptyOrbStore } from '../orb/persistence';
import { emptyFounderAcceptanceTestingStore } from '../founder-acceptance-testing/persistence';
import { emptyLiveValidationSystemStore } from '../live-validation-system/persistence';
import { emptyEvolutionRoomStore } from '../evolution-room/persistence';
import { emptyExecutiveReflectionSuiteStore } from '../executive-reflection-suite/persistence';
import { emptyArchitectsPromptLibraryStore } from '../architects-prompt-library/persistence';
import { emptyStudioOsDesignDnaStore } from '../studio-os-design-dna/persistence';
import { emptyExperienceEngineDnaStore, withExperienceEngineSeedFallback } from '../experience-engine/persistence';
import { emptyExperienceRuntimeStore, withExperienceRuntimeSeedFallback } from '../experience-runtime/persistence';
import { emptyBrandDiscoveryEngineStore } from '../brand-discovery-engine/persistence';
import { emptyStudioIntelligenceLayerStore } from '../studio-intelligence-layer/persistence';
import { emptyNarrativeIntelligenceStore } from '../narrative-intelligence/persistence';
import { emptyExperienceLabStore, normalizeExperienceLabStore } from '../experience-lab/persistence';
import { emptyStudioProductionSystemStore } from '../studio-production-system/persistence';
import { emptyCreativeOperatingSystemStore } from '../creative-operating-system/persistence';
import type { GenesisStore } from '../types';

function emptyStore(): GenesisStore {
  return {
    version: GENESIS_FRAMEWORK_VERSION,
    frameworkVersion: GENESIS_FRAMEWORK_VERSION,
    objects: [],
    relationships: [],
    proposals: [],
    adrs: [],
    reviews: [],
    compileManifests: [],
    historicalRevisions: [],
  };
}

/** In-memory cache — prevents hundreds of synchronous JSON.parse calls during boot. */
let genesisStoreCache: GenesisStore | null = null;
let genesisStoreCacheRaw: string | null = null;
let readGenesisStoreWindowStart = 0;
let readGenesisStoreWindowCount = 0;

export function invalidateGenesisStoreCache(): void {
  genesisStoreCache = null;
  genesisStoreCacheRaw = null;
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GENESIS_UPDATED_EVENT));
  }
}

function noteReadGenesisStoreAccess(): void {
  const now = Date.now();
  if (now - readGenesisStoreWindowStart > 2000) {
    readGenesisStoreWindowStart = now;
    readGenesisStoreWindowCount = 0;
  }
  readGenesisStoreWindowCount += 1;
  if (readGenesisStoreWindowCount === 100) {
    recordTraceEvent(
      'warn',
      'readGenesisStore',
      `${readGenesisStoreWindowCount} reads in 2s — cache should keep this bounded`
    );
  }
}

function mergeParsedGenesis(parsed: GenesisStore): GenesisStore {
  return {
    ...emptyStore(),
    ...parsed,
    version: GENESIS_FRAMEWORK_VERSION,
    frameworkVersion: parsed.frameworkVersion ?? GENESIS_FRAMEWORK_VERSION,
    objects: parsed.objects ?? [],
    relationships: parsed.relationships ?? [],
    proposals: parsed.proposals ?? [],
    adrs: parsed.adrs ?? [],
    reviews: parsed.reviews ?? [],
    compileManifests: parsed.compileManifests ?? [],
    historicalRevisions: parsed.historicalRevisions ?? [],
    constitution: parsed.constitution ?? emptyConstitutionStore(),
    objectModel: parsed.objectModel ?? emptyObjectModelStore(),
    interactionModel: parsed.interactionModel ?? emptyInteractionModelStore(),
    decisionEngine: parsed.decisionEngine ?? emptyDecisionEngineStore(),
    coreSystems: parsed.coreSystems ?? emptyCoreSystemsStore(),
    dependencyMap: parsed.dependencyMap ?? emptyDependencyMapStore(),
    buildOrder: parsed.buildOrder ?? emptyBuildOrderStore(),
    identityEngine: parsed.identityEngine ?? emptyIdentityEngineStore(),
    executiveHeadquarters: parsed.executiveHeadquarters ?? emptyExecutiveHeadquartersStore(),
    orb: parsed.orb ?? emptyOrbStore(),
    founderAcceptanceTesting:
      parsed.founderAcceptanceTesting ?? emptyFounderAcceptanceTestingStore(),
    liveValidationSystem: parsed.liveValidationSystem ?? emptyLiveValidationSystemStore(),
    evolutionRoom: parsed.evolutionRoom ?? emptyEvolutionRoomStore(),
    executiveReflectionSuite:
      parsed.executiveReflectionSuite ?? emptyExecutiveReflectionSuiteStore(),
    architectsPromptLibrary:
      parsed.architectsPromptLibrary ?? emptyArchitectsPromptLibraryStore(),
    studioOsDesignDna: parsed.studioOsDesignDna ?? emptyStudioOsDesignDnaStore(),
    experienceEngineDna: withExperienceEngineSeedFallback(
      parsed.experienceEngineDna ?? emptyExperienceEngineDnaStore()
    ),
    experienceRuntimeDna: withExperienceRuntimeSeedFallback(
      parsed.experienceRuntimeDna ?? emptyExperienceRuntimeStore()
    ),
    brandDiscoveryEngineDna: parsed.brandDiscoveryEngineDna ?? emptyBrandDiscoveryEngineStore(),
    studioIntelligenceLayerDna:
      parsed.studioIntelligenceLayerDna ?? emptyStudioIntelligenceLayerStore(),
    narrativeIntelligenceDna: parsed.narrativeIntelligenceDna ?? emptyNarrativeIntelligenceStore(),
    experienceLabDna: normalizeExperienceLabStore(parsed.experienceLabDna ?? emptyExperienceLabStore()),
    studioProductionSystemDna: parsed.studioProductionSystemDna ?? emptyStudioProductionSystemStore(),
    creativeOperatingSystemDna:
      parsed.creativeOperatingSystemDna ?? emptyCreativeOperatingSystemStore(),
  };
}

export function readGenesisStore(): GenesisStore {
  return traceSync('readGenesisStore', () => {
    noteReadGenesisStoreAccess();

    if (typeof localStorage === 'undefined') {
      return bootstrapGenesisStoreIfEmpty(emptyStore());
    }

    try {
      const raw = localStorage.getItem(GENESIS_STORAGE_KEY);
      if (!raw) {
        const seeded = bootstrapGenesisStoreIfEmpty(emptyStore());
        writeGenesisStore(seeded);
        return seeded;
      }

      if (genesisStoreCache && raw === genesisStoreCacheRaw) {
        return genesisStoreCache;
      }

      const merged = mergeParsedGenesis(JSON.parse(raw) as GenesisStore);
      const result = bootstrapGenesisStoreIfEmpty(merged);
      genesisStoreCache = result;
      genesisStoreCacheRaw = raw;
      return result;
    } catch {
      invalidateGenesisStoreCache();
      return bootstrapGenesisStoreIfEmpty(emptyStore());
    }
  });
}

export function writeGenesisStore(store: GenesisStore): void {
  const normalized = bootstrapGenesisStoreIfEmpty(store);
  const serialized = JSON.stringify(normalized);
  genesisStoreCache = normalized;
  genesisStoreCacheRaw = serialized;

  if (typeof localStorage === 'undefined') return;

  const existing = localStorage.getItem(GENESIS_STORAGE_KEY);
  if (existing === serialized) return;
  localStorage.setItem(GENESIS_STORAGE_KEY, serialized);
  dispatchUpdated();
}

export function mutateGenesisStore(mutator: (store: GenesisStore) => GenesisStore): GenesisStore {
  const next = mutator(readGenesisStore());
  writeGenesisStore(next);
  return next;
}

export type GenesisPersistenceAdapter = {
  load: () => Promise<GenesisStore>;
  save: (store: GenesisStore) => Promise<void>;
};

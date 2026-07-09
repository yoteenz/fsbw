import { XSIL_DEMO_COMPANY_IDS, XSIL_FOUNDATION_TRAITS, XSIL_ROOM_PATHS, type XsilRoomPath } from '../constants';
import { readStudioIntelligenceLayerStore } from '../persistence';
import { compileExperienceEnvironment, getLatestCompileManifest } from '../engines/experience-compiler';
import { evaluateExecutiveIntelligence } from '../engines/executive-intelligence-engine';
import { listIntelligenceConsumerBindings } from '../engines/intelligence-consumer-engine';
import { buildCreativeGraphSummary } from '../engines/creative-knowledge-graph';
import { buildTasteSummary } from '../engines/taste-learning-engine';
import { listPendingCanonReview } from '../engines/canon-engine';
import {
  getAudienceDna,
  getCompanyById,
  getDecisionDna,
  getDefaultCompany,
  getOperatingManual,
  getProductDna,
  getTasteGenome,
  listCreativeForCompany,
  listCanonForCompany,
} from '../registries/intelligence-registries';
import type { XsilExperienceCompileManifest, XsilReadyView, XsilRuntimeInput } from '../types';

export function isValidXsilRoomPath(slug: string): slug is XsilRoomPath {
  return (XSIL_ROOM_PATHS as readonly string[]).includes(slug);
}

export function xsilRoomPathFromSlug(slug?: string): XsilRoomPath {
  if (slug && isValidXsilRoomPath(slug)) return slug;
  return 'studio-intelligence-layer';
}

export function buildXsilOrbNote(): string {
  return 'Studio Intelligence Layer™ — executive reasoning across operating manuals, Decision DNA, taste, canon, audience, product, creative graph, and experience compilation.';
}

function defaultManifest(companyId: string): XsilExperienceCompileManifest {
  return {
    manifestId: `compile-preview-${companyId}`,
    companyId,
    mission: 'Executive headquarters arrival',
    role: 'founder',
    device: 'desktop',
    layersUsed: ['Platform DNA', 'Brand DNA', 'Operating Manual', 'Decision DNA'],
    explainTrace: ['Run Experience Compiler for full manifest'],
    compiledAt: new Date().toISOString(),
  };
}

export function buildStudioIntelligenceLayerReadyView(input?: XsilRuntimeInput): XsilReadyView {
  const store = readStudioIntelligenceLayerStore();
  const activeRoom = xsilRoomPathFromSlug(input?.pathname?.split('/').pop());
  const playground = input?.playground ? { ...store.playground, ...input.playground } : store.playground;
  const companyId = input?.companyId ?? playground.companyId;

  const activeCompany = getCompanyById(companyId) ?? getDefaultCompany();
  const operatingManual = getOperatingManual(companyId)!;
  const decisionDna = getDecisionDna(companyId)!;
  const tasteGenome = getTasteGenome(companyId)!;
  const audienceDna = getAudienceDna(companyId)!;
  const productDna = getProductDna(companyId)!;
  const creativeNodes = listCreativeForCompany(companyId);
  const canonCandidates = listCanonForCompany(companyId);
  const compileManifest =
    getLatestCompileManifest(companyId) ??
    defaultManifest(companyId);

  const executiveRecommendation = evaluateExecutiveIntelligence({
    companyId,
    mission: 'Align next executive action with company intelligence',
    artifactSummary: `${activeCompany.companyName} ${activeRoom}`,
  });

  return {
    activeRoom,
    activeCompany,
    operatingManual,
    decisionDna,
    tasteGenome,
    audienceDna,
    productDna,
    creativeNodes,
    canonCandidates,
    compileManifest,
    executiveRecommendation,
    consumerBindings: listIntelligenceConsumerBindings(companyId),
    demoCompanyIds: [...XSIL_DEMO_COMPANY_IDS],
    foundationTraits: [...XSIL_FOUNDATION_TRAITS],
    orbNote: buildXsilOrbNote(),
    constitutionLocked: store.constitutionLocked,
  };
}

export { compileExperienceEnvironment, buildCreativeGraphSummary, buildTasteSummary, listPendingCanonReview };

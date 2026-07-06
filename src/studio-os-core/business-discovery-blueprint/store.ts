import { BUSINESS_DISCOVERY_BLUEPRINT_STORAGE_KEY, BUSINESS_DISCOVERY_BLUEPRINT_VERSION, STUDIO_OS_BLUEPRINT_UPDATED } from './constants';
import { regenerateBlueprintOutputs } from './outputs-generator';
import {
  computeOverallProgress,
  recommendNextChapter,
  resolveBlueprintStatus,
  detectMilestoneToCelebrate,
  computeAllChapterProgress,
} from './progress';
import { detectLivingDiscoveryPhrase } from './conversational-engine';
import type {
  BusinessDiscoveryBlueprintStore,
  DiscoveryChapterId,
  DiscoveryResponse,
  LivingDiscoverySignal,
  OrganizationDiscoveryBlueprint,
  ResourceUpload,
  ServiceDiscoverySession,
} from './types';

function emptyStore(): BusinessDiscoveryBlueprintStore {
  return { blueprints: [], version: BUSINESS_DISCOVERY_BLUEPRINT_VERSION };
}

export function readBusinessDiscoveryBlueprintStore(): BusinessDiscoveryBlueprintStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(BUSINESS_DISCOVERY_BLUEPRINT_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as BusinessDiscoveryBlueprintStore;
    return { ...emptyStore(), ...parsed, version: BUSINESS_DISCOVERY_BLUEPRINT_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeBusinessDiscoveryBlueprintStore(store: BusinessDiscoveryBlueprintStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(BUSINESS_DISCOVERY_BLUEPRINT_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_BLUEPRINT_UPDATED));
  }
}

export function getOrganizationDiscoveryBlueprint(
  organizationId: string
): OrganizationDiscoveryBlueprint | null {
  return readBusinessDiscoveryBlueprintStore().blueprints.find((b) => b.organizationId === organizationId) ?? null;
}

export function buildInitialBlueprint(
  organizationId: string,
  companyName: string,
  industryId: string
): OrganizationDiscoveryBlueprint {
  const now = new Date().toISOString();
  return {
    organizationId,
    companyName,
    industryId,
    startedAt: now,
    updatedAt: now,
    lastSessionAt: now,
    overallProgressPct: 0,
    currentChapterId: 'organization-identity',
    recommendedNextChapterId: 'organization-identity',
    responses: [],
    serviceSessions: [],
    resourceUploads: [],
    generatedOutputs: [],
    livingSignals: [],
    milestonesCelebrated: [],
    status: 'discovering',
  };
}

export function ensureOrganizationDiscoveryBlueprint(
  organizationId: string,
  companyName?: string,
  industryId?: string
): OrganizationDiscoveryBlueprint {
  const existing = getOrganizationDiscoveryBlueprint(organizationId);
  if (existing) return existing;

  const blueprint = buildInitialBlueprint(
    organizationId,
    companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId ?? 'ecommerce'
  );
  upsertOrganizationDiscoveryBlueprint(blueprint);
  return blueprint;
}

function finalizeBlueprintUpdate(blueprint: OrganizationDiscoveryBlueprint): OrganizationDiscoveryBlueprint {
  const previousPct = blueprint.overallProgressPct;
  const overallProgressPct = computeOverallProgress(blueprint);
  const recommendedNextChapterId = recommendNextChapter(blueprint);
  const generatedOutputs = regenerateBlueprintOutputs({ ...blueprint, overallProgressPct });
  const milestone = detectMilestoneToCelebrate({ ...blueprint, overallProgressPct }, previousPct);
  const milestonesCelebrated = milestone
    ? [...blueprint.milestonesCelebrated, milestone]
    : blueprint.milestonesCelebrated;

  const chapters = computeAllChapterProgress({ ...blueprint, overallProgressPct });
  const blueprintFullyComplete =
    chapters.every((c) => c.status === 'complete') || overallProgressPct >= 100;
  const inaugurationEligibleAt =
    blueprintFullyComplete && !blueprint.inaugurationEligibleAt
      ? new Date().toISOString()
      : blueprint.inaugurationEligibleAt;

  const finalized = {
    ...blueprint,
    overallProgressPct,
    recommendedNextChapterId,
    generatedOutputs,
    milestonesCelebrated,
    status: resolveBlueprintStatus({ ...blueprint, overallProgressPct }),
    updatedAt: new Date().toISOString(),
    lastSessionAt: new Date().toISOString(),
    blueprintFullyComplete,
    inaugurationEligibleAt,
  };

  if (blueprintFullyComplete) {
    void import('../organization-inauguration/store').then((m) => {
      m.ensureInaugurationFromBlueprint(blueprint.organizationId);
    });
    void import('../profession-brain/store').then((m) => {
      m.syncProfessionBrainFromSources(blueprint.organizationId, blueprint.industryId, blueprint.companyName);
    });
  }

  void import('../organization-genome/store').then((m) => {
    m.syncOrganizationGenomeFromSources(blueprint.organizationId);
  });

  void import('../memory-engine/store').then((m) => {
    m.syncMemoryEngineFromSources(blueprint.organizationId);
  });

  void import('../company-health-index/store').then((m) => {
    m.syncCompanyHealthIndexFromSources(blueprint.organizationId);
  });

  void import('../organization-pulse/store').then((m) => {
    m.syncOrganizationPulseFromSources(blueprint.organizationId);
  });

  void import('../wisdom-capture/store').then((m) => {
    m.syncWisdomCaptureFromSources(blueprint.organizationId);
  });

  void import('../shadow-mode/store').then((m) => {
    m.syncShadowModeFromSources(blueprint.organizationId);
  });

  void import('../organization-digital-twin/store').then((m) => {
    m.syncDigitalTwinFromSources(blueprint.organizationId);
  });

  void import('../business-simulation-lab/store').then((m) => {
    m.syncSimulationLabFromSources(blueprint.organizationId);
  });

  void import('../knowledge-confidence/store').then((m) => {
    m.syncKnowledgeConfidenceFromSources(blueprint.organizationId);
  });

  void import('../legacy-vault/store').then((m) => {
    m.syncLegacyVaultFromSources(blueprint.organizationId);
  });

  void import('../ambient-awareness/store').then((m) => {
    m.syncAmbientAwarenessFromSources(blueprint.organizationId);
  });

  void import('../anticipation-engine/store').then((m) => {
    m.syncAnticipationEngineFromSources(blueprint.organizationId);
  });

  void import('../founder-cognitive-load/store').then((m) => {
    m.syncFounderCognitiveLoadFromSources(blueprint.organizationId);
  });

  void import('../presence-engine/store').then((m) => {
    m.syncPresenceEngineFromSources(blueprint.organizationId);
  });

  void import('../succession-mode/store').then((m) => {
    m.syncSuccessionModeFromSources(blueprint.organizationId);
  });

  void import('../executive-council/org-store').then((m) => {
    m.syncExecutiveCouncilFromSources(blueprint.organizationId);
  });

  return finalized;
}

export function upsertOrganizationDiscoveryBlueprint(blueprint: OrganizationDiscoveryBlueprint): void {
  const store = readBusinessDiscoveryBlueprintStore();
  const next = store.blueprints.filter((b) => b.organizationId !== blueprint.organizationId);
  writeBusinessDiscoveryBlueprintStore({
    ...store,
    blueprints: [...next, finalizeBlueprintUpdate(blueprint)],
  });
}

export function saveDiscoveryResponse(
  organizationId: string,
  response: Omit<DiscoveryResponse, 'updatedAt'>
): OrganizationDiscoveryBlueprint {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const updated: DiscoveryResponse = { ...response, updatedAt: new Date().toISOString() };
  const without = blueprint.responses.filter((r) => r.promptId !== response.promptId);
  const next = {
    ...blueprint,
    responses: [...without, updated],
    currentChapterId: response.chapterId,
  };
  upsertOrganizationDiscoveryBlueprint(next);
  return getOrganizationDiscoveryBlueprint(organizationId)!;
}

export function setCurrentChapter(
  organizationId: string,
  chapterId: DiscoveryChapterId
): OrganizationDiscoveryBlueprint {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  upsertOrganizationDiscoveryBlueprint({ ...blueprint, currentChapterId: chapterId });
  return getOrganizationDiscoveryBlueprint(organizationId)!;
}

export function startServiceDiscoverySession(
  organizationId: string,
  serviceName: string
): OrganizationDiscoveryBlueprint {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const existing = blueprint.serviceSessions.find(
    (s) => s.serviceName.toLowerCase() === serviceName.toLowerCase() && s.status === 'in-progress'
  );
  if (existing) {
    upsertOrganizationDiscoveryBlueprint({ ...blueprint, currentChapterId: 'services' });
    return getOrganizationDiscoveryBlueprint(organizationId)!;
  }

  const session: ServiceDiscoverySession = {
    id: `svc-${Date.now()}`,
    serviceName,
    status: 'in-progress',
    responses: [],
    startedAt: new Date().toISOString(),
  };
  upsertOrganizationDiscoveryBlueprint({
    ...blueprint,
    currentChapterId: 'services',
    serviceSessions: [...blueprint.serviceSessions, session],
  });
  return getOrganizationDiscoveryBlueprint(organizationId)!;
}

export function saveServiceDiscoveryResponse(
  organizationId: string,
  sessionId: string,
  response: Omit<DiscoveryResponse, 'updatedAt' | 'serviceName'>
): OrganizationDiscoveryBlueprint {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const sessions = blueprint.serviceSessions.map((session) => {
    if (session.id !== sessionId) return session;
    const updated: DiscoveryResponse = {
      ...response,
      serviceName: session.serviceName,
      updatedAt: new Date().toISOString(),
    };
    const without = session.responses.filter((r) => r.promptId !== response.promptId);
    return { ...session, responses: [...without, updated] };
  });
  upsertOrganizationDiscoveryBlueprint({ ...blueprint, serviceSessions: sessions, currentChapterId: 'services' });
  return getOrganizationDiscoveryBlueprint(organizationId)!;
}

export function completeServiceDiscoverySession(
  organizationId: string,
  sessionId: string
): OrganizationDiscoveryBlueprint {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const sessions = blueprint.serviceSessions.map((session) =>
    session.id === sessionId
      ? { ...session, status: 'complete' as const, completedAt: new Date().toISOString() }
      : session
  );
  upsertOrganizationDiscoveryBlueprint({ ...blueprint, serviceSessions: sessions });
  return getOrganizationDiscoveryBlueprint(organizationId)!;
}

export function addResourceUpload(
  organizationId: string,
  upload: Omit<ResourceUpload, 'id' | 'uploadedAt'>
): OrganizationDiscoveryBlueprint {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const entry: ResourceUpload = {
    ...upload,
    id: `res-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
  };
  upsertOrganizationDiscoveryBlueprint({
    ...blueprint,
    resourceUploads: [...blueprint.resourceUploads, entry],
    currentChapterId: 'resources',
  });
  return getOrganizationDiscoveryBlueprint(organizationId)!;
}

export function recordLivingDiscoverySignal(
  organizationId: string,
  phrase: string
): OrganizationDiscoveryBlueprint {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const signal: LivingDiscoverySignal = {
    id: `living-${Date.now()}`,
    phrase,
    detectedAt: new Date().toISOString(),
    resolved: false,
  };
  upsertOrganizationDiscoveryBlueprint({
    ...blueprint,
    livingSignals: [...blueprint.livingSignals, signal],
    status: 'living',
  });
  return getOrganizationDiscoveryBlueprint(organizationId)!;
}

export function resolveLivingDiscoverySignal(
  organizationId: string,
  signalId: string
): OrganizationDiscoveryBlueprint {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const livingSignals = blueprint.livingSignals.map((s) =>
    s.id === signalId ? { ...s, resolved: true } : s
  );
  upsertOrganizationDiscoveryBlueprint({ ...blueprint, livingSignals });
  return getOrganizationDiscoveryBlueprint(organizationId)!;
}

export function syncBlueprintFromArchitecture(
  organizationId: string,
  industryId: string,
  companyName?: string
): OrganizationDiscoveryBlueprint {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId, companyName, industryId);
  if (blueprint.industryId === industryId && (!companyName || blueprint.companyName === companyName)) {
    return blueprint;
  }
  upsertOrganizationDiscoveryBlueprint({
    ...blueprint,
    industryId,
    companyName: companyName ?? blueprint.companyName,
  });
  return getOrganizationDiscoveryBlueprint(organizationId)!;
}

export function processLivingDiscoveryInput(
  organizationId: string,
  input: string
): OrganizationDiscoveryBlueprint | null {
  if (!detectLivingDiscoveryPhrase(input)) return null;
  return recordLivingDiscoverySignal(organizationId, input.trim());
}

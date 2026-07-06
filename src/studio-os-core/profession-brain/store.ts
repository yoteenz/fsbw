import { PROFESSION_BRAIN_STORAGE_KEY, PROFESSION_BRAIN_VERSION, STUDIO_OS_PROFESSION_BRAIN_UPDATED } from './constants';
import { buildInitialProfile } from './knowledge-seeds';
import { buildMemoryGraph } from './memory-graph';
import { generateAllHumanKnowledge } from './human-knowledge';
import { generateAllAcademyModules } from './academy-bridge';
import { generateAllPublicSurfaces } from './customer-experience';
import { buildJudgmentPatternsFromBrain } from './decision-intelligence';
import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import type {
  BrainKnowledgeEntry,
  LivingBrainSignal,
  OrganizationProfessionBrainProfile,
  ProfessionBrainStore,
} from './types';

function emptyStore(): ProfessionBrainStore {
  return { profiles: [], version: PROFESSION_BRAIN_VERSION };
}

export function readProfessionBrainStore(): ProfessionBrainStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PROFESSION_BRAIN_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ProfessionBrainStore;
    return { ...emptyStore(), ...parsed, version: PROFESSION_BRAIN_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeProfessionBrainStore(store: ProfessionBrainStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PROFESSION_BRAIN_STORAGE_KEY, JSON.stringify(store));
}

export function getOrganizationProfessionBrainProfile(
  organizationId: string
): OrganizationProfessionBrainProfile | null {
  return readProfessionBrainStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function finalizeProfile(profile: OrganizationProfessionBrainProfile): OrganizationProfessionBrainProfile {
  for (const brain of profile.brains) {
    brain.judgmentPatterns = buildJudgmentPatternsFromBrain(brain);
  }
  const humanKnowledge = generateAllHumanKnowledge(profile.brains);
  const academyModules = generateAllAcademyModules(profile.brains);
  const publicSurfaces = generateAllPublicSurfaces(profile.brains);
  const memoryGraph = buildMemoryGraph({ ...profile, humanKnowledge, academyModules, publicSurfaces });
  const overallMaturityPct =
    profile.brains.length === 0
      ? 0
      : Math.round(profile.brains.reduce((s, b) => s + b.maturityPct, 0) / profile.brains.length);

  return {
    ...profile,
    humanKnowledge,
    academyModules,
    publicSurfaces,
    memoryGraph,
    overallMaturityPct,
    updatedAt: new Date().toISOString(),
  };
}

export function ensureOrganizationProfessionBrainProfile(
  organizationId: string,
  companyName?: string,
  industryId?: string
): OrganizationProfessionBrainProfile | null {
  const existing = getOrganizationProfessionBrainProfile(organizationId);
  if (existing) return existing;

  const resolvedIndustry = industryId ?? resolveIndustryForWorkspace(organizationId);
  const name = companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const profile = finalizeProfile(buildInitialProfile(organizationId, resolvedIndustry, name));
  upsertOrganizationProfessionBrainProfile(profile);
  return getOrganizationProfessionBrainProfile(organizationId);
}

export function upsertOrganizationProfessionBrainProfile(
  profile: OrganizationProfessionBrainProfile
): void {
  const store = readProfessionBrainStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeProfessionBrainStore({ ...store, profiles: [...next, finalizeProfile(profile)] });
  void import('../expert-marketplace/store').then((m) => {
    m.syncExpertMarketplaceFromProfessionBrain(profile.organizationId);
  });
  void import('../studio-institute/org-store').then((m) => {
    m.syncStudioInstituteFromProfessionBrain(profile.organizationId);
  });
  void import('../knowledge-commerce/store').then((m) => {
    m.syncKnowledgeCommerceFromProfessionBrain(profile.organizationId);
  });
  void import('../professional-trust-framework/store').then((m) => {
    m.syncProfessionalTrustFromProfessionBrain(profile.organizationId);
  });
}

export function syncProfessionBrainFromSources(
  organizationId: string,
  industryId: string,
  companyName?: string
): OrganizationProfessionBrainProfile | null {
  const existing = getOrganizationProfessionBrainProfile(organizationId);
  if (existing && existing.brains.some((b) => b.knowledgeEntries.length > 3)) {
    return existing;
  }

  const refreshed = finalizeProfile(
    buildInitialProfile(organizationId, industryId, companyName ?? organizationId)
  );
  upsertOrganizationProfessionBrainProfile(refreshed);
  return refreshed;
}

export function addBrainKnowledgeEntry(
  organizationId: string,
  brainId: string,
  entry: Omit<BrainKnowledgeEntry, 'id' | 'updatedAt' | 'version'>
): OrganizationProfessionBrainProfile | null {
  const profile = getOrganizationProfessionBrainProfile(organizationId);
  if (!profile) return null;

  const brains = profile.brains.map((brain) => {
    if (brain.id !== brainId) return brain;
    const newEntry: BrainKnowledgeEntry = {
      ...entry,
      id: `live-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      version: brain.knowledgeEntries.length + 1,
    };
    return {
      ...brain,
      knowledgeEntries: [...brain.knowledgeEntries, newEntry],
      maturityPct: Math.min(100, brain.maturityPct + 5),
      lastEvolvedAt: new Date().toISOString(),
    };
  });

  upsertOrganizationProfessionBrainProfile({ ...profile, brains });
  dispatchBrainUpdated(organizationId);
  return getOrganizationProfessionBrainProfile(organizationId);
}

export function recordLivingBrainSignal(
  organizationId: string,
  phrase: string,
  targetBrainId?: string
): OrganizationProfessionBrainProfile | null {
  const profile = ensureOrganizationProfessionBrainProfile(organizationId);
  if (!profile) return null;

  const signal: LivingBrainSignal = {
    id: `living-${Date.now()}`,
    phrase,
    detectedAt: new Date().toISOString(),
    resolved: false,
    targetBrainId,
  };

  upsertOrganizationProfessionBrainProfile({
    ...profile,
    livingSignals: [...profile.livingSignals, signal],
  });
  return getOrganizationProfessionBrainProfile(organizationId);
}

export function resolveLivingBrainSignal(
  organizationId: string,
  signalId: string
): OrganizationProfessionBrainProfile | null {
  const profile = getOrganizationProfessionBrainProfile(organizationId);
  if (!profile) return null;

  upsertOrganizationProfessionBrainProfile({
    ...profile,
    livingSignals: profile.livingSignals.map((s) =>
      s.id === signalId ? { ...s, resolved: true } : s
    ),
  });
  return getOrganizationProfessionBrainProfile(organizationId);
}

export function recordBrainExportAction(organizationId: string): OrganizationProfessionBrainProfile | null {
  const profile = getOrganizationProfessionBrainProfile(organizationId);
  if (!profile) return null;

  upsertOrganizationProfessionBrainProfile({
    ...profile,
    ownership: {
      ...profile.ownership,
      exportedAt: new Date().toISOString(),
      protected: true,
    },
  });
  return getOrganizationProfessionBrainProfile(organizationId);
}

function dispatchBrainUpdated(organizationId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(STUDIO_OS_PROFESSION_BRAIN_UPDATED, { detail: { organizationId } })
  );
}

export function refreshProfessionBrainProfile(organizationId: string): OrganizationProfessionBrainProfile | null {
  const profile = getOrganizationProfessionBrainProfile(organizationId);
  if (!profile) return ensureOrganizationProfessionBrainProfile(organizationId);

  upsertOrganizationProfessionBrainProfile(profile);
  return getOrganizationProfessionBrainProfile(organizationId);
}

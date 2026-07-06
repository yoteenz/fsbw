import {
  EXECUTIVE_COUNCIL_ORG_STORAGE_KEY,
  EXECUTIVE_COUNCIL_ORG_VERSION,
  STUDIO_OS_EXECUTIVE_COUNCIL_UPDATED,
} from './constants';
import { synthesizeExecutiveBriefing } from './briefing-engine';
import { mergeCouncilProfileState, buildOrganizationExecutiveCouncilProfile } from './council-builder';
import { generateExecutiveContributions } from './collaborative-meeting';
import {
  createCouncilDecisionRecord,
  syncDecisionToMemoryEngine,
  resolveCouncilDecision,
} from './decision-history';
import type {
  CouncilDecisionRecord,
  CouncilMeetingResult,
  ExecutiveBriefing,
  ExecutiveCouncilOrgStore,
  OrganizationExecutiveCouncilProfile,
} from './org-types';

function emptyOrgStore(): ExecutiveCouncilOrgStore {
  return { version: EXECUTIVE_COUNCIL_ORG_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_EXECUTIVE_COUNCIL_UPDATED));
  }
}

export function readExecutiveCouncilOrgStore(): ExecutiveCouncilOrgStore {
  if (typeof localStorage === 'undefined') return emptyOrgStore();
  try {
    const raw = localStorage.getItem(EXECUTIVE_COUNCIL_ORG_STORAGE_KEY);
    if (!raw) return emptyOrgStore();
    const parsed = JSON.parse(raw) as ExecutiveCouncilOrgStore;
    return { ...emptyOrgStore(), ...parsed, version: EXECUTIVE_COUNCIL_ORG_VERSION };
  } catch {
    return emptyOrgStore();
  }
}

export function writeExecutiveCouncilOrgStore(store: ExecutiveCouncilOrgStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(EXECUTIVE_COUNCIL_ORG_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationExecutiveCouncilProfile(
  organizationId: string
): OrganizationExecutiveCouncilProfile | null {
  return readExecutiveCouncilOrgStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationExecutiveCouncilProfile): OrganizationExecutiveCouncilProfile {
  const store = readExecutiveCouncilOrgStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeExecutiveCouncilOrgStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncExecutiveCouncilFromSources(organizationId: string): OrganizationExecutiveCouncilProfile {
  const existing = getOrganizationExecutiveCouncilProfile(organizationId);
  const profile = mergeCouncilProfileState(organizationId, existing);
  return upsertProfile(profile);
}

export function ensureOrganizationExecutiveCouncilProfile(
  organizationId: string
): OrganizationExecutiveCouncilProfile {
  const existing = getOrganizationExecutiveCouncilProfile(organizationId);
  if (existing) return existing;
  return syncExecutiveCouncilFromSources(organizationId);
}

export function conductExecutiveCouncilMeeting(
  organizationId: string,
  query: string
): CouncilMeetingResult {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('Council meeting requires a strategic question.');
  }

  const profile = ensureOrganizationExecutiveCouncilProfile(organizationId);
  const contributions = generateExecutiveContributions(organizationId, trimmed, profile.digitalExecutives);
  const briefing = synthesizeExecutiveBriefing(trimmed, contributions);
  const decisionRecord = createCouncilDecisionRecord(briefing);

  syncDecisionToMemoryEngine(organizationId, decisionRecord, briefing);

  const updated: OrganizationExecutiveCouncilProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
    latestBriefing: briefing,
    meetingsHeld: profile.meetingsHeld + 1,
    pendingDecisions: profile.pendingDecisions + 1,
    decisionHistory: [decisionRecord, ...profile.decisionHistory].slice(0, 50),
    councilHealthPct: Math.min(98, profile.councilHealthPct + 1),
  };

  upsertProfile(updated);
  return { briefing, decisionRecord };
}

export function updateCouncilDecisionOutcome(
  organizationId: string,
  decisionId: string,
  outcome: CouncilDecisionRecord['outcome']
): OrganizationExecutiveCouncilProfile | null {
  const profile = getOrganizationExecutiveCouncilProfile(organizationId);
  if (!profile) return null;

  const decisionHistory = resolveCouncilDecision(profile, decisionId, outcome);
  const pendingDecisions = decisionHistory.filter((d) => d.outcome === 'pending').length;

  return upsertProfile({
    ...profile,
    decisionHistory,
    pendingDecisions,
    updatedAt: new Date().toISOString(),
  });
}

export function getLatestExecutiveBriefing(organizationId: string): ExecutiveBriefing | null {
  return getOrganizationExecutiveCouncilProfile(organizationId)?.latestBriefing ?? null;
}

export function listCouncilDecisionHistory(organizationId: string): CouncilDecisionRecord[] {
  return getOrganizationExecutiveCouncilProfile(organizationId)?.decisionHistory ?? [];
}

/** Rebuild roster when department packs change — preserves meetings and history. */
export function refreshExecutiveCouncilRoster(organizationId: string): OrganizationExecutiveCouncilProfile {
  return syncExecutiveCouncilFromSources(organizationId);
}

export { buildOrganizationExecutiveCouncilProfile };

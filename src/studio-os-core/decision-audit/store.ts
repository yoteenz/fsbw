import { readFirstEnsure } from '../sync/profile-cache';
import {
  DECISION_AUDIT_STORAGE_KEY,
  DECISION_AUDIT_VERSION,
  STUDIO_OS_DECISION_AUDIT_UPDATED,
} from './constants';
import { buildOrganizationDecisionAuditProfile } from './engine-profile-builder';
import { filterTimelineEntries } from './timeline-engine';
import type { DecisionTimelineFilter, OrganizationDecisionAuditProfile, DecisionAuditStore } from './types';

function emptyStore(): DecisionAuditStore {
  return { version: DECISION_AUDIT_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_DECISION_AUDIT_UPDATED));
  }
}

export function readDecisionAuditStore(): DecisionAuditStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(DECISION_AUDIT_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as DecisionAuditStore;
    return { ...emptyStore(), ...parsed, version: DECISION_AUDIT_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeDecisionAuditStore(store: DecisionAuditStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DECISION_AUDIT_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationDecisionAuditProfile(
  organizationId: string
): OrganizationDecisionAuditProfile | null {
  return readDecisionAuditStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationDecisionAuditProfile): OrganizationDecisionAuditProfile {
  const store = readDecisionAuditStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeDecisionAuditStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncDecisionAuditFromSources(organizationId: string): OrganizationDecisionAuditProfile {
  const existing = getOrganizationDecisionAuditProfile(organizationId);
  const built = buildOrganizationDecisionAuditProfile(organizationId);
  const profile = upsertProfile({
    ...built,
    activeFilter: existing?.activeFilter ?? built.activeFilter,
    selectedDecisionId: existing?.selectedDecisionId ?? built.selectedDecisionId,
  });
  return profile;
}

export function ensureOrganizationDecisionAuditProfile(organizationId: string): OrganizationDecisionAuditProfile {
  return readFirstEnsure(organizationId, getOrganizationDecisionAuditProfile, syncDecisionAuditFromSources);
}

export function refreshDecisionAudit(organizationId: string): OrganizationDecisionAuditProfile {
  return syncDecisionAuditFromSources(organizationId);
}

function withProfile(
  organizationId: string,
  update: (p: OrganizationDecisionAuditProfile) => OrganizationDecisionAuditProfile
): OrganizationDecisionAuditProfile {
  const profile = ensureOrganizationDecisionAuditProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function selectDecision(organizationId: string, decisionId: string): OrganizationDecisionAuditProfile {
  return withProfile(organizationId, (p) => ({ ...p, selectedDecisionId: decisionId }));
}

export function setTimelineFilter(
  organizationId: string,
  filter: Partial<DecisionTimelineFilter>
): OrganizationDecisionAuditProfile {
  return withProfile(organizationId, (p) => ({
    ...p,
    activeFilter: { ...p.activeFilter, ...filter },
  }));
}

export function getFilteredTimeline(profile: OrganizationDecisionAuditProfile) {
  return filterTimelineEntries(profile.timeline, profile.activeFilter, profile.decisions, profile.updatedAt);
}

export function getSelectedDecision(profile: OrganizationDecisionAuditProfile) {
  return profile.decisions.find((d) => d.id === profile.selectedDecisionId) ?? profile.decisions[0] ?? null;
}

export { filterTimelineEntries };

import { readFirstEnsure } from '../sync/profile-cache';
import { buildOrganizationKnowledgeCoreProfile } from './engine-profile-builder';
import { getOrganizationKnowledgeCoreProfile, upsertKnowledgeCoreProfile } from './store';

export function syncKnowledgeCoreFromSources(organizationId: string) {
  return upsertKnowledgeCoreProfile(buildOrganizationKnowledgeCoreProfile(organizationId));
}

export function ensureOrganizationKnowledgeCoreProfile(organizationId: string) {
  return readFirstEnsure(organizationId, getOrganizationKnowledgeCoreProfile, syncKnowledgeCoreFromSources);
}

export function bootstrapKnowledgeCore(organizationId: string): void {
  ensureOrganizationKnowledgeCoreProfile(organizationId);
}

import type { KnowledgeRetentionProfile } from '../types';
import { getRetentionProfile, listRetentionProfiles } from './catalog';
import { normalizeRetentionProfile, touchRetentionProfile } from './schemas';

export function upsertRetentionProfile(
  profiles: KnowledgeRetentionProfile[],
  profile: KnowledgeRetentionProfile
): KnowledgeRetentionProfile[] {
  const normalized = normalizeRetentionProfile(profile);
  const next = profiles.filter((item) => item.id !== normalized.id);
  return [...next, normalized];
}

export function removeRetentionProfile(
  profiles: KnowledgeRetentionProfile[],
  profileId: string
): KnowledgeRetentionProfile[] {
  return profiles.filter((profile) => profile.id !== profileId);
}

export function findRetentionProfile(
  profiles: KnowledgeRetentionProfile[],
  profileId: string
): KnowledgeRetentionProfile | undefined {
  return profiles.find((profile) => profile.id === profileId) ?? getRetentionProfile(profileId);
}

export function mergeWithLaunchCatalog(
  profiles: KnowledgeRetentionProfile[]
): KnowledgeRetentionProfile[] {
  const byId = new Map<string, KnowledgeRetentionProfile>();
  for (const seed of listRetentionProfiles()) byId.set(seed.id, seed);
  for (const profile of profiles) byId.set(profile.id, normalizeRetentionProfile(profile));
  return Array.from(byId.values());
}

export function patchRetentionProfile(
  profiles: KnowledgeRetentionProfile[],
  profileId: string,
  patch: Partial<KnowledgeRetentionProfile>
): KnowledgeRetentionProfile[] {
  const existing = findRetentionProfile(profiles, profileId);
  if (!existing) return profiles;
  return upsertRetentionProfile(profiles, touchRetentionProfile(existing, patch));
}

export { normalizeRetentionProfile, touchRetentionProfile, recordProfilePractice, recordProfileReviewCompletion } from './schemas';

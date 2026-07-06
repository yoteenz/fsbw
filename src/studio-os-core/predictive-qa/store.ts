import { readFirstEnsure } from '../sync/profile-cache';
import {
  PREDICTIVE_QA_STORAGE_KEY,
  PREDICTIVE_QA_VERSION,
  STUDIO_OS_PREDICTIVE_QA_UPDATED,
} from './constants';
import { buildOrganizationPredictiveQaProfile } from './engine-profile-builder';
import type { OrganizationPredictiveQaProfile, PredictiveQaStore, PredictiveQaPredictionStatus } from './types';

function emptyStore(): PredictiveQaStore {
  return { version: PREDICTIVE_QA_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PREDICTIVE_QA_UPDATED));
  }
}

export function readPredictiveQaStore(): PredictiveQaStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PREDICTIVE_QA_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PredictiveQaStore;
    return { ...emptyStore(), ...parsed, version: PREDICTIVE_QA_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writePredictiveQaStore(store: PredictiveQaStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PREDICTIVE_QA_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationPredictiveQaProfile(
  organizationId: string
): OrganizationPredictiveQaProfile | null {
  return readPredictiveQaStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationPredictiveQaProfile): OrganizationPredictiveQaProfile {
  const store = readPredictiveQaStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writePredictiveQaStore({ ...store, profiles: [...next, profile] });
  return profile;
}

function mergePredictionStatuses(
  built: OrganizationPredictiveQaProfile,
  existing: OrganizationPredictiveQaProfile | null
): OrganizationPredictiveQaProfile {
  if (!existing) return built;
  const statusMap = new Map(existing.predictions.map((p) => [p.id, p.status]));
  return {
    ...built,
    predictions: built.predictions.map((p) => ({
      ...p,
      status: statusMap.get(p.id) ?? p.status,
    })),
  };
}

export function syncPredictiveQaFromSources(organizationId: string): OrganizationPredictiveQaProfile {
  const existing = getOrganizationPredictiveQaProfile(organizationId);
  const built = mergePredictionStatuses(buildOrganizationPredictiveQaProfile(organizationId), existing);
  const profile = upsertProfile(built);
  return profile;
}

export function ensureOrganizationPredictiveQaProfile(organizationId: string): OrganizationPredictiveQaProfile {
  return readFirstEnsure(organizationId, getOrganizationPredictiveQaProfile, syncPredictiveQaFromSources);
}

export function refreshPredictiveQa(organizationId: string): OrganizationPredictiveQaProfile {
  return syncPredictiveQaFromSources(organizationId);
}

function withProfile(
  organizationId: string,
  update: (p: OrganizationPredictiveQaProfile) => OrganizationPredictiveQaProfile
): OrganizationPredictiveQaProfile {
  const profile = ensureOrganizationPredictiveQaProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function setPredictionStatus(
  organizationId: string,
  predictionId: string,
  status: PredictiveQaPredictionStatus
): OrganizationPredictiveQaProfile {
  return withProfile(organizationId, (p) => {
    const predictions = p.predictions.map((pred) =>
      pred.id === predictionId ? { ...pred, status } : pred
    );
    const active = predictions.filter((pred) => pred.status === 'active');
    return {
      ...p,
      predictions,
      activePredictions: active.length,
      highRiskPredictions: active.filter((pred) => pred.severity === 'high' || pred.severity === 'critical').length,
      preventableRisks: active.filter((pred) => pred.preventableNow).length,
    };
  });
}

export function dismissPrediction(organizationId: string, predictionId: string): OrganizationPredictiveQaProfile {
  return setPredictionStatus(organizationId, predictionId, 'dismissed');
}

export function mitigatePrediction(organizationId: string, predictionId: string): OrganizationPredictiveQaProfile {
  return setPredictionStatus(organizationId, predictionId, 'mitigating');
}

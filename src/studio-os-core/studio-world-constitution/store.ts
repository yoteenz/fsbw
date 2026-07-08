import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { ConstitutionMemoryStore, ConstitutionReviewRecord, ConstitutionReviewResult } from './types';
import { STUDIO_WORLD_CONSTITUTION_EVENT } from './types';

const STORAGE_KEY = 'studioOsStudioWorldConstitution_v1';

const EMPTY: ConstitutionMemoryStore = {
  version: 1,
  reviews: [],
  learningEvents: 0,
};

function dispatch(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STUDIO_WORLD_CONSTITUTION_EVENT));
}

export function readConstitutionStore(): ConstitutionMemoryStore {
  return readStudioOsJson(STORAGE_KEY, () => ({ ...EMPTY, reviews: [] }));
}

export function recordConstitutionReview(result: ConstitutionReviewResult): ConstitutionReviewRecord {
  const store = readConstitutionStore();
  const record: ConstitutionReviewRecord = {
    ...result,
    storedAt: new Date().toISOString(),
  };
  store.reviews = [record, ...store.reviews].slice(0, 48);
  store.learningEvents += 1;
  writeStudioOsJson(STORAGE_KEY, store);
  dispatch();
  return record;
}

export function listConstitutionReviews(limit = 12): ConstitutionReviewRecord[] {
  return readConstitutionStore().reviews.slice(0, limit);
}

export function getConstitutionLearningCount(): number {
  return readConstitutionStore().learningEvents;
}

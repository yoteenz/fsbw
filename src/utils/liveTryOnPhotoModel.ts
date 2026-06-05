import type { LiveTryOnPhotoModel } from '../constants/liveTryOnSpikeAssets';

const STORAGE_KEY = 'liveTryOnPhotoModel';

export function parseLiveTryOnPhotoModelParam(value: string | null | undefined): LiveTryOnPhotoModel | null {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'nbp' || v === 'nano-banana') return 'nbp';
  if (v === 'gpt2' || v === 'gpt' || v === 'gpt-image-2') return 'gpt2';
  return null;
}

export function readLiveTryOnPhotoModelPreference(): LiveTryOnPhotoModel {
  try {
    const fromStorage = parseLiveTryOnPhotoModelParam(localStorage.getItem(STORAGE_KEY));
    if (fromStorage) return fromStorage;
  } catch {
    /* ignore */
  }
  return 'nbp';
}

export function writeLiveTryOnPhotoModelPreference(model: LiveTryOnPhotoModel): void {
  try {
    localStorage.setItem(STORAGE_KEY, model);
  } catch {
    /* ignore */
  }
}

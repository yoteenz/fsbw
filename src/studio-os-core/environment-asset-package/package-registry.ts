import type { EnvironmentAssetPackage } from './types';
import { buildEnvironmentAssetPackage } from './package-workflow';

/** In-memory registry — production persistence layer hooks here later. */
const PACKAGE_STORE = new Map<string, EnvironmentAssetPackage>();

export const EXPERIENCE_LAB_RECEPTION_PACKAGE_ID = 'envpkg.experience-lab.reception.r1';

export function registerEnvironmentPackage(pkg: EnvironmentAssetPackage): void {
  PACKAGE_STORE.set(pkg.packageId, pkg);
}

export function getEnvironmentPackage(packageId: string): EnvironmentAssetPackage | null {
  return PACKAGE_STORE.get(packageId) ?? null;
}

export function listEnvironmentPackages(): EnvironmentAssetPackage[] {
  return [...PACKAGE_STORE.values()];
}

export function seedExperienceLabReceptionPackage(previewUrls: {
  lightPreviewUrl: string;
  darkPreviewUrl: string;
}): EnvironmentAssetPackage {
  const pkg = buildEnvironmentAssetPackage({
    packageId: EXPERIENCE_LAB_RECEPTION_PACKAGE_ID,
    environmentId: 'reception',
    departmentId: 'experience-lab',
    displayName: 'Reception Environment Package',
    revision: 1,
    prompt: 'Experience Lab reception — luxury architectural visualization, department bible aligned',
    promptVersion: 'reception-env-v1',
    provider: 'preview-cache',
    model: 'stage-1-preview',
    seed: 'reception-r1',
    status: 'review',
    stage: 'concept-preview',
    promotedVariantId: null,
    previewUrls: {
      'light-01': previewUrls.lightPreviewUrl,
      'light-02': previewUrls.lightPreviewUrl,
      'light-03': previewUrls.lightPreviewUrl,
      'dark-01': previewUrls.darkPreviewUrl,
      'dark-02': previewUrls.darkPreviewUrl,
      'dark-03': previewUrls.darkPreviewUrl,
    },
  });
  registerEnvironmentPackage(pkg);
  return pkg;
}

/** Ensure default seed package exists (idempotent). */
let seeded = false;

export function ensureDefaultEnvironmentPackages(previewUrls: {
  lightPreviewUrl: string;
  darkPreviewUrl: string;
}): EnvironmentAssetPackage {
  const existing = getEnvironmentPackage(EXPERIENCE_LAB_RECEPTION_PACKAGE_ID);
  if (existing) return existing;
  if (!seeded) {
    seeded = true;
    return seedExperienceLabReceptionPackage(previewUrls);
  }
  return seedExperienceLabReceptionPackage(previewUrls);
}

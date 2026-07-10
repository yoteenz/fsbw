import { updateBuildOrderSystemStatus } from '../../build-order/build-order/registry';
import { ensureStudioOsDesignDnaSubsystem } from '../../studio-os-design-dna/engine';
import { XEE_SUBSYSTEM_VERSION } from '../constants';
import { mutateExperienceEngineDnaStore, readExperienceEngineDnaStore } from '../persistence';
import type { XeePlaygroundSelection, XeeStore } from '../types';
import {
  SEED_BRAND_DNA,
  SEED_COMPONENT_DNA,
  SEED_DEPARTMENT_DNA,
  SEED_INTERACTION_DNA,
  SEED_MOTION_DNA,
  SEED_SCENE_DNA,
} from './seed-data';

function now(): string {
  return new Date().toISOString();
}

export function seedExperienceEngineDnaStore(): void {
  mutateExperienceEngineDnaStore((s: XeeStore) => ({
    ...s,
    brands: SEED_BRAND_DNA,
    departments: SEED_DEPARTMENT_DNA,
    scenes: SEED_SCENE_DNA,
    components: SEED_COMPONENT_DNA,
    motions: SEED_MOTION_DNA,
    interactions: SEED_INTERACTION_DNA,
    constitutionLocked: true,
    seededAt: s.seededAt ?? now(),
    bootstrappedAt: now(),
    version: XEE_SUBSYSTEM_VERSION,
  }));
}

export function ensureExperienceEngineDnaStore() {
  ensureStudioOsDesignDnaSubsystem();
  let store = readExperienceEngineDnaStore();
  const needsPersist =
    !store.seededAt ||
    store.brands.length === 0 ||
    store.departments.length === 0 ||
    store.scenes.length < 5;
  if (needsPersist) {
    seedExperienceEngineDnaStore();
    updateBuildOrderSystemStatus('experience-engine', 'implemented');
    store = readExperienceEngineDnaStore();
  }
  return store;
}

export function recordExperienceEngineOpened(): void {
  const current = readExperienceEngineDnaStore();
  if (current.lastOpenedAt && Date.now() - Date.parse(current.lastOpenedAt) < 60_000) return;
  const openedAt = now();
  mutateExperienceEngineDnaStore((s) => ({ ...s, lastOpenedAt: openedAt }));
}

export function updatePlaygroundSelection(partial: Partial<XeePlaygroundSelection>): XeePlaygroundSelection {
  let next: XeePlaygroundSelection = readExperienceEngineDnaStore().playground;
  mutateExperienceEngineDnaStore((s) => {
    next = { ...s.playground, ...partial };
    return { ...s, playground: next };
  });
  return next;
}

export function listBrandDna() {
  return readExperienceEngineDnaStore().brands;
}

export function getBrandDna(brandId: string) {
  return readExperienceEngineDnaStore().brands.find((b) => b.brandId === brandId);
}

export function listDepartmentDnaForBrand(brandId: string) {
  return readExperienceEngineDnaStore().departments.filter((d) => d.brandId === brandId);
}

export function getDepartmentDna(brandId: string, departmentId: string) {
  return readExperienceEngineDnaStore().departments.find(
    (d) => d.brandId === brandId && d.departmentId === departmentId
  );
}

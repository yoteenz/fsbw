import { updateBuildOrderSystemStatus } from '../../build-order/build-order/registry';
import { ensureArchitectsPromptLibrarySubsystem } from '../../architects-prompt-library/engine';
import { DDNA_SUBSYSTEM_VERSION } from '../constants';
import { mutateStudioOsDesignDnaStore, readStudioOsDesignDnaStore } from '../persistence';
import type { DdnaStore } from '../types';
import {
  SEED_ANIMATION_HOOKS,
  SEED_COMPONENTS,
  SEED_DEPARTMENT_THEMES,
  SEED_DESIGN_TOKENS,
  SEED_GLASS_MATERIALS,
  SEED_ICON_TREATMENTS,
  SEED_LIGHTING_PRESETS,
  SEED_MOTION_PRESETS,
  SEED_NAVIGATION_RULES,
  SEED_SCENE_TEMPLATE,
  SEED_TYPOGRAPHY_SCALE,
} from './seed-data';

function now(): string {
  return new Date().toISOString();
}

export function seedStudioOsDesignDnaStore(): void {
  mutateStudioOsDesignDnaStore((s: DdnaStore) => ({
    ...s,
    tokens: SEED_DESIGN_TOKENS,
    departmentThemes: SEED_DEPARTMENT_THEMES,
    sceneTemplate: SEED_SCENE_TEMPLATE,
    glassMaterials: SEED_GLASS_MATERIALS,
    lightingPresets: SEED_LIGHTING_PRESETS,
    motionPresets: SEED_MOTION_PRESETS,
    animationHooks: SEED_ANIMATION_HOOKS,
    typographyScale: SEED_TYPOGRAPHY_SCALE,
    components: SEED_COMPONENTS,
    navigationRules: SEED_NAVIGATION_RULES,
    iconTreatments: SEED_ICON_TREATMENTS,
    recommendations: [],
    activeDepartmentId: 'headquarters',
    constitutionLocked: true,
    seededAt: s.seededAt ?? now(),
    bootstrappedAt: now(),
    version: DDNA_SUBSYSTEM_VERSION,
  }));
}

export function ensureStudioOsDesignDnaStore() {
  ensureArchitectsPromptLibrarySubsystem();
  const store = readStudioOsDesignDnaStore();
  if (!store.seededAt) {
    seedStudioOsDesignDnaStore();
    updateBuildOrderSystemStatus('studio-os-design-dna', 'implemented');
  }
  return readStudioOsDesignDnaStore();
}

export function recordStudioOsDesignDnaOpened(): void {
  mutateStudioOsDesignDnaStore((s) => ({
    ...s,
    lastOpenedAt: now(),
  }));
}

export function setActiveDepartmentTheme(departmentId: string): boolean {
  const store = readStudioOsDesignDnaStore();
  const exists = store.departmentThemes.some((d) => d.departmentId === departmentId);
  if (!exists) return false;
  mutateStudioOsDesignDnaStore((s) => ({ ...s, activeDepartmentId: departmentId }));
  return true;
}

export function listDesignTokens() {
  return readStudioOsDesignDnaStore().tokens;
}

export function listDepartmentThemes() {
  return readStudioOsDesignDnaStore().departmentThemes;
}

export function getDepartmentTheme(departmentId: string) {
  return readStudioOsDesignDnaStore().departmentThemes.find((d) => d.departmentId === departmentId);
}

export function getSceneTemplate() {
  return readStudioOsDesignDnaStore().sceneTemplate;
}

export function listComponentSpecs() {
  return readStudioOsDesignDnaStore().components;
}

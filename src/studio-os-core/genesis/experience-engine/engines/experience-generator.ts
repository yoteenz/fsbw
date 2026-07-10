import type { XeeBrandDna, XeeDepartmentDna, XeeExperienceProfile } from '../types';
import {
  getComponentRegistry,
  resolveBrandDna,
  resolveDepartmentDna,
  resolveInteractionDna,
  resolveMotionDna,
  resolveSceneDna,
} from './registries';
import { emptyExperienceEngineDnaStore, readExperienceEngineDnaStore } from '../persistence';
import {
  SEED_BRAND_DNA,
  SEED_DEPARTMENT_DNA,
  SEED_INTERACTION_DNA,
  SEED_MOTION_DNA,
  SEED_SCENE_DNA,
} from '../bootstrap/seed-data';
import { XEE_SHARED_SCENE_ID } from '../constants';

export function buildExperienceCssOutput(
  brand: XeeBrandDna,
  department: XeeDepartmentDna
): { cssVariables: Record<string, string>; cssText: string } {
  const cssVariables: Record<string, string> = {
    '--xee-brand-primary': brand.colorSystem.primary,
    '--xee-brand-secondary': brand.colorSystem.secondary,
    '--xee-brand-accent': brand.colorSystem.accent,
    '--xee-brand-background': brand.colorSystem.background,
    '--xee-brand-text-primary': brand.colorSystem.textPrimary,
    '--xee-brand-text-secondary': brand.colorSystem.textSecondary,
    '--xee-dept-primary': department.departmentColor,
    '--xee-glass-panel': brand.glassStyle.panelBackground,
    '--xee-glass-strong': brand.glassStyle.panelStrong,
    '--xee-glass-blur': brand.glassStyle.backdropBlur,
    '--xee-glass-border': brand.glassStyle.border,
    '--xee-ambient-gradient': brand.lighting.ambientGradient,
    '--xee-horizon-glow': brand.lighting.horizonGlow,
    '--xee-dept-wash': `radial-gradient(ellipse at top, ${department.departmentColor}18, transparent 70%)`,
    '--xee-type-display': brand.typography.displayFont,
    '--xee-type-label': brand.typography.labelFont,
    '--xee-type-body': brand.typography.bodyFont,
    '--xee-type-display-size': brand.typography.displaySize,
    '--xee-type-label-size': brand.typography.labelSize,
    '--xee-type-body-size': brand.typography.bodySize,
    '--xee-motion-timing': `${brand.motion.timingMs}ms`,
    '--xee-motion-easing': brand.motion.easing,
    '--xee-orb-glow': brand.orbOverrides.glowColor,
    '--xee-nav-active': brand.navigationStyle.activeIndicator,
    '--xee-hero-gradient': brand.lighting.ambientGradient,
  };

  const lines = Object.entries(cssVariables).map(([k, v]) => `  ${k}: ${v};`);
  const cssText = `:root,\n[data-xee-scene] {\n${lines.join('\n')}\n}`;

  return { cssVariables, cssText };
}

export function resolveExperienceProfile(input?: {
  brandId?: string;
  departmentId?: string;
  sceneId?: string;
  motionDnaId?: string;
}): XeeExperienceProfile {
  const store = readExperienceEngineDnaStore();
  const playground = { ...emptyExperienceEngineDnaStore().playground, ...store.playground };
  const brandId = input?.brandId ?? playground.brandId;
  const departmentId = input?.departmentId ?? playground.departmentId;
  const sceneId = input?.sceneId ?? playground.sceneId ?? XEE_SHARED_SCENE_ID;
  const motionDnaId = input?.motionDnaId ?? playground.motionDnaId;

  const brand =
    resolveBrandDna(brandId) ??
    store.brands.find((b) => b.brandId === brandId) ??
    store.brands[0] ??
    SEED_BRAND_DNA.find((b) => b.brandId === brandId) ??
    SEED_BRAND_DNA[0];
  const department =
    resolveDepartmentDna(brand.brandId, departmentId) ??
    store.departments.find((d) => d.brandId === brand.brandId && d.departmentId === departmentId) ??
    store.departments.find((d) => d.brandId === brand.brandId) ??
    SEED_DEPARTMENT_DNA.find((d) => d.brandId === brand.brandId && d.departmentId === departmentId) ??
    SEED_DEPARTMENT_DNA.find((d) => d.brandId === brand.brandId)!;
  const scene =
    resolveSceneDna(sceneId) ??
    store.scenes.find((s) => s.sceneId === sceneId) ??
    store.scenes[0] ??
    SEED_SCENE_DNA.find((s) => s.sceneId === sceneId) ??
    SEED_SCENE_DNA[0];
  const components = getComponentRegistry(brand.brandId);
  const motion =
    resolveMotionDna(motionDnaId) ??
    store.motions.find((m) => m.brandId === brand.brandId) ??
    SEED_MOTION_DNA.find((m) => m.motionDnaId === motionDnaId) ??
    SEED_MOTION_DNA.find((m) => m.brandId === brand.brandId)!;
  const interaction =
    resolveInteractionDna(brand.brandId) ??
    store.interactions.find((i) => i.brandId === brand.brandId) ??
    SEED_INTERACTION_DNA.find((i) => i.brandId === brand.brandId)!;
  const { cssVariables, cssText } = buildExperienceCssOutput(brand, department);

  return {
    brandId: brand.brandId,
    departmentId: department.departmentId,
    sceneId: scene.sceneId,
    brand,
    department,
    scene,
    components,
    motion,
    interaction,
    cssVariables,
    cssText,
  };
}

export function applyExperienceProfileToElement(
  element: HTMLElement,
  input?: Parameters<typeof resolveExperienceProfile>[0]
): XeeExperienceProfile {
  const profile = resolveExperienceProfile(input);
  for (const [key, value] of Object.entries(profile.cssVariables)) {
    element.style.setProperty(key, value);
  }
  element.setAttribute('data-xee-scene', profile.scene.sceneId);
  element.setAttribute('data-xee-brand', profile.brandId);
  element.setAttribute('data-xee-department', profile.departmentId);
  return profile;
}

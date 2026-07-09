import { readStudioOsDesignDnaStore } from '../persistence';
import type { DdnaGlassMaterial, DdnaLightingPreset, DdnaMotionPreset, DdnaAnimationHook } from '../types';

export function getGlassMaterialEngine(): DdnaGlassMaterial[] {
  return readStudioOsDesignDnaStore().glassMaterials;
}

export function resolveGlassMaterialForDepartment(materialId = 'glass-executive-panel'): DdnaGlassMaterial | undefined {
  return readStudioOsDesignDnaStore().glassMaterials.find((g) => g.materialId === materialId);
}

export function getLightingEngine(): DdnaLightingPreset[] {
  return readStudioOsDesignDnaStore().lightingPresets;
}

export function resolveLightingForDepartment(departmentId: string): DdnaLightingPreset {
  const store = readStudioOsDesignDnaStore();
  const theme = store.departmentThemes.find((d) => d.departmentId === departmentId);
  if (theme?.officialName === 'Knowledge' || theme?.officialName === 'Institute of Knowledge') {
    return store.lightingPresets.find((l) => l.presetId === 'light-library-skylight') ?? store.lightingPresets[0];
  }
  if (theme?.officialName === 'Mission Control' || theme?.officialName === 'Command Center') {
    return store.lightingPresets.find((l) => l.presetId === 'light-command-horizon') ?? store.lightingPresets[0];
  }
  return store.lightingPresets.find((l) => l.presetId === 'light-department-wash') ?? store.lightingPresets[0];
}

export function getMotionEngine(): DdnaMotionPreset[] {
  return readStudioOsDesignDnaStore().motionPresets;
}

export function getAnimationEngine(): DdnaAnimationHook[] {
  return readStudioOsDesignDnaStore().animationHooks;
}

export function resolveMotionForDepartment(departmentId: string): DdnaMotionPreset {
  const store = readStudioOsDesignDnaStore();
  const theme = store.departmentThemes.find((d) => d.departmentId === departmentId);
  const mood = theme?.motionStyle ?? 'calm';
  if (mood.includes('expressive') || mood.includes('fluid')) {
    return store.motionPresets.find((m) => m.presetId === 'motion-expressive') ?? store.motionPresets[0];
  }
  if (mood.includes('ceremonial') || mood.includes('measured')) {
    return store.motionPresets.find((m) => m.presetId === 'motion-ceremonial') ?? store.motionPresets[0];
  }
  if (mood.includes('purposeful') || mood.includes('directional')) {
    return store.motionPresets.find((m) => m.presetId === 'motion-purposeful') ?? store.motionPresets[0];
  }
  return store.motionPresets.find((m) => m.presetId === 'motion-executive-calm') ?? store.motionPresets[0];
}

export function getTypographyEngine() {
  return readStudioOsDesignDnaStore().typographyScale;
}

export function getComponentLibraryEngine() {
  return readStudioOsDesignDnaStore().components;
}

export function getCognitiveNavigationRules() {
  return readStudioOsDesignDnaStore().navigationRules;
}

export function getIconSystemEngine() {
  return readStudioOsDesignDnaStore().iconTreatments;
}

export function getSceneTemplateEngine() {
  return readStudioOsDesignDnaStore().sceneTemplate;
}

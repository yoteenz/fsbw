import { readStudioOsDesignDnaStore } from '../persistence';
import type {
  DdnaDepartmentTheme,
  DdnaDesignToken,
  DdnaPlatformStats,
  DdnaRecommendation,
  DdnaSceneProfile,
  DdnaNavigationContext,
} from '../types';
import { buildDesignDnaCssOutput } from './css-output-engine';

export function getDesignTokenRegistry(): DdnaDesignToken[] {
  return readStudioOsDesignDnaStore().tokens;
}

export function getDesignTokensByCategory(category: string): DdnaDesignToken[] {
  return getDesignTokenRegistry().filter((t) => t.category === category);
}

export function getDepartmentThemeRegistry(): DdnaDepartmentTheme[] {
  return readStudioOsDesignDnaStore().departmentThemes;
}

export function resolveDepartmentTheme(departmentId: string): DdnaDepartmentTheme | undefined {
  const store = readStudioOsDesignDnaStore();
  return (
    store.departmentThemes.find((d) => d.departmentId === departmentId) ??
    store.departmentThemes.find((d) => d.departmentId === 'headquarters')
  );
}

export function getStudioOsDesignDnaPlatformStats(): DdnaPlatformStats {
  const store = readStudioOsDesignDnaStore();
  const layerCount = store.sceneTemplate.layers.length;
  const deptCoverage = store.departmentThemes.length >= 26 ? 100 : Math.round((store.departmentThemes.length / 26) * 100);
  const tokenCoverage = store.tokens.length >= 40 ? 100 : Math.round((store.tokens.length / 55) * 100);
  const componentCoverage = store.components.length >= 10 ? 100 : Math.round((store.components.length / 12) * 100);
  const complianceScore = Math.round((deptCoverage + tokenCoverage + componentCoverage + (layerCount >= 10 ? 100 : 80)) / 4);

  return {
    tokenCount: store.tokens.length,
    departmentCount: store.departmentThemes.length,
    componentCount: store.components.length,
    glassMaterialCount: store.glassMaterials.length,
    lightingPresetCount: store.lightingPresets.length,
    motionPresetCount: store.motionPresets.length,
    typographyRoleCount: store.typographyScale.length,
    sceneLayerCount: layerCount,
    complianceScore,
  };
}

export function buildDdnaOrbRecommendations(): DdnaRecommendation[] {
  const store = readStudioOsDesignDnaStore();
  const stats = getStudioOsDesignDnaPlatformStats();
  const recs: DdnaRecommendation[] = [];

  if (stats.complianceScore >= 95) {
    recs.push({
      recommendationId: 'ddna-constitution-ready',
      title: 'Design DNA constitution is fully seeded',
      reason: `${stats.departmentCount} departments · ${stats.tokenCount} tokens · ${stats.componentCount} components inherit automatically.`,
      confidence: 98,
      targetRoom: 'design-dna',
      orbNote: 'Every new Headquarters scene should call resolveDesignDnaSceneProfile() — never manual styles.',
    });
  }

  const active = resolveDepartmentTheme(store.activeDepartmentId);
  if (active) {
    recs.push({
      recommendationId: 'ddna-preview-dept',
      title: `Preview ${active.officialName} atmosphere`,
      reason: `Primary ${active.primaryColor} · ${active.sceneMood} · ${active.motionStyle}.`,
      confidence: 92,
      targetRoom: 'department-themes',
      orbNote: `Department themes generate CSS variables — scenes inherit ${active.glassTint}.`,
    });
  }

  recs.push({
    recommendationId: 'ddna-scene-template',
    title: 'Apply Master Scene Template™ to new rooms',
    reason: 'All 10 constitutional layers are registered — Hero through Animation Hooks.',
    confidence: 96,
    targetRoom: 'scene-templates',
    orbNote: 'Scene Template Engine™ prevents per-room redesign.',
  });

  return recs.slice(0, 5);
}

export function buildDdnaOrbArchitectNote(): string {
  const stats = getStudioOsDesignDnaPlatformStats();
  return `Design DNA™ is the visual operating system — ${stats.tokenCount} tokens · ${stats.departmentCount} department themes · ${stats.complianceScore}% constitutional compliance. Future rooms inherit; they do not redefine.`;
}

export function resolveCognitiveNavigationContext(departmentId: string): DdnaNavigationContext {
  const theme = resolveDepartmentTheme(departmentId);
  if (!theme) {
    return {
      departmentColor: '#EB1C24',
      divisionShade: '#1A1A1A',
      roomAccent: '#C9A962',
      interactiveState: '#EB1C24',
      breadcrumbTone: '#808080',
      activeNavGlow: '0 0 12px rgba(235,28,36,0.35)',
    };
  }

  return {
    departmentColor: theme.primaryColor,
    divisionShade: theme.divisionShade ?? theme.secondaryColor,
    roomAccent: theme.roomAccent ?? theme.accentColor,
    interactiveState: theme.primaryColor,
    breadcrumbTone: theme.secondaryColor,
    activeNavGlow: `0 0 12px ${theme.primaryColor}55`,
  };
}

export function resolveDesignDnaSceneProfile(departmentId?: string): DdnaSceneProfile {
  const store = readStudioOsDesignDnaStore();
  const deptId = departmentId ?? store.activeDepartmentId;
  const departmentTheme = resolveDepartmentTheme(deptId)!;
  const nav = resolveCognitiveNavigationContext(deptId);
  const { cssVariables, cssText } = buildDesignDnaCssOutput(departmentTheme, store.tokens);

  const glassMaterial =
    store.glassMaterials.find((g) => g.materialId === 'glass-executive-panel') ?? store.glassMaterials[0];
  const lightingPreset =
    store.lightingPresets.find((l) => l.presetId === 'light-department-wash') ?? store.lightingPresets[0];
  const motionPreset =
    store.motionPresets.find((m) => m.departmentDerived) ?? store.motionPresets[0];

  return {
    departmentId: deptId,
    departmentTheme,
    cssVariables,
    cssText,
    sceneTemplate: store.sceneTemplate,
    glassMaterial,
    lightingPreset,
    motionPreset,
    typographyScale: store.typographyScale,
    navigationContext: nav,
  };
}

/** Apply Design DNA to a DOM host — injects CSS variables for automatic scene inheritance. */
export function applyDesignDnaToElement(element: HTMLElement, departmentId?: string): DdnaSceneProfile {
  const profile = resolveDesignDnaSceneProfile(departmentId);
  for (const [key, value] of Object.entries(profile.cssVariables)) {
    element.style.setProperty(key, value);
  }
  element.setAttribute('data-ddna-department', profile.departmentId);
  element.setAttribute('data-ddna-scene', profile.sceneTemplate.templateId);
  return profile;
}

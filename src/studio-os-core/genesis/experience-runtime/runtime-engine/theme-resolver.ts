import type { XerResolvedDnaLayers } from './dna-resolver';
import type { XerRuntimeOverride } from '../types';

export type XerThemeBundle = {
  cssVariables: Record<string, string>;
  cssText: string;
  resolvedTokens: Record<string, string>;
  activeOverrides: XerRuntimeOverride[];
  brandLabel: string;
  departmentWash: string;
  orbGlow: string;
  typography: {
    display: string;
    label: string;
    body: string;
  };
};

export function resolveThemeBundle(layers: XerResolvedDnaLayers, overrides: XerRuntimeOverride[]): XerThemeBundle {
  const { brand, department, profile } = layers;
  const cssVariables: Record<string, string> = {
    ...profile.cssVariables,
    '--xer-brand-primary': brand.colorSystem.primary,
    '--xer-brand-secondary': brand.colorSystem.secondary,
    '--xer-brand-accent': brand.colorSystem.accent,
    '--xer-brand-background': brand.colorSystem.background,
    '--xer-brand-text-primary': brand.colorSystem.textPrimary,
    '--xer-brand-text-secondary': brand.colorSystem.textSecondary,
    '--xer-dept-primary': department.departmentColor,
    '--xer-glass-panel': brand.glassStyle.panelBackground,
    '--xer-glass-strong': brand.glassStyle.panelStrong,
    '--xer-glass-blur': brand.glassStyle.backdropBlur,
    '--xer-glass-border': brand.glassStyle.border,
    '--xer-ambient-gradient': brand.lighting.ambientGradient,
    '--xer-horizon-glow': brand.lighting.horizonGlow,
    '--xer-dept-wash': `radial-gradient(ellipse at top, ${department.departmentColor}18, transparent 70%)`,
    '--xer-type-display': brand.typography.displayFont,
    '--xer-type-label': brand.typography.labelFont,
    '--xer-type-body': brand.typography.bodyFont,
    '--xer-motion-timing': `${brand.motion.timingMs}ms`,
    '--xer-motion-easing': brand.motion.easing,
    '--xer-orb-glow': brand.orbOverrides.glowColor,
  };

  const resolvedTokens = { ...cssVariables };
  const lines = Object.entries(cssVariables).map(([k, v]) => `  ${k}: ${v};`);
  const cssText = `:root,\n[data-xer-runtime] {\n${lines.join('\n')}\n}`;

  return {
    cssVariables,
    cssText,
    resolvedTokens,
    activeOverrides: overrides,
    brandLabel: brand.officialName,
    departmentWash: cssVariables['--xer-dept-wash'],
    orbGlow: brand.orbOverrides.glowColor,
    typography: {
      display: brand.typography.displayFont,
      label: brand.typography.labelFont,
      body: brand.typography.bodyFont,
    },
  };
}

export function applyThemeToElement(element: HTMLElement, theme: XerThemeBundle, meta: {
  brandId: string;
  departmentId: string;
  sceneId: string;
}): void {
  for (const [key, value] of Object.entries(theme.cssVariables)) {
    element.style.setProperty(key, value);
  }
  element.setAttribute('data-xer-runtime', 'true');
  element.setAttribute('data-xer-brand', meta.brandId);
  element.setAttribute('data-xer-department', meta.departmentId);
  element.setAttribute('data-xer-scene', meta.sceneId);
}

import type { DdnaDepartmentTheme, DdnaDesignToken } from '../types';

export function buildDesignDnaCssOutput(
  theme: DdnaDepartmentTheme,
  tokens: DdnaDesignToken[]
): { cssVariables: Record<string, string>; cssText: string } {
  const cssVariables: Record<string, string> = {
    '--studio-ddna-dept-primary': theme.primaryColor,
    '--studio-ddna-dept-secondary': theme.secondaryColor,
    '--studio-ddna-dept-accent': theme.accentColor,
    '--studio-ddna-dept-division-shade': theme.divisionShade ?? theme.secondaryColor,
    '--studio-ddna-dept-room-accent': theme.roomAccent ?? theme.accentColor,
    '--studio-ddna-ambient-lighting': theme.ambientLighting,
    '--studio-ddna-glass-tint': theme.glassTint,
    '--studio-ddna-motion-style': theme.motionStyle,
    '--studio-ddna-scene-mood': theme.sceneMood,
    '--studio-ddna-nav-active-glow': `0 0 12px ${theme.primaryColor}55`,
    '--studio-ddna-hero-gradient': `linear-gradient(165deg, #f8f6f3 0%, ${theme.primaryColor}08 40%, #faf8f5 100%)`,
    '--studio-ddna-dept-wash': `radial-gradient(ellipse at top, ${theme.primaryColor}18, transparent 70%)`,
    '--studio-ddna-glass-panel': `rgba(255,255,255,0.55)`,
    '--studio-ddna-border-active': `2px solid ${theme.primaryColor}`,
  };

  for (const t of tokens) {
    if (t.value.includes('department-derived') || t.value.includes('department primary')) continue;
    if (!t.value.startsWith('var(')) {
      cssVariables[t.cssVariable] = t.value;
    }
  }

  const lines = Object.entries(cssVariables).map(([k, v]) => `  ${k}: ${v};`);
  const cssText = `:root,\n[data-ddna-scene] {\n${lines.join('\n')}\n}`;

  return { cssVariables, cssText };
}

export function mergeDesignTokenEngineCatalog(
  ddnaTokens: DdnaDesignToken[],
  externalTokens: { tokenId: string; cssVariable: string; value: string }[]
): DdnaDesignToken[] {
  const seen = new Set(ddnaTokens.map((t) => t.tokenId));
  const merged = [...ddnaTokens];
  for (const ext of externalTokens) {
    if (seen.has(ext.tokenId)) continue;
    merged.push({
      tokenId: ext.tokenId,
      name: ext.tokenId,
      category: 'color',
      value: ext.value,
      cssVariable: ext.cssVariable,
      description: 'Bridged from Design Token Engine™',
      immutable: true,
      source: 'design-token-engine',
    });
  }
  return merged;
}

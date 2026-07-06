import { ADMIN_STUDIO_THEME } from '../../utils/adminStudioTheme';
import { EIA } from '../../components/admin/studio/executive-ia/executiveIaTheme';
import { STUDIO_OS_THEMES } from './constants';
import { buildDesignTokenCatalog } from './token-catalog';
import type { StudioOsThemeId, ThemeTokenSet } from './types';

/** Theme sets — light active, dark/future prepared. */
export function buildThemeTokenSets(): ThemeTokenSet[] {
  const catalog = buildDesignTokenCatalog();

  return STUDIO_OS_THEMES.map((themeId) => {
    const themeTokens = catalog.filter((t) => t.themes.includes(themeId));
    const accent =
      themeId === 'light'
        ? ADMIN_STUDIO_THEME.accent
        : themeId === 'dark'
          ? '#F87171'
          : '#9333EA';
    const backgroundGlass = themeId === 'light' ? EIA.glass : themeId === 'dark' ? 'rgba(0,0,0,0.72)' : EIA.glass;

    return {
      themeId,
      label: themeId === 'light' ? 'Studio Light (Active)' : themeId === 'dark' ? 'Studio Dark (Planned)' : 'Future Theme (Reserved)',
      active: themeId === 'light',
      tokenCount: themeTokens.length,
      accentColor: accent,
      backgroundGlass,
    };
  });
}

export function getActiveTheme(): StudioOsThemeId {
  return 'light';
}

export function getThemeTokenCount(themeId: StudioOsThemeId): number {
  return buildDesignTokenCatalog().filter((t) => t.themes.includes(themeId)).length;
}

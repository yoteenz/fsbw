import { ADMIN_STUDIO_THEME } from '../../utils/adminStudioTheme';
import { EIA } from '../../components/admin/studio/executive-ia/executiveIaTheme';
import { DESIGN_TOKEN_ENGINE_ACCENT, RESPONSIVE_BREAKPOINTS } from './constants';
import type { DesignTokenEntry, StudioOsThemeId, TokenCategory } from './types';

const LIGHT: StudioOsThemeId[] = ['light'];
const ALL_THEMES: StudioOsThemeId[] = ['light', 'dark', 'future'];

function token(
  partial: Pick<DesignTokenEntry, 'tokenId' | 'name' | 'category' | 'value' | 'description' | 'source'> &
    Partial<DesignTokenEntry>
): DesignTokenEntry {
  return {
    cssVariable: partial.cssVariable ?? `--studio-${partial.tokenId.replace(/\./g, '-')}`,
    themes: partial.themes ?? LIGHT,
    consumedBy: partial.consumedBy ?? ['Executive IA', 'Admin Studio'],
    immutable: partial.immutable ?? true,
    ...partial,
  };
}

/** Canonical Design Token Engine™ catalog — visual source of truth. */
export function buildDesignTokenCatalog(): DesignTokenEntry[] {
  const tokens: DesignTokenEntry[] = [
    // Spacing
    token({ tokenId: 'spacing.section-gap', name: 'Section Gap', category: 'spacing', value: `${EIA.sectionGap}px`, description: 'Default vertical rhythm between workspace sections.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'spacing.section-gap-large', name: 'Section Gap Large', category: 'spacing', value: `${EIA.sectionGapLarge}px`, description: 'Large section separation for hero layouts.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'spacing.card-padding', name: 'Card Padding', category: 'padding', value: `${EIA.cardPadding}px`, description: 'Standard card interior padding.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'spacing.card-padding-large', name: 'Card Padding Large', category: 'padding', value: `${EIA.cardPaddingLarge}px`, description: 'Expanded card padding for hero cards.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'margin.page-root-gap', name: 'Page Root Gap', category: 'margin', value: `${EIA.sectionGap}px`, description: 'Flex gap on ExecutivePageShell root.', source: 'executiveIaTheme.ts' }),

    // Typography
    token({ tokenId: 'typography.section-title', name: 'Section Title', category: 'typography', value: 'Futura PT Medium 10px', description: 'Uppercase section headings.', source: 'executiveIaTheme.ts', consumedBy: ['ExecutiveFocusPanel', 'ExecutiveSecondaryCard'] }),
    token({ tokenId: 'typography.caption', name: 'Caption', category: 'typography', value: 'Futura PT Book 9px', description: 'Secondary descriptive copy.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'typography.grace', name: 'Grace Display', category: 'typography', value: 'Covered By Your Grace', description: 'Display serif for hero titles.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'typography.action-button', name: 'Action Button', category: 'typography', value: 'Futura PT Medium 8px uppercase', description: 'CTA button label style.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'typography.registry-tab', name: 'Registry Tab', category: 'typography', value: 'Futura PT 6–7px uppercase', description: 'Registry workspace tab labels.', source: 'registry-workspaces' }),

    // Brand & accent colors
    token({ tokenId: 'color.brand-accent', name: 'Studio Accent Red', category: 'brand-color', value: ADMIN_STUDIO_THEME.accent, description: 'Primary Studio OS brand accent.', source: 'adminStudioTheme.ts', immutable: true }),
    token({ tokenId: 'color.eia-red', name: 'Executive IA Red', category: 'accent-color', value: EIA.red, description: 'Executive IA accent — matches brand.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'color.text-primary', name: 'Text Primary', category: 'brand-color', value: ADMIN_STUDIO_THEME.textPrimary, description: 'Primary body text on light surfaces.', source: 'adminStudioTheme.ts' }),
    token({ tokenId: 'color.text-secondary', name: 'Text Secondary', category: 'brand-color', value: ADMIN_STUDIO_THEME.textSecondary, description: 'Muted secondary text.', source: 'adminStudioTheme.ts' }),
    token({ tokenId: 'color.pass', name: 'Status Pass', category: 'accent-color', value: EIA.pass, description: 'Healthy/success indicator.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'color.warn', name: 'Status Warn', category: 'accent-color', value: EIA.warn, description: 'Warning indicator.', source: 'executiveIaTheme.ts' }),

    // Glass & blur
    token({ tokenId: 'glass.panel', name: 'Glass Panel', category: 'glass', value: EIA.glass, description: 'Primary acrylic panel background.', source: 'executiveIaTheme.ts', consumedBy: ['eiaPanel', 'ExecutiveSecondaryCard'] }),
    token({ tokenId: 'glass.panel-light', name: 'Glass Panel Light', category: 'glass', value: 'rgba(255,255,255,0.55)', description: 'Lighter glass variant.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'blur.panel', name: 'Panel Blur', category: 'blur', value: '12px', description: 'Backdrop blur for executive panels.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'blur.panel-light', name: 'Panel Blur Light', category: 'blur', value: '8px', description: 'Lighter backdrop blur.', source: 'executiveIaTheme.ts' }),

    // Borders & radius
    token({ tokenId: 'border.default', name: 'Default Border', category: 'border-radius', value: EIA.border, description: 'Standard 1.3px panel border.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'border.strong', name: 'Strong Border', category: 'border-radius', value: EIA.borderStrong, description: 'Emphasis border for CTAs.', source: 'executiveIaTheme.ts' }),
    token({ tokenId: 'border.panel', name: 'Panel Border Token', category: 'border-radius', value: ADMIN_STUDIO_THEME.panelBorder, description: 'Admin theme panel border rgba.', source: 'adminStudioTheme.ts' }),
    token({ tokenId: 'radius.chip', name: 'Chip Radius', category: 'border-radius', value: '2px', description: 'Status pill corner radius.', source: 'CORE.md conventions' }),

    // Shadow & elevation
    token({ tokenId: 'shadow.card', name: 'Card Shadow', category: 'shadow', value: ADMIN_STUDIO_THEME.cardShadow, description: 'Tailwind shadow-lg for cards.', source: 'adminStudioTheme.ts' }),
    token({ tokenId: 'elevation.panel', name: 'Panel Elevation', category: 'elevation', value: 'glass + blur 12px', description: 'Executive panel elevation stack.', source: 'executiveIaTheme.ts' }),

    // Opacity
    token({ tokenId: 'opacity.panel-bg', name: 'Panel Background', category: 'opacity', value: ADMIN_STUDIO_THEME.panelBg, description: 'Subtle panel fill.', source: 'adminStudioTheme.ts' }),
    token({ tokenId: 'opacity.chip-inactive', name: 'Chip Inactive', category: 'opacity', value: ADMIN_STUDIO_THEME.chipInactiveBg, description: 'Inactive chip background.', source: 'adminStudioTheme.ts' }),
    token({ tokenId: 'opacity.chip-active', name: 'Chip Active', category: 'opacity', value: ADMIN_STUDIO_THEME.chipActiveBg, description: 'Active chip with accent tint.', source: 'adminStudioTheme.ts' }),
    token({ tokenId: 'opacity.selected', name: 'Selected Row', category: 'opacity', value: ADMIN_STUDIO_THEME.selectedBg, description: 'Selected list row highlight.', source: 'adminStudioTheme.ts' }),

    // Animation & transition
    token({ tokenId: 'animation.timing-fast', name: 'Fast Timing', category: 'animation-timing', value: '150ms', description: 'Micro-interaction duration.', source: 'platform-default' }),
    token({ tokenId: 'animation.timing-standard', name: 'Standard Timing', category: 'animation-timing', value: '250ms', description: 'Panel expand/collapse.', source: 'platform-default' }),
    token({ tokenId: 'transition.default', name: 'Default Transition', category: 'transition', value: 'all 250ms ease', description: 'Standard property transition.', source: 'platform-default' }),
    token({ tokenId: 'animation.timeline-reveal', name: 'Timeline Reveal', category: 'animation-timing', value: '400ms', description: 'Executive Timeline scroll reveal.', source: 'ExecutiveTimelinePanels.tsx' }),

    // Icon & panel sizes
    token({ tokenId: 'icon.health-ring-sm', name: 'Health Ring SM', category: 'icon-size', value: '44px', description: 'Small health ring diameter.', source: 'ExecutiveHealthRing.tsx' }),
    token({ tokenId: 'icon.health-ring-md', name: 'Health Ring MD', category: 'icon-size', value: '52px', description: 'Mission Control health ring.', source: 'MissionControl panels' }),
    token({ tokenId: 'icon.health-ring-lg', name: 'Health Ring LG', category: 'icon-size', value: '56px', description: 'Workspace hero health ring.', source: 'registry-workspaces' }),
    token({ tokenId: 'panel.height-main-card', name: 'Main Card Height', category: 'panel-height', value: 'calc(100vh * 520 / 745)', description: 'Proportional main card height.', source: 'CORE.md' }),

    // Gradients
    token({ tokenId: 'gradient.accent-subtle', name: 'Accent Subtle Gradient', category: 'gradient', value: 'rgba(235,28,36,0.08) → rgba(235,28,36,0.12)', description: 'Selected/chip accent gradient range.', source: 'adminStudioTheme.ts' }),

    // Breakpoints
    ...Object.entries(RESPONSIVE_BREAKPOINTS).map(([key, px]) =>
      token({
        tokenId: `breakpoint.${key}`,
        name: `Breakpoint ${key.toUpperCase()}`,
        category: 'breakpoint',
        value: `${px}px`,
        description: `Responsive breakpoint at ${px}px.`,
        source: 'design-token-engine/constants.ts',
        themes: ALL_THEMES,
      })
    ),

    // Theme tokens
    token({ tokenId: 'theme.light.accent', name: 'Light Theme Accent', category: 'theme', value: ADMIN_STUDIO_THEME.accent, description: 'Active light theme accent.', source: 'adminStudioTheme.ts', themes: ['light'] }),
    token({ tokenId: 'theme.light.glass', name: 'Light Theme Glass', category: 'theme', value: EIA.glass, description: 'Light theme glass surface.', source: 'executiveIaTheme.ts', themes: ['light'] }),
    token({ tokenId: 'theme.dark.accent', name: 'Dark Theme Accent', category: 'theme', value: '#F87171', description: 'Planned dark theme accent.', source: 'future-theme', themes: ['dark'], immutable: false }),
    token({ tokenId: 'theme.dark.glass', name: 'Dark Theme Glass', category: 'theme', value: 'rgba(0,0,0,0.72)', description: 'Planned dark theme glass.', source: 'future-theme', themes: ['dark'], immutable: false }),
    token({ tokenId: 'theme.future.accent', name: 'Future Theme Accent', category: 'theme', value: 'TBD', description: 'Reserved for future brand evolution.', source: 'future-theme', themes: ['future'], immutable: false }),
  ];

  tokens.push(
    token({
      tokenId: 'engine.self',
      name: 'Design Token Engine™',
      category: 'theme',
      value: DESIGN_TOKEN_ENGINE_ACCENT,
      description: 'Design Token Engine accent — visual governance layer.',
      source: 'design-token-engine/constants.ts',
      consumedBy: ['DesignTokenEngineWorkspace'],
      immutable: false,
    })
  );

  return tokens;
}

export function getDesignToken(tokenId: string): DesignTokenEntry | undefined {
  return buildDesignTokenCatalog().find((t) => t.tokenId === tokenId);
}

export function listTokensByCategory(category: TokenCategory): DesignTokenEntry[] {
  return buildDesignTokenCatalog().filter((t) => t.category === category);
}

export function getTokenValue(tokenId: string): string | undefined {
  return getDesignToken(tokenId)?.value;
}

export function resolveCssVariable(tokenId: string): string | undefined {
  const t = getDesignToken(tokenId);
  return t?.cssVariable ? `var(${t.cssVariable})` : t?.value;
}

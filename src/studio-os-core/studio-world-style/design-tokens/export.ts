import { STUDIO_WORLD_STYLE_BIBLE } from '../style-bible/registry';

export const DESIGN_TOKEN_EXPORT_VERSION = 'studio-world-design-tokens.v1' as const;

export type StudioWorldDesignTokens = {
  tokenVersion: typeof DESIGN_TOKEN_EXPORT_VERSION;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  blur: Record<string, string>;
  glass: Record<string, string>;
  materials: Record<string, string>;
  lighting: Record<string, string>;
  colors: Record<string, string>;
  iconSizing: Record<string, string>;
  animation: Record<string, string>;
  elevation: Record<string, string>;
  border: Record<string, string>;
};

export const STUDIO_WORLD_DESIGN_TOKENS: StudioWorldDesignTokens = {
  tokenVersion: DESIGN_TOKEN_EXPORT_VERSION,
  spacing: {
    'space-1': '4px',
    'space-2': '8px',
    'space-3': '12px',
    'space-4': '16px',
    'space-6': '24px',
    'space-8': '32px',
    'space-12': '48px',
    'space-16': '64px',
  },
  radius: {
    'radius-panel': STUDIO_WORLD_STYLE_BIBLE.panelSystem.cornerRadius,
    'radius-chip': '8px',
    'radius-dock': '16px',
    'radius-workbench': '12px',
    'radius-modal': '16px',
  },
  blur: {
    'blur-panel': '24px',
    'blur-modal': '40px',
    'blur-dock': '16px',
  },
  glass: {
    'glass-panel': STUDIO_WORLD_STYLE_BIBLE.panelSystem.glassTreatment,
    'glass-dock': 'acrylic command dock — illuminated edge glow',
    'glass-workbench': 'frosted workbench console glass',
    'glass-border': STUDIO_WORLD_STYLE_BIBLE.panelSystem.borderTreatment,
  },
  materials: {
    'material-glass': 'architectural glass',
    'material-acrylic': 'premium acrylic',
    'material-chrome': 'chrome',
    'material-stone': 'premium stone',
    'material-marble-slot': 'founder-marble slot',
    'material-oled': 'OLED transparent display',
  },
  lighting: {
    'light-primary': STUDIO_WORLD_STYLE_BIBLE.lightingPhilosophy.primary,
    'light-accent': STUDIO_WORLD_STYLE_BIBLE.lightingPhilosophy.accent,
    'light-glass-edge': STUDIO_WORLD_STYLE_BIBLE.lightingPhilosophy.glass,
    'light-luxury': STUDIO_WORLD_STYLE_BIBLE.lightingPhilosophy.luxury,
  },
  colors: {
    'color-marble': '#f8f6f3',
    'color-chrome': '#c0c0c0',
    'color-champagne': '#d4af37',
    'color-accent-red': '#eb1c24',
    'color-glass-tint': 'rgba(255,255,255,0.08)',
    'color-shadow': 'rgba(0,0,0,0.12)',
  },
  iconSizing: {
    'icon-sm': '16px',
    'icon-md': '20px',
    'icon-lg': '24px',
    'icon-dock': '28px',
    'icon-workbench': '20px',
  },
  animation: {
    'duration-fast': '240ms',
    'duration-standard': '280ms',
    'duration-modal': '360ms',
    'duration-camera': '600ms',
    'easing-standard': 'ease-out-cubic',
    'easing-modal': 'ease-in-out',
  },
  elevation: {
    'elevation-0': 'floor level',
    'elevation-1': STUDIO_WORLD_STYLE_BIBLE.panelSystem.elevationSystem.split('·')[1]?.trim() ?? 'dock/workbench',
    'elevation-2': 'panels',
    'elevation-3': 'modals',
    'shadow-standard': STUDIO_WORLD_STYLE_BIBLE.panelSystem.shadowLanguage,
  },
  border: {
    'border-standard': STUDIO_WORLD_STYLE_BIBLE.panelSystem.borderTreatment,
    'border-width': '1px',
  },
};

export function exportDesignTokens(): StudioWorldDesignTokens {
  return STUDIO_WORLD_DESIGN_TOKENS;
}

export function buildDesignTokenPromptSection(): string {
  const t = STUDIO_WORLD_DESIGN_TOKENS;
  return `DESIGN TOKENS: spacing ${Object.keys(t.spacing).length} scales · radius ${t.radius['radius-panel']} · blur ${t.blur['blur-panel']} · glass ${t.glass['glass-panel']}`;
}

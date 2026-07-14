import type { StudioWorldIconDefinition } from './StudioWorldIconDefinition';
import type { StudioWorldIconState } from './StudioWorldIconState';
import type { StudioWorldIconTheme } from './StudioWorldIconTheme';
import { getIcon, markIconUsed } from './StudioWorldIconRegistry';
import { resolveIconState } from './StudioWorldIconStateResolver';
import { resolveThemeForDevice } from './StudioWorldIconThemeResolver';
import { resolveNewestCertifiedIcon } from './StudioWorldIconVersionManager';

export type RuntimeIconResolveInput = {
  iconId: string;
  state?: StudioWorldIconState;
  theme?: StudioWorldIconTheme;
  device?: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'ar' | 'vr';
  sizePx?: number;
  departmentId?: string;
};

export type ResolvedRuntimeIcon = {
  iconId: string;
  displayName: string;
  assetPath: string | null;
  provider: string;
  state: StudioWorldIconState;
  theme: StudioWorldIconTheme;
  sizePx: number;
  scale: number;
  definition: StudioWorldIconDefinition;
};

export function resolveRuntimeIcon(input: RuntimeIconResolveInput): ResolvedRuntimeIcon | null {
  const icon = getIcon(input.iconId);
  if (!icon) return null;

  markIconUsed(icon.id);

  const state = resolveIconState(icon, input.state ?? 'default');
  const theme = resolveThemeForDevice(icon, input.theme ?? 'studio-dark', input.device ?? 'desktop');
  const sizePx = input.sizePx ?? 24;

  return {
    iconId: icon.id,
    displayName: icon.displayName,
    assetPath: state.assetPath,
    provider: state.provider,
    state: state.state,
    theme: theme.theme,
    sizePx,
    scale: theme.scale,
    definition: resolveNewestCertifiedIcon([icon]) ?? icon,
  };
}

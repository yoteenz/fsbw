/** Site-wide visual debug editor — append `/debug-mode` to any route. */

export const DEBUG_MODE_SUFFIX = '/debug-mode';
export const DEBUG_MODE_STORAGE_KEY = 'baw_page_debug_overrides';
export const DEBUG_MODE_SESSION_KEY = 'baw_debug_mode_active';
export const DEBUG_MODE_UPDATED_EVENT = 'bawPageDebugOverridesUpdated';

export const DEBUG_BRAND_COLORS = {
  red: '#EB1C24',
  gray: '#808080',
  black: '#000000',
} as const;

export const DEBUG_FONT_PRESETS = {
  futuraBook: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
  futuraMedium: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
  futuraDemi: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif',
  coveredGrace: '"Covered By Your Grace", cursive',
} as const;

export type DebugFontPresetId = keyof typeof DEBUG_FONT_PRESETS;

export type DebugElementOverride = {
  text?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  textTransform?: string;
  backgroundColor?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  minHeight?: number;
  borderRadius?: number;
  imageSrc?: string;
  flexOrder?: number;
  translateX?: number;
  translateY?: number;
};

export type DebugPageConfig = {
  updatedAt: number;
  elements: Record<string, DebugElementOverride>;
};

export type DebugModeStore = Record<string, DebugPageConfig>;

export function stripDebugModeSuffix(pathname: string): string {
  if (pathname === DEBUG_MODE_SUFFIX) return '/';
  if (pathname.endsWith(DEBUG_MODE_SUFFIX)) {
    const base = pathname.slice(0, -DEBUG_MODE_SUFFIX.length);
    return base || '/';
  }
  return pathname;
}

export function isDebugModePath(pathname: string): boolean {
  return pathname === DEBUG_MODE_SUFFIX || pathname.endsWith(DEBUG_MODE_SUFFIX);
}

export function withDebugModeSuffix(pathname: string): string {
  const base = stripDebugModeSuffix(pathname);
  if (base === '/') return DEBUG_MODE_SUFFIX;
  return `${base.replace(/\/$/, '')}${DEBUG_MODE_SUFFIX}`;
}

export function snapDebugPx(value: number, grid = 4): number {
  return Math.round(value / grid) * grid;
}

export function loadDebugModeStore(): DebugModeStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DEBUG_MODE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DebugModeStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveDebugModeStore(store: DebugModeStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEBUG_MODE_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(DEBUG_MODE_UPDATED_EVENT));
}

export function getDebugPageConfig(pageKey: string): DebugPageConfig | null {
  return loadDebugModeStore()[pageKey] ?? null;
}

export function saveDebugPageConfig(pageKey: string, config: DebugPageConfig): void {
  const store = loadDebugModeStore();
  store[pageKey] = { ...config, updatedAt: Date.now() };
  saveDebugModeStore(store);
}

export function clearDebugPageConfig(pageKey: string): void {
  const store = loadDebugModeStore();
  delete store[pageKey];
  saveDebugModeStore(store);
}

export function formatDebugPageConfigForCopy(pageKey: string, config: DebugPageConfig): string {
  return JSON.stringify({ pageKey, ...config }, null, 2);
}

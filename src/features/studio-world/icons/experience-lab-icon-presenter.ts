import type { CSSProperties } from 'react';
import type { ExperienceLabIconName } from './experience-lab-icon-registry';
import {
  resolveStudioWorldIconPresentation,
  type IconPresentationProfile,
  type IconPresentationScores,
} from './experience-lab-icon-presentation';

export type ExperienceLabIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const SIZE_PX: Record<ExperienceLabIconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export const FOUNDER_OPTICAL_STORAGE_KEY = 'studio-world:icon-presentation-founder-overrides';
export const FOUNDER_OPTICAL_MODE_KEY = 'studio-world:founder-optical-mode';

export type FounderPresentationPatch = Partial<
  Pick<
    IconPresentationProfile,
    | 'scale'
    | 'offsetX'
    | 'offsetY'
    | 'strokeWeight'
    | 'opticalWeight'
    | 'padding'
    | 'minimumSize'
    | 'maximumSize'
    | 'baselineAdjust'
  >
>;

export type ResolvedIconPresentation = IconPresentationProfile & {
  source: 'registry' | 'founder-override';
};

function readFounderOverrides(): Partial<Record<ExperienceLabIconName, FounderPresentationPatch>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(FOUNDER_OPTICAL_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Record<ExperienceLabIconName, FounderPresentationPatch>>;
  } catch {
    return {};
  }
}

export function getFounderPresentationOverrides(): Partial<
  Record<ExperienceLabIconName, FounderPresentationPatch>
> {
  return readFounderOverrides();
}

export function setFounderPresentationOverride(
  name: ExperienceLabIconName,
  patch: FounderPresentationPatch,
): void {
  if (typeof window === 'undefined') return;
  const current = readFounderOverrides();
  current[name] = { ...current[name], ...patch };
  window.localStorage.setItem(FOUNDER_OPTICAL_STORAGE_KEY, JSON.stringify(current, null, 2));
  window.dispatchEvent(new CustomEvent('studio-world:icon-presentation-updated', { detail: { name } }));
}

export function clearFounderPresentationOverride(name: ExperienceLabIconName): void {
  if (typeof window === 'undefined') return;
  const current = readFounderOverrides();
  delete current[name];
  window.localStorage.setItem(FOUNDER_OPTICAL_STORAGE_KEY, JSON.stringify(current, null, 2));
  window.dispatchEvent(new CustomEvent('studio-world:icon-presentation-updated', { detail: { name } }));
}

export function isFounderOpticalModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(FOUNDER_OPTICAL_MODE_KEY) === '1';
}

export function setFounderOpticalModeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FOUNDER_OPTICAL_MODE_KEY, enabled ? '1' : '0');
  window.dispatchEvent(new CustomEvent('studio-world:founder-optical-mode', { detail: { enabled } }));
}

export function resolveIconPresentation(name: ExperienceLabIconName): ResolvedIconPresentation {
  const base = resolveStudioWorldIconPresentation(name);
  const patch = readFounderOverrides()[name];
  if (!patch) return { ...base, source: 'registry' };
  return {
    ...base,
    ...patch,
    source: 'founder-override',
  };
}

export function resolveCanonicalIconPresentation(name: ExperienceLabIconName): IconPresentationProfile {
  return resolveStudioWorldIconPresentation(name);
}

export type PresentedIconMetrics = {
  boxPx: number;
  offsetScale: number;
  style: CSSProperties;
  imgStyle: CSSProperties;
  scores: IconPresentationScores;
};

export function presentExperienceLabIcon(
  name: ExperienceLabIconName,
  size: ExperienceLabIconSize,
  options?: { canonical?: boolean },
): PresentedIconMetrics {
  const profile = options?.canonical
    ? resolveCanonicalIconPresentation(name)
    : resolveIconPresentation(name);

  const basePx = SIZE_PX[size];
  const offsetScale = basePx / SIZE_PX.md;
  const scaled = Math.round(basePx * profile.scale * profile.opticalWeight);
  const boxPx = Math.max(profile.minimumSize, Math.min(profile.maximumSize, scaled));
  const pad = Math.round(profile.padding * offsetScale);

  const offsetX = Math.round((profile.offsetX + profile.baselineAdjust * 0.25) * offsetScale);
  const offsetY = Math.round((profile.offsetY + profile.baselineAdjust) * offsetScale);

  const style: CSSProperties = {
    width: boxPx,
    height: boxPx,
    padding: pad,
    boxSizing: 'content-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
    verticalAlign: 'middle',
  };

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: `calc(50% + ${offsetX}px) calc(50% + ${offsetY}px)`,
  };

  return {
    boxPx,
    offsetScale,
    style,
    imgStyle,
    scores: profile.scores,
  };
}

/** Export founder overrides as a TS fragment for Composer to merge into the registry. */
export function exportFounderPresentationPatchFragment(): string {
  const overrides = readFounderOverrides();
  const keys = Object.keys(overrides);
  if (keys.length === 0) return '// No founder presentation overrides saved.';
  const lines = keys
    .map((key) => {
      const patch = overrides[key as ExperienceLabIconName];
      const fields = Object.entries(patch ?? {})
        .map(([k, v]) => `    ${k}: ${typeof v === 'string' ? `'${v}'` : v},`)
        .join('\n');
      return `  ${key}: {\n${fields}\n  }`;
    })
    .join(',\n');
  return `/** Founder optical overrides — merge into StudioWorldIconPresentationRegistry */\nexport const FOUNDER_PRESENTATION_PATCH = {\n${lines}\n} as const;`;
}

export function subscribePresentationUpdates(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => listener();
  window.addEventListener('studio-world:icon-presentation-updated', handler);
  window.addEventListener('studio-world:founder-optical-mode', handler);
  return () => {
    window.removeEventListener('studio-world:icon-presentation-updated', handler);
    window.removeEventListener('studio-world:founder-optical-mode', handler);
  };
}

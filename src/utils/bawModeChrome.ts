import {
  BAW_BUILDER_FLOW_STEPS,
  BAW_TRY_FLOW_STEPS,
  type BawBuildMode,
  type BawGuideStepId,
  getBawModeGuideCopy,
  bawBuildModeLabel,
} from '../constants/bawModeGuideConfig';
import { isBawTutorialPath, getBawTryFlowBasePath } from '../constants/bawTutorialConfig';
import { resolveBuildAWigTryPathToHubPath, getBuildAWigFlowBasePath } from './buildAWigRoutes';

export type BawModeChromeContext = {
  mode: BawBuildMode;
  modeLabel: string;
  unitLabel: string;
  step: BawGuideStepId;
  progressPct: number;
  guideTitle: string;
  guideBody: string;
};

function resolveBawUnitLabelFromHubPath(hubPath: string): string {
  if (hubPath.startsWith('/build-a-wig/blanco')) return 'BLANCO';
  if (hubPath.startsWith('/build-a-wig/soft-wave')) return 'SOFT WAVE';
  if (hubPath.startsWith('/build-a-wig/beach-wave')) return 'BEACH WAVE';
  if (hubPath.startsWith('/build-a-wig/soft-curl')) return 'SOFT CURL';
  if (hubPath.startsWith('/build-a-wig/ocean-curl')) return 'OCEAN CURL';
  return 'NOIR';
}

export function resolveBawBuildMode(pathname: string): BawBuildMode | null {
  const p = pathname.replace(/\/$/, '') || '/';
  if (!p.startsWith('/build-a-wig')) return null;
  if (isBawTutorialPath(p)) return 'TRY';
  if (p.includes('/edit')) return 'EDIT';
  if (p.includes('/customize')) return 'CUSTOMIZE';
  if (
    p === '/build-a-wig/noir' ||
    p === '/build-a-wig/blanco' ||
    p === '/build-a-wig/soft-wave' ||
    p === '/build-a-wig/beach-wave' ||
    p === '/build-a-wig/soft-curl' ||
    p === '/build-a-wig/ocean-curl'
  ) {
    return 'HUB';
  }
  return null;
}

export function resolveBawGuideStepFromPathname(pathname: string): BawGuideStepId {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p.endsWith('/cap') || p.endsWith('/cap-size')) return 'cap';
  if (p.endsWith('/length')) return 'length';
  if (p.endsWith('/density')) return 'density';
  if (p.endsWith('/lace')) return 'lace';
  if (p.endsWith('/texture')) return 'texture';
  if (p.endsWith('/color')) return 'color';
  if (p.endsWith('/hairline')) return 'hairline';
  if (p.endsWith('/styling')) return 'styling';
  if (p.endsWith('/addons')) return 'addons';
  return 'intro';
}

function flowStepsForMode(mode: BawBuildMode): readonly BawGuideStepId[] {
  return mode === 'TRY' ? BAW_TRY_FLOW_STEPS : BAW_BUILDER_FLOW_STEPS;
}

export function resolveBawModeChromeContext(pathname: string): BawModeChromeContext | null {
  const mode = resolveBawBuildMode(pathname);
  if (!mode) return null;

  const hubPath = resolveBuildAWigTryPathToHubPath(pathname);
  const unitLabel = resolveBawUnitLabelFromHubPath(hubPath);
  const step = resolveBawGuideStepFromPathname(pathname);
  const steps = flowStepsForMode(mode);
  const stepIndex = steps.indexOf(step);
  const idx = stepIndex >= 0 ? stepIndex : 0;
  const progressPct = ((idx + 1) / steps.length) * 100;
  const copy = getBawModeGuideCopy(mode, step);

  return {
    mode,
    modeLabel: bawBuildModeLabel(mode),
    unitLabel,
    step,
    progressPct,
    guideTitle: copy.title,
    guideBody: copy.body,
  };
}

/** Option sub-step routes (length, color, etc.) — not hub / customize landing. */
export function isBawOptionSubPage(pathname: string): boolean {
  if (!pathname.startsWith('/build-a-wig')) return false;
  return resolveBawGuideStepFromPathname(pathname) !== 'intro';
}

/** Header BACK target from an option sub-page. */
export function resolveBawModeBackPath(pathname: string): string {
  if (isBawTutorialPath(pathname)) {
    return getBawTryFlowBasePath(pathname);
  }
  return getBuildAWigFlowBasePath(pathname);
}

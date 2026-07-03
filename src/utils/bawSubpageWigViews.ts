import { isBawTutorialPath, resolveBawTutorialUnitLabelFromPathname } from '../constants/bawTutorialConfig';
import { pathnameIncludesBawProductSlug } from './buildAWigRoutes';
import { bawStaticMannequinTriplePathsFromUnitAndHairline } from './bawStaticMannequinReferencePaths';

/** Product unit label (NOIR, BLANCO, …) from hub, customize, edit, or try pathname. */
export function resolveBawProductUnitLabelFromPathname(pathname: string): string {
  if (isBawTutorialPath(pathname)) {
    return resolveBawTutorialUnitLabelFromPathname(pathname);
  }
  if (pathnameIncludesBawProductSlug(pathname, 'blanco')) return 'BLANCO';
  if (pathnameIncludesBawProductSlug(pathname, 'soft-wave')) return 'SOFT WAVE';
  if (pathnameIncludesBawProductSlug(pathname, 'beach-wave')) return 'BEACH WAVE';
  if (pathnameIncludesBawProductSlug(pathname, 'soft-curl')) return 'SOFT CURL';
  if (pathnameIncludesBawProductSlug(pathname, 'ocean-curl')) return 'OCEAN CURL';
  return 'NOIR';
}

/** Static L/M/R hero + thumb assets for BAW option sub-pages (includes guest try routes). */
export function getBawSubpageStaticWigViews(
  pathname: string,
  hairlineRaw = 'NATURAL',
): [string, string, string] {
  return [...bawStaticMannequinTriplePathsFromUnitAndHairline(
    resolveBawProductUnitLabelFromPathname(pathname),
    hairlineRaw,
  )];
}

/** NOIR customize/edit step routes that may use live Fal WebPs — not guest try. */
export function isBawNoirLivePreviewStepPathname(pathname: string): boolean {
  if (isBawTutorialPath(pathname)) return false;
  return pathname.includes('/build-a-wig/noir/');
}

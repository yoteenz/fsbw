import type { NavigateFunction } from 'react-router-dom';

/** Fallback when there is no prior history entry (e.g. direct / external open). */
const UNIT_PDP_FALLBACK: Record<string, string> = {
  '/straight/noir': '/units/straight',
  '/straight/blanco': '/units/straight',
  '/wavy/soft-wave': '/units/wavy',
  '/wavy/beach-wave': '/units/wavy',
  '/curly/soft-curl': '/units/curly',
  '/curly/ocean-curl': '/units/curly',
};

/**
 * Unit PDP back: prefer real browser history (same pattern as lobby).
 * If there is no stack to pop, go to the texture’s units listing.
 */
export function navigateUnitProductBack(
  navigate: NavigateFunction,
  pathname: string
): void {
  const fallback = UNIT_PDP_FALLBACK[pathname] ?? '/home/shop';
  if (typeof window !== 'undefined' && window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback);
}

/** Canonical Learn content hub identifiers (Lounge TV internal viewState). */
export type LearnHubId = 'psa-today' | 'slay-tips' | 'psa-answers' | 'product-breakdown';

export const LEARN_HUB_NAV_FOCUS_IDS: Record<LearnHubId, string> = {
  'psa-today': 'learn-nav-psa-today',
  'slay-tips': 'learn-nav-slay-tips',
  'psa-answers': 'learn-nav-psa-answers',
  'product-breakdown': 'learn-nav-product-education',
};

export type LearnSectionSurface = 'compact' | 'hub';

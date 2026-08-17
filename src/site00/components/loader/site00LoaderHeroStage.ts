/** Pedestal-relative hero stage — relationships, not magic pixels. */

export type Site00LoaderHeroStage = {
  pedestal: {
    centerXPercent: number;
    topPercent: number;
    bottomPercent: number;
  };
  geometry: {
    widthPercent: number;
    hoverGapPx: number;
  };
  copy: {
    gapBelowPedestalPx: number;
  };
  signature: {
    safeBottomPx: number;
  };
};

/** Approved Asset Vault loader — geometry projects from marble pedestal. */
export const ASSTS_LOADER_HERO_STAGE: Site00LoaderHeroStage = {
  pedestal: {
    centerXPercent: 50,
    topPercent: 47.5,
    bottomPercent: 58,
  },
  geometry: {
    widthPercent: 36,
    hoverGapPx: 8,
  },
  copy: {
    gapBelowPedestalPx: 18,
  },
  signature: {
    safeBottomPx: 14,
  },
};

export function loaderHeroStageCssVars(stage: Site00LoaderHeroStage): Record<string, string> {
  return {
    '--site00-pedestal-x': `${stage.pedestal.centerXPercent}%`,
    '--site00-pedestal-top': `${stage.pedestal.topPercent}%`,
    '--site00-pedestal-bottom': `${stage.pedestal.bottomPercent}%`,
    '--site00-geo-width': `${stage.geometry.widthPercent}%`,
    '--site00-geo-hover-gap': `${stage.geometry.hoverGapPx}px`,
    '--site00-copy-gap': `${stage.copy.gapBelowPedestalPx}px`,
    '--site00-signature-safe': `${stage.signature.safeBottomPx}px`,
  };
}

export function isLoaderDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('loaderDebug') === '1';
}

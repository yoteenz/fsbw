const LOUNGE_TV_PSA_INTRO_DISMISSED_KEY = 'loungeTvFeaturedPsaIntroDismissed';

/** Per browser session — skippable PSA featured intro on Featured tab. */
export function readLoungeTvPsaIntroDismissed(): boolean {
  try {
    return sessionStorage.getItem(LOUNGE_TV_PSA_INTRO_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissLoungeTvPsaIntro(): void {
  try {
    sessionStorage.setItem(LOUNGE_TV_PSA_INTRO_DISMISSED_KEY, '1');
  } catch {
    /* ignore */
  }
}

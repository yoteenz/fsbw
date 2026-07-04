/** Onboarding Tutorial is view-only — bypass premium (and account sign-in) gates while tour UI is active. */

const TUTORIAL_OS_CONCIERGE_CHANGED = 'tutorialOsConciergeChanged';

let conciergeBypassActive = false;

export function setTutorialOsConciergeBypassActive(active: boolean): void {
  if (conciergeBypassActive === active) return;
  conciergeBypassActive = active;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TUTORIAL_OS_CONCIERGE_CHANGED, { detail: active }));
  }
}

export function isTutorialOsConciergeBypassActive(): boolean {
  return conciergeBypassActive;
}

export { TUTORIAL_OS_CONCIERGE_CHANGED };

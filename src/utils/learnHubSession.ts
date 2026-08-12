import type { LearnHubId } from '../components/lounge/education/learnHubTypes';

const LEARN_RETURN_HUB_KEY = 'loungeTvLearnReturnHub';

export function setLearnReturnHub(hub: LearnHubId): void {
  try {
    sessionStorage.setItem(LEARN_RETURN_HUB_KEY, hub);
  } catch {
    /* ignore */
  }
}

export function readLearnReturnHub(): LearnHubId | null {
  try {
    const raw = sessionStorage.getItem(LEARN_RETURN_HUB_KEY);
    if (
      raw === 'psa-today' ||
      raw === 'slay-tips' ||
      raw === 'psa-answers' ||
      raw === 'product-breakdown'
    ) {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearLearnReturnHub(): void {
  try {
    sessionStorage.removeItem(LEARN_RETURN_HUB_KEY);
  } catch {
    /* ignore */
  }
}

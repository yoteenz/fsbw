import type { LoadBoardSearchFilters } from './freightTypes';

const SESSION_KEY = 'aio-lb-active-filters';

export function setActiveLoadBoardFilters(filters: LoadBoardSearchFilters): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(filters));
}

export function getActiveLoadBoardFilters(fallback: LoadBoardSearchFilters = { originDeadheadMiles: 75 }): LoadBoardSearchFilters {
  if (typeof sessionStorage === 'undefined') return fallback;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as LoadBoardSearchFilters;
  } catch {
    return fallback;
  }
}

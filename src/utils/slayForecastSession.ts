const SLAY_FORECAST_RETURN_KEY = 'loungeTvSlayForecastReturn';

export type SlayForecastReturnView =
  | { kind: 'hub'; editionId: string }
  | { kind: 'history'; editionId?: string }
  | { kind: 'signal'; seasonId: string; signalId: string; editionId?: string }
  | { kind: 'trend-report'; packId: string };

export function setSlayForecastReturn(view: SlayForecastReturnView | null): void {
  try {
    if (!view) sessionStorage.removeItem(SLAY_FORECAST_RETURN_KEY);
    else sessionStorage.setItem(SLAY_FORECAST_RETURN_KEY, JSON.stringify(view));
  } catch {
    /* ignore */
  }
}

export function readSlayForecastReturn(): SlayForecastReturnView | null {
  try {
    const raw = sessionStorage.getItem(SLAY_FORECAST_RETURN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SlayForecastReturnView;
    if (parsed?.kind === 'hub' && typeof parsed.editionId === 'string') return parsed;
    if (parsed?.kind === 'history') return parsed;
    if (parsed?.kind === 'trend-report' && typeof parsed.packId === 'string') return parsed;
    if (
      parsed?.kind === 'signal' &&
      typeof parsed.seasonId === 'string' &&
      typeof parsed.signalId === 'string'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSlayForecastReturn(): void {
  setSlayForecastReturn(null);
}

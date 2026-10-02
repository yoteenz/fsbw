let overrideIso: string | null = null;

export function setSimulationClockOverride(iso: string | null): void {
  overrideIso = iso;
}

export function getSimulationNowIso(): string {
  return overrideIso ?? new Date().toISOString();
}

export function resetSimulationClockForTests(): void {
  overrideIso = null;
}

export function tickWindowIdForInstant(iso: string, bucketMinutes = 15): string {
  const d = new Date(iso);
  const bucket =
    Math.floor(d.getUTCMinutes() / bucketMinutes) * bucketMinutes +
    d.getUTCHours() * 60;
  return `${d.toISOString().slice(0, 10)}-bucket-${bucket}`;
}

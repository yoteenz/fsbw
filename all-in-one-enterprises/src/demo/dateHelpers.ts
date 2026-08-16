/** Relative demo dates — avoid stale seed data */
export function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString();
}

export function daysAhead(d: number): string {
  return new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
}

export function isoNow(): string {
  return new Date().toISOString();
}

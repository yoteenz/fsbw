/** Parse admin hub relative labels (e.g. "2 MIN AGO") for stable sort keys. */
export function parseAdminHubTimestampLabel(label: string): number {
  const s = String(label || '')
    .trim()
    .toUpperCase();
  if (!s) return 0;
  if (s === 'JUST NOW') return Date.now();
  const minMatch = s.match(/^(\d+)\s+MIN(?:UTE)?S?\s+AGO$/);
  if (minMatch) return Date.now() - parseInt(minMatch[1], 10) * 60_000;
  const hrMatch = s.match(/^(\d+)\s+HOUR(?:S)?\s+AGO$/);
  if (hrMatch) return Date.now() - parseInt(hrMatch[1], 10) * 3_600_000;
  const d = new Date(label);
  if (!Number.isNaN(d.getTime())) return d.getTime();
  return 0;
}

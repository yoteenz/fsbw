/**
 * Compact public engagement counts for Lounge TV cards.
 * Examples: 842 · 1.2K · 8.7K · 12K · 1.3M
 */
export function formatEngagementCount(value: number, locale?: string): string {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  const loc = locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en-US');

  if (n < 1000) {
    return new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(n);
  }
  if (n < 1_000_000) {
    const scaled = n / 1000;
    const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 1;
    const formatted = scaled.toFixed(digits).replace(/\.0$/, '');
    return `${formatted}K`;
  }
  const scaled = n / 1_000_000;
  const digits = scaled >= 10 ? 1 : 1;
  const formatted = scaled.toFixed(digits).replace(/\.0$/, '');
  return `${formatted}M`;
}

/** Hide all-zero passive metrics on compact cards when every metric is zero. */
export function shouldHideCompactEngagementRow(counts: {
  helpful: number;
  views: number;
  comments: number;
}): boolean {
  return counts.helpful === 0 && counts.views === 0 && counts.comments === 0;
}

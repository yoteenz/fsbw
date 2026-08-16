import { formatMoney } from '../billing/money';

export function formatMetricMoney(minor: number | null | undefined, unknown = false): string {
  if (unknown || minor === null || minor === undefined) return '—';
  return formatMoney(minor);
}

export function formatMetricCount(n: number | null | undefined, unknown = false): string {
  if (unknown || n === null || n === undefined) return '—';
  return n.toLocaleString('en-US');
}

export function formatMetricPercent(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}%`;
}

export function formatCompactMoney(minor: number): string {
  const dollars = minor / 100;
  if (Math.abs(dollars) >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
  if (Math.abs(dollars) >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  return formatMoney(minor);
}

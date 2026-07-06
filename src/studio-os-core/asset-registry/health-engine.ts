import { ASSET_HEALTH_CHECKS } from './constants';
import type { AssetHealthCheckId, AssetHealthMetric } from './types';

const HEALTH_META: Record<
  AssetHealthCheckId,
  { label: string; scorePct: number; issueCount: number; detail: string; status: AssetHealthMetric['status'] }
> = {
  'broken-links': {
    label: 'Broken Links',
    scorePct: 94,
    issueCount: 4,
    detail: '4 assets reference deleted storage paths.',
    status: 'warning',
  },
  'unused-assets': {
    label: 'Unused Assets',
    scorePct: 78,
    issueCount: 23,
    detail: '23 registered assets with zero usage in 90 days.',
    status: 'warning',
  },
  'duplicate-assets': {
    label: 'Duplicate Assets',
    scorePct: 88,
    issueCount: 3,
    detail: '3 near-duplicate logo variants detected.',
    status: 'warning',
  },
  'missing-alt-text': {
    label: 'Missing Alt Text',
    scorePct: 82,
    issueCount: 18,
    detail: '18 images missing accessibility alt text.',
    status: 'warning',
  },
  'brand-compliance': {
    label: 'Brand Compliance',
    scorePct: 91,
    issueCount: 6,
    detail: '6 assets use deprecated brand colors.',
    status: 'warning',
  },
  resolution: {
    label: 'Resolution',
    scorePct: 95,
    issueCount: 2,
    detail: '2 hero images below recommended 2x resolution.',
    status: 'healthy',
  },
  performance: {
    label: 'Performance',
    scorePct: 89,
    issueCount: 8,
    detail: '8 video assets exceed recommended file size.',
    status: 'warning',
  },
  accessibility: {
    label: 'Accessibility',
    scorePct: 86,
    issueCount: 12,
    detail: '12 assets fail WCAG contrast on dark backgrounds.',
    status: 'warning',
  },
  'recommended-updates': {
    label: 'Recommended Updates',
    scorePct: 92,
    issueCount: 7,
    detail: '7 assets have newer versions available in source.',
    status: 'healthy',
  },
};

export function buildAssetHealthMetrics(): AssetHealthMetric[] {
  return ASSET_HEALTH_CHECKS.map((checkId) => ({
    checkId,
    ...HEALTH_META[checkId],
  }));
}

export function computeHealthScorePct(metrics: AssetHealthMetric[]): number {
  const avg = metrics.reduce((sum, m) => sum + m.scorePct, 0) / metrics.length;
  return Math.round(avg);
}

export function getRecommendedUpdates(metrics: AssetHealthMetric[]): string[] {
  const updates = metrics.find((m) => m.checkId === 'recommended-updates');
  return updates ? [`${updates.issueCount} assets recommended for update`] : [];
}

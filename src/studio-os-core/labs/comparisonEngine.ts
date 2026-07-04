/**
 * Experiment comparison — side-by-side with statistically meaningful diffs.
 */

import type { Experiment, ExperimentComparison } from './types';

const COMPARE_FIELDS: Array<{ key: keyof Experiment['variables']; label: string }> = [
  { key: 'hook', label: 'Hook' },
  { key: 'voice', label: 'Voice' },
  { key: 'caption', label: 'Caption' },
  { key: 'videoDurationSec', label: 'Length (sec)' },
  { key: 'publishingPlatform', label: 'Platform' },
  { key: 'publishTime', label: 'Posting time' },
];

function meaningfulDelta(a: number, b: number): boolean {
  if (a === 0 && b === 0) return false;
  const base = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.abs(a - b) / base >= 0.15;
}

export function compareExperiments(a: Experiment, b: Experiment): ExperimentComparison {
  const differences: ExperimentComparison['differences'] = [];

  for (const { key, label } of COMPARE_FIELDS) {
    const valueA = a.variables[key];
    const valueB = b.variables[key];
    if (valueA !== valueB) {
      differences.push({
        field: label,
        valueA: String(valueA),
        valueB: String(valueB),
        statisticallyMeaningful: false,
      });
    }
  }

  const metricPairs: Array<{ label: string; key: keyof Experiment['metrics'] }> = [
    { label: 'Completion rate', key: 'completionRate' },
    { label: 'Engagement rate', key: 'engagementRate' },
    { label: 'Revenue', key: 'revenue' },
    { label: 'Avg view duration', key: 'averageViewDurationSec' },
  ];

  for (const { label, key } of metricPairs) {
    const valueA = a.metrics[key] as number;
    const valueB = b.metrics[key] as number;
    if (meaningfulDelta(valueA, valueB)) {
      const delta = valueB !== 0 ? Math.round(((valueA - valueB) / valueB) * 100) : 0;
      differences.push({
        field: label,
        valueA,
        valueB,
        statisticallyMeaningful: true,
        metricDelta: delta,
      });
    }
  }

  if (a.thumbnailIntel && b.thumbnailIntel && meaningfulDelta(a.thumbnailIntel.ctr, b.thumbnailIntel.ctr)) {
    differences.push({
      field: 'Thumbnail CTR',
      valueA: a.thumbnailIntel.ctr,
      valueB: b.thumbnailIntel.ctr,
      statisticallyMeaningful: true,
      metricDelta: Math.round(((a.thumbnailIntel.ctr - b.thumbnailIntel.ctr) / b.thumbnailIntel.ctr) * 100),
    });
  }

  return {
    experimentAId: a.id,
    experimentBId: b.id,
    differences,
  };
}

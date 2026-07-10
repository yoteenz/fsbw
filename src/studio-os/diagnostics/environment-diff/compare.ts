import type { EnvironmentDiffResult, EnvironmentSnapshot } from '../types';

function flatten(obj: unknown, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (obj == null || typeof obj !== 'object') {
    out[prefix || 'value'] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    out[prefix || 'array'] = JSON.stringify(obj);
    return out;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, path));
    } else {
      out[path] = v;
    }
  }
  return out;
}

/** Compare two environment snapshots — output only differing values. */
export function compareEnvironmentSnapshots(
  baseline: EnvironmentSnapshot,
  compare: EnvironmentSnapshot
): EnvironmentDiffResult {
  const flatA = flatten(baseline);
  const flatB = flatten(compare);
  const allKeys = new Set([...Object.keys(flatA), ...Object.keys(flatB)]);
  const differingKeys: EnvironmentDiffResult['differingKeys'] = [];

  for (const path of [...allKeys].sort()) {
    const a = flatA[path];
    const b = flatB[path];
    const aStr = JSON.stringify(a);
    const bStr = JSON.stringify(b);
    if (aStr !== bStr) {
      differingKeys.push({ path, baseline: a, compare: b });
    }
  }

  return {
    baselineLabel: baseline.label,
    compareLabel: compare.label,
    differingKeys,
  };
}

/** Suggest label pairs for normal vs private comparison. */
export function findSnapshotPairs(
  snapshots: EnvironmentSnapshot[]
): Array<{ baseline: EnvironmentSnapshot; compare: EnvironmentSnapshot }> {
  const pairs: Array<{ baseline: EnvironmentSnapshot; compare: EnvironmentSnapshot }> = [];
  const byLabel = new Map<string, EnvironmentSnapshot>();
  for (const s of snapshots) {
    byLabel.set(s.label, s);
  }
  const pairDefs: Array<[string, string]> = [
    ['safari-normal', 'safari-private'],
    ['chrome-normal', 'chrome-incognito'],
    ['safari-normal', 'chrome-normal'],
  ];
  for (const [a, b] of pairDefs) {
    const left = byLabel.get(a);
    const right = byLabel.get(b);
    if (left && right) pairs.push({ baseline: left, compare: right });
  }
  return pairs;
}

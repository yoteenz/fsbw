/**
 * Photography Bible version manager — append-only lineage.
 * V1.0 is immutable (stores approved Product Photography System V2.0 spec).
 */

export type PhotographyVersionStatus = 'immutable' | 'active' | 'superseded' | 'draft';

export type PhotographyVersionRecord = {
  version: string;
  label: string;
  status: PhotographyVersionStatus;
  effectiveDate: string;
  summary: string;
  /** When true, patches cannot overwrite this version's spec blob. */
  immutable: boolean;
};

/** Photography System V1.0 — immutable baseline (Milestone 20.5). */
export const PHOTOGRAPHY_VERSION_1_0: PhotographyVersionRecord = {
  version: '1.0',
  label: 'Photography System V1.0',
  status: 'immutable',
  effectiveDate: '2026-07-04',
  summary:
    'Canonical Product Photography System — 1:1 · 4096×4096 · pure white studio · locked camera, lens, crop, lighting, bust, logo, color profile.',
  immutable: true,
};

export const PHOTOGRAPHY_VERSION_HISTORY: readonly PhotographyVersionRecord[] = [
  PHOTOGRAPHY_VERSION_1_0,
] as const;

/** Placeholder slots for future append-only versions — not active until published. */
export const PHOTOGRAPHY_FUTURE_VERSION_SLOTS = ['1.1', '1.2', '2.0'] as const;

export function getCurrentPhotographyVersion(): PhotographyVersionRecord {
  return PHOTOGRAPHY_VERSION_1_0;
}

export function getPhotographyVersion(version: string): PhotographyVersionRecord | undefined {
  return PHOTOGRAPHY_VERSION_HISTORY.find((v) => v.version === version);
}

export function isPhotographyVersionImmutable(version: string): boolean {
  const record = getPhotographyVersion(version);
  return record?.immutable === true;
}

/**
 * Register a new version (append-only). Throws if attempting to mutate immutable V1.0.
 * Infrastructure stub — no persistence layer in Milestone 20.5.
 */
export function appendPhotographyVersionDraft(
  record: Omit<PhotographyVersionRecord, 'immutable'> & { immutable?: boolean }
): PhotographyVersionRecord {
  if (record.version === '1.0') {
    throw new Error('Photography System V1.0 is immutable and cannot be overwritten.');
  }
  return { ...record, immutable: record.immutable ?? false };
}

/**
 * Creative DNA version manager — append-only lineage.
 * v1.0 is immutable; future v1.1 / v1.2 / v2.0 append without overwriting prior versions.
 */

export type CreativeDnaVersionStatus = 'immutable' | 'active' | 'superseded' | 'draft';

export type CreativeDnaVersionRecord = {
  version: string;
  label: string;
  status: CreativeDnaVersionStatus;
  effectiveDate: string;
  summary: string;
  immutable: boolean;
};

export const CREATIVE_DNA_VERSION_1_0: CreativeDnaVersionRecord = {
  version: '1.0',
  label: 'Creative DNA v1.0',
  status: 'immutable',
  effectiveDate: '2026-07-04',
  summary:
    'Permanent Frontal Slayer product photography standard — approved prompt v2.0, Display Bust v1.0, SOFT WAVE benchmark, locked specs, editorial reference, generation package architecture.',
  immutable: true,
};

export const CREATIVE_DNA_VERSION_HISTORY: readonly CreativeDnaVersionRecord[] = [CREATIVE_DNA_VERSION_1_0] as const;

export const CREATIVE_DNA_FUTURE_VERSION_SLOTS = ['1.1', '1.2', '2.0'] as const;

export function getCurrentCreativeDnaVersion(): CreativeDnaVersionRecord {
  return CREATIVE_DNA_VERSION_1_0;
}

export function getCreativeDnaVersion(version: string): CreativeDnaVersionRecord | undefined {
  return CREATIVE_DNA_VERSION_HISTORY.find((v) => v.version === version);
}

export function isCreativeDnaVersionImmutable(version: string): boolean {
  return getCreativeDnaVersion(version)?.immutable === true;
}

export function appendCreativeDnaVersionDraft(
  record: Omit<CreativeDnaVersionRecord, 'immutable'> & { immutable?: boolean }
): CreativeDnaVersionRecord {
  if (record.version === '1.0') {
    throw new Error('Creative DNA v1.0 is immutable and cannot be overwritten.');
  }
  return { ...record, immutable: record.immutable ?? false };
}

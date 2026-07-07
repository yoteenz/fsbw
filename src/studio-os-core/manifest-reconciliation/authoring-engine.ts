import { getMasterSpecBundleSync } from './load-bundle';
import type { ManifestValidationIssue, MasterSpecBundle } from './types';

/** Manifest Authoring™ — validates Master Specification manifest integrity. */
export function validateMasterSpecManifest(bundle: MasterSpecBundle = getMasterSpecBundleSync()): ManifestValidationIssue[] {
  const issues: ManifestValidationIssue[] = [];
  const milestoneIds = new Set<string>();
  const internalIds = new Set<string>();
  const volumeIds = new Set(bundle.volumes.map((v) => v.id));
  const chapters = bundle.chapters ?? [];
  const chapterIds = new Set(chapters.map((c) => c.id));

  for (const ch of chapters) {
    if (!volumeIds.has(ch.volumeId)) {
      issues.push({ severity: 'warning', code: 'CHAPTER_UNKNOWN_VOLUME', message: `${ch.id} references unknown volume ${ch.volumeId}`, entityId: ch.id });
    }
    for (const mid of ch.milestoneIds) {
      const exists =
        bundle.milestones.some((m) => m.canonicalId === mid) ||
        bundle.designRevisions.some((d) => d.id === mid) ||
        mid.startsWith('DR-');
      if (!exists) {
        issues.push({ severity: 'warning', code: 'CHAPTER_UNKNOWN_MILESTONE', message: `${ch.id} lists unknown milestone ${mid}`, entityId: ch.id });
      }
    }
  }

  for (const m of bundle.milestones) {
    if (milestoneIds.has(m.canonicalId)) {
      issues.push({ severity: 'error', code: 'DUPLICATE_CANONICAL_ID', message: `Duplicate canonicalId ${m.canonicalId}`, entityId: m.canonicalId });
    }
    milestoneIds.add(m.canonicalId);

    if (internalIds.has(m.internalId)) {
      issues.push({ severity: 'error', code: 'DUPLICATE_INTERNAL_ID', message: `Duplicate internalId ${m.internalId}`, entityId: m.internalId });
    }
    internalIds.add(m.internalId);

    if (!volumeIds.has(m.volumeId)) {
      issues.push({ severity: 'warning', code: 'UNKNOWN_VOLUME', message: `${m.canonicalId} references unknown volume ${m.volumeId}`, entityId: m.canonicalId });
    }

    if (m.chapterId && !chapterIds.has(m.chapterId)) {
      issues.push({ severity: 'warning', code: 'UNKNOWN_CHAPTER', message: `${m.canonicalId} references unknown chapter ${m.chapterId}`, entityId: m.canonicalId });
    }

    for (const dep of m.dependsOn) {
      const depExists =
        milestoneIds.has(dep) ||
        bundle.milestones.some((x) => x.canonicalId === dep || x.internalId === dep) ||
        volumeIds.has(dep) ||
        dep.startsWith('DR-');
      if (!depExists && m.implementationStatus === 'complete') {
        issues.push({ severity: 'warning', code: 'UNRESOLVED_DEP', message: `${m.canonicalId} depends on unresolved ${dep}`, entityId: m.canonicalId });
      }
    }
  }

  for (const dr of bundle.designRevisions) {
    if (!dr.mergeTargets.length) {
      issues.push({ severity: 'error', code: 'DR_NO_MERGE_TARGETS', message: `${dr.id} has no mergeTargets`, entityId: dr.id });
    }
  }

  if (!bundle.volumes.some((v) => v.id === 'volume-i')) {
    issues.push({ severity: 'error', code: 'MISSING_VOLUME_I', message: 'Volume I container missing' });
  }

  const volumeI = bundle.milestones.filter((m) => m.volumeId === 'volume-i');
  if (volumeI.length < 20) {
    issues.push({ severity: 'warning', code: 'LOW_VOLUME_I_COUNT', message: `Expected ≥20 Volume I milestones, found ${volumeI.length}` });
  }

  if ((bundle.chapters ?? []).filter((c) => c.volumeId === 'volume-i').length < 6) {
    issues.push({ severity: 'warning', code: 'LOW_VOLUME_I_CHAPTERS', message: 'Volume I should have structured chapters' });
  }

  if (!bundle.volumes.some((v) => v.id === 'volume-ii')) {
    issues.push({ severity: 'error', code: 'MISSING_VOLUME_II', message: 'Volume II container missing' });
  }

  const volumeII = bundle.milestones.filter((m) => m.volumeId === 'volume-ii');
  if (volumeII.length < 35) {
    issues.push({ severity: 'warning', code: 'LOW_VOLUME_II_COUNT', message: `Expected ≥35 Volume II milestones, found ${volumeII.length}` });
  }

  if ((bundle.chapters ?? []).filter((c) => c.volumeId === 'volume-ii').length < 8) {
    issues.push({ severity: 'warning', code: 'LOW_VOLUME_II_CHAPTERS', message: 'Volume II should have structured chapters' });
  }

  if (bundle.milestones.length < 210) {
    issues.push({ severity: 'warning', code: 'LOW_MILESTONE_COUNT', message: `Expected ~218 milestones, found ${bundle.milestones.length}` });
  }

  return issues;
}

export function summarizeManifestAuthoring(bundle: MasterSpecBundle = getMasterSpecBundleSync()): string {
  const issues = validateMasterSpecManifest(bundle);
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return `Manifest Authoring™ — ${bundle.stats.milestoneCount} milestones · ${bundle.stats.chapterCount ?? 0} chapters · ${bundle.stats.volumeCount} volumes · ${errors} errors · ${warnings} warnings`;
}

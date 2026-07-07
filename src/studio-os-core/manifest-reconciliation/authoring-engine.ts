import { getMasterSpecBundleSync } from './load-bundle';
import type { ManifestValidationIssue, MasterSpecBundle } from './types';

/** Manifest Authoring™ — validates Master Specification manifest integrity. */
export function validateMasterSpecManifest(bundle: MasterSpecBundle = getMasterSpecBundleSync()): ManifestValidationIssue[] {
  const issues: ManifestValidationIssue[] = [];
  const milestoneIds = new Set<string>();
  const internalIds = new Set<string>();
  const volumeIds = new Set(bundle.volumes.map((v) => v.id));

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

  if (bundle.milestones.length < 190) {
    issues.push({ severity: 'warning', code: 'LOW_MILESTONE_COUNT', message: `Expected ~194 milestones, found ${bundle.milestones.length}` });
  }

  return issues;
}

export function summarizeManifestAuthoring(bundle: MasterSpecBundle = getMasterSpecBundleSync()): string {
  const issues = validateMasterSpecManifest(bundle);
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return `Manifest Authoring™ — ${bundle.stats.milestoneCount} milestones · ${bundle.stats.volumeCount} volumes · ${errors} errors · ${warnings} warnings`;
}

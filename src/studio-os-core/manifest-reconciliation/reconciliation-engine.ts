import { DOCUMENTATION_SYSTEM_REGISTRY } from '../documentation-sync/system-registry';
import { getMasterSpecBundleSync } from './load-bundle';
import type { MasterSpecBundle, ReconciliationMatch, ReconciliationReport } from './types';

/** Manifest Reconciliation™ — merges Master Spec with live codebase modules. */
export function reconcileMasterSpecWithLive(bundle: MasterSpecBundle = getMasterSpecBundleSync()): ReconciliationReport {
  const liveByModule = new Map<string, (typeof DOCUMENTATION_SYSTEM_REGISTRY)[number]>();
  for (const entry of DOCUMENTATION_SYSTEM_REGISTRY) {
    if (entry.moduleId) liveByModule.set(entry.moduleId, entry);
    liveByModule.set(entry.id, entry);
  }

  const matches: ReconciliationMatch[] = [];
  const matchedModuleIds = new Set<string>();

  for (const m of bundle.milestones) {
    const live = m.moduleId ? liveByModule.get(m.moduleId) : liveByModule.get(m.internalId);
    const matchedLive = Boolean(live);
    if (live?.moduleId) matchedModuleIds.add(live.moduleId);
    if (live?.id) matchedModuleIds.add(live.id);

    matches.push({
      internalId: m.internalId,
      canonicalId: m.canonicalId,
      moduleId: m.moduleId,
      implementationStatus: m.implementationStatus,
      matchedLive,
      liveRoute: live?.route,
    });
  }

  const orphanedLiveModules = DOCUMENTATION_SYSTEM_REGISTRY.filter(
    (e) => e.moduleId && !matchedModuleIds.has(e.moduleId) && !bundle.milestones.some((m) => m.moduleId === e.moduleId)
  ).map((e) => e.moduleId!);

  const idConflicts = bundle.milestoneAliases
    .filter((a) => a.shippedId && a.canonicalId !== a.shippedId)
    .map((a) => ({ canonicalId: a.canonicalId, shippedId: a.shippedId!, moduleId: a.moduleId ?? '' }));

  const volumeCoverage = bundle.volumes.map((v) => {
    const volMilestones = bundle.milestones.filter((m) => m.volumeId === v.id);
    return {
      volumeId: v.id,
      milestoneCount: volMilestones.length,
      completeCount: volMilestones.filter((m) => m.implementationStatus === 'complete').length,
    };
  });

  const matchedLive = matches.filter((m) => m.matchedLive).length;
  const plannedOnly = matches.filter((m) => !m.matchedLive).length;
  const masterSpecCoveragePct = Math.round((bundle.milestones.length / Math.max(1, bundle.milestones.length)) * 100);

  return {
    compiledAt: bundle.compiledAt,
    totalManifestMilestones: bundle.milestones.length,
    matchedLive,
    plannedOnly,
    orphanedLiveModules,
    idConflicts,
    volumeCoverage,
    masterSpecCoveragePct,
  };
}

export function summarizeManifestReconciliation(bundle: MasterSpecBundle = getMasterSpecBundleSync()): string {
  const report = reconcileMasterSpecWithLive(bundle);
  return [
    `Manifest Reconciliation™ — ${report.totalManifestMilestones} manifest milestones`,
    `${report.matchedLive} matched live · ${report.plannedOnly} planned only`,
    `${report.orphanedLiveModules.length} orphaned live modules`,
    `Master Spec coverage ${report.masterSpecCoveragePct}%`,
  ].join(' · ');
}

export function getReconciliationMatches(bundle: MasterSpecBundle = getMasterSpecBundleSync()): ReconciliationMatch[] {
  return reconcileMasterSpecWithLive(bundle).totalManifestMilestones > 0
    ? bundle.milestones.map((m) => {
        const live = DOCUMENTATION_SYSTEM_REGISTRY.find((e) => e.moduleId === m.moduleId || e.id === m.internalId);
        return {
          internalId: m.internalId,
          canonicalId: m.canonicalId,
          moduleId: m.moduleId,
          implementationStatus: m.implementationStatus,
          matchedLive: Boolean(live),
          liveRoute: live?.route,
        };
      })
    : [];
}

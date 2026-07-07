import {
  getMasterSpecBundleSync,
  reconcileMasterSpecWithLive,
  summarizeManifestAuthoring,
  validateMasterSpecManifest,
} from '../manifest-reconciliation';
import type { ReconciliationReport, VolumeReconciliationCoverage } from '../manifest-reconciliation/types';

export type ManifestReconciliationMetrics = {
  compiledAt: string;
  summaryLine: string;
  authoringSummary: string;
  totalMilestones: number;
  matchedLive: number;
  plannedOnly: number;
  orphanedLiveModules: number;
  idConflictCount: number;
  masterSpecCoveragePct: number;
  liveMatchPct: number;
  manifestAuthoringErrors: number;
  manifestAuthoringWarnings: number;
  volumeICoverage: VolumeReconciliationCoverage | null;
  volumeIICoverage: VolumeReconciliationCoverage | null;
  volumeCoverage: VolumeReconciliationCoverage[];
  topAuthoringIssues: string[];
};

export function buildManifestReconciliationMetrics(
  report: ReconciliationReport = reconcileMasterSpecWithLive()
): ManifestReconciliationMetrics {
  const bundle = getMasterSpecBundleSync();
  const issues = validateMasterSpecManifest(bundle);
  const volumeI = report.volumeCoverage.find((v) => v.volumeId === 'volume-i') ?? null;
  const volumeII = report.volumeCoverage.find((v) => v.volumeId === 'volume-ii') ?? null;
  const liveMatchPct = Math.round((report.matchedLive / Math.max(1, report.totalManifestMilestones)) * 100);

  return {
    compiledAt: report.compiledAt,
    summaryLine: [
      `Manifest: ${report.totalManifestMilestones} milestones`,
      `${report.matchedLive} live · ${report.plannedOnly} planned`,
      `Vol I: ${volumeI?.milestoneCount ?? 0} · Vol II: ${volumeII?.milestoneCount ?? 0}`,
      `${report.manifestAuthoringErrors} authoring errors`,
    ].join(' · '),
    authoringSummary: summarizeManifestAuthoring(bundle),
    totalMilestones: report.totalManifestMilestones,
    matchedLive: report.matchedLive,
    plannedOnly: report.plannedOnly,
    orphanedLiveModules: report.orphanedLiveModules.length,
    idConflictCount: report.idConflicts.length,
    masterSpecCoveragePct: report.masterSpecCoveragePct,
    liveMatchPct,
    manifestAuthoringErrors: report.manifestAuthoringErrors,
    manifestAuthoringWarnings: report.manifestAuthoringWarnings,
    volumeICoverage: volumeI,
    volumeIICoverage: volumeII,
    volumeCoverage: report.volumeCoverage,
    topAuthoringIssues: issues.slice(0, 6).map((i) => `[${i.severity}] ${i.code}: ${i.message}`),
  };
}

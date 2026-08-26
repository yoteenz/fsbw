import { DEFAULT_SHELL_PROPAGATION_SCOPE, FSBW_FAMILY_DERIVATION_SPRINT } from '../constants';
import type {
  FamilyDerivedMissingTargetRecord,
  FamilyShellChangeRecord,
  ShellPropagationExceptionRecord,
  ShellPropagationImpactAnalysis,
  ShellPropagationRecapturePlan,
  ShellPropagationReceipt,
  ShellPropagationScope,
  SharedShellRecord,
  StudioWorldDesignRouteManifest,
  ViewportClass,
} from '../types';
import { buildSharedShellDependencyGraph, detectDuplicatedFamilyImplementation } from './shell-graph';

const ALL_VIEWPORTS: ViewportClass[] = ['MOBILE', 'TABLET', 'DESKTOP'];

function bumpShellVersion(version: string): string {
  const m = version.match(/^(.*@v)(\d+)$/);
  if (!m) return `${version}@v2`;
  return `${m[1]}${parseInt(m[2]!, 10) + 1}`;
}

export function analyzeShellPropagationImpact(
  projectId: string,
  shell: SharedShellRecord,
  scope: ShellPropagationScope,
  manifest: StudioWorldDesignRouteManifest,
  exceptions: string[] = [],
): ShellPropagationImpactAnalysis {
  const graph = buildSharedShellDependencyGraph(projectId, manifest);
  const pageSet = manifest.projectPageSets?.find((p) => p.projectId === projectId);
  const pages = pageSet?.experiencePages ?? [];

  let affectedPageIds = [...shell.consumerPageIds];
  let affectedFamilyIds = [...shell.consumerFamilyIds];
  let affectedMaterialScreenIds: string[] = [];
  let affectedStateIds: string[] = [];
  let affectedRoutes: string[] = [];

  if (scope === 'DESIGN_FAMILY' && affectedFamilyIds.length === 1) {
    const familyId = affectedFamilyIds[0]!;
    affectedPageIds = pages.filter((p) => p.designFamilyIds.includes(familyId)).map((p) => p.experiencePageId);
  }

  if (scope === 'SHARED_SHELL_GLOBAL') {
    affectedPageIds = shell.consumerPageIds;
    affectedFamilyIds = shell.consumerFamilyIds;
  }

  affectedPageIds = affectedPageIds.filter((id) => !exceptions.includes(id));
  affectedRoutes = affectedPageIds
    .map((id) => pages.find((p) => p.experiencePageId === id)?.representativeRoute)
    .filter((r): r is string => !!r);

  for (const pageId of affectedPageIds) {
    const page = pages.find((p) => p.experiencePageId === pageId);
    if (page) {
      affectedMaterialScreenIds.push(...page.materialScreenIds.filter((id) => !exceptions.includes(id)));
      affectedStateIds.push(...page.visualStateIds.filter((id) => !exceptions.includes(id)));
    }
  }

  const duplicatedFamilyImplementation = affectedFamilyIds.some((fid) => {
    const family = manifest.designFamilies?.find((f) => f.designFamilyId === fid);
    return family ? detectDuplicatedFamilyImplementation(family, graph) : false;
  });

  const blastRadius = {
    pages: affectedPageIds.length,
    materialScreens: affectedMaterialScreenIds.length,
    states: affectedStateIds.length,
    viewportImplementations: (affectedPageIds.length + affectedMaterialScreenIds.length) * ALL_VIEWPORTS.length,
  };

  return {
    scope,
    shellId: shell.shellId,
    projectId,
    affectedFamilyIds,
    affectedPageIds,
    affectedMaterialScreenIds,
    affectedStateIds,
    affectedRoutes,
    viewportsAffected: ALL_VIEWPORTS,
    referencesPossiblyStale: affectedPageIds.filter((id) => {
      const p = pages.find((x) => x.experiencePageId === id);
      return p?.referenceStatus === 'REFERENCE_CANONICAL';
    }),
    snapshotsPossiblyStale: affectedRoutes,
    knownExceptions: exceptions,
    risk: scope === 'SHARED_SHELL_GLOBAL' ? 'HIGH' : scope === 'DESIGN_FAMILY' ? 'MEDIUM' : 'LOW',
    duplicatedFamilyImplementation,
    crossProjectBlocked: false,
    blastRadius,
    requiresFounderApproval: scope !== 'TARGET_ONLY',
  };
}

export function proposeShellChange(
  target: FamilyDerivedMissingTargetRecord,
  scope: ShellPropagationScope,
  manifest: StudioWorldDesignRouteManifest,
  shell: SharedShellRecord,
  exceptions: ShellPropagationExceptionRecord[] = [],
): FamilyShellChangeRecord {
  const impact = analyzeShellPropagationImpact(
    target.projectId,
    shell,
    scope,
    manifest,
    exceptions.map((e) => e.pageId),
  );

  return {
    changeId: `${target.projectId}:shell-change:${Date.now()}`,
    projectId: target.projectId,
    sourceTargetId: target.targetId,
    sourceFamilyId: target.sourceFamilyId,
    sourceShellId: shell.shellId,
    propagationScope: scope,
    affectedFamilyIds: impact.affectedFamilyIds,
    affectedPageIds: impact.affectedPageIds,
    affectedMaterialScreenIds: impact.affectedMaterialScreenIds,
    affectedStateIds: impact.affectedStateIds,
    beforeVersion: shell.version,
    afterVersion: scope === 'TARGET_ONLY' ? shell.version : bumpShellVersion(shell.version),
    changedComponents: scope === 'TARGET_ONLY' ? [] : shell.componentPaths,
    changedTokens: [],
    changedGeometry: [],
    founderApproved: false,
    status: scope === 'TARGET_ONLY' ? 'SHELL_CHANGE_PROPOSED' : 'SHELL_PROPAGATION_REVIEW',
    exceptions,
    createdAt: new Date().toISOString(),
  };
}

export function buildShellPropagationRecapturePlan(change: FamilyShellChangeRecord): ShellPropagationRecapturePlan {
  const targets = change.affectedPageIds.map((targetId) => ({
    targetId,
    route: targetId,
    viewports: ALL_VIEWPORTS,
  }));
  return {
    planId: `${change.changeId}:recapture`,
    shellChangeId: change.changeId,
    projectId: change.projectId,
    targets,
    fullProjectRecapture: false,
  };
}

export function applyShellPropagation(
  change: FamilyShellChangeRecord,
  shell: SharedShellRecord,
  founderApproved: boolean,
): { change: FamilyShellChangeRecord; shell: SharedShellRecord; receipt: ShellPropagationReceipt; blocked?: string } {
  if (change.propagationScope !== 'TARGET_ONLY' && !founderApproved) {
    return {
      change,
      shell,
      receipt: {} as ShellPropagationReceipt,
      blocked: 'FAIL_SHELL_PROPAGATION_WITHOUT_APPROVAL',
    };
  }

  const updatedShell =
    change.propagationScope === 'TARGET_ONLY'
      ? shell
      : { ...shell, version: change.afterVersion };

  const updatedChange: FamilyShellChangeRecord = {
    ...change,
    founderApproved: change.propagationScope === 'TARGET_ONLY' || founderApproved,
    status: change.propagationScope === 'TARGET_ONLY' ? 'SHELL_CHANGE_PROPOSED' : 'SHELL_PROPAGATED',
  };

  const receipt: ShellPropagationReceipt = {
    receiptId: `${change.changeId}:receipt`,
    changeId: change.changeId,
    projectId: change.projectId,
    scope: change.propagationScope,
    affectedPages: change.affectedPageIds.length,
    affectedRoutes: change.affectedPageIds,
    beforeShellVersion: change.beforeVersion,
    afterShellVersion: updatedShell.version,
    codeChanges: updatedChange.changedComponents,
    exceptions: updatedChange.exceptions.map((e) => e.pageId),
    referencesInvalidated: [],
    snapshotsInvalidated: change.affectedPageIds,
    recapturePlanId: `${change.changeId}:recapture`,
    createdAt: new Date().toISOString(),
  };

  return { change: updatedChange, shell: updatedShell, receipt };
}

export function rollbackShellChange(
  change: FamilyShellChangeRecord,
  shell: SharedShellRecord,
): { shell: SharedShellRecord; change: FamilyShellChangeRecord } {
  return {
    shell: { ...shell, version: change.beforeVersion },
    change: { ...change, status: 'SHELL_CHANGE_PROPOSED', afterVersion: change.beforeVersion },
  };
}

export function defaultPropagationScope(): ShellPropagationScope {
  return DEFAULT_SHELL_PROPAGATION_SCOPE;
}

export function validateCrossProjectPropagation(
  sourceProjectId: string,
  targetProjectId: string,
): boolean {
  return sourceProjectId === targetProjectId;
}

export const SHELL_PROPAGATION_SPRINT = FSBW_FAMILY_DERIVATION_SPRINT;

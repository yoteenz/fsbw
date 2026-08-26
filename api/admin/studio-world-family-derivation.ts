import type { VercelRequest, VercelResponse } from '@vercel/node';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { requireAdmin } from '../_lib/adminAuth.js';
import {
  deriveMissingTargetFromFamily,
  runFamilyDerivedMissingTargetPipeline,
  analyzeShellPropagationImpact,
  applyShellPropagation,
  proposeShellChange,
  validateCrossProjectPropagation,
  loadComposerPageRegistry,
  saveComposerPageRegistry,
  FSBW_COMPOSER_PAGE_REGISTRY_RELATIVE_PATH,
  executeVoiceLabDerivation,
  persistVoiceLabExecution,
} from '../../src/studio-os-core/route-intelligence/fsbw-missing-route-completion/index.ts';
import { runCrossProjectRouteForensicAudit, registerMissingRoutesAsDesignable, attachPageSetsToManifest, attachExperiencePagesToManifest } from '../../src/studio-os-core/route-intelligence/index.ts';
import type { ShellPropagationScope } from '../../src/studio-os-core/route-intelligence/types.ts';

/**
 * POST /api/admin/studio-world-family-derivation
 * Body: { action, projectId?, targetId?, scope?, founderApproved?, executeBuild? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const repoRoot = process.cwd();
  const body = req.body ?? {};
  const action = typeof body.action === 'string' ? body.action : 'scan';

  if (action === 'scan') {
    const { manifest: base } = runCrossProjectRouteForensicAudit({ repoRoot });
    const routes = registerMissingRoutesAsDesignable(base.rawImplementationRoutes, base.dependencyGraphs);
    const withPageSets = attachPageSetsToManifest({ ...base, rawImplementationRoutes: routes, routes: routes });
    const withExperience = attachExperiencePagesToManifest(withPageSets);
    const report = runFamilyDerivedMissingTargetPipeline({
      repoRoot,
      manifest: withExperience,
      executeBuild: false,
      includeFixtures: body.includeFixtures !== false,
    });
    return res.status(200).json({ ok: true, report });
  }

  if (action === 'derive') {
    const targetId = typeof body.targetId === 'string' ? body.targetId : '';
    const registryPath = join(repoRoot, FSBW_COMPOSER_PAGE_REGISTRY_RELATIVE_PATH);
    const registry = loadComposerPageRegistry(registryPath);
    const target = registry?.familyDerivedTargets?.find((t) => t.targetId === targetId);
    if (!target) return res.status(404).json({ error: 'Target not found' });

    const { manifest: base } = runCrossProjectRouteForensicAudit({ repoRoot });
    const candidate = {
      candidateId: target.targetId,
      projectId: target.projectId,
      displayName: target.displayName,
      representativeRoute: target.representativeRoute,
      designFamilyIds: target.sourceFamilyId ? [target.sourceFamilyId] : [],
      sourceKind: 'EXPERIENCE_PAGE' as const,
      ownership: 'FSBW' as const,
      implementationStatus: 'IMPLEMENTATION_MISSING' as const,
    };

    const result = deriveMissingTargetFromFamily(candidate, base, {
      repoRoot,
      sourceCommit: base.sourceCommit,
      executeBuild: body.executeBuild === true,
      founderOverrideSiblingId: typeof body.siblingId === 'string' ? body.siblingId : undefined,
      existingSnapshots: registry?.snapshots ?? [],
    });

    return res.status(200).json({ ok: true, result });
  }

  if (action === 'execute-voice-lab') {
    const { manifest: base } = runCrossProjectRouteForensicAudit({ repoRoot });
    const routes = registerMissingRoutesAsDesignable(base.rawImplementationRoutes, base.dependencyGraphs);
    const withPageSets = attachPageSetsToManifest({ ...base, rawImplementationRoutes: routes, routes: routes });
    const withExperience = attachExperiencePagesToManifest(withPageSets);
    const registryPath = join(repoRoot, FSBW_COMPOSER_PAGE_REGISTRY_RELATIVE_PATH);
    const registry = loadComposerPageRegistry(registryPath);

    const result = executeVoiceLabDerivation({
      repoRoot,
      sourceCommit: withExperience.sourceCommit,
      manifest: withExperience,
      founderOverrideSiblingId: typeof body.siblingId === 'string' ? body.siblingId : undefined,
      markSnapshotsCaptured: body.markSnapshotsCaptured === true,
      existingSnapshots: registry?.snapshots ?? [],
    });

    persistVoiceLabExecution(repoRoot, result, withExperience.sourceCommit);

    const shell = {
      shellId: result.parent.sharedShellId,
      projectId: 'studio-world',
      displayName: 'Character Lab Workspace Shell',
      componentPaths: result.parent.sharedComponentPaths,
      consumerPageIds: [result.parent.experiencePageId],
      consumerFamilyIds: [result.parent.designFamilyId],
      responsiveAuthority: 'CharacterLabShell',
      version: 'character-lab-shell@v1',
    };
    const blastRadius = analyzeShellPropagationImpact('studio-world', shell, 'DESIGN_FAMILY', withExperience).blastRadius;

    return res.status(200).json({ ok: true, result, blastRadius, propagationDefault: 'TARGET_ONLY' });
  }

  if (action === 'propagate') {
    const projectId = typeof body.projectId === 'string' ? body.projectId : '';
    const scope = (typeof body.scope === 'string' ? body.scope : 'TARGET_ONLY') as ShellPropagationScope;
    const targetProjectId = typeof body.targetProjectId === 'string' ? body.targetProjectId : projectId;

    if (!validateCrossProjectPropagation(projectId, targetProjectId)) {
      return res.status(400).json({ error: 'FAIL_CROSS_PROJECT_SHELL_PROPAGATION' });
    }

    const registryPath = join(repoRoot, FSBW_COMPOSER_PAGE_REGISTRY_RELATIVE_PATH);
    const registry = loadComposerPageRegistry(registryPath);
    const target = registry?.familyDerivedTargets?.find((t) => t.targetId === body.targetId);
    const shell = registry?.sharedShells?.find((s) => s.shellId === target?.shellId);
    if (!target || !shell) return res.status(404).json({ error: 'Target or shell not found' });

    const { manifest: base } = runCrossProjectRouteForensicAudit({ repoRoot });
    const impact = analyzeShellPropagationImpact(projectId, shell, scope, base, body.exceptions ?? []);
    const change = proposeShellChange(target, scope, base, shell);
    const applied = applyShellPropagation(change, shell, body.founderApproved === true);

    if (applied.blocked) {
      return res.status(400).json({ error: applied.blocked, impact });
    }

    const nextRegistry = {
      ...registry!,
      shellChanges: [...(registry!.shellChanges ?? []), applied.change],
      shellPropagations: [...(registry!.shellPropagations ?? []), applied.receipt],
      sharedShells: (registry!.sharedShells ?? []).map((s) => (s.shellId === shell.shellId ? applied.shell : s)),
    };
    saveComposerPageRegistry(registryPath, nextRegistry);

    return res.status(200).json({ ok: true, impact, change: applied.change, receipt: applied.receipt });
  }

  return res.status(400).json({ error: 'Unknown action' });
}

/** Project-specific source materialization adapters */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type {
  MaterializationApplyResult,
  Site00DesignChangeRequest,
  Site00ProjectKey,
  Site00SourceMaterializationPlan,
  Site00StructuredOperation,
} from './types.js';
import { extractExpectedTargets, normalizeTargetPath } from './operations.js';
import { PROJECT_SOURCE_ROOTS } from './constants.js';

export type MaterializerContext = {
  repoRoot: string;
  dryRun: boolean;
};

export interface Site00ProjectMaterializer {
  projectId: Site00ProjectKey;
  resolveOperationPath(op: Site00StructuredOperation): string | null;
  detectDuplicatedImplementation(op: Site00StructuredOperation): boolean;
  getCurrentShellVersion(shellId: string): string | null;
  applyOperation(op: Site00StructuredOperation, ctx: MaterializerContext): { ok: boolean; path?: string; error?: string };
}

function jsonPatchProp(content: string, prop: string, value: unknown): string {
  if (content.includes(`${prop}=`) || content.includes(`${prop}:`)) {
    return content;
  }
  return `${content}\n/* site00-bridge */ export const ${prop} = ${JSON.stringify(value)};\n`;
}

export abstract class BaseSite00Materializer implements Site00ProjectMaterializer {
  abstract projectId: Site00ProjectKey;

  resolveOperationPath(op: Site00StructuredOperation): string | null {
    if (op.targetPath) return normalizeTargetPath(op.targetPath);
    if (op.route && op.componentId) {
      return join(PROJECT_SOURCE_ROOTS[this.projectId], 'pages', `${op.route.replace(/\//g, '-')}.tsx`);
    }
    return null;
  }

  detectDuplicatedImplementation(op: Site00StructuredOperation): boolean {
    if (op.type !== 'CHANGE_SHARED_SHELL' || (op as Site00StructuredOperation & { authorizeMultiFilePropagation?: boolean }).authorizeMultiFilePropagation) return false;
    const shellId = op.shellId ?? op.componentId;
    if (!shellId) return false;
    const primary = join(this.repoScope(), 'components', 'shells', `${shellId}.tsx`);
    const duplicate = join(this.repoScope(), 'pages', '_duplicated', `${shellId}.tsx`);
    return existsSync(join(process.cwd(), primary)) && existsSync(join(process.cwd(), duplicate));
  }

  getCurrentShellVersion(shellId: string): string | null {
    const manifestPath = join(process.cwd(), this.repoScope(), 'config', 'shell-versions.json');
    if (!existsSync(manifestPath)) return null;
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, string>;
      return manifest[shellId] ?? null;
    } catch {
      return null;
    }
  }

  applyOperation(op: Site00StructuredOperation, ctx: MaterializerContext): { ok: boolean; path?: string; error?: string } {
    const rel = this.resolveOperationPath(op);
    if (!rel) return { ok: false, error: 'Could not resolve operation path' };

    const abs = join(ctx.repoRoot, rel);
    if (!existsSync(abs) && op.type !== 'ADD_SECTION' && op.type !== 'REGISTER_ROUTE') {
      return { ok: false, error: `Target file missing: ${rel}` };
    }

    if (ctx.dryRun) return { ok: true, path: rel };

    let content = existsSync(abs) ? readFileSync(abs, 'utf8') : '';
    switch (op.type) {
      case 'UPDATE_COMPONENT_PROP':
      case 'UPDATE_CONTENT_BINDING':
        content = jsonPatchProp(content, op.prop ?? 'site00Value', op.value);
        break;
      case 'UPDATE_DESIGN_TOKEN':
        content = jsonPatchProp(content, `token_${op.tokenKey?.replace(/\./g, '_')}`, op.value);
        break;
      case 'UPDATE_PAGE_METADATA':
        content = jsonPatchProp(content, 'pageMetadata', op.value ?? op.metadata);
        break;
      case 'REGISTER_ROUTE':
      case 'ADD_SECTION':
        content = content || `/* site00-bridge route */ export default function Site00BridgePlaceholder() { return null; }\n`;
        break;
      default:
        content = `${content}\n/* site00-bridge:${op.type} */\n`;
    }

    writeFileSync(abs, content, 'utf8');
    return { ok: true, path: rel };
  }

  protected repoScope(): string {
    return PROJECT_SOURCE_ROOTS[this.projectId];
  }
}

export class FrontalSlayerSite00Materializer extends BaseSite00Materializer {
  projectId = 'FRONTAL_SLAYER' as const;
}

export class AIOSite00Materializer extends BaseSite00Materializer {
  projectId = 'ALL_IN_ONE_ENTERPRISES' as const;

  resolveOperationPath(op: Site00StructuredOperation): string | null {
    if (op.targetPath) return normalizeTargetPath(op.targetPath);
    if (op.route) return join('all-in-one-enterprises/src/pages', `${op.route.replace(/^\//, '')}.tsx`);
    return null;
  }
}

export class StudioWorldWebsiteSite00Materializer extends BaseSite00Materializer {
  projectId = 'STUDIO_WORLD_WEBSITE' as const;

  resolveOperationPath(op: Site00StructuredOperation): string | null {
    if (op.targetPath) return normalizeTargetPath(op.targetPath);
    if (op.route) {
      return join('src/features/studio-world/website/pages', `${op.route.replace(/^\//, '')}.tsx`);
    }
    return null;
  }
}

const MATERIALIZERS: Record<Site00ProjectKey, Site00ProjectMaterializer> = {
  FRONTAL_SLAYER: new FrontalSlayerSite00Materializer(),
  ALL_IN_ONE_ENTERPRISES: new AIOSite00Materializer(),
  STUDIO_WORLD_WEBSITE: new StudioWorldWebsiteSite00Materializer(),
};

export function getMaterializerForProject(projectId: Site00ProjectKey): Site00ProjectMaterializer {
  return MATERIALIZERS[projectId];
}

export function compileMaterializationPlan(
  change: Site00DesignChangeRequest,
  validationStatus: Site00SourceMaterializationPlan['status'],
  blockReason?: string,
): Site00SourceMaterializationPlan {
  const targets = extractExpectedTargets(change.operations);
  const materializer = getMaterializerForProject(change.project_id);

  for (const op of change.operations) {
    const p = materializer.resolveOperationPath(op);
    if (p) targets.files.push(p);
  }

  return {
    changeRequestId: change.change_request_id,
    projectId: change.project_id,
    baseCommit: change.base_source_commit,
    targetBranch: change.target_branch,
    operations: change.operations,
    filesExpectedToChange: [...new Set(targets.files)],
    componentsExpectedToChange: targets.components,
    routesExpectedToChange: targets.routes,
    testsRequired: [`project:${change.project_id}`],
    buildRequired: true,
    riskLevel: change.risk_level ?? 'MEDIUM',
    status: validationStatus,
    blockReason,
    shell: change.shell_propagation ?? undefined,
  };
}

export function applyPlanToSource(
  plan: Site00SourceMaterializationPlan,
  ctx: MaterializerContext,
): MaterializationApplyResult {
  const materializer = getMaterializerForProject(plan.projectId);
  const filesChanged: string[] = [];
  const componentsChanged = new Set(plan.componentsExpectedToChange);
  const routesChanged = new Set(plan.routesExpectedToChange);

  if (plan.status !== 'VALID') {
    return {
      ok: false,
      dryRun: ctx.dryRun,
      plan,
      filesChanged: [],
      componentsChanged: [],
      routesChanged: [],
      error: plan.blockReason ?? plan.status,
    };
  }

  for (const op of plan.operations) {
    if (op.type === 'CHANGE_SHARED_SHELL') {
      const shellId = op.shellId ?? op.componentId;
      const expected = op.expectedShellVersion ?? plan.shell?.expectedVersion;
      if (shellId && expected) {
        const current = materializer.getCurrentShellVersion(shellId);
        if (current && current !== expected) {
          return {
            ok: false,
            dryRun: ctx.dryRun,
            plan: { ...plan, status: 'CONFLICT', blockReason: `Shell version mismatch: expected ${expected}, current ${current}` },
            filesChanged,
            componentsChanged: [...componentsChanged],
            routesChanged: [...routesChanged],
            error: 'Shell version conflict',
          };
        }
      }
      if (materializer.detectDuplicatedImplementation(op)) {
        return {
          ok: false,
          dryRun: ctx.dryRun,
          plan: {
            ...plan,
            status: 'DUPLICATED_IMPLEMENTATION_RECONCILIATION_REQUIRED',
            blockReason: 'Duplicated shell implementation requires explicit multi-file authorization',
          },
          filesChanged,
          componentsChanged: [...componentsChanged],
          routesChanged: [...routesChanged],
          error: 'Duplicated implementation',
        };
      }
    }

    const result = materializer.applyOperation(op, ctx);
    if (!result.ok) {
      return {
        ok: false,
        dryRun: ctx.dryRun,
        plan,
        filesChanged,
        componentsChanged: [...componentsChanged],
        routesChanged: [...routesChanged],
        error: result.error,
      };
    }
    if (result.path) filesChanged.push(result.path);
    if (op.componentId) componentsChanged.add(op.componentId);
    if (op.route) routesChanged.add(op.route);
  }

  return {
    ok: true,
    dryRun: ctx.dryRun,
    plan,
    filesChanged: [...new Set(filesChanged)],
    componentsChanged: [...componentsChanged],
    routesChanged: [...routesChanged],
  };
}

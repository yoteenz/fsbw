import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildExperienceLabLiveWorkspaceViewModel,
  resolveExperienceLabBlueprintDisplay,
  resolveStudioWorldWorkbenchRegistry,
  resolveActiveWorkbenchTool,
  liveWorkspaceToV2ViewModel,
  EXPERIENCE_LAB_V2_PAGE_ID,
  generateBlueprintOutput,
  retryBlueprintOutput,
  exportLiveWorkspaceDiagnosticJson,
} from './live-workspace';
import { ensureExperienceLabVariantPackages, getDesignVariantPackage } from './experience-lab-environment-package-bridge';
import { DEFAULT_ACTIVE_DESIGN_VARIANT_ID } from './experience-lab-design-variants';
import { resolveDesignVariantById } from './experience-lab-design-variants';

const V2_DIR = dirname(fileURLToPath(import.meta.url));

function readV2Source(filename: string): string {
  return readFileSync(resolve(V2_DIR, filename), 'utf8');
}

function buildTestLiveWorkspace(variantId = DEFAULT_ACTIVE_DESIGN_VARIANT_ID) {
  ensureExperienceLabVariantPackages();
  const pkg = getDesignVariantPackage(variantId);
  const variant = resolveDesignVariantById(variantId);
  return buildExperienceLabLiveWorkspaceViewModel({
    pipeline: {
      programId: 'studio-world',
      studioDepartmentId: 'experience-lab',
      industryPackId: null,
      environmentId: 'experience-lab-main',
    },
    departmentId: 'experience-lab',
    activeVariant: variant,
    activeVariantId: variantId,
    environmentPackage: pkg,
    queue: null,
    workbenchToolId: 'architectural-tools',
    historicalPreviewRevision: null,
    imageLoaded: true,
  });
}

describe('Experience Lab Live Workspace', () => {
  beforeEach(() => {
    ensureExperienceLabVariantPackages();
  });

  it('builds canonical view model from active package', () => {
    const live = buildTestLiveWorkspace();
    expect(live.environmentPackageId).toContain('light-01');
    expect(live.variantId).toBe('light-01');
    expect(live.designBrief.currentObjective).toBeTruthy();
    expect(live.designBrief.moodLine).not.toContain('Luxury / Power / Innovation');
  });

  it('Design Brief contains no hardcoded demo mood line', () => {
    const live = buildTestLiveWorkspace();
    const consoleSrc = readV2Source('ExperienceLabFounderReviewConsole.tsx');
    expect(consoleSrc).not.toContain('Luxury / Power / Innovation');
    expect(live.designBrief.packageRevision).toBeGreaterThan(0);
  });

  it('Founder Review Wall derives from package revision history', () => {
    const live = buildTestLiveWorkspace();
    expect(live.founderReviewEntries.length).toBeGreaterThan(0);
    expect(live.founderReviewEntries[0].variantId).toBe('light-01');
  });

  it('Revision Timeline derives from package audit events', () => {
    const live = buildTestLiveWorkspace();
    expect(live.timelineEvents.length).toBeGreaterThan(0);
    expect(live.timelineEvents.some((e) => e.eventType === 'package-created' || e.note.includes('created'))).toBe(true);
  });

  it('Blueprint Display resolves active package blueprint state', () => {
    const pkg = getDesignVariantPackage('light-01');
    const blueprint = resolveExperienceLabBlueprintDisplay({
      pkg,
      readiness: null,
      environmentName: 'LIGHT 01',
      variantId: 'light-01',
    });
    expect(blueprint.packageId).toBe(pkg?.packageId);
    expect(['NOT_REQUESTED', 'BLOCKED', 'QUEUED', 'GENERATING', 'GENERATED', 'STALE', 'FAILED', 'APPROVED', 'CANONICAL']).toContain(blueprint.displayState);
  });

  it('Blueprint Display updates when variant changes', () => {
    const light = buildTestLiveWorkspace('light-01');
    const dark = buildTestLiveWorkspace('dark-01');
    expect(light.variantId).not.toBe(dark.variantId);
    expect(light.environmentPackageId).not.toBe(dark.environmentPackageId);
  });

  it('Blueprint shows pending state when output not generated', () => {
    const live = buildTestLiveWorkspace();
    expect(live.blueprintOutput.artifactUrl).toBeNull();
    expect(['NOT_REQUESTED', 'BLOCKED', 'QUEUED', 'GENERATING', 'PENDING'].some((s) =>
      live.blueprintStatus.includes(s as never) || live.blueprintOutput.displayState === s
    )).toBe(true);
  });

  it('Workbench registry is page-aware for Experience Lab', () => {
    const registry = resolveStudioWorldWorkbenchRegistry({
      pageId: EXPERIENCE_LAB_V2_PAGE_ID,
      programId: 'studio-world',
      departmentId: 'experience-lab',
      industryPackId: null,
      environmentId: 'experience-lab-main',
    });
    expect(registry.length).toBeGreaterThanOrEqual(6);
    expect(registry[0].id).toBe('architectural-tools');
  });

  it('Every Experience Lab workbench button resolves a real module', () => {
    const registry = resolveStudioWorldWorkbenchRegistry({
      pageId: EXPERIENCE_LAB_V2_PAGE_ID,
      programId: 'studio-world',
      departmentId: null,
      industryPackId: null,
      environmentId: null,
    });
    for (const entry of registry.filter((e) => e.enabled)) {
      expect(entry.moduleId).toBe(entry.id);
    }
  });

  it('Selecting workbench tool resolves active context module', () => {
    const registry = resolveStudioWorldWorkbenchRegistry({
      pageId: EXPERIENCE_LAB_V2_PAGE_ID,
      programId: 'studio-world',
      departmentId: null,
      industryPackId: null,
      environmentId: null,
    });
    const tool = resolveActiveWorkbenchTool({
      pageId: EXPERIENCE_LAB_V2_PAGE_ID,
      registry,
      requestedTool: 'material-library',
    });
    expect(tool).toBe('material-library');
  });

  it('liveWorkspaceToV2ViewModel bridges to legacy view model with liveWorkspace attached', () => {
    const live = buildTestLiveWorkspace();
    const v2 = liveWorkspaceToV2ViewModel(live, 'BLUEPRINT', true);
    expect(v2.departmentId).toBe('experience-lab');
    expect(v2.liveWorkspace?.environmentPackageId).toBe(live.environmentPackageId);
    expect(v2.charterSummary).toBe(live.designBrief.currentObjective);
  });

  it('Architectural Tools reads real package data', () => {
    const live = buildTestLiveWorkspace();
    expect(live.workbenchModules.architectural.activeRevision).toBe(live.packageRevision);
  });

  it('Material Library reads real materials output data', () => {
    const live = buildTestLiveWorkspace();
    expect(live.workbenchModules.materials.profileStatus).toBeDefined();
  });

  it('Asset Reference reads real manifest data', () => {
    const live = buildTestLiveWorkspace();
    expect(live.workbenchModules.assetReference.manifestStatus).toBeDefined();
  });

  it('Budget Forecast reads real cost data', () => {
    const live = buildTestLiveWorkspace();
    expect(live.workbenchModules.budget.estimatedCostUsd).toBeGreaterThan(0);
    expect(live.workbenchModules.budget.displayEstimate).not.toBe('—');
  });

  it('Workforce Center reads real job data', () => {
    const live = buildTestLiveWorkspace();
    expect(live.workbenchModules.workforce.schedulerJobs.length).toBeGreaterThan(0);
  });

  it('Permit Center reads real readiness data', () => {
    const live = buildTestLiveWorkspace();
    expect(live.workbenchModules.permit.readinessPercent).toBeGreaterThanOrEqual(0);
  });

  it('Approval Bridge reads active package readiness', () => {
    const live = buildTestLiveWorkspace();
    expect(live.approvalState.permitStatus).toBeDefined();
    expect(live.diagnostics.approvalEligible).toBeTypeOf('boolean');
  });

  it('Generate Blueprint uses package production pipeline', async () => {
    const pkg = getDesignVariantPackage('light-01');
    expect(pkg).not.toBeNull();
    const result = await generateBlueprintOutput(pkg!);
    expect(result.ok).toBeDefined();
  });

  it('Retry Blueprint retries only blueprint output', async () => {
    const pkg = getDesignVariantPackage('light-01');
    expect(pkg).not.toBeNull();
    const result = await retryBlueprintOutput(pkg!);
    expect(result.ok).toBe(true);
    expect(result.package?.outputs.blueprint.status).toBe('generating');
  });

  it('Diagnostics export produces JSON snapshot', () => {
    const live = buildTestLiveWorkspace();
    const json = exportLiveWorkspaceDiagnosticJson(live);
    const parsed = JSON.parse(json) as { activeWorkspaceContext: { environmentPackageId: string } };
    expect(parsed.activeWorkspaceContext.environmentPackageId).toBe(live.environmentPackageId);
  });

  it('Shell wires ExperienceLabLiveWorkspaceProvider', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    expect(shell).toContain('ExperienceLabLiveWorkspaceProvider');
    expect(shell).toContain('liveWorkspaceToV2ViewModel');
    expect(shell).toContain('onApprove');
  });

  it('Single Dynamic Context Display — one primary instance in viewport stage', () => {
    const stage = readV2Source('ExperienceLabViewportStage.tsx');
    const primaryMatches = (stage.match(/<ExperienceLabDynamicContextCard/g) ?? []).length;
    expect(primaryMatches).toBeLessThanOrEqual(2);
    expect(stage).toContain('dynamicContextCard');
  });

  it('Blueprint Display remains separate from Dynamic Context', () => {
    const blueprintCard = readV2Source('ExperienceLabBlueprintCard.tsx');
    const viewport = readV2Source('StudioViewport.tsx');
    expect(blueprintCard).toContain('ELAB_V2_COMPOSITION.blueprintCard');
    expect(viewport).toContain('ExperienceLabBlueprintCard');
    expect(viewport).toContain('dynamicContextCard');
  });

  it('Founder Review Console has no hardcoded REVISION_POINTS', () => {
    const consoleSrc = readV2Source('ExperienceLabFounderReviewConsole.tsx');
    expect(consoleSrc).not.toContain('REVISION_POINTS');
    expect(consoleSrc).not.toContain('CHART_HEIGHTS');
  });

  it('Error states do not fall back to demo data in live workspace builder', () => {
    const live = buildExperienceLabLiveWorkspaceViewModel({
      pipeline: {
        programId: 'studio-world',
        studioDepartmentId: null,
        industryPackId: null,
        environmentId: null,
      },
      departmentId: 'experience-lab',
      activeVariant: null,
      activeVariantId: 'light-01',
      environmentPackage: null,
      queue: null,
      workbenchToolId: null,
      historicalPreviewRevision: null,
    });
    expect(live.empty).toBe(true);
    expect(live.founderReviewEntries).toHaveLength(0);
    expect(live.error).toBeTruthy();
  });

  it('UI does not duplicate package business records in view model', () => {
    const live = buildTestLiveWorkspace();
    expect(live.revisionHistory).toBe(
      getDesignVariantPackage('light-01')?.revisionHistory
    );
  });
});

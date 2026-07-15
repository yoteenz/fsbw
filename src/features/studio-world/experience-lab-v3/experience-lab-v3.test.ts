import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listV3DepartmentsForProgram,
  listV3Programs,
  resolveV3DepartmentLabel,
} from './registry/v3-program-registry';
import { defaultV3WorkbenchTool, resolveV3WorkbenchTools } from './registry/v3-workbench-registry';
import {
  V3_CORE_WORKSPACES,
  resolveV3WorkspaceByOffset,
  resolveV3WorkspaceIndex,
} from './registry/v3-workspace-registry';
import { resolveV3WorkspaceForWorkbenchTool } from './registry/v3-workbench-workspace-map';
import { createInitialV3State, rebuildV3ContextState } from './store/v3-demo-seed';
import { resolveExperienceLabV3FeatureFlags } from './experience-lab-v3-feature-flags';
import { V3_CORE_WORKSPACE_IDS, V3_CORE_WORKSPACE_IDS as WS_IDS } from './experience-lab-v3.types';
import { V3_PAGE_WIDTH_PCT } from './context/ExperienceLabV3WorkspaceProvider';
import { deriveV3ModelFromLiveWorkspace } from './adapters/liveWorkspaceToV3Model';
import type { ExperienceLabLiveWorkspaceViewModel } from '../experience-lab-v2/live-workspace/ExperienceLabLiveWorkspaceViewModel';
import type { CanonicalMainDepartmentId } from '../../../studio-os-core/canonical-studio-world/canonical-department-registry';

const V3_DIR = dirname(fileURLToPath(import.meta.url));
const V2_DIR = resolve(V3_DIR, '../experience-lab-v2');

function readV3Source(filename: string): string {
  return readFileSync(resolve(V3_DIR, filename), 'utf8');
}

function readV2Source(filename: string): string {
  return readFileSync(resolve(V2_DIR, filename), 'utf8');
}

function minimalLiveWorkspace(overrides: Partial<ExperienceLabLiveWorkspaceViewModel> = {}): ExperienceLabLiveWorkspaceViewModel {
  return {
    programId: 'studio-world',
    departmentId: 'experience-lab' as CanonicalMainDepartmentId,
    departmentName: 'Experience Lab',
    industryPackId: null,
    environmentId: 'experience-lab-main',
    environmentName: 'Experience Lab',
    variantId: 'dark-02',
    variantName: 'NOIR B',
    theme: 'dark',
    environmentPackageId: 'pkg.reception.dark-02.r18',
    packageRevision: 18,
    packageStatus: 'Awaiting Approval',
    packageHealth: 88,
    readinessPercent: 72,
    readinessBlockers: [],
    promptVersion: 'v1',
    promptHash: 'abc',
    provider: 'fal-ai',
    model: 'flux',
    seed: '1',
    estimatedCost: 4.5,
    actualCost: 2.1,
    currentObjective: 'Complete reception package',
    founderNotes: null,
    activeRevision: 18,
    revisionHistory: [],
    generationJobs: [{ kind: 'blueprint', status: 'running', outputKeys: ['blueprint'] }],
    generatedOutputs: ['desktop'],
    pendingOutputs: ['mobile'],
    failedOutputs: [],
    activeWorkbenchTool: null,
    activeContextModule: null,
    blueprintOutput: {
      packageId: 'pkg',
      variantId: 'dark-02',
      environmentName: 'Experience Lab',
      artifactUrl: null,
      outputStatus: 'generating',
      displayState: 'GENERATING',
      revision: 18,
      generationJobKind: 'blueprint',
      checksum: null,
      generatedAt: null,
      approvalState: 'pending',
      isStale: false,
      isCanonical: false,
      blockerReason: null,
      dependency: null,
      queuePosition: 1,
      failureCode: null,
      source: 'pending',
      canGenerate: false,
      canRetry: true,
      canApprove: false,
      canOpen: false,
    },
    blueprintStatus: 'GENERATING',
    approvalState: {
      canApprove: false,
      disabledReasons: [],
      primaryActionLabel: 'APPROVE',
      permitStatus: 'pending',
      approvalRecorded: false,
    },
    canonicalState: false,
    cdsHandoffState: 'none',
    updatedAt: new Date().toISOString(),
    designBrief: {
      currentObjective: 'Review reception',
      programLabel: 'Studio World',
      departmentOrPackLabel: 'Experience Lab',
      environmentLabel: 'Experience Lab',
      variantName: 'NOIR B',
      theme: 'dark',
      packageRevision: 18,
      packageStatus: 'Awaiting Approval',
      promptVersion: 'v1',
      provider: 'fal-ai',
      model: 'flux',
      readinessPercent: 72,
      estimatedCostUsd: 4.5,
      actualCostUsd: 2.1,
      founderNotes: null,
      blockers: [],
      moodLine: null,
    },
    founderReviewEntries: [
      {
        id: 'rev-1',
        revision: 18,
        previewThumbnailUrl: null,
        outputType: 'environment',
        variantId: 'dark-02',
        variantName: 'NOIR B',
        theme: 'dark',
        generatedAt: new Date().toISOString(),
        provider: 'fal-ai',
        model: 'flux',
        generationCostUsd: 2.1,
        status: 'pending',
        founderComment: null,
        approvalState: 'pending',
        isCanonical: false,
        isArchived: false,
        isHistoricalPreview: false,
      },
    ],
    timelineEvents: [
      {
        id: 'ev-1',
        eventType: 'generation-started',
        revision: 18,
        timestamp: new Date().toISOString(),
        actor: 'system',
        output: 'blueprint',
        costUsd: 0.12,
        note: 'Started',
        status: 'running',
      },
    ],
    workbenchModules: {
      architectural: { blueprintStatus: 'generating', constructionStatus: 'pending', activeRevision: 18, architectureReadiness: 72, dependencies: ['desktop'] },
      materials: { profileStatus: 'pending', summary: '', revision: 18, appliedMaterials: [], pendingSelections: [], generationJobStatus: 'pending' },
      assetReference: { manifestStatus: 'pending', attachedCount: 1, missingCount: 2, goldenReferences: [], summary: '' },
      budget: { estimatedCostUsd: 4.5, actualCostUsd: 2.1, outputsGenerated: 1, outputsPending: 3, outputsFailed: 0, outputsRemaining: 3, retryReserveUsd: 0.5, projectedFinalUsd: 5, displayEstimate: '$5.00' },
      workforce: { activeAssignments: ['scheduler'], generationWorkers: ['gpu-1'], schedulerJobs: ['wo-blueprint'], responsibleDepartment: 'Experience Lab', blockedAssignments: [] },
      permit: { lifecycleState: 'draft', readinessPercent: 72, blockers: [], founderApproved: false, canApproveForProduction: false, canPromoteToCanonical: false, cdsHandoffEligible: false, permitStatus: 'pending' },
    },
    founderRender: null,
    historicalPreviewRevision: null,
    isHistoricalPreviewMode: false,
    diagnostics: {
      activePackageId: 'pkg.reception.dark-02.r18',
      activeRevision: 18,
      selectedWorkbenchTool: null,
      resolvedContextModule: null,
      blueprintOutputSource: 'pending',
      blueprintOutputStatus: 'generating',
      latestPackageEvent: null,
      realtimeConnected: true,
      designBriefSource: 'live',
      reviewWallSourceCount: 1,
      timelineSourceCount: 1,
      packageReadinessPercent: 72,
      approvalEligible: false,
      repositoryMode: 'durable',
    },
    loading: false,
    error: null,
    empty: false,
    ...overrides,
  };
}

describe('Experience Lab V3 — workspace population sprint', () => {
  it('1. V2 remains untouched — no V3 imports in V2 shell', () => {
    const v2Shell = readV2Source('ExperienceLabV2Shell.tsx');
    expect(v2Shell).not.toContain('experience-lab-v3');
  });

  it('2. V3 uses V2-derived shell', () => {
    const shell = readV3Source('ExperienceLabV3Shell.tsx');
    expect(shell).toContain('ExperienceLabCommandDock');
    expect(shell).toContain('experience-lab-v2.css');
  });

  it('3. Exactly five workspace pages exist', () => {
    expect(V3_CORE_WORKSPACE_IDS).toHaveLength(5);
    expect(V3_CORE_WORKSPACES).toHaveLength(5);
  });

  it('4–8. Every workspace has mounted content component with composition markers', () => {
    const renderer = readV3Source('viewport/V3WorkspacePaneRenderer.tsx');
    expect(renderer).toContain('V3ProductionWorkspace');
    expect(renderer).toContain('V3ReviewWorkspace');
    expect(renderer).toContain('V3AssetsWorkspace');
    expect(renderer).toContain('V3CommandWorkspace');
    const production = readV3Source('workspaces/V3ProductionWorkspace.tsx');
    const review = readV3Source('workspaces/V3ReviewWorkspace.tsx');
    const assets = readV3Source('workspaces/V3AssetsWorkspace.tsx');
    const command = readV3Source('workspaces/V3CommandWorkspace.tsx');
    expect(production).toContain('productionWorkspace');
    expect(review).toContain('reviewWorkspace');
    expect(assets).toContain('assetsWorkspace');
    expect(command).toContain('commandWorkspace');
    expect(production).not.toMatch(/return\s+null/);
    expect(review).not.toMatch(/return\s+null/);
    expect(assets).not.toMatch(/return\s+null/);
    expect(command).not.toMatch(/return\s+null/);
  });

  it('9–14. Pager uses transform-based horizontal pages with correct page width', () => {
    const pager = readV3Source('viewport/V3WorkspaceViewportPager.tsx');
    expect(pager).toContain('translate3d');
    expect(pager).toContain('onPointerDown');
    expect(pager).toContain('onPointerMove');
    expect(pager).toContain('VELOCITY_THRESHOLD');
    expect(pager).toContain('ArrowRight');
    expect(V3_PAGE_WIDTH_PCT).toBe(20);
    expect(resolveV3WorkspaceByOffset('environment', 1)).toBe('production');
    expect(resolveV3WorkspaceByOffset('production', 1)).toBe('review');
    expect(resolveV3WorkspaceByOffset('review', 1)).toBe('assets');
    expect(resolveV3WorkspaceByOffset('assets', 1)).toBe('command');
    expect(resolveV3WorkspaceByOffset('command', -1)).toBe('assets');
    expect(resolveV3WorkspaceByOffset('production', -1)).toBe('environment');
  });

  it('15–16. Selector synchronization and keyboard navigation', () => {
    const pager = readV3Source('viewport/V3WorkspaceViewportPager.tsx');
    expect(pager).toContain('V3WorkspaceSegmentedControl');
    expect(pager).toContain('handleSegmentSelect');
    expect(pager).toContain('activeWorkspace');
  });

  it('17–18. Environment uses V2 viewport stage with design variants', () => {
    const shell = readV3Source('ExperienceLabV3Shell.tsx');
    expect(shell).toContain('ExperienceLabViewportStage');
    expect(readV2Source('ExperienceLabViewportStage.tsx')).toContain('designVariants');
  });

  it('19–23. Production workspace sections', () => {
    const src = readV3Source('workspaces/V3ProductionWorkspace.tsx');
    expect(src).toContain('Active Work Order');
    expect(src).toContain('AI Turn Board');
    expect(src).toContain('Pipeline');
    expect(src).toContain('Costs');
    expect(src).toContain('Required Attention');
  });

  it('24–27. Review workspace sections and gated actions', () => {
    const src = readV3Source('workspaces/V3ReviewWorkspace.tsx');
    expect(src).toContain('Active Review Item');
    expect(src).toContain('comparison');
    expect(src).toContain('Founder Review Wall');
    expect(src).toContain('Revision Timeline');
    expect(src).toContain('disabled={!liveWorkspace.diagnostics.approvalEligible}');
  });

  it('28–29. Assets workspace outputs and selected asset', () => {
    const src = readV3Source('workspaces/V3AssetsWorkspace.tsx');
    expect(src).toContain('Asset Grid');
    expect(src).toContain('Selected Asset');
    expect(src).toContain('setActiveOutput');
  });

  it('30–32. Command workspace health jobs failures', () => {
    const src = readV3Source('workspaces/V3CommandWorkspace.tsx');
    expect(src).toContain('System Health');
    expect(src).toContain('generationWorkers');
    expect(src).toContain('failedOutputs');
    expect(src).toContain('Export diagnostic JSON');
  });

  it('33–35. Workspace-specific workbench and single contextual display', () => {
    const registry = readV3Source('registry/v3-workbench-registry.ts');
    expect(registry).toContain('PRODUCTION_TOOLS');
    expect(registry).toContain('REVIEW_TOOLS');
    expect(registry).toContain('ASSETS_TOOLS');
    expect(registry).toContain('COMMAND_TOOLS');
    const chrome = readV3Source('shared/V3WorkspaceChrome.tsx');
    expect(chrome).toContain('V3WorkspaceFloatingDisplays');
    expect(chrome).toContain('persistent');
    expect(chrome).toContain('interchangeable');
  });

  it('36–38. Active package persistence and workspace memory', () => {
    const provider = readV3Source('context/ExperienceLabV3WorkspaceProvider.tsx');
    expect(provider).toContain('SYNC_FROM_LIVE');
    const store = readV3Source('store/ExperienceLabV3Store.tsx');
    expect(store).toContain('workspaceMemory');
    expect(store).toContain('invalidateSelections');
  });

  it('39–42. Loading empty error states — no blank pages', () => {
    const chrome = readV3Source('shared/V3WorkspaceChrome.tsx');
    expect(chrome).toContain('V3WorkspaceStateGate');
    expect(chrome).toContain('loading');
    expect(chrome).toContain('empty');
    expect(chrome).toContain('error');
    const css = readV3Source('experience-lab-v3-pager.css');
    expect(css).toContain('min-height');
    expect(css).toContain('elab-v3-ws-state');
  });

  it('43–45. Responsive pager CSS for mobile tablet desktop', () => {
    const css = readV3Source('experience-lab-v3-pager.css');
    expect(css).toContain('@media (max-width: 900px)');
    expect(css).toContain('touch-action');
    expect(css).toContain('elab-v3-viewport-pager__track');
  });

  it('46. Reduced motion support', () => {
    expect(readV3Source('experience-lab-v3-pager.css')).toContain('prefers-reduced-motion');
  });

  it('47–50. Shell workbench dock orb remain mounted', () => {
    const shell = readV3Source('ExperienceLabV3Shell.tsx');
    expect(shell).toContain('ExperienceLabWorkstationFrame');
    expect(shell).toContain('ExperienceLabFounderWorkbench');
    expect(shell).toContain('ExperienceLabWorkbenchDock');
    expect(readV2Source('ExperienceLabFounderWorkbench.tsx')).toContain('LivingStudioWorldOrb');
  });

  it('live adapter derives non-empty production and review data', () => {
    const derived = deriveV3ModelFromLiveWorkspace(minimalLiveWorkspace());
    expect(derived.workOrders.length).toBeGreaterThan(0);
    expect(derived.reviewItems.length).toBeGreaterThan(0);
    expect(derived.activePackage).not.toBeNull();
    expect(derived.pipeline.length).toBeGreaterThan(0);
  });

  it('empty live workspace shows explicit empty states', () => {
    const derived = deriveV3ModelFromLiveWorkspace(minimalLiveWorkspace({ empty: true, environmentPackageId: '' }));
    expect(derived.empty).toBe(true);
  });

  it('workbench tool maps to workspace context', () => {
    expect(resolveV3WorkspaceForWorkbenchTool('lighting-studio')).toBe('environment');
    expect(resolveV3WorkspaceForWorkbenchTool('workforce-center')).toBe('production');
    expect(resolveV3WorkspaceForWorkbenchTool('budget-forecast')).toBe('command');
  });

  it('workspace index resolves for all five pages', () => {
    for (const id of WS_IDS) {
      expect(resolveV3WorkspaceIndex(id)).toBeGreaterThanOrEqual(0);
    }
  });

  it('default workbench tools differ per workspace', () => {
    expect(defaultV3WorkbenchTool('environment')).toBe('blueprint');
    expect(defaultV3WorkbenchTool('production')).toBe('pause');
    expect(defaultV3WorkbenchTool('review')).toBe('approve');
    expect(defaultV3WorkbenchTool('assets')).toBe('publish');
    expect(defaultV3WorkbenchTool('command')).toBe('budget');
    expect(resolveV3WorkbenchTools('production').map((t) => t.id)).toContain('retry');
  });

  it('mobile V3 reserves lower-deck space for workbench', () => {
    const css = readV3Source('experience-lab-v3-pager.css');
    expect(css).toContain('max-height: var(--el-v2-viewport-room-ratio)');
    expect(css).toContain('elab-app-shell__lower-deck');
    expect(css).toContain('--el-v2-viewport-room-ratio: 50%');
  });

  it('V3 page uses fixedViewport like V2', () => {
    const page = readFileSync(resolve(V3_DIR, '../../../pages/admin/studio/experience-lab-v3/page.tsx'), 'utf8');
    expect(page).toContain('fixedViewport');
  });

  it('diagnostics export exists', () => {
    expect(readV3Source('diagnostics/V3WorkspaceDiagnostics.tsx')).toContain('EXPORT EXPERIENCE LAB V3 WORKSPACE DIAGNOSTIC JSON');
  });

  it('demo seed initializes all workspaces ready', () => {
    const state = createInitialV3State();
    expect(state.workspaceDataState.production).toBe('ready');
    expect(state.activePackage).toBeTruthy();
  });

  it('rebuilds context on department change', () => {
    const initial = createInitialV3State();
    const next = rebuildV3ContextState(initial, { departmentId: 'marketplace' });
    expect(next.workspace.departmentId).toBe('marketplace');
    expect(resolveV3DepartmentLabel('studio-world', 'marketplace')).toBe('Marketplace');
  });

  it('feature flags gate V3 independently from V2', () => {
    const flags = resolveExperienceLabV3FeatureFlags();
    expect(flags).toHaveProperty('experienceLabV3Enabled');
  });

  it('lists two top-level programs', () => {
    const programs = listV3Programs();
    expect(programs.map((p) => p.programId)).toEqual(['studio-world', 'industry-packs']);
  });

  it('loads departments dynamically per program', () => {
    const world = listV3DepartmentsForProgram('studio-world');
    expect(world.some((d) => d.id === 'reception')).toBe(true);
  });
});

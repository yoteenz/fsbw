import { describe, expect, it, beforeEach } from 'vitest';
import {
  EXPERIENCE_LAB_V2_ROUTE,
  EXPERIENCE_LAB_V2_ALIAS_ROUTE,
  STUDIO_VIEWPORT_MODES,
} from './experience-lab-v2.types';
import {
  experienceLabV2ViewModelAdapter,
  parseViewportModeFromQuery,
  viewportModeToQuery,
} from './experience-lab-v2-view-model-adapter';
import { evaluateExperienceLabV2Approval } from './experience-lab-v2-approval';
import { buildFounderRenderJobView } from '../../../studio-os-core/founder-render';
import { buildCanonicalDepartmentConstructionPlan } from '../../../studio-os-core/canonical-studio-world/canonical-department-construction-plan';
import {
  canPerformProductionWrite,
  readExperienceLabV2TestMode,
  requiresLiveConfirmation,
  writeExperienceLabV2TestMode,
} from './experience-lab-v2-test-modes';
import { resolveExperienceLabV2FeatureFlags } from './experience-lab-v2-feature-flags';
import { isStudioWorldAdminOnlyPath } from '../../../studio-os-core/canonical-studio-world/permission-model';

describe('Experience Lab V2 — Routes', () => {
  it('defines canonical V2 route and alias', () => {
    expect(EXPERIENCE_LAB_V2_ROUTE).toBe('/admin/studio/experience-lab-v2');
    expect(EXPERIENCE_LAB_V2_ALIAS_ROUTE).toBe('/admin/studio/experience-lab/test-v2');
  });

  it('legacy production route remains separate', () => {
    expect(isStudioWorldAdminOnlyPath('/admin/studio/experience-lab')).toBe(true);
    expect(isStudioWorldAdminOnlyPath('/admin/studio/experience-lab-v2')).toBe(true);
    expect(isStudioWorldAdminOnlyPath('/admin/studio/experience-lab/safe')).toBe(true);
  });
});

describe('Experience Lab V2 — StudioViewport modes', () => {
  it('supports all required viewport modes', () => {
    expect(STUDIO_VIEWPORT_MODES).toContain('BLUEPRINT');
    expect(STUDIO_VIEWPORT_MODES).toContain('FOUNDER_RENDER');
    expect(STUDIO_VIEWPORT_MODES).toContain('CONSTRUCTION_PLAN');
    expect(STUDIO_VIEWPORT_MODES).toContain('SPLIT_VIEW');
    expect(STUDIO_VIEWPORT_MODES).toContain('LOADING');
    expect(STUDIO_VIEWPORT_MODES).toContain('ERROR');
  });

  it('parses and serializes view query state', () => {
    expect(parseViewportModeFromQuery('?view=blueprint')).toBe('BLUEPRINT');
    expect(parseViewportModeFromQuery('?view=founder-render')).toBe('FOUNDER_RENDER');
    expect(parseViewportModeFromQuery('?view=split')).toBe('SPLIT_VIEW');
    expect(viewportModeToQuery('BLUEPRINT')).toBe('blueprint');
    expect(viewportModeToQuery('SPLIT_VIEW')).toBe('split');
  });

  it('blueprint and founder render are distinct artifact keys', () => {
    const model = experienceLabV2ViewModelAdapter({
      program: 'studio-world',
      departmentId: 'experience-lab',
      viewportMode: 'SPLIT_VIEW',
      queue: null,
      useMock: true,
    });
    expect(model.artifacts.blueprint?.kind).toBe('blueprint');
    expect(model.artifacts.founderRender?.kind).toBe('founder-render');
    expect(model.artifacts.blueprint?.kind).not.toBe(model.artifacts.founderRender?.kind);
  });
});

describe('Experience Lab V2 — Approval & test modes', () => {
  const built = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
  const plan = built.ok ? built.plan : null;

  it('approval disabled in read-only mode', () => {
    const job = plan
      ? buildFounderRenderJobView({ plan, job: { status: 'ready', previewArtifactUrl: 'https://example.com/render.png', blueprintRevision: plan.metadata.revision } })
      : null;
    const approval = evaluateExperienceLabV2Approval({
      founderRender: job,
      imageLoaded: true,
      blueprintRevision: plan?.metadata.revision ?? 1,
      testMode: 'READ_ONLY',
      approvalRecorded: false,
      hasAdminPermission: true,
    });
    expect(approval.canApprove).toBe(false);
    expect(approval.disabledReasons.some((r) => r.includes('READ_ONLY'))).toBe(true);
  });

  it('mock mode performs no writes', () => {
    expect(canPerformProductionWrite('MOCK')).toBe(false);
    expect(canPerformProductionWrite('READ_ONLY')).toBe(false);
    expect(canPerformProductionWrite('CONTROLLED_LIVE')).toBe(true);
  });

  it('controlled live requires confirmation', () => {
    expect(requiresLiveConfirmation('CONTROLLED_LIVE')).toBe(true);
    expect(requiresLiveConfirmation('MOCK')).toBe(false);
  });

  it('approval disabled when stale', () => {
    const job = plan
      ? buildFounderRenderJobView({
          plan,
          job: { status: 'stale', previewArtifactUrl: 'https://example.com/old.png', blueprintRevision: 0 },
        })
      : null;
    const approval = evaluateExperienceLabV2Approval({
      founderRender: job,
      imageLoaded: true,
      blueprintRevision: plan?.metadata.revision ?? 1,
      testMode: 'CONTROLLED_LIVE',
      approvalRecorded: false,
      hasAdminPermission: true,
    });
    expect(approval.canApprove).toBe(false);
  });
});

describe('Experience Lab V2 — View model adapter', () => {
  it('maps production contracts into V2 presentation model', () => {
    const model = experienceLabV2ViewModelAdapter({
      program: 'studio-world',
      departmentId: 'experience-lab',
      viewportMode: 'BLUEPRINT',
      queue: null,
    });
    expect(model.version).toBe('experience-lab-v2.v1');
    expect(model.departmentName.length).toBeGreaterThan(0);
    expect(model.charterSummary.length).toBeGreaterThan(0);
    expect(model.artifacts.blueprint).toBeDefined();
    expect(model.artifacts.construction).toBeDefined();
  });

  it('inspector module selection maps to viewport modes', () => {
    expect(parseViewportModeFromQuery('?view=construction')).toBe('CONSTRUCTION_PLAN');
    expect(parseViewportModeFromQuery('?view=materials')).toBe('MATERIALS');
    expect(parseViewportModeFromQuery('?view=lighting')).toBe('LIGHTING');
    expect(parseViewportModeFromQuery('?view=camera')).toBe('CAMERA');
  });
});

describe('Experience Lab V2 — Feature flags & persistence', () => {
  beforeEach(() => {
    writeExperienceLabV2TestMode('READ_ONLY');
  });

  it('defaults test mode to READ_ONLY', () => {
    expect(readExperienceLabV2TestMode()).toBe('READ_ONLY');
  });

  it('resolves feature flag structure', () => {
    const flags = resolveExperienceLabV2FeatureFlags();
    expect(flags).toHaveProperty('experienceLabV2Enabled');
    expect(flags).toHaveProperty('experienceLabV2LiveActionsEnabled');
    expect(flags).toHaveProperty('experienceLabV2EnvironmentAssetEnabled');
  });
});

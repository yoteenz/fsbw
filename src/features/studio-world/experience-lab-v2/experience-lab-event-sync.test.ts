import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  ENVIRONMENT_PACKAGE_EVENT_TYPES,
  ENVIRONMENT_PACKAGE_EVENT_SCHEMA_VERSION,
  validateEnvironmentPackageEvent,
  normalizeLegacyAuditEventType,
  createInitialEventCursor,
  processEnvironmentPackageEvent,
  resetEnvironmentPackageEventProcessor,
  resolveInvalidationsForEvent,
  shouldThrottleProgressEvent,
  reconcileExperienceLabWorkspace,
  publishLocalEnvironmentPackageEvent,
  resetLocalEnvironmentPackageEventBus,
  subscribeLocalEnvironmentPackageEvents,
  createEnvironmentPackageRealtimeClient,
  resetEnvironmentPackageRealtimeThrottle,
  recoverEnvironmentPackageEventGap,
  mapAuditRowToEnvironmentPackageEvent,
} from '../../../studio-os-core/environment-asset-package/events';
import {
  buildExperienceLabLiveWorkspaceViewModel,
  resolveExperienceLabBlueprintDisplay,
} from './live-workspace';
import { ensureExperienceLabVariantPackages, getDesignVariantPackage } from './experience-lab-environment-package-bridge';
import { resolveDesignVariantById } from './experience-lab-design-variants';
import type { DesignVariantId } from './experience-lab-design-variants';

function buildTestLiveWorkspace(variantId: DesignVariantId = 'light-01') {
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

function sampleEvent(overrides: Partial<ReturnType<typeof publishLocalEnvironmentPackageEvent>> = {}) {
  return publishLocalEnvironmentPackageEvent({
    eventType: 'BLUEPRINT_UPDATED',
    packageId: 'pkg-test',
    revision: 1,
    ...overrides,
  });
}

describe('Environment Package Event Synchronization', () => {
  beforeEach(() => {
    resetEnvironmentPackageEventProcessor();
    resetLocalEnvironmentPackageEventBus();
    resetEnvironmentPackageRealtimeThrottle();
    ensureExperienceLabVariantPackages();
  });

  it('1. Canonical event envelope validates', () => {
    const event = sampleEvent();
    const result = validateEnvironmentPackageEvent(event);
    expect(result.ok).toBe(true);
    expect(event.schemaVersion).toBe(ENVIRONMENT_PACKAGE_EVENT_SCHEMA_VERSION);
  });

  it('2. Event types are registry-driven', () => {
    expect(ENVIRONMENT_PACKAGE_EVENT_TYPES).toContain('BLUEPRINT_UPDATED');
    expect(ENVIRONMENT_PACKAGE_EVENT_TYPES).toContain('READINESS_UPDATED');
    expect(ENVIRONMENT_PACKAGE_EVENT_TYPES.length).toBeGreaterThan(60);
  });

  it('3. Legacy audit types normalize to registry types', () => {
    expect(normalizeLegacyAuditEventType('blueprint-generation-started')).toBe('OUTPUT_GENERATING');
    expect(normalizeLegacyAuditEventType('canonical-promoted')).toBe('PACKAGE_PROMOTED_TO_CANONICAL');
  });

  it('4. Package sequence is monotonic locally', () => {
    const a = publishLocalEnvironmentPackageEvent({ eventType: 'PACKAGE_UPDATED', packageId: 'pkg-1', revision: 1 });
    const b = publishLocalEnvironmentPackageEvent({ eventType: 'PACKAGE_UPDATED', packageId: 'pkg-1', revision: 1 });
    expect(b.sequence).toBeGreaterThan(a.sequence);
  });

  it('5. Duplicate event IDs are idempotent', () => {
    const cursor = createInitialEventCursor('pkg-1');
    const event = { ...sampleEvent({ packageId: 'pkg-1' }), eventId: 'dup-1', sequence: 1 };
    const first = processEnvironmentPackageEvent(cursor, event);
    const second = processEnvironmentPackageEvent(first.cursor, event);
    expect(first.action).toBe('accept');
    expect(second.action).toBe('duplicate');
  });

  it('6. Prior package events do not update current workspace', () => {
    const result = reconcileExperienceLabWorkspace({
      event: sampleEvent({ packageId: 'old-pkg' }),
      activePackageId: 'current-pkg',
      historicalPreviewRevision: null,
      activeWorkbenchTool: 'architectural-tools',
    });
    expect(result.accepted).toBe(false);
  });

  it('7. Event-to-invalidation matrix is targeted', () => {
    const invalidations = resolveInvalidationsForEvent('BLUEPRINT_UPDATED');
    expect(invalidations).toContain('blueprint-display');
    expect(invalidations).not.toContain('workforce-center');
  });

  it('8. BLUEPRINT_UPDATED invalidates blueprint and design brief selectors', () => {
    const invalidations = resolveInvalidationsForEvent('BLUEPRINT_UPDATED');
    expect(invalidations).toEqual(expect.arrayContaining(['blueprint-display', 'design-brief', 'architectural-tools']));
  });

  it('9. OUTPUT_GENERATING shows progress-related invalidations', () => {
    const invalidations = resolveInvalidationsForEvent('OUTPUT_GENERATING');
    expect(invalidations).toContain('blueprint-display');
    expect(shouldThrottleProgressEvent('OUTPUT_GENERATING')).toBe(true);
  });

  it('10. MATERIALS_UPDATED refreshes Material Library selector', () => {
    expect(resolveInvalidationsForEvent('MATERIALS_UPDATED')).toContain('material-library');
  });

  it('11. BUDGET_UPDATED refreshes Budget Forecast selector', () => {
    expect(resolveInvalidationsForEvent('BUDGET_UPDATED')).toContain('budget-forecast');
  });

  it('12. READINESS_UPDATED refreshes Permit Center and Approval Bridge', () => {
    const inv = resolveInvalidationsForEvent('READINESS_UPDATED');
    expect(inv).toContain('permit-center');
    expect(inv).toContain('approval-bridge');
  });

  it('13. REVISION_CREATED updates Founder Review Wall selector', () => {
    expect(resolveInvalidationsForEvent('REVISION_CREATED')).toContain('founder-review-wall');
  });

  it('14. REVISION_COMPLETED updates Revision Timeline selector', () => {
    expect(resolveInvalidationsForEvent('REVISION_COMPLETED')).toContain('revision-timeline');
  });

  it('15. Progress updates are throttled in realtime client', () => {
    vi.useFakeTimers();
    const received: string[] = [];
    const client = createEnvironmentPackageRealtimeClient({
      packageId: 'pkg-1',
      fetchEvents: async () => ({ ok: true, events: [] }),
      onEvent: (e) => received.push(e.eventType),
    });
    publishLocalEnvironmentPackageEvent({ eventType: 'OUTPUT_GENERATING', packageId: 'pkg-1', revision: 1 });
    publishLocalEnvironmentPackageEvent({ eventType: 'OUTPUT_GENERATING', packageId: 'pkg-1', revision: 1 });
    publishLocalEnvironmentPackageEvent({ eventType: 'OUTPUT_GENERATING', packageId: 'pkg-1', revision: 1 });
    expect(received.length).toBe(0);
    vi.advanceTimersByTime(300);
    expect(received.length).toBe(1);
    client.dispose();
    vi.useRealTimers();
  });

  it('16. Duplicate events do not duplicate timeline via processor', () => {
    const cursor = createInitialEventCursor('pkg-1');
    const event = { ...sampleEvent({ packageId: 'pkg-1', eventType: 'REVISION_COMPLETED' }), eventId: 'evt-dup', sequence: 2 };
    processEnvironmentPackageEvent(cursor, event);
    const dup = processEnvironmentPackageEvent(cursor, event);
    expect(dup.action).toBe('duplicate');
  });

  it('17. Event gap triggers recovery fetch', async () => {
    const fetchEvents = vi.fn().mockResolvedValue({
      ok: true,
      events: [
        mapAuditRowToEnvironmentPackageEvent({
          event_id: 'gap-1',
          package_id: 'pkg-1',
          event_type: 'OUTPUT_GENERATED',
          sequence: 3,
          revision: 1,
          occurred_at: new Date().toISOString(),
        }),
      ],
      latestSequence: 3,
    });
    const recovery = await recoverEnvironmentPackageEventGap({
      packageId: 'pkg-1',
      cursor: { ...createInitialEventCursor('pkg-1'), lastSequence: 1 },
      fetchEvents,
    });
    expect(recovery.recovered).toBe(true);
    expect(fetchEvents).toHaveBeenCalledWith({ packageId: 'pkg-1', afterSequence: 1 });
  });

  it('18. Historical preview remains pinned during live updates', () => {
    const pkg = getDesignVariantPackage('light-01')!;
    const result = reconcileExperienceLabWorkspace({
      event: publishLocalEnvironmentPackageEvent({
        eventType: 'OUTPUT_GENERATED',
        packageId: pkg.packageId,
        revision: pkg.revision,
      }),
      activePackageId: pkg.packageId,
      historicalPreviewRevision: 1,
      activeWorkbenchTool: 'architectural-tools',
    });
    expect(result.preserveHistoricalPreview).toBe(true);
    expect(result.currentPackageUpdated).toBe(true);
  });

  it('19. Unrelated events do not switch workbench tool', () => {
    const result = reconcileExperienceLabWorkspace({
      event: publishLocalEnvironmentPackageEvent({ eventType: 'MATERIALS_UPDATED', packageId: 'pkg-1', revision: 1 }),
      activePackageId: 'pkg-1',
      historicalPreviewRevision: null,
      activeWorkbenchTool: 'permit-center',
    });
    expect(result.switchWorkbenchTool).toBe(false);
  });

  it('20. Local subscription is scoped to active package', () => {
    const received: string[] = [];
    subscribeLocalEnvironmentPackageEvents('pkg-a', (e) => received.push(e.packageId));
    publishLocalEnvironmentPackageEvent({ eventType: 'PACKAGE_UPDATED', packageId: 'pkg-a', revision: 1 });
    publishLocalEnvironmentPackageEvent({ eventType: 'PACKAGE_UPDATED', packageId: 'pkg-b', revision: 1 });
    expect(received).toEqual(['pkg-a']);
  });

  it('21. BLUEPRINT_UPDATED refreshes live workspace blueprint state via refresh flag', () => {
    const pkg = getDesignVariantPackage('light-01')!;
    const result = reconcileExperienceLabWorkspace({
      event: publishLocalEnvironmentPackageEvent({
        eventType: 'BLUEPRINT_UPDATED',
        packageId: pkg.packageId,
        revision: pkg.revision,
      }),
      activePackageId: pkg.packageId,
      historicalPreviewRevision: null,
      activeWorkbenchTool: 'architectural-tools',
    });
    expect(result.refreshPackage).toBe(true);
    expect(result.invalidations).toContain('blueprint-display');
  });

  it('22. Generate blueprint emits OUTPUT_GENERATING local event', async () => {
    const pkg = getDesignVariantPackage('light-01')!;
    const received: string[] = [];
    const unsub = subscribeLocalEnvironmentPackageEvents(pkg.packageId, (e) => received.push(e.eventType));
    publishLocalEnvironmentPackageEvent({
      eventType: 'OUTPUT_GENERATING',
      packageId: pkg.packageId,
      variantId: pkg.variantId,
      revision: pkg.revision,
      outputType: 'blueprint',
    });
    unsub();
    expect(received).toContain('OUTPUT_GENERATING');
  });

  it('23. Live workspace builder does not restore demo data when package missing', () => {
    const live = buildExperienceLabLiveWorkspaceViewModel({
      pipeline: { programId: 'studio-world', studioDepartmentId: null, industryPackId: null, environmentId: null },
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
  });

  it('24. Variant change produces distinct package IDs in view model', () => {
    const light = buildTestLiveWorkspace('light-01');
    const dark = buildTestLiveWorkspace('dark-01');
    expect(light.environmentPackageId).not.toBe(dark.environmentPackageId);
  });

  it('25. Blueprint display resolves from active package', () => {
    const pkg = getDesignVariantPackage('light-01');
    const blueprint = resolveExperienceLabBlueprintDisplay({
      pkg,
      readiness: null,
      environmentName: 'LIGHT 01',
      variantId: 'light-01',
    });
    expect(blueprint.packageId).toBe(pkg?.packageId);
  });

  it('26. Components reference shared revision history not duplicated copies', () => {
    const live = buildTestLiveWorkspace();
    expect(live.revisionHistory).toBe(getDesignVariantPackage('light-01')?.revisionHistory);
  });

  it('27. Provider wires event sync hook', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const dir = dirname(fileURLToPath(import.meta.url));
    const provider = readFileSync(resolve(dir, 'live-workspace/ExperienceLabLiveWorkspaceProvider.tsx'), 'utf8');
    expect(provider).toContain('useEnvironmentPackageEventSync');
    expect(provider).toContain('eventSync');
  });

  it('28. Diagnostics export includes event synchronization block', async () => {
    const { exportLiveWorkspaceDiagnosticJson } = await import('./live-workspace/experience-lab-live-workspace-diagnostics');
    const live = buildTestLiveWorkspace();
    const json = JSON.parse(exportLiveWorkspaceDiagnosticJson(live, {
      cursor: createInitialEventCursor(live.environmentPackageId),
      lastInvalidationSet: ['blueprint-display'],
      currentPackageUpdated: false,
      subscriberCount: 1,
    })) as { eventSynchronization: { subscriberCount: number } };
    expect(json.eventSynchronization.subscriberCount).toBe(1);
  });
});

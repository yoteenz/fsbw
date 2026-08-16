import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { createWorkflowInstanceFromRequest } from '../workflow/workflowOrchestrator';
import { processEventThroughAutomation, createDomainEvent } from '../workflow/domainEvents';
import {
  detectDependencyCycles,
  evaluateConditions,
  getReadySteps,
  validateTemplateVersion,
} from '../workflow/workflowValidation';
import {
  computeWeightedProgress,
  deriveInstanceStatus,
} from '../workflow/workflowEngine';
import type { WorkflowStepInstance } from '../workflow/workflowTypes';

describe('workflow validation', () => {
  it('detects dependency cycles', () => {
    const cycle = detectDependencyCycles([
      { id: '1', fromStepId: 'a', toStepId: 'b', kind: 'sequential' },
      { id: '2', fromStepId: 'b', toStepId: 'c', kind: 'sequential' },
      { id: '3', fromStepId: 'c', toStepId: 'a', kind: 'sequential' },
    ]);
    expect(cycle).not.toBeNull();
  });

  it('validates published template has completion step', () => {
    const store = createDemoSeed();
    const version = store.workflowTemplateVersions!.find((v) => v.id === 'wtv-oa-v1')!;
    const issues = validateTemplateVersion(version);
    expect(issues.filter((i) => i.code === 'NO_COMPLETION')).toHaveLength(0);
  });

  it('rejects protected automatic completion', () => {
    const store = createDemoSeed();
    const version = store.workflowTemplateVersions!.find((v) => v.id === 'wtv-oa-v1')!;
    const bad = {
      ...version,
      steps: version.steps.map((s) =>
        s.id === 'oa-doc-review' ? { ...s, completionMethod: 'automatic' as const } : s,
      ),
    };
    expect(validateTemplateVersion(bad).some((i) => i.code === 'PROTECTED_AUTO')).toBe(true);
  });
});

describe('workflow engine', () => {
  it('computes weighted progress', () => {
    const store = createDemoSeed();
    const version = store.workflowTemplateVersions!.find((v) => v.id === 'wtv-oa-v1')!;
    const steps = store.workflowStepInstances!.filter((s) => s.workflowInstanceId === 'wfi-oa-client-a');
    const progress = computeWeightedProgress(steps, version.steps);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('derives waiting_external status', () => {
    const steps: WorkflowStepInstance[] = [
      { id: '1', workflowInstanceId: 'w', stepTemplateId: 'a', phaseId: 'p', status: 'completed', waitingOn: 'none', version: 1 },
      { id: '2', workflowInstanceId: 'w', stepTemplateId: 'b', phaseId: 'p', status: 'waiting_external', waitingOn: 'external', version: 1 },
    ];
    expect(deriveInstanceStatus(steps)).toBe('waiting_external');
  });

  it('activates ready steps sequentially', () => {
    const store = createDemoSeed();
    const version = store.workflowTemplateVersions!.find((v) => v.id === 'wtv-usdot-v1')!;
    const completed = new Set(['usdot-info']);
    const ready = getReadySteps(version.steps, version.dependencies, completed, new Set(), {});
    expect(ready.map((s) => s.id)).toContain('usdot-docs');
    expect(ready.map((s) => s.id)).not.toContain('usdot-review');
  });
});

describe('workflow idempotency', () => {
  it('suppresses duplicate domain events', () => {
    let store = createDemoSeed();
    const event = createDomainEvent({
      type: 'DOCUMENT_RECEIVED',
      organizationId: 'client-a',
      documentId: 'doc-x',
      actorType: 'customer',
      dedupeKey: 'document-received:doc-x',
    });
    store = processEventThroughAutomation(store, event);
    const count1 = store.workflowEvents!.length;
    store = processEventThroughAutomation(store, event);
    expect(store.workflowEvents!.length).toBe(count1);
  });

  it('does not create duplicate workflow for same service request', () => {
    let store = createDemoSeed();
    const before = store.workflowInstances!.length;
    store = createWorkflowInstanceFromRequest(store, 'req-1', 'wtpl-operating-authority');
    expect(store.workflowInstances!.length).toBe(before);
  });
});

describe('template versioning', () => {
  it('pins instance to v1 while v2 is published', () => {
    const store = createDemoSeed();
    const instance = store.workflowInstances!.find((w) => w.id === 'wfi-oa-client-a');
    const template = store.workflowTemplates!.find((t) => t.id === 'wtpl-operating-authority');
    expect(instance?.templateVersionId).toBe('wtv-oa-v1');
    expect(template?.currentPublishedVersionId).toBe('wtv-oa-v2');
  });
});

describe('conditional skip', () => {
  it('evaluates entity exists condition', () => {
    const ok = evaluateConditions(
      [{ id: '1', field: 'entityExists', operator: 'eq', value: 'true' }],
      { entityExists: 'true' },
    );
    expect(ok).toBe(true);
  });
});

describe('service journey seed', () => {
  it('includes new carrier startup journey for client-a', () => {
    const store = createDemoSeed();
    const journey = store.serviceJourneys!.find((j) => j.organizationId === 'client-a');
    expect(journey?.name).toContain('Trucking Business');
    expect(journey!.workflowInstanceIds.length).toBeGreaterThanOrEqual(2);
  });
});

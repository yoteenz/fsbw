import { beforeEach, describe, expect, it } from 'vitest';
import {
  addMemoryRecord,
  createCareerRequest,
  createResidentRequest,
  createWorldStory,
  evaluateFounderGate,
  getOrganizationalMemory,
  getResidentLifeTwin,
  getReturnBrief,
  recordCareerEvent,
  recordResidentEvent,
  recordResidentIntervention,
  registerPrivateDisclosure,
  resetLifeOsStoreForTests,
  resolveResidentRequest,
  updateResidentLocation,
  updateResidentNeedState,
  persistLifeOsStore,
  rehydrateLifeOsFromRepository,
} from './life-os';
import { InMemoryResidentLifeRepository } from './life-os/persistence/in-memory-repository';
import { resetRepositoryContextForTests, setResidentLifeRepository } from './life-os/persistence/repository-context';
import { exportStoreToSnapshot } from './life-os/persistence/snapshot-utils';
import { mapEventToRow } from './life-os/persistence/supabase-repository';
import { getSimulationNowIso, resetSimulationClockForTests, setSimulationClockOverride } from './life-os/runtime/simulation-clock';
import { createSeededRandom, pickVariance } from './life-os/runtime/simulation-random';
import { runWorldTick, getEventChain } from './life-os/runtime/simulation-tick';
import { buildReturnBrief } from './life-os/runtime/return-brief-service';
import { recordRelationshipEvent, getRelationshipLife } from './life-os/runtime/relationship-runtime';
import { getMindInspectorSnapshot } from './life-os/runtime/mind-inspector';
import { memoryRetentionAction } from './life-os/memory-utils';
import { getLifeOsStore } from './life-os/life-os-store';
import { maybeCreateMemoryFromEvent } from './life-os/runtime/memory-from-event';
import {
  evaluateTrainingResponse,
  getHumanEmployeeProfile,
  propagateRumor,
  recordSocialEvent,
  registerHumanEmployee,
  seedAioTrainingCanonExample,
  proposeTrainingCanonCorrectionEntry,
  markTrainingCanonCorrectionApproved,
  approveTrainingCanonCorrection,
} from './life-os';
import { getAuthoritativeTruth } from './life-os/rumor-engine';

describe('Studio World Resident Life Runtime — Simulation1', () => {
  beforeEach(() => {
    resetLifeOsStoreForTests();
    resetRepositoryContextForTests();
    resetSimulationClockForTests();
    setResidentLifeRepository(new InMemoryResidentLifeRepository());
  });

  it('1. persisted life twin rehydrates', async () => {
    updateResidentLocation('SW-RESIDENT-001', 'loc-test', 'Test Lab');
    await persistLifeOsStore();
    resetLifeOsStoreForTests();
    const ok = await rehydrateLifeOsFromRepository();
    expect(ok).toBe(true);
    expect(getResidentLifeTwin('SW-RESIDENT-001').current.locationLabel).toBe('Test Lab');
  });

  it('2. in-memory + supabase row mapping contracts match', () => {
    const evt = recordResidentEvent({
      eventType: 'ACTIVITY_STARTED',
      timestamp: '2026-10-05T12:00:00.000Z',
      worldId: 'studio-world-hq-v1',
      organizationId: 'frontal-slayer',
      residentIds: ['SW-RESIDENT-002'],
      visibility: 'OFFICE_KNOWN',
      source: 'simulation',
      payload: { summary: 'Contract row test' },
      truthStatus: 'AUTHORITATIVE',
    });
    const row = mapEventToRow(evt);
    expect(row.event_id).toBe(evt.eventId);
    expect(row.resident_ids).toContain('SW-RESIDENT-002');
  });

  it('3. tick does not execute founder-gated action', async () => {
    setSimulationClockOverride('2026-10-05T10:00:00.000Z');
    const store = getLifeOsStore();
    const bundle = store.bundles.get('SW-RESIDENT-001')!;
    bundle.autonomy.level = 'ROLE_BOUND';
    const gate = evaluateFounderGate('SPEND_MONEY', bundle.autonomy.level);
    expect(gate.allowed).toBe(false);
    await runWorldTick({ seed: 42, residentIds: ['SW-RESIDENT-001'] });
    const spent = store.events.some((e) => e.payload.actionKind === 'SPEND_MONEY');
    expect(spent).toBe(false);
  });

  it('4. low-risk internal action can progress on tick', async () => {
    setSimulationClockOverride('2026-10-05T11:00:00.000Z');
    const result = await runWorldTick({ seed: 99, residentIds: ['SW-RESIDENT-004'] });
    expect(result.skippedDuplicate).toBe(false);
    expect(result.outputs.includes('WORK_PROGRESS') || result.outputs.includes('NO_ACTION')).toBe(true);
  });

  it('5. tick is idempotent', async () => {
    setSimulationClockOverride('2026-10-05T12:00:00.000Z');
    const a = await runWorldTick({ seed: 1, residentIds: ['SW-RESIDENT-001'] });
    const b = await runWorldTick({ seed: 1, residentIds: ['SW-RESIDENT-001'] });
    expect(a.skippedDuplicate).toBe(false);
    expect(b.skippedDuplicate).toBe(true);
  });

  it('6. location change persists', async () => {
    updateResidentLocation('SW-RESIDENT-003', 'loc-x', 'Commons');
    await persistLifeOsStore();
    resetLifeOsStoreForTests();
    await rehydrateLifeOsFromRepository();
    expect(getResidentLifeTwin('SW-RESIDENT-003').current.locationLabel).toBe('Commons');
  });

  it('7. need change preserves cause', async () => {
    updateResidentNeedState(
      'SW-RESIDENT-004',
      { causeType: 'WORKLOAD', summary: 'Tick pressure', at: '2026-10-05T09:00:00.000Z' },
      { FOCUS: 2 },
    );
    await persistLifeOsStore();
    resetLifeOsStoreForTests();
    await rehydrateLifeOsFromRepository();
    expect(getResidentLifeTwin('SW-RESIDENT-004').needs.causes.some((c) => c.summary === 'Tick pressure')).toBe(true);
  });

  it('8. work progression persists', async () => {
    setSimulationClockOverride('2026-10-05T13:00:00.000Z');
    await runWorldTick({ seed: 50, residentIds: ['SW-RESIDENT-006'] });
    await persistLifeOsStore();
    const snap = exportStoreToSnapshot(getLifeOsStore());
    expect(snap.events.some((e) => e.eventType === 'WORK_PROGRESS')).toBe(true);
  });

  it('9. resident request resolved without founder when authorized', () => {
    createResidentRequest({
      fromResidentId: 'SW-RESIDENT-001',
      toResidentId: 'SW-RESIDENT-004',
      request: 'Review systems note',
      why: 'Blocking internal doc',
      priority: 'NORMAL',
    });
    const id = getLifeOsStore().residentRequests[0]!.requestId;
    expect(resolveResidentRequest(id, { summary: 'Reviewed internally', withoutFounder: true })).toBe(true);
  });

  it('10. founder escalation created when required', async () => {
    setSimulationClockOverride('2026-10-05T14:00:00.000Z');
    const store = getLifeOsStore();
    store.bundles.get('SW-RESIDENT-001')!.workNow.founderBlockers = ['budget'];
    await runWorldTick({ seed: 2, residentIds: ['SW-RESIDENT-001'] });
    const escalations = store.decisions.filter((d) => d.founderRequired);
    expect(escalations.length).toBeGreaterThan(0);
  });

  it('11. event chain causal lineage preserved', () => {
    const root = recordResidentEvent({
      eventType: 'ACTIVITY_STARTED',
      timestamp: '2026-10-06T10:00:00.000Z',
      worldId: 'studio-world-hq-v1',
      organizationId: 'frontal-slayer',
      residentIds: ['SW-RESIDENT-003'],
      visibility: 'OFFICE_KNOWN',
      source: 'simulation',
      payload: { summary: 'Jules notices concern' },
      truthStatus: 'AUTHORITATIVE',
    });
    recordResidentEvent({
      eventType: 'INTERNAL_MESSAGE',
      timestamp: '2026-10-06T10:05:00.000Z',
      worldId: 'studio-world-hq-v1',
      organizationId: 'frontal-slayer',
      residentIds: ['SW-RESIDENT-003', 'SW-RESIDENT-002'],
      visibility: 'TEAM_ONLY',
      source: 'simulation',
      payload: { summary: 'Tells Zuri' },
      truthStatus: 'AUTHORITATIVE',
      causalParentEventId: root.eventId,
    });
    const chain = getEventChain(root.eventId);
    expect(chain.length).toBe(2);
    expect(chain[1]?.causalParentEventId).toBe(root.eventId);
  });

  it('12. memory candidate from significant event', () => {
    const evt = recordResidentEvent({
      eventType: 'WORLD_STORY',
      timestamp: '2026-10-05T15:00:00.000Z',
      worldId: 'studio-world-hq-v1',
      organizationId: 'frontal-slayer',
      residentIds: ['SW-RESIDENT-001'],
      visibility: 'OFFICE_KNOWN',
      source: 'simulation',
      payload: { summary: 'Major milestone', significance: 0.92 },
      truthStatus: 'AUTHORITATIVE',
    });
    maybeCreateMemoryFromEvent(evt);
    const mems = getLifeOsStore().memories.get('SW-RESIDENT-001') ?? [];
    expect(mems.some((m) => m.significance >= 0.65)).toBe(true);
  });

  it('13. low-significance event does not become core memory', () => {
    addMemoryRecord({
      residentId: 'SW-RESIDENT-002',
      memoryClass: 'EPISODIC_MEMORY',
      summary: 'Minor hallway chat',
      significance: 0.2,
      emotionalIntensity: 0.1,
      recencyWeight: 0.2,
      identityRelevance: 0.1,
      resolutionState: 'OPEN',
      formedAt: '2026-10-01T00:00:00.000Z',
      visibility: 'OFFICE_KNOWN',
    });
    expect(memoryRetentionAction('EPISODIC_MEMORY', 0.2)).toBe('ARCHIVE_ELIGIBLE');
    const mems = getLifeOsStore().memories.get('SW-RESIDENT-002') ?? [];
    expect(mems.every((m) => m.memoryClass !== 'CORE_MEMORY')).toBe(true);
  });

  it('14. private disclosure remains private', () => {
    registerPrivateDisclosure({
      fromResidentId: 'SW-RESIDENT-003',
      subject: 'Runtime private note',
      disclosureScope: 'FOUNDER_ONLY',
      sharingPermission: 'FOUNDER_CONFIDENTIAL',
      confidentialityExpectation: 'Private',
      trustImpactIfViolated: 'High',
    });
    const brief = buildReturnBrief('2026-01-01T00:00:00.000Z', '2026-12-31T23:59:59.000Z', {
      isFounderPrivileged: false,
    });
    expect(JSON.stringify(brief.items)).not.toContain('Runtime private note');
  });

  it('15. rumor propagation does not change truth', () => {
    const truth = recordSocialEvent({
      summary: 'Ground truth runtime',
      authoritativePayload: { x: 1 },
      occurredAt: '2026-10-07T12:00:00.000Z',
      visibility: 'TEAM_ONLY',
      directWitnessIds: ['SW-RESIDENT-001'],
      disclosedTo: [],
      founderKnows: false,
    });
    const before = getAuthoritativeTruth(truth.truthEventId);
    propagateRumor({
      truthEventId: truth.truthEventId,
      fromHolderId: 'SW-RESIDENT-001',
      toHolderId: 'SW-RESIDENT-002',
      embellishment: 'speculation',
    });
    expect(getAuthoritativeTruth(truth.truthEventId)).toBe(before);
  });

  it('16. relationship change requires event', () => {
    recordRelationshipEvent({
      residentAId: 'SW-RESIDENT-001',
      residentBId: 'SW-RESIDENT-005',
      summary: 'Supported my work',
      sentimentTag: 'SUPPORTED_ME',
      trustDelta: 0.08,
    });
    const rel = getRelationshipLife('SW-RESIDENT-001');
    expect(rel.length).toBe(1);
    expect(rel[0]?.trust).toBeGreaterThan(0.5);
  });

  it('17. world story references real event', () => {
    const evt = recordResidentEvent({
      eventType: 'ACTIVITY_STARTED',
      timestamp: '2026-10-08T10:00:00.000Z',
      worldId: 'studio-world-hq-v1',
      organizationId: 'frontal-slayer',
      residentIds: ['SW-RESIDENT-006'],
      visibility: 'OFFICE_KNOWN',
      source: 'simulation',
      payload: { summary: 'Fab sprint', significance: 0.7 },
      truthStatus: 'AUTHORITATIVE',
    });
    const story = createWorldStory({
      storyType: 'ROUTINE_CHANGED',
      summary: 'Iona shifted fab sprint',
      groundedEventId: evt.eventId,
      residentIds: ['SW-RESIDENT-006'],
      at: evt.timestamp,
    });
    expect(story.groundedEventId).toBe(evt.eventId);
  });

  it('18. return brief uses events after last_seen only', () => {
    recordResidentEvent({
      eventType: 'ACTIVITY_STARTED',
      timestamp: '2026-10-09T08:00:00.000Z',
      worldId: 'studio-world-hq-v1',
      organizationId: 'frontal-slayer',
      residentIds: ['SW-RESIDENT-001'],
      visibility: 'OFFICE_KNOWN',
      source: 'simulation',
      payload: { summary: 'Before window', significance: 0.8 },
      truthStatus: 'AUTHORITATIVE',
    });
    recordResidentEvent({
      eventType: 'ACTIVITY_STARTED',
      timestamp: '2026-10-09T18:00:00.000Z',
      worldId: 'studio-world-hq-v1',
      organizationId: 'frontal-slayer',
      residentIds: ['SW-RESIDENT-001'],
      visibility: 'OFFICE_KNOWN',
      source: 'simulation',
      payload: { summary: 'After window', significance: 0.8 },
      truthStatus: 'AUTHORITATIVE',
    });
    const brief = getReturnBrief('2026-10-09T12:00:00.000Z', '2026-10-09T23:59:59.000Z');
    expect(brief.items.some((i) => i.summary === 'After window')).toBe(true);
    expect(brief.items.some((i) => i.summary === 'Before window')).toBe(false);
  });

  it('19. return brief suppresses low-significance tick noise', () => {
    recordResidentEvent({
      eventType: 'WORK_PROGRESS',
      timestamp: '2026-10-10T10:00:00.000Z',
      worldId: 'studio-world-hq-v1',
      organizationId: 'frontal-slayer',
      residentIds: ['SW-RESIDENT-004'],
      visibility: 'TEAM_ONLY',
      source: 'simulation',
      payload: { summary: 'Tick noise', significance: 0.2 },
      truthStatus: 'AUTHORITATIVE',
    });
    const brief = getReturnBrief('2026-10-10T00:00:00.000Z', '2026-10-10T23:59:59.000Z');
    expect(brief.items.some((i) => i.summary === 'Tick noise')).toBe(false);
  });

  it('20. return brief respects access', () => {
    recordResidentEvent({
      eventType: 'FOUNDER_ESCALATION',
      timestamp: '2026-10-11T10:00:00.000Z',
      worldId: 'studio-world-hq-v1',
      organizationId: 'frontal-slayer',
      residentIds: ['SW-RESIDENT-001'],
      visibility: 'FOUNDER_PRIVILEGED',
      source: 'simulation',
      payload: { summary: 'Founder-only item', significance: 0.9 },
      truthStatus: 'AUTHORITATIVE',
    });
    const publicBrief = buildReturnBrief('2026-10-11T00:00:00.000Z', '2026-10-11T23:59:59.000Z', {
      isFounderPrivileged: false,
    });
    expect(publicBrief.items.some((i) => i.summary === 'Founder-only item')).toBe(false);
  });

  it('21. career request persists', async () => {
    createCareerRequest({
      residentId: 'SW-RESIDENT-005',
      requestKind: 'TRANSFER',
      summary: 'Rotation to World Team',
    });
    await persistLifeOsStore();
    resetLifeOsStoreForTests();
    await rehydrateLifeOsFromRepository();
    expect(getLifeOsStore().careerRequests.length).toBe(1);
  });

  it('22. notice / alumni history retained', async () => {
    recordCareerEvent('SW-RESIDENT-008', 'NOTICE_PERIOD', { lastDay: '2026-12-01' });
    recordCareerEvent('SW-RESIDENT-008', 'ALUMNI', {});
    await persistLifeOsStore();
    resetLifeOsStoreForTests();
    await rehydrateLifeOsFromRepository();
    expect(getResidentLifeTwin('SW-RESIDENT-008').career.careerState).toBe('ALUMNI');
    expect(getLifeOsStore().events.some((e) => e.eventType === 'CAREER_EVENT')).toBe(true);
  });

  it('23. pair outcome stored by task type', () => {
    const outcomes = getLifeOsStore().pairingOutcomes.filter(
      (p) => p.residentAId === 'SW-RESIDENT-001' && p.residentBId === 'SW-RESIDENT-005',
    );
    expect(new Set(outcomes.map((o) => o.taskType)).size).toBeGreaterThan(1);
  });

  it('24. organizational memory source retained', async () => {
    await persistLifeOsStore();
    resetLifeOsStoreForTests();
    await rehydrateLifeOsFromRepository();
    const mem = getOrganizationalMemory()[0];
    expect(mem?.source).toBeTruthy();
  });

  it('25. founder intervention audit retained', async () => {
    recordResidentIntervention({
      kind: 'SOFT_DIRECTION',
      targetResidentId: 'SW-RESIDENT-002',
      directive: 'Slow down intake',
      residentAware: true,
      stateBeforeSummary: 'Rushed',
    });
    await persistLifeOsStore();
    resetLifeOsStoreForTests();
    await rehydrateLifeOsFromRepository();
    expect(getLifeOsStore().interventions.length).toBe(1);
  });

  it('26. human employee remains domain-separate', () => {
    registerHumanEmployee({
      employeeId: 'human-rt-1',
      entityKind: 'HUMAN_EMPLOYEE',
      role: 'Trainee',
      completedModules: [],
      strengths: [],
      weakAreas: [],
      authorizedTasks: [],
      supervisedTasks: [],
      trainingRequired: [],
      notYetCleared: [],
      inTraining: true,
    });
    expect(getHumanEmployeeProfile('human-rt-1')?.entityKind).toBe('HUMAN_EMPLOYEE');
    expect(getResidentLifeTwin('SW-RESIDENT-001').identity.residentId).toMatch(/^SW-RESIDENT-/);
  });

  it('27. training canon versioning works', () => {
    seedAioTrainingCanonExample();
    const proposal = proposeTrainingCanonCorrectionEntry({
      companyId: 'aio',
      proposedBy: 'mgr',
      source: 'correction',
      summary: 'Version bump',
      targetCanonId: 'aio-permit-intake-v1',
    });
    markTrainingCanonCorrectionApproved(proposal.correctionId);
    const updated = approveTrainingCanonCorrection(proposal.correctionId, 'aio-permit-intake-v1');
    expect(updated?.bodySummary).toContain('Version bump');
  });

  it('28. trainer unknown / high-risk case escalates', () => {
    const answer = evaluateTrainingResponse('high', 'aio', 'unknown_domain');
    expect(answer.tier).toBe('REQUIRES_LEGAL_OR_COMPLIANCE_REVIEW');
  });

  it('29. seeded simulation is deterministic', () => {
    const a = pickVariance(12345, ['A', 'B', 'C']);
    const b = pickVariance(12345, ['A', 'B', 'C']);
    expect(a).toBe(b);
    const r1 = createSeededRandom(7)();
    const r2 = createSeededRandom(7)();
    expect(r1).toBe(r2);
  });

  it('30. debug clock is deterministic', () => {
    setSimulationClockOverride('2026-10-12T08:30:00.000Z');
    expect(getSimulationNowIso()).toBe('2026-10-12T08:30:00.000Z');
    expect(getSimulationNowIso()).toBe('2026-10-12T08:30:00.000Z');
  });

  it('mind inspector exposes safe structured summary', () => {
    const mind = getMindInspectorSnapshot('SW-RESIDENT-001');
    expect(mind.currentIntent.length).toBeGreaterThan(0);
    expect(mind.decisionSummary.length).toBeGreaterThan(0);
  });
});

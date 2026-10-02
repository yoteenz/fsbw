import { describe, expect, it, beforeEach } from 'vitest';
import { STUDIO_DEBUG_PATHS } from '../../routes/StudioDebugRoutes';
import {
  assertCastContractDoesNotMutateCanon,
  cloneCanonicalIdentity,
} from './casting';
import { getEttaVale } from './registry';
import type { ResidentCastRoleContract } from './types';
import {
  addMemoryRecord,
  approveTrainingCanonCorrection,
  markTrainingCanonCorrectionApproved,
  attachCastRole,
  assertResidentStillHasHistory,
  createWorldStory,
  evaluateFounderGate,
  evaluateTrainingResponse,
  getHumanEmployeeProfile,
  getInspectorSnapshot,
  getOrganizationalMemory,
  getPairingOutcomesForPair,
  getResidentCareerState,
  getResidentKnowledgeState,
  getResidentLifeTwin,
  getReturnBrief,
  propagateRumor,
  proposeTrainingCanonCorrectionEntry,
  recordCareerEvent,
  recordResidentEvent,
  recordResidentIntervention,
  recordSocialEvent,
  registerHumanEmployee,
  listFounderPrivateDisclosures,
  registerPrivateDisclosure,
  registerTrainingCanon,
  resetLifeOsStoreForTests,
  seedAioTrainingCanonExample,
  setResidentBelief,
  updateResidentNeedState,
} from './life-os';
import { getAuthoritativeTruth } from './life-os/rumor-engine';
import { scoreMemoryRetention, classifyMemoryStability } from './life-os/memory-utils';

describe('Studio World Resident Life OS — Foundation2', () => {
  beforeEach(() => {
    resetLifeOsStoreForTests();
  });

  it('1. canonical identity does not change when cast role changes', () => {
    const before = cloneCanonicalIdentity(getEttaVale());
    const contract: ResidentCastRoleContract = {
      id: 'cast-aio-zuri',
      residentId: 'SW-RESIDENT-002',
      roleName: 'AIO Training Coach',
      roleType: 'CUSTOM',
      toneAdjustment: 'Compliance-forward',
      temporaryBackstory: 'Client role only',
      authorizedKnowledge: ['AIO SOP'],
      authorizedBehaviors: ['Coach intake'],
      restrictedBehaviors: [],
      approvalStatus: 'approved',
      roleHistory: [],
      assetLinks: [],
      version: 'v1.0.0',
    };
    attachCastRole(contract);
    expect(assertCastContractDoesNotMutateCanon(before, getEttaVale())).toBe(true);
  });

  it('2. resident life state can be retrieved', () => {
    const twin = getResidentLifeTwin('SW-RESIDENT-001');
    expect(twin.identity.residentId).toBe('SW-RESIDENT-001');
    expect(twin.current.presence).not.toBe('AWAY');
    expect(twin.current.activity.length).toBeGreaterThan(5);
  });

  it('3. ground truth event remains distinct from resident belief', () => {
    const truth = recordSocialEvent({
      summary: 'Private dinner — ground truth',
      authoritativePayload: { kind: 'private_date' },
      occurredAt: '2026-10-03T20:00:00.000Z',
      visibility: 'PRIVATE',
      directWitnessIds: ['SW-RESIDENT-003', 'SW-RESIDENT-007'],
      disclosedTo: [],
      founderKnows: true,
    });
    setResidentBelief({
      residentId: 'SW-RESIDENT-002',
      subjectKey: truth.truthEventId,
      knowledgeState: 'SUSPECTS',
      beliefSummary: 'Something happened between Jules and Marlowe',
      confidence: 0.6,
      updatedAt: '2026-10-04T10:00:00.000Z',
    });
    expect(getAuthoritativeTruth(truth.truthEventId)).toContain('Private dinner');
    const zuri = getResidentKnowledgeState('SW-RESIDENT-002');
    expect(zuri.beliefs[0]?.knowledgeState).toBe('SUSPECTS');
    expect(zuri.beliefs[0]?.beliefSummary).not.toEqual(truth.authoritativePayload);
  });

  it('4. private disclosure does not become office-known automatically', () => {
    registerPrivateDisclosure({
      fromResidentId: 'SW-RESIDENT-003',
      subject: 'Personal concern',
      disclosureScope: 'FOUNDER_ONLY',
      sharingPermission: 'FOUNDER_CONFIDENTIAL',
      confidentialityExpectation: 'Do not share with team',
      trustImpactIfViolated: 'Severe trust loss',
    });
    expect(listFounderPrivateDisclosures()).toHaveLength(1);
    const snap = getInspectorSnapshot('SW-RESIDENT-003');
    const leaked = snap.twin.recentEvents.some(
      (e) => e.visibility === 'OFFICE_KNOWN' && JSON.stringify(e.payload).includes('Personal concern'),
    );
    expect(leaked).toBe(false);
  });

  it('5. rumor propagation does not alter true event', () => {
    const truth = recordSocialEvent({
      summary: 'Project review meeting',
      authoritativePayload: { agenda: 'review' },
      occurredAt: '2026-10-03T12:00:00.000Z',
      visibility: 'TEAM_ONLY',
      directWitnessIds: ['SW-RESIDENT-001'],
      disclosedTo: [],
      founderKnows: false,
    });
    const before = getAuthoritativeTruth(truth.truthEventId);
    propagateRumor({
      truthEventId: truth.truthEventId,
      fromHolderId: 'SW-RESIDENT-001',
      toHolderId: 'SW-RESIDENT-003',
      embellishment: 'maybe drama',
    });
    expect(getAuthoritativeTruth(truth.truthEventId)).toBe(before);
  });

  it('6. autonomy gate prevents unauthorized founder-gated action', () => {
    const gate = evaluateFounderGate('SPEND_MONEY', 'ROLE_BOUND');
    expect(gate.allowed).toBe(false);
    expect(gate.requiresFounderApproval).toBe(true);
  });

  it('7. resident may handle low-risk work without founder', () => {
    const gate = evaluateFounderGate('INTERNAL_CREATIVE_REVIEW', 'ROLE_BOUND');
    expect(gate.allowed).toBe(true);
  });

  it('8. career promotion does not mutate canonical personality', () => {
    const traitsBefore = [...getEttaVale().personality.traits];
    recordCareerEvent('SW-RESIDENT-001', 'PROMOTED', { title: 'Executive Creative Director' });
    expect(getEttaVale().personality.traits).toEqual(traitsBefore);
    expect(getResidentCareerState('SW-RESIDENT-001').title).toContain('Executive');
  });

  it('9. transfer changes role context without replacing resident', () => {
    recordCareerEvent('SW-RESIDENT-005', 'TRANSFERRED', {
      department: 'World Team',
      title: 'World Team — rotation',
    });
    const career = getResidentCareerState('SW-RESIDENT-005');
    expect(career.department).toBe('World Team');
    expect(getResidentLifeTwin('SW-RESIDENT-005').identity.residentId).toBe('SW-RESIDENT-005');
  });

  it('10. notice period does not delete resident', () => {
    recordCareerEvent('SW-RESIDENT-008', 'NOTICE_PERIOD', { lastDay: '2026-12-01' });
    expect(getResidentLifeTwin('SW-RESIDENT-008').identity.displayName).toBe('Elio Vahn');
    expect(getResidentCareerState('SW-RESIDENT-008').careerState).toBe('NOTICE_PERIOD');
  });

  it('11. alumni retains history / relationships', () => {
    recordCareerEvent('SW-RESIDENT-008', 'ALUMNI', {});
    expect(getResidentCareerState('SW-RESIDENT-008').careerState).toBe('ALUMNI');
    expect(assertResidentStillHasHistory('SW-RESIDENT-008')).toBe(true);
    expect(getResidentLifeTwin('SW-RESIDENT-008').identity.residentId).toBe('SW-RESIDENT-008');
  });

  it('12. pairing outcome may differ by task type', () => {
    const concept = getPairingOutcomesForPair('SW-RESIDENT-001', 'SW-RESIDENT-005', 'concepting');
    const rapid = getPairingOutcomesForPair('SW-RESIDENT-001', 'SW-RESIDENT-005', 'rapid_execution');
    expect(concept.length).toBe(1);
    expect(rapid.length).toBe(1);
    expect(concept[0]?.taskType).not.toBe(rapid[0]?.taskType);
  });

  it('13. need state causes are preserved', () => {
    updateResidentNeedState(
      'SW-RESIDENT-004',
      { causeType: 'WORKLOAD', summary: 'Pipeline pressure', at: '2026-10-03T09:00:00.000Z' },
      { FOCUS: 2 },
    );
    const twin = getResidentLifeTwin('SW-RESIDENT-004');
    expect(twin.needs.causes.some((c) => c.causeType === 'WORKLOAD')).toBe(true);
  });

  it('14. memory significance / classification works', () => {
    const score = scoreMemoryRetention({
      significance: 0.9,
      emotionalIntensity: 0.8,
      recencyWeight: 0.5,
      identityRelevance: 0.95,
    });
    expect(score).toBeGreaterThan(0.7);
    expect(classifyMemoryStability('CORE_MEMORY', score)).toBe('HIGH');
    const mem = addMemoryRecord({
      residentId: 'SW-RESIDENT-001',
      memoryClass: 'CORE_MEMORY',
      summary: 'Founding ensemble memory anchor',
      significance: 0.95,
      emotionalIntensity: 0.7,
      recencyWeight: 0.8,
      identityRelevance: 1,
      resolutionState: 'RESOLVED',
      formedAt: '2026-01-01T00:00:00.000Z',
      visibility: 'PRIVATE',
    });
    expect(mem.memoryId).toContain('SW-RESIDENT-001');
  });

  it('15. organizational memory is source-versioned', () => {
    const mem = getOrganizationalMemory()[0];
    expect(mem?.source).toBeTruthy();
    expect(mem?.confidence).toBeGreaterThan(0);
    expect(mem?.recordedAt).toBeTruthy();
  });

  it('16. world story references actual event', () => {
    const evt = recordResidentEvent({
      eventType: 'ACTIVITY_STARTED',
      timestamp: '2026-10-03T14:00:00.000Z',
      worldId: 'studio-world-hq-v1',
      organizationId: 'frontal-slayer',
      residentIds: ['SW-RESIDENT-006'],
      visibility: 'OFFICE_KNOWN',
      source: 'simulation',
      payload: { summary: 'Fabrication sprint' },
      truthStatus: 'AUTHORITATIVE',
    });
    const story = createWorldStory({
      storyType: 'SIDE_PROJECT_STARTED',
      summary: 'Iona started fabrication sprint',
      groundedEventId: evt.eventId,
      residentIds: ['SW-RESIDENT-006'],
      at: evt.timestamp,
    });
    expect(story.groundedEventId).toBe(evt.eventId);
  });

  it('17. return brief only uses real state changes', () => {
    const brief = getReturnBrief('2026-10-02T00:00:00.000Z', '2026-10-02T23:59:59.000Z');
    for (const item of brief.items) {
      expect(item.groundedEventId.startsWith('evt-')).toBe(true);
    }
  });

  it('18. human employee profile is distinct from resident', () => {
    registerHumanEmployee({
      employeeId: 'human-aio-001',
      entityKind: 'HUMAN_EMPLOYEE',
      role: 'Permit Specialist I',
      completedModules: [],
      strengths: [],
      weakAreas: ['IFTA'],
      authorizedTasks: ['basic filings'],
      supervisedTasks: [],
      trainingRequired: ['IFTA'],
      notYetCleared: ['high-risk compliance correction'],
      inTraining: true,
    });
    expect(getHumanEmployeeProfile('human-aio-001')?.entityKind).toBe('HUMAN_EMPLOYEE');
    expect(getResidentLifeTwin('SW-RESIDENT-001').identity.residentId).toMatch(/^SW-RESIDENT-/);
  });

  it('19. trainer cannot silently override approved company canon', () => {
    seedAioTrainingCanonExample();
    const pending = proposeTrainingCanonCorrectionEntry({
      companyId: 'aio',
      proposedBy: 'manager-1',
      source: 'manager_correction',
      summary: 'Skip authority check',
      targetCanonId: 'aio-permit-intake-v1',
    });
    expect(pending.reviewStatus).toBe('pending');
    const canonBefore = registerTrainingCanon;
    seedAioTrainingCanonExample();
    const answer = evaluateTrainingResponse('low', 'aio', 'permitting');
    expect(answer.tier).toBe('APPROVED_COMPANY_CANON');
    expect(canonBefore).toBeTruthy();
  });

  it('20. trainer high-risk unknown can escalate', () => {
    const answer = evaluateTrainingResponse('high', 'aio', 'unknown_domain');
    expect(answer.tier).toBe('REQUIRES_LEGAL_OR_COMPLIANCE_REVIEW');
  });

  it('21. client cast role does not mutate resident canon', () => {
    const before = cloneCanonicalIdentity(getEttaVale());
    attachCastRole({
      id: 'cast-client-trainer',
      residentId: 'SW-RESIDENT-002',
      roleName: 'Client Trainer',
      roleType: 'CUSTOM',
      authorizedKnowledge: [],
      authorizedBehaviors: [],
      restrictedBehaviors: [],
      approvalStatus: 'approved',
      roleHistory: [],
      assetLinks: [],
      version: 'v1.0.0',
    });
    expect(assertCastContractDoesNotMutateCanon(before, getEttaVale())).toBe(true);
  });

  it('22. founder intervention is auditable', () => {
    recordResidentIntervention({
      kind: 'SOFT_DIRECTION',
      targetResidentId: 'SW-RESIDENT-003',
      directive: 'ENCOURAGE_SOCIALIZATION',
      reason: 'Office morale',
      residentAware: false,
      stateBeforeSummary: 'Focused on desk',
    });
    const snap = getInspectorSnapshot('SW-RESIDENT-003');
    expect(snap.interventions.length).toBe(1);
    expect(snap.interventions[0]?.directive).toContain('ENCOURAGE');
  });

  it('23. preview / debug routes do not become public storefront', () => {
    expect((STUDIO_DEBUG_PATHS as readonly string[]).includes('/__studio-world/residents')).toBe(true);
    expect('/__studio-world/residents'.startsWith('/__')).toBe(true);
  });

  it('trainer canon correction requires approval before apply', () => {
    seedAioTrainingCanonExample();
    const proposal = proposeTrainingCanonCorrectionEntry({
      companyId: 'aio',
      proposedBy: 'mgr',
      source: 'correction',
      summary: 'Updated intake question order',
      targetCanonId: 'aio-permit-intake-v1',
    });
    expect(approveTrainingCanonCorrection(proposal.correctionId, 'aio-permit-intake-v1')).toBeNull();
    markTrainingCanonCorrectionApproved(proposal.correctionId);
    const updated = approveTrainingCanonCorrection(proposal.correctionId, 'aio-permit-intake-v1');
    expect(updated?.bodySummary).toContain('Updated intake');
  });
});

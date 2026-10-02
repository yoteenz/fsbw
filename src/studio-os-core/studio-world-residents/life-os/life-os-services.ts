import { cloneCanonicalIdentity } from '../casting';
import { getRelationshipGraph, getResidentById, getSeason1ResidentRegistry } from '../registry';
import type { ResidentCastRoleContract, ResidentId } from '../types';
import { RESIDENT_LIFE_OS_VERSION, STUDIO_WORLD_DEFAULT_ORG_SLUG, STUDIO_WORLD_DEFAULT_WORLD_ID } from './constants';
import { evaluateFounderGate } from './founder-gate';
import type { ResidentLifeEventEnvelope } from './event-envelope';
import { classifyMemoryStability, scoreMemoryRetention } from './memory-utils';
import { propagateRumor } from './rumor-engine';
import { getLifeOsStore, resetLifeOsStoreForTests } from './life-os-store';
import { persistLifeOsStore, rehydrateLifeOsFromRepository } from './persistence/repository-context';
import { buildReturnBrief } from './runtime/return-brief-service';
import { getSimulationNowIso } from './runtime/simulation-clock';
import type { CareerRequestKind } from './runtime/career-requests';
import type {
  ResidentLifeTwin,
  ResidentMemoryRecord,
  ReturnBrief,
  SocialTruthEvent,
} from './life-twin-model';
import type { ResidentRelationshipLifeDimensions } from './life-twin-model';
import type { PrivateDisclosureRecord, WorldStoryRecord } from './life-os-domain-records';
import {
  applyApprovedTrainingCorrection,
  evaluateTrainerAnswer,
  proposeTrainingCanonCorrection,
  type HumanEmployeeLearningProfile,
  type TrainingCanonDocument,
  type TrainingSessionState,
} from './training-domain';

export { resetLifeOsStoreForTests, evaluateFounderGate, propagateRumor, rehydrateLifeOsFromRepository, persistLifeOsStore };

export function getResidentLifeTwin(residentId: ResidentId): ResidentLifeTwin {
  const store = getLifeOsStore();
  const bundle = store.bundles.get(residentId);
  if (!bundle) throw new Error(`Unknown resident ${residentId}`);
  const identity = getResidentById(residentId);
  if (!identity) throw new Error(`Unknown resident ${residentId}`);
  const mems = store.memories.get(residentId) ?? [];
  const castRoles = store.activeCastRoles.filter((c) => c.residentId === residentId);
  const recentEvents = store.events
    .filter((e) => e.residentIds.includes(residentId))
    .slice(-20);

  return {
    identity,
    worldId: store.worldId,
    organizationId: store.organizationId,
    current: { ...bundle.current },
    needs: { ...bundle.needs, causes: [...bundle.needs.causes] },
    approach: { ...bundle.approach },
    decisionWeights: { ...bundle.weights },
    autonomy: { ...bundle.autonomy },
    career: { ...bundle.career },
    workNow: { ...bundle.workNow },
    goals: { ...bundle.goals },
    rhythm: { ...bundle.rhythm },
    home: { ...bundle.home },
    activeCastRoles: castRoles.map((c) => ({ ...c })),
    recentEvents,
    memoryCount: mems.length,
    openLoopCount: mems.filter((m) => m.resolutionState === 'OPEN').length,
  };
}

export function getResidentCurrentState(residentId: ResidentId) {
  return getResidentLifeTwin(residentId).current;
}

export function getResidentDay(_residentId: ResidentId) {
  return {
    rhythm: getLifeOsStore().bundles.get(_residentId)?.rhythm,
    plannedBlocks: ['Core obligations', 'Optional social orbit', 'Self-initiated work'],
  };
}

export function getResidentWorkState(residentId: ResidentId) {
  const twin = getResidentLifeTwin(residentId);
  return { workNow: twin.workNow, career: twin.career, autonomy: twin.autonomy };
}

export function getResidentCareerState(residentId: ResidentId) {
  return getResidentLifeTwin(residentId).career;
}

export function getResidentRelationshipState(residentId: ResidentId): ResidentRelationshipLifeDimensions[] {
  const graph = getRelationshipGraph();
  const edges = graph.byResident.get(residentId) ?? [];
  return edges.map((e) => {
    const other = e.personAId === residentId ? e.personBId : e.personAId;
    return {
      residentAId: residentId,
      residentBId: other,
      trust: e.trustLevel / 5,
      affection: e.chemistryLevel / 5,
      respect: e.loyaltyLevel / 5,
      familiarity: 0.6,
      resentment: e.frictionLevel / 5,
      rivalry: e.relationshipType === 'strategic_rivalry' ? 0.7 : 0.2,
      candor: e.trustLevel / 5,
      sentiments: [],
    };
  });
}

export function getResidentKnowledgeState(residentId: ResidentId) {
  const beliefs = getLifeOsStore().beliefs.get(residentId) ?? [];
  return { residentId, beliefs: [...beliefs] };
}

export function getResidentMemories(residentId: ResidentId): ResidentMemoryRecord[] {
  return [...(getLifeOsStore().memories.get(residentId) ?? [])];
}

export function getResidentGoals(residentId: ResidentId) {
  return getResidentLifeTwin(residentId).goals;
}

export function getResidentAutonomy(residentId: ResidentId) {
  return getResidentLifeTwin(residentId).autonomy;
}

export function recordResidentEvent(
  partial: Omit<ResidentLifeEventEnvelope, 'eventId' | 'canonVersion'> & { eventId?: string }
): ResidentLifeEventEnvelope {
  const store = getLifeOsStore();
  const event: ResidentLifeEventEnvelope = {
    ...partial,
    eventId: partial.eventId ?? `evt-${store.events.length + 1}-${getSimulationNowIso()}`,
    canonVersion: RESIDENT_LIFE_OS_VERSION,
    timestamp: partial.timestamp ?? getSimulationNowIso(),
  };
  store.events.push(event);
  void persistLifeOsStore();
  return event;
}

export function recordResidentDecision(input: {
  residentId: ResidentId;
  decisionSummary: string;
  disposition: import('./types-core').DecisionDisposition;
  reasoningSummary: string;
  founderRequired: boolean;
}): void {
  const store = getLifeOsStore();
  store.decisions.push({
    decisionId: `dec-${store.decisions.length + 1}`,
    residentId: input.residentId,
    decisionSummary: input.decisionSummary,
    disposition: input.disposition,
    inputs: ['personality', 'role', 'authority'],
    memoryIds: [],
    authoritySummary: getResidentAutonomy(input.residentId).level,
    confidence: 0.7,
    reasoningSummary: input.reasoningSummary,
    risks: [],
    founderRequired: input.founderRequired,
    at: new Date().toISOString(),
  });
}

export function recordResidentIntervention(input: {
  kind: import('./types-core').FounderInterventionKind;
  targetResidentId: ResidentId;
  directive: string;
  reason?: string;
  residentAware: boolean;
  stateBeforeSummary: string;
}): void {
  const store = getLifeOsStore();
  const rec = {
    interventionId: `int-${store.interventions.length + 1}`,
    at: new Date().toISOString(),
    stateAfterSummary: 'Pending simulation tick',
    ...input,
  };
  store.interventions.push(rec);
  recordResidentEvent({
    eventType: 'FOUNDER_INTERVENTION',
    timestamp: rec.at,
    worldId: store.worldId,
    organizationId: store.organizationId,
    residentIds: [input.targetResidentId],
    visibility: 'FOUNDER_PRIVILEGED',
    source: 'founder',
    payload: { interventionId: rec.interventionId, directive: input.directive },
    truthStatus: 'AUTHORITATIVE',
  });
}

export function recordSocialEvent(truth: Omit<SocialTruthEvent, 'truthEventId'> & { truthEventId?: string }): SocialTruthEvent {
  const store = getLifeOsStore();
  const truthEventId = truth.truthEventId ?? `truth-${store.truthEvents.size + 1}`;
  const full: SocialTruthEvent = { ...truth, truthEventId };
  store.truthEvents.set(truthEventId, full);
  recordResidentEvent({
    eventType: 'SOCIAL_INTERACTION',
    timestamp: truth.occurredAt,
    worldId: store.worldId,
    organizationId: store.organizationId,
    residentIds: [...truth.directWitnessIds],
    visibility: truth.visibility,
    source: 'simulation',
    payload: { truthEventId, summary: truth.summary },
    truthStatus: 'AUTHORITATIVE',
  });
  return full;
}

export function updateResidentLocation(residentId: ResidentId, locationId: string, locationLabel: string): void {
  const bundle = getLifeOsStore().bundles.get(residentId);
  if (!bundle) return;
  bundle.current.locationId = locationId;
  bundle.current.locationLabel = locationLabel;
  bundle.current.updatedAt = new Date().toISOString();
  recordResidentEvent({
    eventType: 'LOCATION_CHANGED',
    timestamp: bundle.current.updatedAt,
    worldId: getLifeOsStore().worldId,
    organizationId: getLifeOsStore().organizationId,
    residentIds: [residentId],
    locationId,
    visibility: 'OFFICE_KNOWN',
    source: 'simulation',
    payload: { locationLabel },
    truthStatus: 'AUTHORITATIVE',
  });
}

export function updateResidentNeedState(
  residentId: ResidentId,
  cause: import('./life-twin-model').NeedStateCause,
  levelsPatch: Partial<import('./life-twin-model').ResidentNeedSnapshot['levels']>
): void {
  const bundle = getLifeOsStore().bundles.get(residentId);
  if (!bundle) return;
  bundle.needs.levels = { ...bundle.needs.levels, ...levelsPatch };
  bundle.needs.causes.push(cause);
  bundle.needs.updatedAt = new Date().toISOString();
}

export function proposeResidentAction(residentId: ResidentId, _summary: string): { proposalId: string; gate: ReturnType<typeof evaluateFounderGate> } {
  const gate = evaluateFounderGate('INTERNAL_PROPOSAL', getResidentAutonomy(residentId).level);
  return { proposalId: `prop-${residentId}-${Date.now()}`, gate };
}

export function recordCareerEvent(residentId: ResidentId, eventType: string, payload: Record<string, unknown>): void {
  const store = getLifeOsStore();
  const bundle = store.bundles.get(residentId);
  if (!bundle) return;
  if (eventType === 'PROMOTED') {
    bundle.career.title = String(payload.title ?? bundle.career.title);
    bundle.career.scopeSummary = String(payload.scope ?? bundle.career.scopeSummary);
  }
  if (eventType === 'TRANSFERRED') {
    bundle.career.department = String(payload.department ?? bundle.career.department);
    bundle.career.title = String(payload.title ?? bundle.career.title);
  }
  if (eventType === 'NOTICE_PERIOD') {
    bundle.career.careerState = 'NOTICE_PERIOD';
    bundle.career.noticePeriodEnd = String(payload.lastDay ?? '');
  }
  if (eventType === 'ALUMNI') {
    bundle.career.careerState = 'ALUMNI';
    bundle.career.employmentActive = false;
    bundle.career.alumniSince = new Date().toISOString();
    store.alumni.add(residentId);
  }
  recordResidentEvent({
    eventType: 'CAREER_EVENT',
    timestamp: new Date().toISOString(),
    worldId: store.worldId,
    organizationId: store.organizationId,
    residentIds: [residentId],
    visibility: 'OFFICE_KNOWN',
    source: 'simulation',
    payload: { eventType, ...payload },
    truthStatus: 'AUTHORITATIVE',
  });
}

export function createResidentRequest(input: Omit<import('./life-os-domain-records').ResidentRequestRecord, 'requestId' | 'at' | 'status'>): void {
  const store = getLifeOsStore();
  const rec = {
    ...input,
    requestId: `req-${store.residentRequests.length + 1}`,
    status: 'OPEN' as const,
    at: getSimulationNowIso(),
  };
  store.residentRequests.push(rec);
  void persistLifeOsStore();
}

export function resolveResidentRequest(requestId: string, resolution: { summary: string; withoutFounder?: boolean }): boolean {
  const store = getLifeOsStore();
  const req = store.residentRequests.find((r) => r.requestId === requestId);
  if (!req || req.status !== 'OPEN') return false;
  const gate = evaluateFounderGate('INTERNAL_CREATIVE_REVIEW', getResidentAutonomy(req.toResidentId).level);
  if (!resolution.withoutFounder && !gate.allowed) return false;
  req.status = 'RESOLVED';
  recordResidentEvent({
    eventType: 'INTERNAL_MESSAGE',
    timestamp: getSimulationNowIso(),
    worldId: store.worldId,
    organizationId: store.organizationId,
    residentIds: [req.fromResidentId, req.toResidentId],
    visibility: 'TEAM_ONLY',
    source: 'simulation',
    payload: {
      summary: resolution.summary,
      requestId,
      significance: 0.72,
      founderRelevance: 0.3,
    },
    truthStatus: 'AUTHORITATIVE',
  });
  void persistLifeOsStore();
  return true;
}

export function createCareerRequest(input: {
  residentId: ResidentId;
  requestKind: CareerRequestKind;
  summary: string;
  founderApprovalRequired?: boolean;
  payload?: Record<string, unknown>;
}): string {
  const store = getLifeOsStore();
  const id = `cr-${store.careerRequests.length + 1}`;
  store.careerRequests.push({
    careerRequestId: id,
    residentId: input.residentId,
    requestKind: input.requestKind,
    summary: input.summary,
    status: 'OPEN',
    founderApprovalRequired: input.founderApprovalRequired ?? true,
    at: getSimulationNowIso(),
    payload: input.payload ?? {},
  });
  recordResidentEvent({
    eventType: 'CAREER_EVENT',
    timestamp: getSimulationNowIso(),
    worldId: store.worldId,
    organizationId: store.organizationId,
    residentIds: [input.residentId],
    visibility: 'FOUNDER_PRIVILEGED',
    source: 'simulation',
    payload: {
      summary: input.summary,
      requestKind: input.requestKind,
      significance: 0.8,
      founderRelevance: 0.85,
      founderActionRequired: input.founderApprovalRequired ?? true,
    },
    truthStatus: 'AUTHORITATIVE',
  });
  void persistLifeOsStore();
  return id;
}

export function createResidentProposal(residentId: ResidentId, summary: string): string {
  const id = `proposal-${Date.now()}`;
  recordResidentEvent({
    eventType: 'WORLD_STORY',
    timestamp: new Date().toISOString(),
    worldId: getLifeOsStore().worldId,
    organizationId: getLifeOsStore().organizationId,
    residentIds: [residentId],
    visibility: 'TEAM_ONLY',
    source: 'simulation',
    payload: { kind: 'PROPOSAL', summary },
    truthStatus: 'PROPOSED',
  });
  return id;
}

export function createWorldStory(input: Omit<WorldStoryRecord, 'storyId'>): WorldStoryRecord {
  const store = getLifeOsStore();
  const story: WorldStoryRecord = { ...input, storyId: `ws-${store.worldStories.length + 1}` };
  const eventExists = store.events.some((e) => e.eventId === input.groundedEventId);
  if (!eventExists) {
    throw new Error('World story must reference an actual simulation event');
  }
  store.worldStories.push(story);
  recordResidentEvent({
    eventId: `evt-ws-${story.storyId}`,
    eventType: 'WORLD_STORY',
    timestamp: input.at,
    worldId: store.worldId,
    organizationId: store.organizationId,
    residentIds: input.residentIds,
    visibility: 'OFFICE_KNOWN',
    source: 'simulation',
    payload: { storyId: story.storyId, storyType: input.storyType },
    truthStatus: 'AUTHORITATIVE',
    causalParentEventId: input.groundedEventId,
  });
  return story;
}

export function getReturnBrief(fromIso: string, toIso: string, access?: { isFounderPrivileged: boolean }): ReturnBrief {
  return buildReturnBrief(fromIso, toIso, access ?? { isFounderPrivileged: true });
}

export function getOrganizationalMemory() {
  return [...getLifeOsStore().orgMemory];
}

export function listFounderPrivateDisclosures(): PrivateDisclosureRecord[] {
  return [...getLifeOsStore().privateDisclosures];
}

export function registerPrivateDisclosure(input: Omit<PrivateDisclosureRecord, 'disclosureId' | 'at'>): PrivateDisclosureRecord {
  const store = getLifeOsStore();
  const rec: PrivateDisclosureRecord = {
    ...input,
    disclosureId: `pd-${store.privateDisclosures.length + 1}`,
    at: new Date().toISOString(),
  };
  store.privateDisclosures.push(rec);
  return rec;
}

export function addMemoryRecord(memory: Omit<ResidentMemoryRecord, 'memoryId'>): ResidentMemoryRecord {
  const store = getLifeOsStore();
  const retention = scoreMemoryRetention(memory);
  const stability = classifyMemoryStability(memory.memoryClass, retention);
  const full: ResidentMemoryRecord = {
    ...memory,
    memoryId: `mem-${memory.residentId}-${store.memories.size + 1}`,
  };
  if (stability === 'LOW' && memory.memoryClass === 'EPISODIC_MEMORY') {
    // still stored for QA — decay policy deferred to runtime
  }
  const list = store.memories.get(memory.residentId) ?? [];
  list.push(full);
  store.memories.set(memory.residentId, list);
  return full;
}

export function setResidentBelief(belief: import('./life-twin-model').ResidentBeliefRecord): void {
  const store = getLifeOsStore();
  const list = store.beliefs.get(belief.residentId) ?? [];
  list.push(belief);
  store.beliefs.set(belief.residentId, list);
}

export function getPairingOutcomesForPair(a: ResidentId, b: ResidentId, taskType?: string) {
  const store = getLifeOsStore();
  return store.pairingOutcomes.filter(
    (p) =>
      (p.residentAId === a && p.residentBId === b) || (p.residentAId === b && p.residentBId === a),
  ).filter((p) => (taskType ? p.taskType === taskType : true));
}

export function attachCastRole(contract: ResidentCastRoleContract): void {
  const resident = getResidentById(contract.residentId);
  if (!resident) throw new Error(`Unknown resident ${contract.residentId}`);
  const before = cloneCanonicalIdentity(resident);
  getLifeOsStore().activeCastRoles.push({ ...contract });
  const after = cloneCanonicalIdentity(getResidentById(contract.residentId)!);
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    throw new Error('Cast role attachment mutated canonical identity');
  }
}

export function getHumanEmployeeProfile(employeeId: string): HumanEmployeeLearningProfile | undefined {
  return getLifeOsStore().humanEmployees.get(employeeId);
}

export function registerHumanEmployee(profile: HumanEmployeeLearningProfile): void {
  getLifeOsStore().humanEmployees.set(profile.employeeId, profile);
}

export function getTrainingCanon(companyId: string, domain: string): TrainingCanonDocument | undefined {
  return [...getLifeOsStore().trainingCanons.values()].find(
    (c) => c.companyId === companyId && c.domain === domain && c.approvalStatus === 'approved',
  );
}

export function registerTrainingCanon(doc: TrainingCanonDocument): void {
  getLifeOsStore().trainingCanons.set(doc.canonId, doc);
}

export function getRoleCurriculum(_role: string) {
  return { modules: ['COMPANY_OVERVIEW', 'ROLE_OVERVIEW', 'WORKFLOW', 'RISK', 'SIMULATION'] };
}

export function startTrainingSession(employeeId: string, curriculumId: string): TrainingSessionState {
  return {
    sessionId: `ts-${Date.now()}`,
    employeeId,
    curriculumId,
    startedAt: new Date().toISOString(),
    status: 'active',
  };
}

export function evaluateTrainingResponse(questionRisk: 'low' | 'high', companyId: string, domain: string) {
  const canon = getTrainingCanon(companyId, domain);
  return evaluateTrainerAnswer(questionRisk, canon);
}

export function recordCompetency(employeeId: string, task: string, cleared: boolean): void {
  const profile = getHumanEmployeeProfile(employeeId);
  if (!profile) return;
  if (cleared && !profile.authorizedTasks.includes(task)) {
    profile.authorizedTasks.push(task);
  }
}

export function createEscalation(employeeId: string, reason: string, riskArea: string): void {
  getLifeOsStore().trainingEscalations.push({
    escalationId: `esc-${Date.now()}`,
    employeeId,
    reason,
    riskArea,
    at: new Date().toISOString(),
  });
}

export function proposeTrainingCanonCorrectionEntry(
  input: Omit<import('./training-domain').ProposedCanonCorrection, 'correctionId' | 'reviewStatus'>
) {
  const proposal = proposeTrainingCanonCorrection(input);
  getLifeOsStore().proposedCorrections.push(proposal);
  return proposal;
}

export function approveTrainingCanonCorrection(correctionId: string, canonId: string): TrainingCanonDocument | null {
  const store = getLifeOsStore();
  const proposal = store.proposedCorrections.find((p) => p.correctionId === correctionId);
  const canon = store.trainingCanons.get(canonId);
  if (!proposal || !canon) return null;
  if (proposal.reviewStatus !== 'approved') return null;
  const updated = applyApprovedTrainingCorrection(canon, proposal);
  if (updated) store.trainingCanons.set(canonId, updated);
  return updated;
}

export function markTrainingCanonCorrectionApproved(correctionId: string): void {
  const proposal = getLifeOsStore().proposedCorrections.find((p) => p.correctionId === correctionId);
  if (proposal) proposal.reviewStatus = 'approved';
}

export function seedAioTrainingCanonExample(): void {
  registerTrainingCanon({
    canonId: 'aio-permit-intake-v1',
    companyId: 'aio',
    domain: 'permitting',
    title: 'Standard intake — authority status check',
    source: 'approved_sop',
    version: '1.0.0',
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    roleScope: ['PERMIT_SPECIALIST_I'],
    bodySummary: 'Ask operating status vs authority status before proceeding with filings.',
  });
}

export function assertResidentStillHasHistory(residentId: ResidentId): boolean {
  const store = getLifeOsStore();
  const events = store.events.filter((e) => e.residentIds.includes(residentId));
  const mems = store.memories.get(residentId) ?? [];
  return events.length > 0 || mems.length > 0 || store.bundles.has(residentId);
}

export function getLifeOsDefaults() {
  return {
    worldId: STUDIO_WORLD_DEFAULT_WORLD_ID,
    organizationId: STUDIO_WORLD_DEFAULT_ORG_SLUG,
    version: RESIDENT_LIFE_OS_VERSION,
  };
}

export function getInspectorSnapshot(residentId: ResidentId) {
  const registry = getSeason1ResidentRegistry();
  const documentary = registry.documentaryProfiles.find((p) => p.residentId === residentId);
  const twin = getResidentLifeTwin(residentId);
  const store = getLifeOsStore();
  return {
    twin,
    relationships: getResidentRelationshipState(residentId),
    memories: getResidentMemories(residentId),
    knowledge: getResidentKnowledgeState(residentId),
    goals: getResidentGoals(residentId),
    autonomy: getResidentAutonomy(residentId),
    rumors: store.rumors.filter((r) => r.holderId === residentId),
    truthEvents: [...store.truthEvents.values()],
    interventions: store.interventions.filter((i) => i.targetResidentId === residentId),
    documentary,
    castRoles: store.activeCastRoles.filter((c) => c.residentId === residentId),
    orgMemory: store.orgMemory,
  };
}

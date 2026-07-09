import { BUSINESS_DISCOVERY_PHASES } from '../phases';
import type {
  BusinessDiscoveryPhaseId,
  DiscoveryCompanyProfile,
  DiscoveryFounderProfile,
  DiscoveryOrbConfiguration,
  DiscoveryPhaseProgress,
  DiscoveryResponse,
  DiscoverySession,
  DiscoverySessionStatus,
} from '../types';

export function normalizeDiscoveryResponse(
  questionId: string,
  phaseId: BusinessDiscoveryPhaseId,
  answer: string
): DiscoveryResponse {
  const trimmed = answer.trim();
  return {
    questionId,
    phaseId,
    answer: trimmed,
    answeredAt: new Date().toISOString(),
    wordCount: trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0,
  };
}

export function buildInitialPhaseProgress(): DiscoveryPhaseProgress[] {
  return BUSINESS_DISCOVERY_PHASES.map((phase) => ({
    phaseId: phase.id,
    answeredCount: 0,
    totalCount: phase.questionsAsked.length,
    percentComplete: 0,
    status: 'not-started',
  }));
}

export function defaultOrbConfiguration(): DiscoveryOrbConfiguration {
  return {
    strategistTone: 'consultative',
    briefingCadence: 'milestone-only',
    escalationStyle: 'founder-first',
    proactiveInsights: true,
    milestoneLanguage: true,
  };
}

export function buildInitialFounder(founderId: string, displayName = 'Founder'): DiscoveryFounderProfile {
  return {
    founderId,
    displayName,
    values: [],
    goals: [],
  };
}

export function buildInitialCompany(
  companyId: string,
  companyName: string,
  industryId = 'general-business'
): DiscoveryCompanyProfile {
  return {
    companyId,
    companyName,
    industryId,
    offers: [],
    customerSegments: [],
    revenueSources: [],
    technologyStack: [],
  };
}

export function createDiscoverySession(
  organizationId: string,
  options: {
    founderId?: string;
    founderName?: string;
    companyName?: string;
    industryId?: string;
  } = {}
): DiscoverySession {
  const now = new Date().toISOString();
  const founderId = options.founderId ?? `founder-${organizationId}`;
  const companyId = `company-${organizationId}`;

  return {
    id: `discovery-${organizationId}-${Date.now()}`,
    organizationId,
    status: 'in-progress',
    founder: buildInitialFounder(founderId, options.founderName),
    company: buildInitialCompany(
      companyId,
      options.companyName ?? 'New Organization',
      options.industryId ?? 'general-business'
    ),
    progress: buildInitialPhaseProgress(),
    responses: [],
    discoveredSystems: [],
    relationships: [],
    dependencies: [],
    insights: [],
    recommendations: [],
    risks: [],
    generatedObjects: [],
    generatedHeadquarters: null,
    generatedDepartments: [],
    generatedRooms: [],
    generatedMissions: [],
    orbConfiguration: defaultOrbConfiguration(),
    companyGenome: null,
    currentPhaseId: 'founder-discovery',
    overallProgressPercent: 0,
    genomeCompletionPercent: 0,
    founderMomentsCelebrated: [],
    startedAt: now,
    updatedAt: now,
  };
}

export function upsertDiscoveryResponse(
  session: DiscoverySession,
  response: DiscoveryResponse
): DiscoverySession {
  const responses = [
    ...session.responses.filter(
      (item) => !(item.questionId === response.questionId && item.phaseId === response.phaseId)
    ),
    response,
  ];
  return { ...session, responses, updatedAt: new Date().toISOString() };
}

export function touchDiscoverySessionStatus(
  session: DiscoverySession,
  status: DiscoverySessionStatus
): DiscoverySession {
  return {
    ...session,
    status,
    updatedAt: new Date().toISOString(),
    completedAt: status === 'complete' ? new Date().toISOString() : session.completedAt,
  };
}

export function normalizeDiscoverySession(session: DiscoverySession): DiscoverySession {
  return {
    ...session,
    progress: session.progress.length ? session.progress : buildInitialPhaseProgress(),
    orbConfiguration: session.orbConfiguration ?? defaultOrbConfiguration(),
  };
}

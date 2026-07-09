import { BUSINESS_DISCOVERY_PHASES } from '../phases';
import { normalizeDiscoveryResponse, upsertDiscoveryResponse } from '../discovery-sessions/schemas';
import { ensureDiscoverySession, upsertDiscoverySession } from '../discovery-sessions/store';
import {
  computeGenomeCompletion,
  computeOverallProgress,
  computePhaseProgress,
  resolveCurrentPhase,
  resolveSessionStatus,
} from '../discovery-progress/calculator';
import { resolveNextQuestions } from '../discovery-questions/engine';
import {
  extractCompanyProfile,
  extractFounderProfile,
  analyzeRelationships,
} from '../relationship-engine/analyzer';
import {
  generatePhaseInsights,
  generateDiscoveryRecommendations,
  mergeInsights,
  topInsight,
} from '../discovery-insights/generator';
import { analyzeBusinessRisks } from './risk-analyzer';
import { detectAutomationOpportunities } from './automation-engine';
import { generateCompanyGenome } from '../genome-builder/generator';
import { generateHeadquartersPackage } from '../headquarters-generator/generator';
import { buildDiscoveryVisualExperience } from '../visual-experience/builder';
import type {
  BusinessDiscoveryPhaseId,
  BusinessDiscoveryState,
  DiscoveryEngineSyncOptions,
  DiscoverySession,
} from '../types';

export function bootstrapBusinessDiscovery(
  organizationId: string,
  options: {
    founderId?: string;
    founderName?: string;
    companyName?: string;
    industryId?: string;
  } = {}
): DiscoverySession {
  return ensureDiscoverySession(organizationId, options);
}

function applyProfiles(session: DiscoverySession): DiscoverySession {
  return {
    ...session,
    founder: extractFounderProfile(session.founder, session.responses),
    company: extractCompanyProfile(session.company, session.responses),
  };
}

function applyRelationshipAnalysis(session: DiscoverySession): DiscoverySession {
  const { systems, relationships, dependencies } = analyzeRelationships(session);
  return {
    ...session,
    discoveredSystems: systems,
    relationships,
    dependencies,
  };
}

function applyInsightsAndRisks(session: DiscoverySession, phaseId?: BusinessDiscoveryPhaseId): DiscoverySession {
  const phaseIds = phaseId ? [phaseId] : BUSINESS_DISCOVERY_PHASES.map((phase) => phase.id);
  let insights = session.insights;
  const newMoments: string[] = [];

  for (const id of phaseIds) {
    const phaseInsights = generatePhaseInsights(session, id);
    for (const insight of phaseInsights) {
      if (insight.founderMoment && !session.founderMomentsCelebrated.includes(insight.founderMoment)) {
        newMoments.push(insight.founderMoment);
      }
    }
    insights = mergeInsights(insights, phaseInsights);
  }

  const risks = analyzeBusinessRisks(session);
  const recommendations = generateDiscoveryRecommendations({ ...session, insights, risks });

  return {
    ...session,
    insights,
    risks,
    recommendations,
    founderMomentsCelebrated: [...session.founderMomentsCelebrated, ...newMoments],
  };
}

function maybeGenerateGenome(session: DiscoverySession): DiscoverySession {
  const progress = computeOverallProgress(session.progress);
  if (progress < 40 && session.responses.length < 6) return session;

  const companyGenome = generateCompanyGenome(session);
  return {
    ...session,
    companyGenome,
    genomeCompletionPercent: companyGenome.completionPercent,
  };
}

function maybeGenerateHeadquarters(session: DiscoverySession): DiscoverySession {
  if (!session.companyGenome) return session;

  const pkg = generateHeadquartersPackage(session);
  if (!pkg.headquarters) return session;

  return {
    ...session,
    generatedHeadquarters: pkg.headquarters,
    generatedDepartments: pkg.departments,
    generatedRooms: pkg.rooms,
    generatedMissions: pkg.missions,
    orbConfiguration: pkg.orbConfiguration,
    generatedObjects: [...session.generatedObjects, ...pkg.generatedObjects],
  };
}

function finalizeSession(session: DiscoverySession): DiscoverySession {
  const progress = computePhaseProgress(session);
  const overallProgressPercent = computeOverallProgress(progress);
  const genomeCompletionPercent = session.companyGenome
    ? session.companyGenome.completionPercent
    : computeGenomeCompletion(session);
  const currentPhaseId = resolveCurrentPhase(progress);
  const status = resolveSessionStatus(session, overallProgressPercent, genomeCompletionPercent);

  return {
    ...session,
    progress,
    overallProgressPercent,
    genomeCompletionPercent,
    currentPhaseId,
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function syncBusinessDiscovery(options: DiscoveryEngineSyncOptions): BusinessDiscoveryState {
  let session = ensureDiscoverySession(options.organizationId, {
    founderId: options.founderId,
    companyName: options.companyName,
    industryId: options.industryId,
  });

  if (options.recordResponse) {
    const response = normalizeDiscoveryResponse(
      options.recordResponse.questionId,
      options.recordResponse.phaseId,
      options.recordResponse.answer
    );
    session = upsertDiscoveryResponse(session, response);
  }

  session = applyProfiles(session);
  session = applyRelationshipAnalysis(session);
  session = applyInsightsAndRisks(session, options.recordResponse?.phaseId);
  session = maybeGenerateGenome(session);

  // Refresh risks/opportunities after genome
  session = {
    ...session,
    risks: analyzeBusinessRisks(session),
    recommendations: generateDiscoveryRecommendations(session),
  };

  // Attach automation opportunities to genome if present
  if (session.companyGenome) {
    session = {
      ...session,
      companyGenome: {
        ...session.companyGenome,
        automationOpportunities: detectAutomationOpportunities(session),
        operationalRisks: session.risks,
        aiOpportunities: generateDiscoveryRecommendations(session).filter(
          (rec) => rec.category === 'automation' || rec.category === 'knowledge'
        ),
      },
    };
  }

  session = maybeGenerateHeadquarters(session);
  session = finalizeSession(session);

  const saved = upsertDiscoverySession(session);
  const visualExperience = buildDiscoveryVisualExperience(saved);
  const nextQuestions = resolveNextQuestions(
    { session: saved, phaseId: saved.currentPhaseId, industryId: saved.company.industryId },
    3
  );

  return {
    session: saved,
    visualExperience,
    nextQuestions,
    topInsight: topInsight(saved),
  };
}

export function recordDiscoveryAnswer(
  organizationId: string,
  questionId: string,
  phaseId: BusinessDiscoveryPhaseId,
  answer: string
): BusinessDiscoveryState {
  return syncBusinessDiscovery({
    organizationId,
    recordResponse: { questionId, phaseId, answer },
  });
}

export function getBusinessDiscoveryState(organizationId: string): BusinessDiscoveryState {
  return syncBusinessDiscovery({ organizationId });
}

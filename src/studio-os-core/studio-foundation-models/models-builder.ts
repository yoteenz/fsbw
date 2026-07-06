import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationModelOrchestratorProfile } from '../model-orchestrator/store';
import { getOrganizationStudioIntelligenceArchitectureProfile } from '../studio-intelligence-architecture/store';
import { getOrganizationTrustFrameworkProfile } from '../professional-trust-framework/store';
import { buildFoundationCapabilities, summarizeFoundationCapabilities } from './foundation-models';
import { buildProfessionModels, summarizeProfessionModels } from './profession-models';
import { buildTrainingSources, summarizeTrainingSources } from './training-source-engine';
import {
  buildDemoHybridRequest,
  buildHybridIntelligenceLine,
  buildHybridLayers,
  summarizeHybridIntelligence,
} from './hybrid-intelligence';
import { buildEnterpriseDeployments, summarizeEnterpriseDeployment } from './enterprise-deployment';
import { buildMoatLine, buildMoatSources, summarizeMoat } from './moat-engine';
import {
  buildRoadmapPhases,
  computeFoundationScore,
  resolveCurrentRoadmapPhase,
  summarizeRoadmap,
} from './roadmap-engine';
import type { OrganizationStudioFoundationModelsProfile } from './types';

export function buildDockFoundationModelsLine(profile: OrganizationStudioFoundationModelsProfile): string {
  if (profile.foundationScore >= 85) {
    return `Studio Foundation Models™ ${profile.foundationScore}% — ${profile.professionModels.length} Profession Models™ · hybrid intelligence active · roadmap: ${profile.currentRoadmapPhase.replace(/-/g, ' ')}. General models know the world. Studio Models™ know organizations.`;
  }
  return `Studio Models™ roadmap calibrating — ${profile.foundationScore}% foundation score. Third-party models are the bridge. Studio-owned intelligence is the destination.`;
}

export function buildOrganizationStudioFoundationModelsProfile(
  organizationId: string
): OrganizationStudioFoundationModelsProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const sia = getOrganizationStudioIntelligenceArchitectureProfile(organizationId);
  const orchestrator = getOrganizationModelOrchestratorProfile(organizationId);
  const trust = getOrganizationTrustFrameworkProfile(organizationId);

  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;
  const brainVitality = brain?.overallMaturityPct ?? 70;
  const architectureScore = sia?.architectureScore ?? 75;
  const architectureNodes = sia?.knowledgeFabricNodes ?? 0;
  const orchestratorScore = orchestrator?.orchestratorScore ?? 70;
  const trustRegulated = Boolean(trust?.regulatedRules?.length);
  const brainLinked = Boolean(brain);
  const orchestratorLinked = Boolean(orchestrator);

  const roadmapPhases = buildRoadmapPhases(orchestratorScore, architectureScore);
  const currentRoadmapPhase = resolveCurrentRoadmapPhase(roadmapPhases);
  const foundationCapabilities = buildFoundationCapabilities(architectureScore, brainVitality);
  const professionModels = buildProfessionModels(industryId, brainLinked, trustRegulated);
  const trainingSources = buildTrainingSources(brainLinked, true);
  const hybridLayers = buildHybridLayers(orchestratorLinked);
  const enterpriseDeployments = buildEnterpriseDeployments(
    trustRegulated,
    orchestrator?.offlineCapable ?? false
  );
  const moatSources = buildMoatSources(brainVitality, architectureNodes, orchestratorScore);

  const roadmapProgressAvg = Math.round(
    roadmapPhases.reduce((s, p) => s + p.progressPct, 0) / Math.max(1, roadmapPhases.length)
  );
  const professionModelsReady = professionModels.filter((m) => m.readinessPct >= 70).length;
  const moatAvg = Math.round(
    moatSources.reduce((s, m) => s + m.contributionPct, 0) / Math.max(1, moatSources.length)
  );
  const hybridLayersActive = hybridLayers.filter((l) => l.active).length;

  const profile: OrganizationStudioFoundationModelsProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    foundationScore: 0,
    currentRoadmapPhase,
    roadmapPhases,
    foundationCapabilities,
    professionModels,
    trainingSources,
    hybridLayers,
    enterpriseDeployments,
    moatSources,
    recentHybridRequests: [buildDemoHybridRequest('studio-tax')],
    dockFoundationModelsLine: '',
    hybridIntelligenceLine: buildHybridIntelligenceLine(hybridLayers),
    moatLine: buildMoatLine(moatSources),
    modelOrchestratorLinked: true,
    externalModelsBridge: true,
    neverTrainWithoutConsent: true,
    syncedSources: [
      'model-orchestrator',
      'studio-intelligence-architecture',
      'profession-brain',
      'professional-trust-framework',
      'legacy-vault',
      'organization-operating-manual',
      'studio-institute',
      'knowledge-fabric',
    ],
  };

  profile.foundationScore = computeFoundationScore(
    roadmapProgressAvg,
    professionModelsReady,
    moatAvg,
    hybridLayersActive
  );
  profile.dockFoundationModelsLine = buildDockFoundationModelsLine(profile);

  return profile;
}

export function summarizeStudioFoundationModelsProfile(
  profile: OrganizationStudioFoundationModelsProfile
): string {
  return [
    profile.dockFoundationModelsLine,
    summarizeRoadmap(profile.roadmapPhases, profile.currentRoadmapPhase),
    summarizeFoundationCapabilities(profile.foundationCapabilities),
    summarizeProfessionModels(profile.professionModels),
    summarizeTrainingSources(profile.trainingSources),
    summarizeHybridIntelligence(profile.hybridLayers),
    summarizeEnterpriseDeployment(profile.enterpriseDeployments),
    summarizeMoat(profile.moatSources),
    'Preserve Expertise. Build Legacy. Own the Intelligence Layer.',
  ].join(' ');
}

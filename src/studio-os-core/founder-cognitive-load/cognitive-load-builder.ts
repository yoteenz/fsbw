import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildAttentionModes } from './attention-engine';
import {
  buildCognitiveFactorSnapshots,
  computeCognitiveDemand,
  resolveLoadState,
} from './cognitive-analyzer';
import { buildExecutiveAssistance, buildDockHeadline, summarizeCognitiveLoadProfile } from './assistance-engine';
import { buildIntelligentFilters, computeFocusProtection } from './filtering-engine';
import type { OrganizationFounderCognitiveLoadProfile } from './types';

export { summarizeCognitiveLoadProfile };

export function buildOrganizationFounderCognitiveLoadProfile(
  organizationId: string
): OrganizationFounderCognitiveLoadProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();

  const factorSnapshots = buildCognitiveFactorSnapshots(organizationId);
  const cognitiveDemandPct = computeCognitiveDemand(factorSnapshots);
  const loadState = resolveLoadState(cognitiveDemandPct);
  const activeFilters = buildIntelligentFilters(loadState, cognitiveDemandPct);
  const focusProtectionPct = computeFocusProtection(activeFilters, loadState);
  const { modes: attentionModes, activeMode: activeAttentionMode } = buildAttentionModes(loadState);
  const executiveAssistance = buildExecutiveAssistance(
    organizationId,
    loadState,
    activeFilters,
    council?.pendingDecisions ?? 0
  );

  return {
    organizationId,
    companyName,
    industryId: brain?.industryId ?? organizationId,
    updatedAt: new Date().toISOString(),
    cognitiveDemandPct,
    focusProtectionPct,
    loadState,
    activeAttentionMode,
    factorSnapshots,
    activeFilters,
    attentionModes,
    executiveAssistance,
    dockHeadline: buildDockHeadline(executiveAssistance, loadState),
    syncedSources: [
      'ambient-awareness',
      'anticipation-engine',
      'organization-pulse',
      'executive-council',
      'business-discovery-blueprint',
      'profession-brain',
      'command-dock',
      'mission-control',
    ],
  };
}

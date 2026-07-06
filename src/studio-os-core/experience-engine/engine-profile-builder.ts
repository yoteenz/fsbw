import { getOrganizationAssetRegistryProfile } from '../asset-registry/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildContextSignalReadings, computeContextAwarenessPct } from './context-engine';
import { buildAdaptiveEnvironmentSettings } from './environment-engine';
import {
  buildExperienceRecommendations,
  computeAdaptabilityPct,
  runExperienceGovernanceAudit,
} from './governance-engine';
import { buildExperienceModeCatalog, resolveActiveMode } from './mode-catalog';
import { buildExperienceTransitionRules, computeTransitionQualityPct } from './transition-engine';
import type { OrganizationExperienceEngineProfile } from './types';

export function buildDockExperienceLine(profile: OrganizationExperienceEngineProfile): string {
  return `Experience Engine™ ${profile.atmosphereScore}% — ${profile.activeModeLabel} active · ${profile.contextAwarenessPct}% context-aware · Infrastructure Chapter complete.`;
}

export function buildOrganizationExperienceEngineProfile(organizationId: string): OrganizationExperienceEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const assetRegistry = getOrganizationAssetRegistryProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const contextSignals = buildContextSignalReadings();
  const activeMode = resolveActiveMode(contextSignals);
  const experienceModes = buildExperienceModeCatalog();
  const environmentSettings = buildAdaptiveEnvironmentSettings(activeMode);
  const transitionRules = buildExperienceTransitionRules();
  const contextAwarenessPct = computeContextAwarenessPct(contextSignals);
  const transitionQualityPct = computeTransitionQualityPct();
  const adaptabilityPct = computeAdaptabilityPct(experienceModes.length, contextAwarenessPct);
  const governanceFindings = runExperienceGovernanceAudit();
  const activeModeEntry = experienceModes.find((m) => m.modeId === activeMode);

  const assetBoost = assetRegistry ? Math.round(assetRegistry.registryScore / 30) : 0;
  const atmosphereScore = Math.min(
    99,
    Math.round((adaptabilityPct + contextAwarenessPct + transitionQualityPct + assetBoost) / 3)
  );

  const profile: OrganizationExperienceEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    atmosphereScore,
    adaptabilityPct,
    contextAwarenessPct,
    transitionQualityPct,
    experienceModes,
    environmentSettings,
    contextSignals,
    transitionRules,
    governanceFindings,
    recommendations: buildExperienceRecommendations(activeMode),
    activeMode,
    activeModeLabel: activeModeEntry?.label ?? 'Normal',
    dockExperienceLine: '',
    infrastructureChapterComplete: true,
    lastSyncedAt: now,
  };

  profile.dockExperienceLine = buildDockExperienceLine(profile);
  return profile;
}

export function summarizeExperienceEngine(profile: OrganizationExperienceEngineProfile): string {
  return `${profile.dockExperienceLine} Calm · confident · intentional.`;
}

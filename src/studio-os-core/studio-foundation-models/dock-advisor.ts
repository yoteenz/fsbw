import { summarizeStudioFoundationModelsProfile } from './models-builder';
import { summarizeProfessionModels } from './profession-models';
import { summarizeTrainingSources } from './training-source-engine';
import { summarizeHybridIntelligence } from './hybrid-intelligence';
import { summarizeEnterpriseDeployment } from './enterprise-deployment';
import { summarizeMoat } from './moat-engine';
import { summarizeRoadmap } from './roadmap-engine';
import {
  ensureOrganizationStudioFoundationModelsProfile,
  getOrganizationStudioFoundationModelsProfile,
} from './store';
import type { StudioFoundationModelsDockAdvice } from './types';

export function resolveStudioFoundationModelsAdvice(
  input: string,
  organizationId: string
): StudioFoundationModelsDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationStudioFoundationModelsProfile(organizationId) ??
    ensureOrganizationStudioFoundationModelsProfile(organizationId);

  if (/studio foundation|foundation model|studio model|profession model|own the intelligence|long.term roadmap/i.test(trimmed)) {
    return {
      response: summarizeStudioFoundationModelsProfile(profile),
      concierge: 'Chief Concierge',
      foundationScore: profile.foundationScore,
      currentRoadmapPhase: profile.currentRoadmapPhase,
    };
  }

  if (/roadmap|model.agnostic|model.resilient|model.independent|third.party.*bridge/i.test(trimmed)) {
    return {
      response: summarizeRoadmap(profile.roadmapPhases, profile.currentRoadmapPhase),
      concierge: 'Chief Concierge',
      currentRoadmapPhase: profile.currentRoadmapPhase,
    };
  }

  if (/profession model|studio tax|studio legal|studio medical|studio hair|studio construction|specialized/i.test(trimmed)) {
    return {
      response: summarizeProfessionModels(profile.professionModels),
      concierge: 'Chief Concierge',
      foundationScore: profile.foundationScore,
    };
  }

  if (/training source|train on|consent|private org data|never train/i.test(trimmed)) {
    return {
      response: summarizeTrainingSources(profile.trainingSources),
      concierge: 'Chief Concierge',
    };
  }

  if (/hybrid intelligence|layered intelligence|knowledge fabric.*context|external model.*draft/i.test(trimmed)) {
    return {
      response: summarizeHybridIntelligence(profile.hybridLayers),
      concierge: 'Chief Concierge',
    };
  }

  if (/enterprise deployment|private studio|offline enterprise|regulated|local inference|customer.owned/i.test(trimmed)) {
    return {
      response: summarizeEnterpriseDeployment(profile.enterpriseDeployments),
      concierge: 'Chief Concierge',
    };
  }

  if (/moat|compounds|organizational expertise|legacy vault.*entry|blueprint.*improve/i.test(trimmed)) {
    return {
      response: summarizeMoat(profile.moatSources),
      concierge: 'Chief Concierge',
      foundationScore: profile.foundationScore,
    };
  }

  if (/general models know|studio models know|preserve expertise|build legacy/i.test(trimmed)) {
    return {
      response: `General models know the world. Studio Models™ know how organizations operate. ${profile.dockFoundationModelsLine}`,
      concierge: 'Chief Concierge',
      foundationScore: profile.foundationScore,
    };
  }

  return null;
}

export function listStudioFoundationModelsDockSuggestions(organizationId: string): string[] {
  ensureOrganizationStudioFoundationModelsProfile(organizationId);
  return [
    'Explain Studio Foundation Models and the long-term roadmap.',
    'Which Profession Models are available for our organization?',
    'How does hybrid intelligence work with external models?',
    'What is the Studio Models training and consent policy?',
  ].slice(0, 4);
}

export function buildProactiveStudioFoundationModelsSuggestion(organizationId: string): string | null {
  const profile = getOrganizationStudioFoundationModelsProfile(organizationId);
  if (!profile) return null;
  return summarizeStudioFoundationModelsProfile(profile);
}

export function buildStudioFoundationModelsOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationStudioFoundationModelsProfile(organizationId);
  return profile.dockFoundationModelsLine;
}

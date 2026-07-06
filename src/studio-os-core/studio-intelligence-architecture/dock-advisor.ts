import { summarizeStudioIntelligenceArchitectureProfile } from './architecture-builder';
import { summarizeContextEngine } from './context-engine';
import { summarizeKnowledgeFabric } from './knowledge-fabric';
import { summarizeIntelligenceLayer } from './intelligence-layer';
import { summarizeModelGateway } from './model-gateway';
import {
  ensureOrganizationStudioIntelligenceArchitectureProfile,
  getOrganizationStudioIntelligenceArchitectureProfile,
} from './store';
import type { StudioIntelligenceArchitectureDockAdvice } from './types';

export function resolveStudioIntelligenceArchitectureAdvice(
  input: string,
  organizationId: string
): StudioIntelligenceArchitectureDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationStudioIntelligenceArchitectureProfile(organizationId) ??
    ensureOrganizationStudioIntelligenceArchitectureProfile(organizationId);

  if (/studio intelligence|intelligence architecture|model.agnostic|model agnostic/i.test(trimmed)) {
    return {
      response: summarizeStudioIntelligenceArchitectureProfile(profile),
      concierge: 'Chief Concierge',
      architectureScore: profile.architectureScore,
      pipelineHealthPct: profile.pipelineHealthPct,
    };
  }

  if (/knowledge fabric|knowledge graph|interconnected/i.test(trimmed)) {
    return {
      response: summarizeKnowledgeFabric(profile.knowledgeFabricNodesList, profile.knowledgeFabricEdges),
      concierge: 'Chief Concierge',
      architectureScore: profile.architectureScore,
    };
  }

  if (/context engine|trusted context|what does.*know|organization know/i.test(trimmed)) {
    return {
      response: summarizeContextEngine(profile.contextBundle),
      concierge: 'Chief Concierge',
      pipelineHealthPct: profile.pipelineHealthPct,
    };
  }

  if (/intelligence layer|pipeline|validate output|no direct|third.party ai|vendor/i.test(trimmed)) {
    return {
      response: summarizeIntelligenceLayer(profile.pipelineSteps),
      concierge: 'Chief Concierge',
      pipelineHealthPct: profile.pipelineHealthPct,
    };
  }

  if (/model gateway|openai|anthropic|google|xai|reasoning engine|provider/i.test(trimmed)) {
    return {
      response: summarizeModelGateway(profile.modelGatewayRoutes),
      concierge: 'Chief Concierge',
    };
  }

  if (/knowledge vs reasoning|moat|preserved expertise|not defined by models/i.test(trimmed)) {
    return {
      response: `${profile.knowledgeVsReasoningLine} The moat is preserved expertise, identity, memory, decisions, relationships, and history — not any single AI vendor.`,
      concierge: 'Chief Concierge',
      architectureScore: profile.architectureScore,
    };
  }

  if (/profession brain|genome|memory engine|consciousness|operating manual/i.test(trimmed)) {
    const connected = profile.intelligenceStack.filter((s) => s.connected);
    return {
      response: `${connected.length}/${profile.intelligenceStack.length} intelligence systems connected · ${connected.map((s) => s.label).slice(0, 4).join(' · ')}…`,
      concierge: 'Chief Concierge',
      architectureScore: profile.architectureScore,
    };
  }

  return null;
}

export function listStudioIntelligenceArchitectureDockSuggestions(organizationId: string): string[] {
  ensureOrganizationStudioIntelligenceArchitectureProfile(organizationId);
  return [
    'Explain Studio Intelligence Architecture — model-agnostic layer.',
    'What context does the Context Engine assemble before AI responds?',
    'Show Knowledge Fabric connections for our organization.',
    'How does Studio OS separate knowledge from reasoning?',
  ].slice(0, 4);
}

export function buildProactiveStudioIntelligenceArchitectureSuggestion(
  organizationId: string
): string | null {
  const profile = getOrganizationStudioIntelligenceArchitectureProfile(organizationId);
  if (!profile) return null;
  return summarizeStudioIntelligenceArchitectureProfile(profile);
}

export function buildStudioIntelligenceArchitectureOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationStudioIntelligenceArchitectureProfile(organizationId);
  return profile.dockArchitectureLine;
}

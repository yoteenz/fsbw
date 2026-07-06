import { detectBottleneckWorkflows } from './analytics-engine';
import { explainProcessTemplate, explainWorkflowNode, queryWorkflowEngine } from './discovery-engine';
import { summarizeWorkflowEngine } from './engine-profile-builder';
import { isSimulationReady } from './testing-engine';
import {
  ensureOrganizationWorkflowEngineProfile,
  getOrganizationWorkflowEngineProfile,
} from './store';
import type { WorkflowEngineDockAdvice } from './types';

export function resolveWorkflowEngineAdvice(input: string, organizationId: string): WorkflowEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationWorkflowEngineProfile(organizationId) ??
    ensureOrganizationWorkflowEngineProfile(organizationId);

  if (/workflow engine|visual workflow|organizational choreography|living systems/i.test(trimmed)) {
    return {
      response: summarizeWorkflowEngine(profile),
      concierge: 'Chief Concierge',
      choreographyScore: profile.choreographyScore,
    };
  }

  if (/build.*workflow.*client onboarding|workflow for new client onboarding|client onboarding workflow/i.test(trimmed)) {
    return {
      response:
        'Client Onboarding template ready — 12 nodes: Trigger → Intake → Document Creation → Approval → Digital Concierge → Institute training → End. Open Workflow Engine builder to customize.',
      concierge: 'Chief Concierge',
      choreographyScore: profile.choreographyScore,
    };
  }

  if (/bottleneck|permit processing|show bottlenecks/i.test(trimmed)) {
    const bottlenecks = detectBottleneckWorkflows();
    const metric = profile.analyticsMetrics.find((m) => m.metricId === 'bottlenecks');
    return {
      response: `${metric?.value ?? '3 detected'} — primary: ${bottlenecks.join(' · ')}. Approval delays averaging 18 hours.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/simulate.*approval|simulate this workflow|simulation/i.test(trimmed)) {
    const ready = isSimulationReady(organizationId);
    return {
      response: ready
        ? 'Simulation ready — run in Testing sandbox with sample data. No real approvals or notifications sent.'
        : 'Complete Validate testing mode before simulation.',
      concierge: 'Chief Concierge',
    };
  }

  if (/recommend workflow improvements|workflow improvements|optimization/i.test(trimmed)) {
    const suggestions = profile.optimizationSuggestions.slice(0, 3).map((s) => s.title);
    return {
      response: `${profile.optimizationSuggestions.length} optimization suggestions: ${suggestions.join(' · ')}.`,
      concierge: 'Chief Concierge',
      choreographyScore: profile.choreographyScore,
    };
  }

  if (/preview|debug|step through|validate workflow|test workflow/i.test(trimmed)) {
    const required = profile.testingCapabilities.filter((t) => t.requiredBeforePublish).map((t) => t.label);
    return {
      response: `Testing modes: ${required.join(' · ')} required before publish. Nothing goes live without testing.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/drag.?drop|visual builder|workflow nodes|node types/i.test(trimmed)) {
    const nodes = profile.nodeCatalog.slice(0, 6).map((n) => n.label);
    return {
      response: `${profile.nodeCatalog.length} draggable nodes — ${nodes.join(' · ')}… Build visually without code.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/analytics|completion rate|execution count|average duration/i.test(trimmed)) {
    const top = profile.analyticsMetrics.slice(0, 3).map((m) => `${m.label} ${m.value}`);
    return {
      response: `Workflow analytics ${profile.analyticsScorePct}% — ${top.join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  const explainNodeMatch = trimmed.match(/explain (?:node|workflow node)\s+(.+)/i);
  if (explainNodeMatch) {
    const hits = queryWorkflowEngine(explainNodeMatch[1], organizationId, 1);
    if (hits[0]?.type === 'node') {
      return { response: explainWorkflowNode(hits[0].id) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const explainProcessMatch = trimmed.match(/explain (?:process|workflow type)\s+(.+)/i);
  if (explainProcessMatch) {
    const hits = queryWorkflowEngine(explainProcessMatch[1], organizationId, 1);
    if (hits[0]?.type === 'process') {
      return { response: explainProcessTemplate(hits[0].id) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryWorkflowEngine(trimmed, organizationId, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits.map((h) => h.label).join(' · '),
      concierge: 'Chief Concierge',
      choreographyScore: profile.choreographyScore,
    };
  }

  return null;
}

export function listWorkflowEngineDockSuggestions(_organizationId: string): string[] {
  return [
    'Build a workflow for new client onboarding.',
    'Show bottlenecks in permit processing.',
    'Simulate this approval workflow.',
    'Recommend workflow improvements.',
  ].slice(0, 4);
}

export function buildProactiveWorkflowEngineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationWorkflowEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeWorkflowEngine(profile);
}

export function buildWorkflowEngineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationWorkflowEngineProfile(organizationId);
  return profile.dockChoreographyLine;
}

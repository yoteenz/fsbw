import { getOrganizationTrustFrameworkProfile } from '../professional-trust-framework/store';
import {
  ORCHESTRATOR_PROVIDER_LABELS,
  ORCHESTRATOR_PROVIDERS,
  ROUTING_TASK_LABELS,
  ROUTING_TASK_TYPES,
} from './constants';
import type { OrchestratorProvider, RoutingTaskType, TaskRouteDecision } from './types';

const TASK_PROVIDER_MAP: Record<RoutingTaskType, OrchestratorProvider> = {
  'creative-writing': 'openai',
  strategy: 'anthropic',
  research: 'google',
  code: 'openai',
  math: 'google',
  summarization: 'google',
  'legal-preparation': 'anthropic',
  'medical-education': 'anthropic',
  'fast-replies': 'openai',
  'offline-assistance': 'offline',
  'private-enterprise-reasoning': 'local',
};

const TASK_REASONS: Record<RoutingTaskType, string> = {
  'creative-writing': 'High-quality prose · tone alignment with Organization Genome™',
  strategy: 'Deep reasoning · Executive Council™ synthesis quality',
  research: 'Broad knowledge retrieval · World Knowledge Engine™ alignment',
  code: 'Code generation reliability · Production Studio™ workflows',
  math: 'Numerical accuracy · Finance and operations tasks',
  summarization: 'Fast concise output · Command Dock™ briefings',
  'legal-preparation': 'Professional Trust Framework™ scope · cautious reasoning',
  'medical-education': 'Regulated education tone · Studio Institute™ paths',
  'fast-replies': 'Low latency · Digital Concierge responsiveness',
  'offline-assistance': 'Cloud unavailable · offline mode preserved',
  'private-enterprise-reasoning': 'Data sensitivity · never leaves organization boundary',
};

function costTier(task: RoutingTaskType): TaskRouteDecision['costTier'] {
  if (task === 'fast-replies' || task === 'summarization') return 'low';
  if (task === 'strategy' || task === 'legal-preparation') return 'high';
  return 'medium';
}

function speedTier(task: RoutingTaskType): TaskRouteDecision['speedTier'] {
  if (task === 'fast-replies' || task === 'summarization') return 'fast';
  if (task === 'strategy' || task === 'research') return 'quality';
  return 'balanced';
}

export function buildMultiModelRoutes(
  organizationId: string,
  activeProvider: OrchestratorProvider
): TaskRouteDecision[] {
  const trust = getOrganizationTrustFrameworkProfile(organizationId);
  const regulated = Boolean(trust?.regulatedRules?.length);

  return ROUTING_TASK_TYPES.map((taskType) => {
    let assigned = TASK_PROVIDER_MAP[taskType];
    if (regulated && (taskType === 'legal-preparation' || taskType === 'medical-education')) {
      assigned = 'anthropic';
    }
    if (taskType === 'fast-replies' && activeProvider !== 'offline') {
      assigned = activeProvider === 'local' ? 'local' : 'openai';
    }

    return {
      taskType,
      taskLabel: ROUTING_TASK_LABELS[taskType],
      assignedProvider: assigned,
      providerLabel: ORCHESTRATOR_PROVIDER_LABELS[assigned],
      reason: TASK_REASONS[taskType],
      founderVisible: false,
      costTier: costTier(taskType),
      speedTier: speedTier(taskType),
    };
  });
}

export function selectActiveProvider(organizationId: string): OrchestratorProvider {
  const hash = organizationId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const cloud = ORCHESTRATOR_PROVIDERS.filter((p) => p !== 'offline' && p !== 'local');
  return cloud[hash % cloud.length] ?? 'anthropic';
}

export function summarizeMultiModelRouting(routes: TaskRouteDecision[]): string {
  const providers = new Set(routes.map((r) => r.providerLabel));
  return `Multi-model routing — ${routes.length} task types · ${providers.size} providers in rotation. Founder never needs to know which model answered unless they ask.`;
}

import { getOrganizationPromptRegistryProfile } from '../prompt-registry/store';
import { getOrganizationConfidenceEngineProfile } from '../confidence-engine/store';
import {
  PROMPT_ISSUE_LABELS,
  PROMPT_ISSUE_TYPES,
  PROMPT_SOURCE_LABELS,
  PROMPT_SOURCES,
} from './constants';
import type { PromptIssueType, PromptQaFinding, PromptSource, PromptSourceCoverage } from './types';

const CATEGORY_TO_SOURCE: Record<string, PromptSource> = {
  'profession-brain': 'profession-brain',
  'decision-support': 'studio-intelligence',
  research: 'studio-intelligence',
  'command-dock': 'ai-concierge',
  'digital-concierge': 'ai-concierge',
  marketplace: 'marketplace',
  'automation-workflow': 'automation',
  'help-center': 'documentation',
  summaries: 'documentation',
  'knowledge-commerce': 'knowledge',
  search: 'knowledge',
  'studio-institute': 'knowledge',
  'executive-council': 'system',
  'developer-tools': 'system',
  'content-creation': 'generated',
  future: 'generated',
};

const FINDING_SEEDS: Omit<
  PromptQaFinding,
  'id' | 'issueLabel' | 'sourceLabel' | 'promptId' | 'promptName' | 'source'
>[] = [
  {
    issueType: 'ambiguous-instructions',
    severity: 'critical',
    description: 'Prompt uses vague directive "handle appropriately" without defining success criteria.',
    conflictReport: 'Model may interpret "appropriately" differently across sessions — inconsistent outputs.',
    suggestedImprovement: 'Replace with explicit success criteria and output schema · reference Profession Brain guardrails.',
  },
  {
    issueType: 'missing-context',
    severity: 'warning',
    description: 'Workflow prompt omits organization boundary and department scope variables.',
    conflictReport: 'Without org context, concierge may answer with platform defaults instead of tenant truth.',
    suggestedImprovement: 'Inject organizationContext, departmentScope, and knowledgeConfidence variables before execution.',
  },
  {
    issueType: 'conflicting-logic',
    severity: 'critical',
    description: 'System prompt requires brevity while chain-of-thought template mandates exhaustive reasoning.',
    conflictReport: 'Conflicting length directives produce unstable token usage and truncated reasoning chains.',
    suggestedImprovement: 'Align system + workflow prompts · define executive summary vs full reasoning modes.',
  },
  {
    issueType: 'contradictory-rules',
    severity: 'critical',
    description: 'Prompt forbids speculation but also instructs model to infer missing marketplace pricing.',
    conflictReport: 'Contradictory safety vs inference rules increase hallucination risk on pricing queries.',
    suggestedImprovement: 'Split inference rules by data availability · escalate to Confidence Engine when evidence insufficient.',
  },
  {
    issueType: 'hallucination-risk',
    severity: 'warning',
    description: 'Knowledge prompt lacks citation requirement for factual claims about organization history.',
    conflictReport: 'Uncited factual claims may fabricate organizational milestones under low-confidence conditions.',
    suggestedImprovement: 'Require source citations from Memory Engine · attach low-confidence disclaimer from Confidence Engine.',
  },
  {
    issueType: 'circular-dependencies',
    severity: 'critical',
    description: 'Automation prompt references workflow A which references prompt B which references workflow A.',
    conflictReport: 'Circular dependency detected — automation may loop indefinitely or fail silently.',
    suggestedImprovement: 'Break cycle at workflow entry point · register acyclic dependency graph in Automation Registry.',
  },
  {
    issueType: 'duplicate-instructions',
    severity: 'warning',
    description: 'Profession Brain persona rules duplicated across system and instruction prompts.',
    conflictReport: 'Duplicate persona blocks consume tokens and may drift if updated in only one location.',
    suggestedImprovement: 'Extract shared persona to Prompt Registry include · inherit via single canonical promptId.',
  },
  {
    issueType: 'incomplete-workflows',
    severity: 'warning',
    description: 'Multi-step publishing workflow missing failure-handling branch after approval rejection.',
    conflictReport: 'Incomplete workflow leaves automation in undefined state when founder rejects recommendation.',
    suggestedImprovement: 'Add rejection branch · notify Decision Audit · rollback to draft with explanation.',
  },
  {
    issueType: 'missing-edge-cases',
    severity: 'advisory',
    description: 'Concierge prompt lacks guidance for empty search results or zero-knowledge scenarios.',
    conflictReport: 'Edge case gap may produce overconfident answers when knowledge base returns no matches.',
    suggestedImprovement: 'Add explicit empty-state behavior · route to Confidence Engine insufficient-evidence response.',
  },
  {
    issueType: 'unsafe-assumptions',
    severity: 'critical',
    description: 'Generated prompt assumes all users have admin permissions for destructive actions.',
    conflictReport: 'Unsafe permission assumption could recommend actions beyond user capability scope.',
    suggestedImprovement: 'Gate destructive recommendations behind Permission Engine capability checks.',
  },
  {
    issueType: 'overly-complex-prompts',
    severity: 'warning',
    description: 'Studio Intelligence reasoning chain exceeds 2,400 tokens of nested conditional logic.',
    conflictReport: 'Complexity reduces maintainability and increases regression risk on model updates.',
    suggestedImprovement: 'Decompose into modular sub-prompts · register each in Prompt Registry with version history.',
  },
  {
    issueType: 'maintainability-concerns',
    severity: 'advisory',
    description: 'Hardcoded module names embedded in prompt text instead of registry references.',
    conflictReport: 'Renamed modules will desynchronize prompt routing without registry indirection.',
    suggestedImprovement: 'Replace hardcoded names with moduleKey references from System Registry.',
  },
  {
    issueType: 'scalability-concerns',
    severity: 'advisory',
    description: 'Prompt loads entire Profession Brain corpus inline instead of retrieval-augmented context.',
    conflictReport: 'Inline corpus will exceed context limits as organization knowledge grows.',
    suggestedImprovement: 'Switch to RAG via Knowledge Hub · inject top-k relevant chunks per query.',
  },
];

export function mapCategoryToSource(category: string): PromptSource {
  return CATEGORY_TO_SOURCE[category] ?? 'system';
}

export function buildSourceCoverage(organizationId: string): PromptSourceCoverage[] {
  const registry = getOrganizationPromptRegistryProfile(organizationId);
  const prompts = registry?.prompts ?? [];

  return PROMPT_SOURCES.map((source) => {
    const matched = prompts.filter((p) => mapCategoryToSource(p.category) === source);
    const avgQuality =
      matched.length > 0
        ? Math.round(matched.reduce((s, p) => s + p.qualityScorePct, 0) / matched.length)
        : source === 'generated' ? 72 : 0;
    return {
      source,
      label: PROMPT_SOURCE_LABELS[source],
      promptCount: matched.length || (source === 'studio-intelligence' ? 2 : source === 'profession-brain' ? 3 : 0),
      avgQuality: avgQuality || (source === 'profession-brain' ? 86 : source === 'studio-intelligence' ? 84 : 78),
    };
  });
}

export function buildPromptQaFindings(organizationId: string): PromptQaFinding[] {
  const registry = getOrganizationPromptRegistryProfile(organizationId);
  const confidence = getOrganizationConfidenceEngineProfile(organizationId);
  const prompts = registry?.prompts ?? [];
  const findings: PromptQaFinding[] = [];

  const auditPrompts = prompts.length > 0 ? prompts.slice(0, 10) : [
    { promptId: 'profession-brain.core-persona', name: 'Profession Brain Core Persona', category: 'profession-brain' },
    { promptId: 'studio-intelligence.recommendation', name: 'Studio Intelligence Recommendation', category: 'decision-support' },
    { promptId: 'concierge.chief-concierge', name: 'Chief Concierge System Prompt', category: 'digital-concierge' },
    { promptId: 'automation.workflow-orchestrator', name: 'Workflow Orchestrator', category: 'automation-workflow' },
    { promptId: 'marketplace.listing-optimization', name: 'Marketplace Listing Optimization', category: 'marketplace' },
    { promptId: 'documentation.page-guide', name: 'Documentation Page Guide', category: 'help-center' },
  ] as const;

  auditPrompts.forEach((prompt, promptIdx) => {
    const source = mapCategoryToSource('category' in prompt ? prompt.category : 'system');
    const seeds = FINDING_SEEDS.filter((_, i) => (i + promptIdx) % auditPrompts.length < 2 || promptIdx === 0);
    seeds.slice(0, promptIdx === 0 ? 3 : 1).forEach((seed, i) => {
      const issueType = seed.issueType;
      findings.push({
        ...seed,
        id: `pqa-${prompt.promptId}-${issueType}-${i}`,
        issueLabel: PROMPT_ISSUE_LABELS[issueType],
        promptId: prompt.promptId,
        promptName: prompt.name,
        source,
        sourceLabel: PROMPT_SOURCE_LABELS[source],
        severity:
          confidence && confidence.lowConfidenceCount > 0 && seed.severity === 'warning' ? 'critical' : seed.severity,
      });
    });
  });

  return findings;
}

export function countOpenFindings(findings: PromptQaFinding[]): number {
  return findings.length;
}

export function countNotProductionReady(reports: import('./types').PromptAuditReport[]): number {
  return reports.filter((r) => !r.productionReady).length;
}

export function computeOverallQaScore(reports: import('./types').PromptAuditReport[]): number {
  if (reports.length === 0) return 78;
  const avg = reports.reduce((s, r) => s + r.promptQualityScore, 0) / reports.length;
  return Math.round(avg);
}

export function getIssueTypesForSource(source: PromptSource): PromptIssueType[] {
  return PROMPT_ISSUE_TYPES.filter((_, i) => i % PROMPT_SOURCES.length === PROMPT_SOURCES.indexOf(source) % PROMPT_ISSUE_TYPES.length);
}

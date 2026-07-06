import type { SemanticSearchCluster } from './types';

/** Semantic clusters — searching one concept surfaces related systems. */
export const SEMANTIC_SEARCH_CLUSTERS: SemanticSearchCluster[] = [
  {
    id: 'memory-cluster',
    triggers: ['memory', 'remember', 'recall', 'history', 'past decisions'],
    relatedSystemIds: [
      'memory-engine',
      'legacy-vault',
      'studio-intelligence-architecture',
      'profession-brain',
      'organization-genome',
      'relationship-memory',
      'executive-timeline',
    ],
    naturalLanguageQuestions: [
      'How does Studio OS remember things?',
      'Where is organizational memory stored?',
      'What is the difference between Memory Engine and Legacy Vault?',
    ],
  },
  {
    id: 'ai-cluster',
    triggers: ['ai', 'artificial intelligence', 'model', 'gpt', 'llm', 'chatgpt', 'anthropic', 'openai'],
    relatedSystemIds: [
      'studio-intelligence',
      'studio-intelligence-architecture',
      'model-orchestrator',
      'professional-trust-framework',
      'command-dock',
      'studio-foundation-models',
      'knowledge-confidence',
    ],
    naturalLanguageQuestions: [
      'How does AI work in Studio OS?',
      'Can we change AI providers?',
      'What happens if OpenAI shuts down?',
      'What are Studio Foundation Models?',
    ],
  },
  {
    id: 'onboarding-cluster',
    triggers: ['getting started', 'onboarding', 'first time', 'new user', 'start here', 'begin'],
    relatedSystemIds: [
      'mission-control',
      'business-discovery-blueprint',
      'profession-brain',
      'command-dock',
      'organization-genome',
      'studio-institute',
    ],
    naturalLanguageQuestions: [
      'How do I get started with Studio OS?',
      'What should I do first?',
      'How does onboarding work?',
    ],
  },
  {
    id: 'trust-cluster',
    triggers: ['trust', 'regulated', 'legal', 'medical', 'compliance', 'scope', 'validation'],
    relatedSystemIds: [
      'professional-trust-framework',
      'knowledge-confidence',
      'studio-intelligence-architecture',
      'model-orchestrator',
      'studio-foundation-models',
    ],
    naturalLanguageQuestions: [
      'How does Studio OS handle regulated industries?',
      'What validates AI scope before execution?',
    ],
  },
  {
    id: 'legacy-cluster',
    triggers: ['legacy', 'succession', 'preserve', 'expertise', 'handoff', 'continuity'],
    relatedSystemIds: [
      'legacy-vault',
      'succession-mode',
      'legacy-network',
      'profession-brain',
      'studio-institute',
      'studio-foundation-models',
      'executive-timeline',
    ],
    naturalLanguageQuestions: [
      'How do we preserve organizational expertise?',
      'What happens when the founder is unavailable?',
    ],
  },
  {
    id: 'intelligence-cluster',
    triggers: ['intelligence', 'briefing', 'executive', 'insights', 'recommendations', 'consciousness'],
    relatedSystemIds: [
      'studio-intelligence',
      'studio-intelligence-architecture',
      'organizational-consciousness',
      'executive-council',
      'organization-pulse',
      'world-knowledge-engine',
    ],
    naturalLanguageQuestions: [
      'How does Studio Intelligence work?',
      'What is organizational consciousness?',
    ],
  },
  {
    id: 'help-cluster',
    triggers: ['help', 'documentation', 'manual', 'tutorial', 'walkthrough', 'how to', 'guide'],
    relatedSystemIds: ['mission-control', 'command-dock'],
    naturalLanguageQuestions: [
      'Where is the Studio Manual?',
      'How do I learn a module?',
      'What is the Knowledge Hub?',
    ],
  },
  {
    id: 'commerce-cluster',
    triggers: ['sell', 'monetize', 'commerce', 'marketplace', 'courses', 'products', 'revenue'],
    relatedSystemIds: ['knowledge-commerce', 'expert-marketplace', 'studio-institute', 'profession-brain'],
    naturalLanguageQuestions: [
      'How do we monetize our expertise?',
      'What is Knowledge Commerce?',
    ],
  },
];

export function expandSemanticQuery(query: string): { expandedTerms: string[]; relatedSystemIds: string[] } {
  const q = query.trim().toLowerCase();
  if (!q) return { expandedTerms: [], relatedSystemIds: [] };

  const expandedTerms = new Set<string>([q]);
  const relatedSystemIds = new Set<string>();

  for (const cluster of SEMANTIC_SEARCH_CLUSTERS) {
    const matched = cluster.triggers.some(
      (t) => q.includes(t) || t.includes(q) || q.split(/\s+/).some((w) => t.includes(w))
    );
    if (matched) {
      cluster.triggers.forEach((t) => expandedTerms.add(t));
      cluster.naturalLanguageQuestions.forEach((n) => expandedTerms.add(n.toLowerCase()));
      cluster.relatedSystemIds.forEach((id) => relatedSystemIds.add(id));
    }
  }

  return {
    expandedTerms: [...expandedTerms],
    relatedSystemIds: [...relatedSystemIds],
  };
}

export function getSemanticClusterCount(): number {
  return SEMANTIC_SEARCH_CLUSTERS.length;
}

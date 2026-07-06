import type { DocumentationFaqEntry } from './types';

export const DOCUMENTATION_FAQ_REGISTRY: DocumentationFaqEntry[] = [
  {
    id: 'faq-getting-started',
    question: 'How do I get started with Studio OS?',
    answer:
      'Begin with Business Discovery Blueprint™ to capture how your organization operates. Then activate Profession Brain™, open Headquarters (Mission Control), and use Command Dock™ for daily commands. Advanced intelligence unlocks as you progress.',
    relatedSystemIds: ['business-discovery-blueprint', 'profession-brain', 'mission-control', 'command-dock'],
    category: 'getting-started',
  },
  {
    id: 'faq-memory-vs-vault',
    question: 'What is the difference between Memory Engine and Legacy Vault?',
    answer:
      'Memory Engine™ stores operational memory — decisions, patterns, and proof of what worked. Legacy Vault™ preserves the organizational story — milestones, founder narrative, and permanent history. Both feed Studio Intelligence™.',
    relatedSystemIds: ['memory-engine', 'legacy-vault', 'studio-intelligence-architecture'],
    category: 'intelligence',
  },
  {
    id: 'faq-ai-provider-change',
    question: 'What happens if we change AI providers?',
    answer:
      'Model Orchestrator™ and AI Swap Engine™ switch providers without breaking Command Dock, Concierges, Profession Brain, or other protected features. Studio Intelligence™ remains — models are interchangeable engines.',
    relatedSystemIds: ['model-orchestrator', 'studio-intelligence-architecture', 'studio-foundation-models'],
    moduleId: 'model-orchestrator',
    category: 'intelligence',
  },
  {
    id: 'faq-knowledge-fabric',
    question: 'What is Knowledge Fabric?',
    answer:
      'Knowledge Fabric™ is the connected knowledge graph inside Studio Intelligence™ Architecture. It links Profession Brain, Genome, Memory Engine, Legacy Vault, and other sources so AI responses use organization-specific context first.',
    relatedSystemIds: ['studio-intelligence-architecture', 'profession-brain', 'memory-engine'],
    moduleId: 'studio-intelligence-architecture',
    category: 'intelligence',
  },
  {
    id: 'faq-trust-validation',
    question: 'How does Studio OS validate AI scope?',
    answer:
      'Professional Trust Framework™ gates regulated workflows. Knowledge Confidence™ scores data quality. Studio Intelligence Layer validates every AI request before execution. Never train on private org data without explicit consent.',
    relatedSystemIds: ['professional-trust-framework', 'knowledge-confidence', 'studio-intelligence-architecture'],
    category: 'trust',
  },
  {
    id: 'faq-operating-manual',
    question: 'How does the Operating Manual stay current?',
    answer:
      'Organization Operating Manual™ auto-generates 21 sections from live org data. When departments, brains, policies, or automation change, the manual syncs automatically — one handbook, always current.',
    relatedSystemIds: ['organization-operating-manual', 'profession-brain', 'organization-genome'],
    moduleId: 'organization-operating-manual',
    category: 'operations',
  },
  {
    id: 'faq-succession',
    question: 'How does Succession Mode work?',
    answer:
      'Succession Mode™ maps knowledge dependencies, scores readiness without the founder, and recommends continuity actions. Works with Memory Engine, Legacy Vault, and Profession Brain to preserve expertise.',
    relatedSystemIds: ['succession-mode', 'memory-engine', 'legacy-vault', 'profession-brain'],
    moduleId: 'succession-mode',
    category: 'legacy',
  },
  {
    id: 'faq-studio-models',
    question: 'What are Studio Foundation Models and Profession Models?',
    answer:
      'Studio Foundation Models™ are long-term Studio-owned reasoning models for organizational intelligence. Profession Models™ (Studio Tax™, Legal Intake™, etc.) are specialized layers — not generic chatbots. Hybrid intelligence combines Studio models with external drafting.',
    relatedSystemIds: ['studio-foundation-models', 'model-orchestrator', 'profession-brain'],
    moduleId: 'studio-foundation-models',
    category: 'intelligence',
  },
  {
    id: 'faq-command-dock',
    question: 'How do I use Command Dock?',
    answer:
      'Speak naturally in Command Dock™ — Studio OS routes your request to the right concierge or module. Context-aware help knows your current page and suggests related documentation.',
    relatedSystemIds: ['command-dock', 'studio-intelligence-architecture'],
    moduleId: 'command-dock',
    category: 'operations',
  },
  {
    id: 'faq-documentation-sync',
    question: 'How does documentation stay synchronized?',
    answer:
      'Documentation Synchronization™ (M125) maintains one registry feeding search, manual, walkthrough, help center, FAQ, and knowledge graph. Future milestones integrate automatically — documentation evolves with the platform.',
    relatedSystemIds: ['mission-control'],
    category: 'general',
  },
  {
    id: 'faq-institute-vs-commerce',
    question: 'What is the difference between Studio Institute and Knowledge Commerce?',
    answer:
      'Studio Institute™ generates living training from Profession Brain™ — courses and paths for staff and customers. Knowledge Commerce™ monetizes that expertise — sell courses, playbooks, and knowledge products.',
    relatedSystemIds: ['studio-institute', 'knowledge-commerce', 'profession-brain'],
    category: 'operations',
  },
  {
    id: 'faq-help-contextual',
    question: 'How does contextual help work?',
    answer:
      'Press ⓘ on any Studio page — help knows your current module, organization context, and suggests next steps, related documentation, and walkthroughs. Search understands aliases and related concepts semantically.',
    relatedSystemIds: ['mission-control', 'command-dock'],
    category: 'general',
  },
];

export function searchDocumentationFaq(query: string, limit = 8): DocumentationFaqEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return DOCUMENTATION_FAQ_REGISTRY.slice(0, limit);

  return DOCUMENTATION_FAQ_REGISTRY.filter(
    (faq) =>
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      q.split(/\s+/).every((w) => faq.answer.toLowerCase().includes(w) || faq.question.toLowerCase().includes(w))
  ).slice(0, limit);
}

export function getFaqCount(): number {
  return DOCUMENTATION_FAQ_REGISTRY.length;
}

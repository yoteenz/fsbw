import type {
  ArchitectureDecisionDraftInput,
  ArchitectureDecisionRecord,
} from './types';

export const ARCHITECTS_OATH_QUESTIONS = [
  'Why are we building this?',
  'What problem does it solve?',
  'What alternatives did we reject?',
  'Will this still make sense five years from now?',
  'How does it strengthen the civilization?',
] as const;

export const ARTICLE_K21_ADR: ArchitectureDecisionRecord = {
  adrNumber: 'ADR-0001',
  title: 'Architecture Decision Records™ as Constitutional History',
  dateApproved: '2026-07-08',
  status: 'Accepted',
  author: 'Founder',
  decisionSummary:
    'Studio World will preserve major architectural decisions as permanent Architecture Decision Records™ so future founders can understand why foundational systems exist.',
  problemStatement:
    'Studio World was gaining foundational systems faster than institutional memory could preserve their reasoning. Important decisions risked being buried in chat history, commits, and temporary agent memory.',
  goals: [
    'Preserve the reasoning behind every foundational system.',
    'Make accepted decisions explorable inside Constitution Hall™.',
    'Generate companion Architect Journal™ narratives for human philosophical context.',
    'Register ADRs as architectural-decision nodes inside the World Graph™.',
    'Keep previous decisions historical instead of deleting or rewriting them.',
    'Create a review process that challenges flagship ideas before approval.',
  ],
  alternativesConsidered: [
    {
      name: 'Continue using chat history and commit messages',
      summary: 'Leave decision rationale scattered across conversations, agent summaries, and git history.',
      rejectedBecause:
        'Temporary memory is not civilization memory. Future founders would have to reconstruct reasoning from fragments.',
    },
    {
      name: 'Use ordinary documentation pages',
      summary: 'Document approved outcomes in docs after implementation.',
      rejectedBecause:
        'Documentation explains what exists. ADRs must preserve why decisions were made and what was rejected.',
    },
    {
      name: 'Store decisions only in the Knowledge Graph',
      summary: 'Represent decisions as graph nodes without a human-readable constitutional exhibit.',
      rejectedBecause:
        'Graph truth needs projections. Founders need to walk through decision history as culture, not inspect raw data.',
    },
  ],
  tradeoffs: [
    'Major decisions require more structured review before approval.',
    'The system creates more canonical artifacts, so governance must prevent duplicate truth.',
    'Draft generation increases speed, but founder approval remains required before acceptance.',
  ],
  finalDecision:
    'Create Architecture Decision Records™ as a permanent constitutional system. Every accepted ADR becomes a Constitution Hall™ exhibit, an Architect Journal™ companion narrative, and a World Graph™ architectural-decision node.',
  constitutionArticlesAffected: [
    'ARTICLE-K21 — Architecture Decision Records™',
    'World Graph Is Truth™',
    'Documentation First™',
    'Knowledge Review™',
    'Immutability of History™',
    'Approval Workflow™',
  ],
  worldBibleReferences: [
    'Studio World Graph™ — Canonical Architecture',
    'Studio World Constitution™',
    'Studio World Governance Hierarchy™',
    'Studio World Three Eras Roadmap™',
  ],
  experienceSystemsAffected: [
    'Constitution Hall™',
    'Architect Journal™',
    'Decision Graph™',
    'World Graph™',
    'Knowledge Library™',
    'Orb Archivist™',
    'Architecture Auditor™',
  ],
  engineeringImpact: [
    'Adds a typed ADR registry under src/studio-os-core/architecture-decision-records/.',
    'Adds World Graph ingestion for accepted ADRs.',
    'Extends Constitution Hall™ with preserved ADR exhibits and journal copy.',
    'Defines automatic ADR draft generation inputs for future flagship decisions.',
  ],
  futureExpansionOpportunities: [
    'Render a full walkable Constitution Hall™ museum wing for hundreds of ADRs.',
    'Promote ADR challenge sessions into Executive Council™ debates.',
    'Generate decision lineage visualizations in Studio World Atlas™.',
    'Let Orb Archivist™ answer “why does this system exist?” directly from ADR graph relationships.',
    'Connect ADR approvals to automated implementation sprint creation.',
  ],
  relatedAdrs: [],
  visualReferences: [
    'Constitution Hall™ architectural museum',
    'Decision Graph™ lineage map',
    'Architect Journal™ exhibit placards',
  ],
  implementationSprint:
    'ARTICLE-K21 follow-up — Architecture Decision Records™ constitutional memory sprint.',
  lessonsLearned: [
    'Outcome-only documentation is insufficient for civilization-scale architecture.',
    'Institutional memory must preserve rejected alternatives, tradeoffs, and founder reasoning.',
    'Accepted decisions need both structured graph truth and human narrative projection.',
  ],
  reviewStage: 'Implemented',
  journal: {
    title: 'Why Studio World needed constitutional memory',
    narrative:
      'Studio World reached a point where every new room, engine, and law depended on decisions made earlier. We could not let those choices disappear into chat transcripts or commits. ADRs became the civilization’s memory of judgment: why the Orb became an artifact, why presence must be progressive, why the Atlas is holographic, and why history is never deleted.',
  },
  graph: {
    createdSystems: [
      'Architecture Decision Records™',
      'Constitution Hall™ ADR Exhibits',
      'Architect Journal™',
      'Decision Graph™',
      'Automatic ADR Drafting™',
    ],
    dependedOnDecisions: [
      'World Graph Is Truth™',
      'Three Eras Roadmap™',
      'World Memory Physics™',
      'Immutability of History™',
    ],
    supersededDecisions: [],
    futureIdeasOriginated: [
      'Founder-facing decision lineage walks',
      'Executive Council challenge mode',
      'Orb “why” answer paths',
      'ADR-driven implementation sprint generation',
    ],
  },
};

export const FLAGSHIP_ADR_DRAFT_SEEDS = [
  'Progressive Presence™',
  'Mission Control™',
  'World Atlas™',
  'Orb™',
  'Scene Graph™',
  'World Compiler™',
  'Knowledge Engine™',
  'Experience Engine™',
  'Discovery Packs™',
  'Parallel Futures™',
  'Marketplace™',
  'Civilization Events™',
] as const;

export const ACCEPTED_ARCHITECTURE_DECISION_RECORDS = [ARTICLE_K21_ADR] as const;

export function createArchitectureDecisionDraft(
  input: ArchitectureDecisionDraftInput
): ArchitectureDecisionRecord {
  const slug = input.title
    .replace(/™/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase();

  return {
    adrNumber: `ADR-DRAFT-${slug || 'UNTITLED'}`,
    title: input.title,
    dateApproved: 'Pending founder approval',
    status: 'Proposed',
    author: input.author,
    decisionSummary: input.decisionSummary ?? 'Draft decision summary pending review.',
    problemStatement: input.problemStatement,
    goals: input.goals ?? [],
    alternativesConsidered: [],
    tradeoffs: [],
    finalDecision: 'Pending challenge and founder approval.',
    constitutionArticlesAffected: input.constitutionArticlesAffected ?? [],
    worldBibleReferences: input.worldBibleReferences ?? [],
    experienceSystemsAffected: input.experienceSystemsAffected ?? [],
    engineeringImpact: [],
    futureExpansionOpportunities: [],
    relatedAdrs: [],
    visualReferences: [],
    implementationSprint: input.implementationSprint ?? 'Pending sprint assignment.',
    lessonsLearned: [],
    reviewStage: 'Draft',
    journal: {
      title: `Why ${input.title} deserves a decision record`,
      narrative:
        'This draft exists because flagship architecture must explain its reasoning before it becomes permanent.',
    },
    graph: {
      createdSystems: [],
      dependedOnDecisions: [],
      supersededDecisions: [],
      futureIdeasOriginated: [],
    },
  };
}

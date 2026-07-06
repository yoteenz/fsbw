/**
 * Milestone 91 — Profession Brain™ V1.0
 * Living institutional intelligence — not an AI chatbot.
 */

export type KnowledgeDomain = string;

export type BrainKnowledgeKind =
  | 'expertise'
  | 'decision-logic'
  | 'business-rule'
  | 'regulation'
  | 'best-practice'
  | 'mistake'
  | 'exception'
  | 'lesson'
  | 'judgment'
  | 'intuition'
  | 'policy'
  | 'story'
  | 'terminology'
  | 'template'
  | 'shortcut'
  | 'philosophy';

export type ProfessionBrainDefinition = {
  id: string;
  label: string;
  tagline: string;
  /** Concierge that speaks from this brain. */
  conciergeId?: string;
  industryHints: string[];
  serviceKeywords: string[];
};

export type BrainKnowledgeEntry = {
  id: string;
  brainId: string;
  kind: BrainKnowledgeKind;
  title: string;
  /** WHAT the organization does. */
  what: string;
  /** WHY it is done this way — judgment, not only procedure. */
  why: string;
  source: 'blueprint' | 'inauguration' | 'living-update' | 'manual' | 'service-discovery';
  updatedAt: string;
  version: number;
};

export type DecisionJudgmentPattern = {
  id: string;
  brainId: string;
  situation: string;
  reasoning: string;
  /** Example: "When mileage is missing, I first check…" */
  professionalResponse: string;
  notJustProcedure: string;
};

export type MemoryGraphNodeType =
  | 'person'
  | 'customer'
  | 'process'
  | 'department'
  | 'document'
  | 'law'
  | 'template'
  | 'policy'
  | 'service'
  | 'task'
  | 'exception'
  | 'deadline'
  | 'brain';

export type MemoryGraphNode = {
  id: string;
  type: MemoryGraphNodeType;
  label: string;
  brainId?: string;
};

export type MemoryGraphEdge = {
  id: string;
  fromId: string;
  toId: string;
  relationship: string;
};

export type HumanKnowledgeArtifact = {
  id: string;
  brainId: string;
  type:
    | 'onboarding'
    | 'training-lesson'
    | 'reference-manual'
    | 'checklist'
    | 'decision-tree'
    | 'operational-guide'
    | 'faq'
    | 'scenario';
  title: string;
  content: string;
};

export type AcademyFoundationModule = {
  id: string;
  brainId: string;
  title: string;
  audiences: ('ai-concierge' | 'employee' | 'leadership' | 'customer' | 'certification')[];
  summary: string;
};

export type PublicKnowledgeSurface = {
  id: string;
  brainId: string;
  publicTitle: string;
  description: string;
  enabled: boolean;
  capabilities: ('learn' | 'ask' | 'prepare' | 'workflow' | 'purchase' | 'book' | 'upgrade')[];
};

export type KnowledgeOwnershipRecord = {
  exportedAt?: string;
  backupAt?: string;
  versionLabel: string;
  archived: boolean;
  protected: boolean;
};

export type LivingBrainSignal = {
  id: string;
  phrase: string;
  detectedAt: string;
  resolved: boolean;
  targetBrainId?: string;
};

export type OrganizationProfessionBrain = {
  id: string;
  definitionId: string;
  label: string;
  maturityPct: number;
  knowledgeEntries: BrainKnowledgeEntry[];
  judgmentPatterns: DecisionJudgmentPattern[];
  conciergeId?: string;
  lastEvolvedAt: string;
};

export type OrganizationProfessionBrainProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  initializedAt: string;
  updatedAt: string;
  overallMaturityPct: number;
  brains: OrganizationProfessionBrain[];
  memoryGraph: { nodes: MemoryGraphNode[]; edges: MemoryGraphEdge[] };
  humanKnowledge: HumanKnowledgeArtifact[];
  academyModules: AcademyFoundationModule[];
  publicSurfaces: PublicKnowledgeSurface[];
  ownership: KnowledgeOwnershipRecord;
  livingSignals: LivingBrainSignal[];
  legacyNote: string;
};

export type ProfessionBrainStore = {
  version: string;
  profiles: OrganizationProfessionBrainProfile[];
};

export type ProfessionBrainDockAdvice = {
  response: string;
  concierge: string;
  brainId: string;
  suggestedCommand?: string;
};

export type ConciergeBrainBinding = {
  conciergeId: string;
  brainId: string;
  voiceNote: string;
};

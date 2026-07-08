import type { KnowledgeCoreDomain } from '../studio-world-knowledge-core/types';
import type {
  ConversationArchive,
  MemoryExtractionReport,
  ProposedKnowledgeEntry,
} from './types';
import { appendExtractionReport, linkArchiveToExtraction, readMemorySystemStore } from './store';

const ISO = () => new Date().toISOString();

const SYSTEM_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /knowledge core/gi, label: 'Knowledge Core™' },
  { pattern: /memory system/gi, label: 'Memory System™' },
  { pattern: /conversation archive/gi, label: 'Conversation Archive™' },
  { pattern: /world graph/gi, label: 'World Graph™' },
  { pattern: /progressive presence/gi, label: 'Progressive Presence™' },
  { pattern: /architecture decision record|adr/gi, label: 'Architecture Decision Records™' },
  { pattern: /experience engine/gi, label: 'Experience Engine™' },
  { pattern: /scene stack/gi, label: 'Scene Stack™' },
  { pattern: /mission control/gi, label: 'Mission Control™' },
  { pattern: /architect.?s memory/gi, label: "Architect's Memory™" },
];

function extractLinesMatching(transcript: string, signals: string[]): string[] {
  const lines = transcript.split('\n').map((l) => l.trim()).filter(Boolean);
  const hits = new Set<string>();
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (signals.some((s) => lower.includes(s)) && line.length > 12) {
      hits.add(line.slice(0, 200));
    }
  }
  return [...hits].slice(0, 12);
}

function detectSystems(transcript: string): string[] {
  const found = new Set<string>();
  for (const { pattern, label } of SYSTEM_PATTERNS) {
    if (pattern.test(transcript)) found.add(label);
  }
  return [...found];
}

function buildProposedEntries(
  archive: ConversationArchive,
  systems: string[],
  decisions: string[]
): ProposedKnowledgeEntry[] {
  if (decisions.length === 0 && systems.length === 0) return [];

  const domain: KnowledgeCoreDomain = systems.some((s) => s.includes('Memory'))
    ? 'Knowledge Engine™'
    : 'Architecture™';

  return [
    {
      id: `proposed-${archive.id}`,
      title: `Extracted Knowledge — ${archive.title}`,
      domain,
      summary: archive.summaryForIndex,
      reasoning: `Extracted from conversation ${archive.id}. Awaiting founder review before Knowledge Core promotion.`,
      architectureAdded: systems,
      relatedSystems: systems,
      constitutionArticles: decisions.filter((d) => /article-k/i.test(d)),
      adrReferences: decisions.filter((d) => /adr/i.test(d)).map(() => 'ADR-candidate'),
      worldBibleReferences: systems,
      tags: ['extracted', 'awaiting-review', 'not-canon'],
    },
  ];
}

function createExtractionId(archiveId: string): string {
  return archiveId.replace(/^CONV-/, 'KEX-');
}

/**
 * Layer 2 — Knowledge Extraction™
 * Analyzes archived conversation. Produces understanding — never canon.
 */
export function extractKnowledgeFromConversation(
  archive: ConversationArchive
): MemoryExtractionReport {
  const transcript = archive.transcript;
  const now = ISO();
  const id = createExtractionId(archive.id);

  const architecturalDecisions = extractLinesMatching(transcript, [
    'decision',
    'must',
    'should never',
    'law',
    'principle',
    'approved',
    'canon',
  ]);
  const systemsIntroduced = detectSystems(transcript);
  const designPrinciples = extractLinesMatching(transcript, [
    'philosophy',
    'principle',
    'prefer',
    'never confuse',
    'immutable',
    'approval',
  ]);
  const conflictsDetected = extractLinesMatching(transcript, [
    'must not',
    'not become',
    'conflict',
    'do not',
    'forbidden',
  ]);
  const potentialAdrs = architecturalDecisions
    .filter((d) => d.length > 30)
    .slice(0, 5)
    .map((d) => `ADR candidate — ${d.slice(0, 80)}`);
  const futureOpportunities = extractLinesMatching(transcript, [
    'future',
    'expansion',
    'next',
    'automated',
    'visualization',
  ]);

  const proposedEntries = buildProposedEntries(archive, systemsIntroduced, architecturalDecisions);

  const report: MemoryExtractionReport = {
    id,
    title: `Knowledge Extraction Report™ — ${archive.title}`,
    sourceConversationId: archive.id,
    status: 'Awaiting Founder Review',
    conversationSummary: archive.summaryForIndex,
    architecturalDecisions,
    systemsIntroduced,
    designPrinciples,
    conflictsDetected,
    potentialAdrs,
    constitutionUpdates: architecturalDecisions.filter((d) => /article-k/i.test(d)),
    worldBibleUpdates: systemsIntroduced,
    promptStandardUpdates: extractLinesMatching(transcript, ['prompt', 'standard', 'model']),
    engineeringRecommendations: extractLinesMatching(transcript, [
      'implement',
      'engine',
      'pipeline',
      'store',
      'graph',
    ]),
    futureOpportunities,
    itemsAwaitingApproval: proposedEntries.map((e) => e.title),
    proposedEntries,
    createdAt: now,
  };

  appendExtractionReport(report);
  linkArchiveToExtraction(archive.id, report.id);
  return report;
}

export function listExtractionReports(): MemoryExtractionReport[] {
  return readMemorySystemStore().extractionReports;
}

export function getExtractionReport(id: string): MemoryExtractionReport | null {
  return listExtractionReports().find((r) => r.id === id) ?? null;
}

export function getExtractionForConversation(conversationId: string): MemoryExtractionReport | null {
  return listExtractionReports().find((r) => r.sourceConversationId === conversationId) ?? null;
}

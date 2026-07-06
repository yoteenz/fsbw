import { getOrganizationGenomeProfile } from '../organization-genome/store';
import type { ManualDocumentSection, SearchableAnswer } from './types';

const FAQ_TEMPLATES: Array<{
  patterns: RegExp[];
  question: string;
  documentType: SearchableAnswer['sourceDocumentType'];
  buildAnswer: (docs: ManualDocumentSection[], companyName: string) => string;
}> = [
  {
    patterns: [/onboard.*client|client.*onboard|new client/i],
    question: 'How do we onboard clients?',
    documentType: 'standard-operating-procedures',
    buildAnswer: (docs, companyName) => {
      const sop = docs.find((d) => d.type === 'standard-operating-procedures');
      const dept = docs.find((d) => d.type === 'department-guides');
      return `${sop?.content.slice(0, 120) ?? 'Follow standard onboarding SOP.'} ${dept ? `Department guide: ${dept.summary}` : ''} — ${companyName} onboarding is documented in the Operating Manual.`;
    },
  },
  {
    patterns: [/refund|return policy|money back/i],
    question: 'What is our refund policy?',
    documentType: 'policy-library',
    buildAnswer: (docs) => {
      const policy = docs.find((d) => d.type === 'policy-library');
      const cx = docs.find((d) => d.type === 'customer-experience-standards');
      return `${policy?.content.slice(0, 100) ?? 'See policy library.'} Customer standards: ${cx?.summary ?? 'Professional resolution for all refund requests.'}`;
    },
  },
  {
    patterns: [/approval|approve|sign.?off/i],
    question: 'How do approvals work?',
    documentType: 'approval-workflows',
    buildAnswer: (docs) => {
      const approvals = docs.find((d) => d.type === 'approval-workflows');
      return approvals?.content ?? 'Approvals follow organizational Genome preferences — executive review for strategic items, department leads for operational.';
    },
  },
  {
    patterns: [/customer service|service philosophy|cx standard/i],
    question: "What's our customer service philosophy?",
    documentType: 'customer-experience-standards',
    buildAnswer: (docs) => {
      const cx = docs.find((d) => d.type === 'customer-experience-standards');
      return cx?.content ?? 'Every customer receives professional, consistent service aligned with organizational values.';
    },
  },
  {
    patterns: [/mission|why do we exist/i],
    question: 'What is our mission?',
    documentType: 'mission',
    buildAnswer: (docs) => docs.find((d) => d.type === 'mission')?.content ?? 'Mission synced from Organization Genome.',
  },
  {
    patterns: [/vision|where.*going|future/i],
    question: 'What is our vision?',
    documentType: 'vision',
    buildAnswer: (docs) => docs.find((d) => d.type === 'vision')?.content ?? 'Vision synced from Organization Genome.',
  },
  {
    patterns: [/emergency|crisis|urgent/i],
    question: 'What are our emergency procedures?',
    documentType: 'emergency-procedures',
    buildAnswer: (docs) => docs.find((d) => d.type === 'emergency-procedures')?.content ?? 'Escalate via Command Dock immediately.',
  },
  {
    patterns: [/train|learning|course|institute/i],
    question: 'What training paths are available?',
    documentType: 'training-paths',
    buildAnswer: (docs) => docs.find((d) => d.type === 'training-paths')?.content ?? 'Training paths auto-sync from Studio Institute™.',
  },
];

export function buildSearchableAnswers(
  organizationId: string,
  companyName: string,
  documents: ManualDocumentSection[]
): SearchableAnswer[] {
  const genome = getOrganizationGenomeProfile(organizationId);

  return FAQ_TEMPLATES.map((template, index) => ({
    id: `qa-${organizationId}-${index}`,
    question: template.question,
    answer: template.buildAnswer(documents, companyName),
    sourceDocumentType: template.documentType,
    confidencePct: Math.min(99, 75 + (genome?.genomeCompletenessPct ?? 50) / 5),
    keywords: template.patterns.map((p) => p.source.replace(/\\|\[|\]|\^|\$|\?|\*/g, '').slice(0, 20)),
  }));
}

export function resolveNaturalLanguageQuery(
  query: string,
  organizationId: string,
  documents: ManualDocumentSection[],
  searchableQa: SearchableAnswer[],
  companyName: string
): SearchableAnswer | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const templateMatch = FAQ_TEMPLATES.find((t) => t.patterns.some((p) => p.test(trimmed)));
  if (templateMatch) {
    const index = FAQ_TEMPLATES.indexOf(templateMatch);
    return searchableQa[index] ?? null;
  }

  const docMatch = documents.find(
    (d) =>
      d.label.toLowerCase().includes(trimmed.toLowerCase()) ||
      d.summary.toLowerCase().includes(trimmed.toLowerCase()) ||
      d.content.toLowerCase().includes(trimmed.slice(0, 20).toLowerCase())
  );
  if (docMatch) {
    return {
      id: `qa-adhoc-${docMatch.id}`,
      question: trimmed,
      answer: `${docMatch.summary} ${docMatch.content.slice(0, 200)}`,
      sourceDocumentType: docMatch.type,
      confidencePct: 72,
      keywords: [trimmed.split(/\s+/)[0] ?? ''],
    };
  }

  const qaMatch = searchableQa.find(
    (q) =>
      q.question.toLowerCase().includes(trimmed.toLowerCase()) ||
      q.answer.toLowerCase().includes(trimmed.toLowerCase())
  );
  if (qaMatch) return qaMatch;

  return {
    id: `qa-fallback-${organizationId}`,
    question: trimmed,
    answer: `Search the Operating Manual for "${trimmed}" — ${documents.length} sections synchronized for ${companyName}. Try: onboarding, approvals, refund policy, or customer service philosophy.`,
    sourceDocumentType: 'glossary',
    confidencePct: 55,
    keywords: trimmed.split(/\s+/).slice(0, 3),
  };
}

export function summarizeSearchableOrganization(answers: SearchableAnswer[]): string {
  return `${answers.length} natural-language answers ready — employees ask questions naturally, Operating Manual responds immediately with accurate answers.`;
}

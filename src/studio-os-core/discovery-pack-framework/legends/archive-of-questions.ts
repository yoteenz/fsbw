/**
 * The Archive of Questions™ — unanswered questions preserved in the Knowledge Library.
 * The Archive does not provide answers. It preserves curiosity.
 */

import type { PublicArchiveQuestion } from '../types';

export type ArchiveQuestionDefinition = {
  id: string;
  publicQuestion: string;
  category: 'civilization' | 'technology' | 'discovery' | 'theory' | 'blueprint' | 'future';
};

export const ARCHIVE_OF_QUESTIONS_CATALOG: ArchiveQuestionDefinition[] = [
  {
    id: 'aoq-unknown-civilization',
    publicQuestion: 'Which civilization built the architectural signatures beyond the mapped frontier?',
    category: 'civilization',
  },
  {
    id: 'aoq-unexplained-tech',
    publicQuestion: 'What technology produced the parallel pathways referenced in the World Graph?',
    category: 'technology',
  },
  {
    id: 'aoq-missing-discovery',
    publicQuestion: 'What discovery was removed from the Atlas between ERA 1 and ERA 2?',
    category: 'discovery',
  },
  {
    id: 'aoq-unfinished-theory',
    publicQuestion: 'Why do Blueprint lineage records end at the same procedural step across unrelated professions?',
    category: 'theory',
  },
  {
    id: 'aoq-blueprint-fragment',
    publicQuestion: 'Who authored the incomplete Blueprint fragments found in three unrelated headquarters?',
    category: 'blueprint',
  },
  {
    id: 'aoq-future-possibility',
    publicQuestion: 'What exists in Future Regions™ that no living founder has permission to chart?',
    category: 'future',
  },
  {
    id: 'aoq-orb-voice',
    publicQuestion: 'When Orb speaks unprompted, which intelligence is speaking?',
    category: 'technology',
  },
  {
    id: 'aoq-cartographers-guild',
    publicQuestion: 'Has the Cartographers Guild™ already mapped regions they have not published?',
    category: 'discovery',
  },
];

export function buildPublicArchiveOfQuestions(input: {
  knowledgeCapital: number;
  mysteryCount: number;
}): PublicArchiveQuestion[] {
  const visibleCount = Math.min(
    ARCHIVE_OF_QUESTIONS_CATALOG.length,
    3 + Math.floor(input.knowledgeCapital / 15) + Math.floor(input.mysteryCount / 3)
  );

  return ARCHIVE_OF_QUESTIONS_CATALOG.slice(0, visibleCount).map((q) => ({
    id: q.id,
    publicQuestion: q.publicQuestion,
    category: q.category,
  }));
}

export function primaryArchiveQuestion(questions: PublicArchiveQuestion[]): PublicArchiveQuestion | null {
  return questions[0] ?? null;
}

export function archiveAmbientLine(questionCount: number): string {
  return `The Archive of Questions™ preserves ${questionCount} unanswered question${questionCount !== 1 ? 's' : ''} — curiosity without answers.`;
}

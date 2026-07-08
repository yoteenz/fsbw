/**
 * Lost Knowledge™ — incomplete history in the Museum.
 * Missing pages, damaged Blueprints, unknown inventors, forgotten expeditions.
 */

import type { PublicLostKnowledgeFragment } from '../types';

export type LostKnowledgeDefinition = {
  id: string;
  publicTitle: string;
  publicDescription: string;
  fragmentKind: 'missing-page' | 'damaged-blueprint' | 'unknown-inventor' | 'unfinished-prototype' | 'forgotten-expedition';
  resolutionStatus: 'unresolved' | 'partially-recovered' | 'disputed';
};

export const LOST_KNOWLEDGE_CATALOG: LostKnowledgeDefinition[] = [
  {
    id: 'lk-missing-atlas-page',
    publicTitle: 'Missing Atlas Page',
    publicDescription: 'A cartographic folio with pages torn out — the missing region is described but not drawn.',
    fragmentKind: 'missing-page',
    resolutionStatus: 'unresolved',
  },
  {
    id: 'lk-damaged-blueprint',
    publicTitle: 'Damaged Blueprint Fragment',
    publicDescription: 'A workflow lineage record ends mid-procedure. The final steps were never recovered.',
    fragmentKind: 'damaged-blueprint',
    resolutionStatus: 'partially-recovered',
  },
  {
    id: 'lk-unknown-inventor',
    publicTitle: 'The Unknown Inventor',
    publicDescription: 'World Graph credits an innovation to an inventor whose name appears in no other archive.',
    fragmentKind: 'unknown-inventor',
    resolutionStatus: 'disputed',
  },
  {
    id: 'lk-unfinished-prototype',
    publicTitle: 'Unfinished Prototype',
    publicDescription: 'The Prototype Vault holds a chamber sealed with a note: "Complete when civilization is ready."',
    fragmentKind: 'unfinished-prototype',
    resolutionStatus: 'unresolved',
  },
  {
    id: 'lk-forgotten-expedition',
    publicTitle: 'Forgotten Expedition',
    publicDescription: 'An expedition journal describes three weeks beyond the Innovation District. No return entry exists.',
    fragmentKind: 'forgotten-expedition',
    resolutionStatus: 'unresolved',
  },
  {
    id: 'lk-collaboration-gap',
    publicTitle: 'The Collaboration Gap',
    publicDescription: 'Historical records reference a cross-profession summit. No attendees, no outcomes — only the invitation.',
    fragmentKind: 'missing-page',
    resolutionStatus: 'disputed',
  },
];

export function buildPublicLostKnowledge(input: {
  knowledgeCapital: number;
  civilizationHealth: number;
}): PublicLostKnowledgeFragment[] {
  const threshold = input.knowledgeCapital >= 35 || input.civilizationHealth >= 45;
  if (!threshold) return LOST_KNOWLEDGE_CATALOG.slice(0, 2).map(toPublicFragment);

  return LOST_KNOWLEDGE_CATALOG.map(toPublicFragment);
}

function toPublicFragment(def: LostKnowledgeDefinition): PublicLostKnowledgeFragment {
  return {
    id: def.id,
    publicTitle: def.publicTitle,
    publicDescription: def.publicDescription,
    resolutionStatus: def.resolutionStatus,
  };
}

export function lostKnowledgeAmbientLine(fragments: PublicLostKnowledgeFragment[]): string {
  const unresolved = fragments.filter((f) => f.resolutionStatus === 'unresolved').length;
  if (unresolved === 0) {
    return 'The Museum preserves history — including what remains incomplete.';
  }
  return `${unresolved} unresolved fragment${unresolved > 1 ? 's' : ''} in the Living Museum™ — history feels authentic because it is incomplete.`;
}

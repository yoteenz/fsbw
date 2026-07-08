import {
  INSTITUTE_CANON_GATE,
  INSTITUTE_OF_KNOWLEDGE_NAME,
  INSTITUTE_WORLD_GRAPH_NODE_ID,
} from '../constants';
import { INSTITUTE_DIVISIONS, INSTITUTE_PUBLICATION_TYPES } from '../divisions';
import type { InstituteDivisionId } from '../types';

export type InstituteOfKnowledgeRegistry = {
  id: 'institute-of-knowledge';
  title: typeof INSTITUTE_OF_KNOWLEDGE_NAME;
  purpose: string;
  constitutionalAuthority: string[];
  divisions: typeof INSTITUTE_DIVISIONS;
  publicationTypes: typeof INSTITUTE_PUBLICATION_TYPES;
  governs: string[];
  supersedes: string[];
  worldGraphNodeId: typeof INSTITUTE_WORLD_GRAPH_NODE_ID;
  canonGate: typeof INSTITUTE_CANON_GATE;
};

export const THE_INSTITUTE_OF_KNOWLEDGE: InstituteOfKnowledgeRegistry = {
  id: 'institute-of-knowledge',
  title: INSTITUTE_OF_KNOWLEDGE_NAME,
  purpose:
    'Permanent institution responsible for preserving, validating, publishing, evolving, and governing all canonical knowledge throughout Studio World.',
  constitutionalAuthority: [
    'Publishing',
    'Research',
    'Knowledge Preservation',
    'Canon Review',
    'Constitutional Review',
    'Version History',
    'Historical Archives',
    'Profession Research',
    'Industry Standards',
    'Educational Standards',
    'AI Knowledge Validation',
    'World History',
    'Future Research',
    "Founder's Journal",
    'Release Records',
  ],
  divisions: INSTITUTE_DIVISIONS,
  publicationTypes: INSTITUTE_PUBLICATION_TYPES,
  governs: ['Studio World Codex™', 'Knowledge Core™', 'Profession Brains™', 'World Chronicle™'],
  supersedes: ['Studio World Press™'],
  worldGraphNodeId: INSTITUTE_WORLD_GRAPH_NODE_ID,
  canonGate: INSTITUTE_CANON_GATE,
};

export function getInstituteConstitutionalAuthority(): string[] {
  return [...THE_INSTITUTE_OF_KNOWLEDGE.constitutionalAuthority];
}

export function resolveDivisionForPublicationType(
  type: string
): InstituteDivisionId {
  if (/constitution|constitutional|amendment/i.test(type)) return 'constitution-office';
  if (/research-paper|whitepaper|civilization-report/i.test(type)) return 'research-bureau';
  if (/standard|specification|manual/i.test(type)) return 'standards-bureau';
  if (/release-notes|roadmap|letter|founder-letter/i.test(type)) return 'publication-office';
  if (/guide|sdk-documentation|developer-documentation/i.test(type)) return 'publishing-bureau';
  return 'publishing-bureau';
}

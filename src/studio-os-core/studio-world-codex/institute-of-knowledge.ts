export type InstituteKnowledgeDivisionId =
  | 'publishing-bureau'
  | 'research-bureau'
  | 'constitution-office'
  | 'historical-archives'
  | 'knowledge-validation-bureau'
  | 'standards-bureau'
  | 'publication-office'
  | 'world-chronicle';

export type InstituteKnowledgeDivision = {
  id: InstituteKnowledgeDivisionId;
  title: string;
  purpose: string;
  responsibilities: string[];
  governsSystems: string[];
};

export type InstitutePublicationType =
  | 'book'
  | 'manual'
  | 'specification'
  | 'official-edition'
  | 'whitepaper'
  | 'sdk-documentation'
  | 'developer-documentation'
  | 'release-notes'
  | 'profession-guide'
  | 'research-paper'
  | 'civilization-report'
  | 'founder-letter'
  | 'roadmap'
  | 'expansion-manual';

export type InstituteOfKnowledge = {
  id: 'institute-of-knowledge';
  title: 'The Institute of Knowledge™';
  purpose: string;
  constitutionalAuthority: string[];
  divisions: InstituteKnowledgeDivision[];
  publicationTypes: InstitutePublicationType[];
  governs: string[];
  supersedes: string[];
  worldGraphNodeId: string;
};

export const INSTITUTE_PUBLICATION_TYPES: InstitutePublicationType[] = [
  'book',
  'manual',
  'specification',
  'official-edition',
  'whitepaper',
  'sdk-documentation',
  'developer-documentation',
  'release-notes',
  'profession-guide',
  'research-paper',
  'civilization-report',
  'founder-letter',
  'roadmap',
  'expansion-manual',
];

export const INSTITUTE_KNOWLEDGE_DIVISIONS: InstituteKnowledgeDivision[] = [
  {
    id: 'publishing-bureau',
    title: 'Publishing Bureau™',
    purpose: 'Publishes books, manuals, specifications, canonical editions, and official works.',
    responsibilities: [
      'Publish official editions',
      'Maintain publication metadata',
      'Coordinate canon-ready releases',
      'Ensure every official work points back to source articles',
    ],
    governsSystems: ['Codex™', 'Publication Office™', 'World Graph™'],
  },
  {
    id: 'research-bureau',
    title: 'Research Bureau™',
    purpose: 'Conducts profession research and keeps Profession Brains™ synchronized with real-world developments.',
    responsibilities: [
      'Conduct profession research',
      'Maintain research queues',
      'Propose Profession Brain™ updates',
      'Track industry standards and changes',
    ],
    governsSystems: ['Profession Brains™', 'Research Engine™', 'Knowledge Core™'],
  },
  {
    id: 'constitution-office',
    title: 'Constitution Office™',
    purpose: 'Maintains constitutional articles, reviews amendments, and preserves historical revisions.',
    responsibilities: [
      'Maintain constitutional articles',
      'Review amendments',
      'Preserve historical revisions',
      'Gate Constitution Review™ before implementation',
    ],
    governsSystems: ['Codex™', 'Constitution Review™', 'Architecture Decision Records™'],
  },
  {
    id: 'historical-archives',
    title: 'Historical Archives™',
    purpose: 'Stores every previous edition and keeps all knowledge historically accessible.',
    responsibilities: [
      'Preserve previous editions',
      'Store superseded canon',
      'Maintain historical lineage',
      'Never destroy knowledge',
    ],
    governsSystems: ['Memory System™', 'Knowledge Core™', 'World Chronicle™'],
  },
  {
    id: 'knowledge-validation-bureau',
    title: 'Knowledge Validation Bureau™',
    purpose: 'Reviews AI-generated knowledge, verifies sources, and promotes approved knowledge into canon.',
    responsibilities: [
      'Validate AI-generated knowledge',
      'Verify sources',
      'Approve, reject, or return research',
      'Protect canon from unverified updates',
    ],
    governsSystems: ['AI Knowledge Validation™', 'Knowledge Core™', 'Profession Brains™'],
  },
  {
    id: 'standards-bureau',
    title: 'Standards Bureau™',
    purpose: 'Maintains design, engineering, education, simulation, and brand standards.',
    responsibilities: [
      'Maintain design standards',
      'Maintain engineering standards',
      'Maintain education standards',
      'Maintain simulation and brand standards',
    ],
    governsSystems: ['Design Language™', 'Production Standards™', 'Profession Simulation Engine™'],
  },
  {
    id: 'publication-office',
    title: 'Publication Office™',
    purpose: 'Produces books, whitepapers, SDK docs, developer docs, release notes, guides, reports, letters, roadmaps, and manuals.',
    responsibilities: [
      'Produce official publications',
      'Format canon for audiences',
      'Issue release records',
      'Publish Founder Letters™ and Civilization Reports™',
    ],
    governsSystems: ['Publishing Bureau™', 'Release Records™', 'Founder Journal™'],
  },
  {
    id: 'world-chronicle',
    title: 'World Chronicle™',
    purpose: 'Maintains the living history of Studio World; every major event becomes part of civilization history.',
    responsibilities: [
      'Record major world events',
      'Maintain civilization timeline',
      'Connect releases, articles, and institutions',
      'Preserve Founder Journal™ entries',
    ],
    governsSystems: ['World Graph™', 'Historical Archives™', 'Founder Journal™'],
  },
];

export const THE_INSTITUTE_OF_KNOWLEDGE: InstituteOfKnowledge = {
  id: 'institute-of-knowledge',
  title: 'The Institute of Knowledge™',
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
  divisions: INSTITUTE_KNOWLEDGE_DIVISIONS,
  publicationTypes: INSTITUTE_PUBLICATION_TYPES,
  governs: ['Studio World Codex™', 'Knowledge Core™', 'Profession Brains™', 'World Chronicle™'],
  supersedes: ['Studio World Press™'],
  worldGraphNodeId: 'W-ORG-institute-of-knowledge',
};

export function listInstituteKnowledgeDivisions(): InstituteKnowledgeDivision[] {
  return [...INSTITUTE_KNOWLEDGE_DIVISIONS];
}

export function getInstituteKnowledgeDivision(
  id: InstituteKnowledgeDivisionId
): InstituteKnowledgeDivision | undefined {
  return INSTITUTE_KNOWLEDGE_DIVISIONS.find((division) => division.id === id);
}

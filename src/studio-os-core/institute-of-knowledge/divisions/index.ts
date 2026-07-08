import type { InstituteDivision, InstituteDivisionId } from '../types';

/** Modular division registry — each bureau independently expandable. */
export const INSTITUTE_DIVISIONS: InstituteDivision[] = [
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
    modulePath: 'publications',
    expandable: true,
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
    modulePath: 'research',
    expandable: true,
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
    modulePath: 'validation',
    expandable: true,
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
    modulePath: 'history',
    expandable: true,
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
    modulePath: 'constitution',
    expandable: true,
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
    modulePath: 'standards',
    expandable: true,
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
    modulePath: 'chronicle',
    expandable: true,
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
    modulePath: 'publications',
    expandable: true,
  },
];

export const INSTITUTE_PUBLICATION_TYPES = [
  'book',
  'collection',
  'volume',
  'article',
  'whitepaper',
  'research-paper',
  'sdk-documentation',
  'developer-documentation',
  'guide',
  'letter',
  'release-notes',
  'manual',
  'specification',
  'roadmap',
  'official-edition',
  'profession-guide',
  'civilization-report',
  'founder-letter',
  'expansion-manual',
] as const;

export function listInstituteDivisions(): InstituteDivision[] {
  return [...INSTITUTE_DIVISIONS];
}

export function getInstituteDivision(id: InstituteDivisionId): InstituteDivision | undefined {
  return INSTITUTE_DIVISIONS.find((d) => d.id === id);
}

export function getDivisionByModulePath(modulePath: string): InstituteDivision | undefined {
  return INSTITUTE_DIVISIONS.find((d) => d.modulePath === modulePath);
}

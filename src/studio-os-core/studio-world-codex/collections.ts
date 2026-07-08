import type { CodexCollection } from './types';

export const FOUNDATIONAL_CODEX_COLLECTION_ID = 'foundational-collection';

/** ARTICLE-C02 — Complete Codex expansion model. */
export const CODEX_COLLECTIONS: CodexCollection[] = [
  {
    id: FOUNDATIONAL_CODEX_COLLECTION_ID,
    title: 'Foundational Collection™',
    purpose:
      'The first ten permanent volumes: Studio World philosophy, constitution, world bible, architecture, design language, production standards, Profession Brains, Career Worlds, Knowledge Core, and future vision.',
    scope: [
      'universal philosophy',
      'constitutional laws',
      'world model',
      'platform architecture',
      'design language',
      'production standards',
      'profession truth',
      'career worlds',
      'institutional memory',
      'future vision',
    ],
    governanceLevel: 'Foundational',
    owningSystems: ['Studio World Codex™', 'Institute of Knowledge™', 'Knowledge Core™', 'World Graph™'],
    volumeIds: [
      'volume-i-manifesto',
      'volume-ii-constitution',
      'volume-iii-world-bible',
      'volume-iv-architecture-standards',
      'volume-v-design-language',
      'volume-vi-production-standards',
      'volume-vii-profession-brains',
      'volume-viii-career-worlds',
      'volume-ix-knowledge-core',
      'volume-x-future-vision',
    ],
    relatedCollections: [
      'company-headquarters-collection',
      'experience-interface-collection',
      'memory-history-archive-collection',
      'future-eras-collection',
    ],
    tags: ['foundational', 'volumes-i-x', 'constitution', 'canon'],
    status: 'Foundational',
    worldGraphNodeId: 'W-KNO-codex-foundational-collection',
  },
  {
    id: 'company-headquarters-collection',
    title: 'Company & Headquarters Collection™',
    purpose:
      'Multi-company civilization structure, headquarters systems, company genomes, organizational inheritance, departments, executive roles, and institutional operations.',
    scope: ['companies', 'headquarters', 'departments', 'executive roles', 'organizational inheritance'],
    governanceLevel: 'Operational',
    owningSystems: ['Company Genome™', 'Mission Control™', 'Headquarters Marketplace™'],
    volumeIds: [],
    relatedCollections: [FOUNDATIONAL_CODEX_COLLECTION_ID, 'economy-governance-collection'],
    tags: ['companies', 'headquarters', 'operations'],
    status: 'Planned',
  },
  {
    id: 'product-commerce-collection',
    title: 'Product & Commerce Collection™',
    purpose:
      'Studio Exchange™, Professional Licenses™, product systems, marketplace offerings, pricing logic, commerce governance, packages, expansions, and economic product classes.',
    scope: ['commerce', 'licenses', 'products', 'packages', 'expansions'],
    governanceLevel: 'Operational',
    owningSystems: ['Studio Exchange™', 'Professional License System™', 'Marketplace™'],
    volumeIds: [],
    relatedCollections: [FOUNDATIONAL_CODEX_COLLECTION_ID, 'economy-governance-collection'],
    tags: ['commerce', 'exchange', 'licenses'],
    status: 'Planned',
  },
  {
    id: 'experience-interface-collection',
    title: 'Experience & Interface Collection™',
    purpose:
      'Progressive Presence™, global experience, scene assembly, Hero Objects™, Orb behavior, Atlas behavior, navigation language, motion, materials, and frontstage interaction.',
    scope: ['experience', 'interface', 'hero objects', 'orb', 'atlas', 'materials'],
    governanceLevel: 'Constitutional',
    owningSystems: ['Global Experience System™', 'Hero Objects™', 'Orb™', 'Atlas™'],
    volumeIds: [],
    relatedCollections: [FOUNDATIONAL_CODEX_COLLECTION_ID],
    tags: ['experience', 'interface', 'design-language'],
    status: 'Planned',
  },
  {
    id: 'intelligence-agents-collection',
    title: 'Intelligence & Agents Collection™',
    purpose:
      'Orb intelligence, AI councils, agent roles, model orchestration, mentor AI, copilots, governance of AI actions, and intelligence-routing systems.',
    scope: ['agents', 'orb intelligence', 'ai councils', 'model orchestration', 'mentor ai'],
    governanceLevel: 'Constitutional',
    owningSystems: ['Orb™', 'Model Orchestrator™', 'AI Council™'],
    volumeIds: [],
    relatedCollections: [FOUNDATIONAL_CODEX_COLLECTION_ID, 'economy-governance-collection'],
    tags: ['ai', 'agents', 'intelligence'],
    status: 'Planned',
  },
  {
    id: 'production-operations-collection',
    title: 'Production & Operations Collection™',
    purpose:
      'Production boards, QA systems, release readiness, render queues, asset manufacturing operations, completion workflows, and production governance beyond foundational standards.',
    scope: ['production', 'qa', 'release readiness', 'render queue', 'asset operations'],
    governanceLevel: 'Operational',
    owningSystems: ['Production Orchestrator™', 'QA Headquarters™', 'Render Queue™'],
    volumeIds: [],
    relatedCollections: [FOUNDATIONAL_CODEX_COLLECTION_ID],
    tags: ['production', 'operations', 'qa'],
    status: 'Planned',
  },
  {
    id: 'professions-career-worlds-collection',
    title: 'Professions & Career Worlds Collection™',
    purpose:
      'Every profession-specific Career World, Profession Brain, simulation rule set, license, expansion, certification, mentor, NPC ecosystem, and industry update.',
    scope: ['professions', 'career worlds', 'licenses', 'simulations', 'industry updates'],
    governanceLevel: 'Operational',
    owningSystems: ['Career Worlds™', 'Profession Brains™', 'Profession Simulation Engine™'],
    volumeIds: [],
    relatedCollections: [FOUNDATIONAL_CODEX_COLLECTION_ID, 'product-commerce-collection'],
    tags: ['professions', 'career-worlds', 'simulation'],
    status: 'Planned',
  },
  {
    id: 'memory-history-archive-collection',
    title: 'Memory, History & Archive Collection™',
    purpose:
      'Conversation archives, Knowledge Core projections, professional memory, wisdom lineage, ADR histories, old superseded canon, historical timelines, and institutional archaeology.',
    scope: ['memory', 'history', 'archives', 'adrs', 'wisdom lineage'],
    governanceLevel: 'Constitutional',
    owningSystems: ['Institute of Knowledge™', 'Knowledge Core™', 'Memory System™', 'Professional Memory™'],
    volumeIds: [],
    relatedCollections: [FOUNDATIONAL_CODEX_COLLECTION_ID],
    tags: ['memory', 'history', 'archive', 'wisdom'],
    status: 'Planned',
  },
  {
    id: 'economy-governance-collection',
    title: 'Economy & Governance Collection™',
    purpose:
      'Citizen rights, governance structures, professional economies, reputation systems, value flows, AI council governance, and future civic systems.',
    scope: ['citizen rights', 'governance', 'economies', 'reputation', 'value flows'],
    governanceLevel: 'Future',
    owningSystems: ['Studio Economy™', 'Governance™', 'AI Council™'],
    volumeIds: [],
    relatedCollections: [FOUNDATIONAL_CODEX_COLLECTION_ID, 'future-eras-collection'],
    tags: ['economy', 'governance', 'citizens'],
    status: 'Planned',
  },
  {
    id: 'future-eras-collection',
    title: 'Future Eras Collection™',
    purpose:
      'Long-term future visions, unbuilt technologies, cross-career worlds, civilization-scale expansion, future professions, future governance, and era transition planning.',
    scope: ['future eras', 'unbuilt technologies', 'cross-career worlds', 'future professions'],
    governanceLevel: 'Future',
    owningSystems: ['Innovation District™', 'World Graph™', 'Future Vision™'],
    volumeIds: [],
    relatedCollections: [FOUNDATIONAL_CODEX_COLLECTION_ID, 'economy-governance-collection'],
    tags: ['future', 'eras', 'roadmap'],
    status: 'Planned',
  },
];

export function listCodexCollections(): CodexCollection[] {
  return [...CODEX_COLLECTIONS];
}

export function getCodexCollection(id: string): CodexCollection | undefined {
  return CODEX_COLLECTIONS.find((collection) => collection.id === id);
}

export function listPlannedCodexCollections(): CodexCollection[] {
  return CODEX_COLLECTIONS.filter((collection) => collection.status === 'Planned');
}

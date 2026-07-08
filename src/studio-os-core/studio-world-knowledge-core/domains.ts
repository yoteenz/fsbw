import { KNOWLEDGE_CORE_DOMAINS, type KnowledgeCoreDomain } from './types';

export type KnowledgeDomainRegistration = {
  id: KnowledgeCoreDomain;
  slug: string;
  displayName: KnowledgeCoreDomain;
  summary: string;
  orbProjectionLabel: string;
  primaryQuestion: string;
};

function slugify(domain: KnowledgeCoreDomain): string {
  return domain
    .replace(/™/g, '')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

const DOMAIN_COPY: Record<KnowledgeCoreDomain, { summary: string; question: string; orb: string }> = {
  'Constitution™': {
    summary: 'Laws, articles, governance, and oaths that govern Studio World.',
    question: 'What must never break?',
    orb: 'Constitutional Law',
  },
  'Architecture™': {
    summary: 'System architecture and structural decisions.',
    question: 'How is the world built?',
    orb: 'Architecture Memory',
  },
  'World Bible™': {
    summary: 'Publication projections drawn from canon truth.',
    question: 'What story does the world tell?',
    orb: 'World Bible',
  },
  'Design Language™': {
    summary: 'Visual, material, typographic, and spatial language.',
    question: 'How should it feel?',
    orb: 'Design Language',
  },
  'Experience System™': {
    summary: 'Interaction philosophy, presence, navigation, and ambient behavior.',
    question: 'How does presence unfold?',
    orb: 'Experience Canon',
  },
  'Orb™': {
    summary: 'Orb identity, modes, memory, and guidance logic.',
    question: 'What does the Orb remember?',
    orb: 'Orb Memory',
  },
  'Mission Control™': {
    summary: 'Command center architecture and world-interface decisions.',
    question: 'Where does executive attention flow?',
    orb: 'Mission Control',
  },
  'Atlas™': {
    summary: 'Spatial world projection and navigation memory.',
    question: 'Where does everything belong?',
    orb: 'Atlas Memory',
  },
  'Scene Assembly™': {
    summary: 'Scene Stack™, layers, shells, blueprints, and assembly rules.',
    question: 'How are rooms assembled?',
    orb: 'Scene Assembly',
  },
  'Knowledge Engine™': {
    summary: 'Knowledge Core, search, lifecycle, and graph memory.',
    question: 'What does the civilization remember?',
    orb: 'Knowledge Engine',
  },
  'Codex™': {
    summary: 'Constitutional memory: Codex Articles, volumes, lifecycle, and article-first governance.',
    question: 'What must be written before we build?',
    orb: 'Codex Memory',
  },
  'Marketplace™': {
    summary: 'Economy, distribution, licensing, and asset reuse.',
    question: 'What value travels?',
    orb: 'Marketplace Memory',
  },
  'Discovery Packs™': {
    summary: 'Exploration, unknowns, and expansion lore.',
    question: 'What remains undiscovered?',
    orb: 'Discovery Lore',
  },
  'Civilization™': {
    summary: 'World evolution, events, ecology, and relationships.',
    question: 'How has the world evolved?',
    orb: 'Civilization Chronicle',
  },
  'ADR Archive™': {
    summary: 'Architecture Decision Records™ and decision lineage.',
    question: 'Why was this decided?',
    orb: 'Decision Archive',
  },
  'Asset Standards™': {
    summary: 'Reuse, registry, generation, and conservation.',
    question: 'What assets endure?',
    orb: 'Asset Standards',
  },
  'Engineering Standards™': {
    summary: 'Implementation standards and repository patterns.',
    question: 'How do we build?',
    orb: 'Engineering Standards',
  },
  'Prompt Standards™': {
    summary: 'Recurring prompt structure and governance.',
    question: 'How should prompts be shaped?',
    orb: 'Prompt Standards',
  },
  'Brand Standards™': {
    summary: 'Brand meaning, voice, presentation, and consistency.',
    question: 'How does the brand speak?',
    orb: 'Brand Standards',
  },
  'Research™': {
    summary: 'Evidence, experiments, discoveries, and external context.',
    question: 'What have we learned?',
    orb: 'Research Memory',
  },
  'Future Concepts™': {
    summary: 'Preserved future ideas not yet canon.',
    question: 'What may come next?',
    orb: 'Future Concepts',
  },
  "Architect's Memory™": {
    summary: 'Philosophy, vocabulary, naming, materials, and decision heuristics.',
    question: 'What principles endure?',
    orb: "Architect's Memory",
  },
};

/** Permanent domain registrations — each domain owns its own history. */
export const KNOWLEDGE_DOMAIN_REGISTRATIONS: KnowledgeDomainRegistration[] = KNOWLEDGE_CORE_DOMAINS.map(
  (domain) => {
    const copy = DOMAIN_COPY[domain];
    return {
      id: domain,
      slug: slugify(domain),
      displayName: domain,
      summary: copy.summary,
      orbProjectionLabel: copy.orb,
      primaryQuestion: copy.question,
    };
  }
);

export function getKnowledgeDomainRegistration(
  domain: KnowledgeCoreDomain
): KnowledgeDomainRegistration | null {
  return KNOWLEDGE_DOMAIN_REGISTRATIONS.find((d) => d.id === domain) ?? null;
}

export function listKnowledgeDomains(): KnowledgeDomainRegistration[] {
  return [...KNOWLEDGE_DOMAIN_REGISTRATIONS];
}

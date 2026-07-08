import type { CodexVolume } from './types';

export const CODEX_VOLUMES: CodexVolume[] = [
  {
    id: 'volume-i-manifesto',
    title: 'Volume I — Studio World Manifesto™',
    order: 1,
    purpose: 'Permanent philosophy, promise, and civilization-level worldview.',
    owns: ['origin philosophy', 'north-star statements', 'founder-facing meaning'],
  },
  {
    id: 'volume-ii-constitution',
    title: 'Volume II — Constitution™',
    order: 2,
    purpose: 'Laws, governance, review gates, and non-negotiable constraints.',
    owns: ['constitutional laws', 'review gates', 'behavioral governance'],
  },
  {
    id: 'volume-iii-world-bible',
    title: 'Volume III — World Bible™',
    order: 3,
    purpose: 'Canonical world lore, rooms, districts, roles, and institutional narrative.',
    owns: ['world canon', 'rooms', 'districts', 'civilization lore'],
  },
  {
    id: 'volume-iv-architecture-standards',
    title: 'Volume IV — Architecture Standards™',
    order: 4,
    purpose: 'Reusable system architecture, ownership boundaries, and platform standards.',
    owns: ['engines', 'registries', 'contracts', 'extension points'],
  },
  {
    id: 'volume-v-design-language',
    title: 'Volume V — Design Language™',
    order: 5,
    purpose: 'Visual, spatial, material, interaction, and motion language.',
    owns: ['material language', 'motion rules', 'spatial composition', 'visual canon'],
  },
  {
    id: 'volume-vi-production-standards',
    title: 'Volume VI — Production Standards™',
    order: 6,
    purpose: 'Definition of Done, release readiness, QA, and production governance.',
    owns: ['quality gates', 'completion standards', 'launch review', 'post-launch review'],
  },
  {
    id: 'volume-vii-profession-brains',
    title: 'Volume VII — Profession Brains™',
    order: 7,
    purpose: 'Professional truth models, vocabularies, standards, and reasoning systems.',
    owns: ['profession knowledge', 'skill standards', 'judgment frameworks'],
  },
  {
    id: 'volume-viii-career-worlds',
    title: 'Volume VIII — Career Worlds™',
    order: 8,
    purpose: 'Persistent profession worlds, player identity, economy, NPCs, and career progression.',
    owns: ['career worlds', 'profession simulation', 'persistent identity', 'world events'],
  },
  {
    id: 'volume-ix-knowledge-core',
    title: 'Volume IX — Knowledge Core™',
    order: 9,
    purpose: 'Institutional memory, knowledge lifecycle, archives, extraction, and canon promotion.',
    owns: ['knowledge entries', 'memory lineage', 'architect memory', 'searchable canon'],
  },
  {
    id: 'volume-x-future-vision',
    title: 'Volume X — Future Vision™',
    order: 10,
    purpose: 'Long-term possibilities, future eras, preserved concepts, and evolution paths.',
    owns: ['future systems', 'era transitions', 'unbuilt opportunities'],
  },
];

export function getCodexVolume(id: CodexVolume['id']): CodexVolume | undefined {
  return CODEX_VOLUMES.find((volume) => volume.id === id);
}

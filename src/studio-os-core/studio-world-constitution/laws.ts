/**
 * Studio World Constitution™ — eight foundational laws.
 */

import type { ConstitutionLaw } from './types';

export const STUDIO_WORLD_CONSTITUTION_PREAMBLE =
  'Studio World should grow by expanding a civilization — not by accumulating features. Nothing enters without earning its place.';

export const FOUNDATIONAL_LAWS: ConstitutionLaw[] = [
  {
    id: 'everything-belongs-somewhere',
    number: 1,
    title: 'Everything Belongs Somewhere™',
    summary: 'Every feature must have a permanent home in a flagship destination.',
    enforcement: 'If no destination owns it — it cannot be built.',
    examples: [
      'Creative Direction Studio™ — vision & approval',
      'Studio Warehouse™ — manufacture & assemble',
      'Studio Archives™ — preserve & teach',
      'Marketplace™ — share & license',
      'Headquarters™ — execute business work',
      'Command Center™ — coordinate & observe',
      'Expedition Hub™ — guided transformation',
    ],
  },
  {
    id: 'one-mission-per-destination',
    number: 2,
    title: 'One Mission Per Destination™',
    summary: 'Every flagship has one primary responsibility. No overlap. No duplicate systems.',
    enforcement: 'If a feature violates destination responsibilities — the Constitution flags it.',
    examples: [
      'CDS imagines · Warehouse manufactures · Archives preserves',
      'Marketplace distributes · Headquarters executes · Command Center coordinates',
    ],
  },
  {
    id: 'everything-is-architecture',
    number: 3,
    title: 'Everything Is Architecture™',
    summary: 'No feature exists as an isolated webpage.',
    enforcement: 'The Constitution rejects page-first thinking.',
    examples: ['Building', 'Wing', 'Room', 'Observatory', 'Vault', 'Theater', 'Pavilion', 'Workshop'],
  },
  {
    id: 'everything-is-connected',
    number: 4,
    title: 'Everything Is Connected™',
    summary: 'No destination exists independently.',
    enforcement: 'Walking · Transit · Atlas · Orb · Scene Stack™ continuity required.',
    examples: ['Shared lighting language', 'Material language', 'Architectural continuity'],
  },
  {
    id: 'reuse-before-generation',
    number: 5,
    title: 'Reuse Before Generation™',
    summary: 'Search Asset Registry™, Blueprint Archive™, Golden Builds™, Marketplace™, Company Genome™ first.',
    enforcement: 'Only generate what genuinely does not exist.',
    examples: ['Asset Registry™', 'Blueprint Archive™', 'Golden Builds™', 'Marketplace™', 'Company Genome™'],
  },
  {
    id: 'plan-before-build',
    number: 6,
    title: 'Plan Before Build™',
    summary: 'Intent → Planning → Parallel Futures™ → Tournament™ → Merge™ → Approval™ → Manufacturing™ → Archives™ → Marketplace™.',
    enforcement: 'Never skip planning.',
    examples: ['Founder Intent™', 'Future Tournament™', 'Concept Approval™', 'Golden Build™'],
  },
  {
    id: 'founder-creative-director',
    number: 7,
    title: 'The Founder Remains Creative Director™',
    summary: 'Studio OS recommends, explains, simulates, optimizes — the founder retains final authority.',
    enforcement: 'No AI engine may automatically override founder intent.',
    examples: ['Chairman recommends — founder approves', 'Orb explains — never decides'],
  },
  {
    id: 'studio-world-learns',
    number: 8,
    title: 'Studio World Learns™',
    summary: 'Every approval, rejection, merge, generation, Blueprint, purchase, Expedition, and Genome update improves the platform.',
    enforcement: 'The platform continuously evolves from founder decisions.',
    examples: ['Tournament learning', 'Merge history', 'Atlas discovery', 'Constitution reviews'],
  },
];

export function getConstitutionLaw(id: ConstitutionLaw['id']): ConstitutionLaw {
  const law = FOUNDATIONAL_LAWS.find((l) => l.id === id);
  if (!law) throw new Error(`Unknown constitution law: ${id}`);
  return law;
}

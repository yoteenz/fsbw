/**
 * Studio World Design Principles™ — Layer 1 governance.
 * Philosophy and experience north star — not technical rules.
 */

export type DesignPrincipleId =
  | 'immersion-over-pages'
  | 'world-first'
  | 'reuse-before-regeneration'
  | 'memory-before-intelligence'
  | 'progressive-disclosure'
  | 'everything-has-a-home'
  | 'beauty-through-function'
  | 'founders-build-worlds'
  | 'hero-objects-over-icons'
  | 'careers-are-simulated';

export type DesignPrinciple = {
  id: DesignPrincipleId;
  number: number;
  title: string;
  summary: string;
  /** When multiple valid solutions exist, this principle breaks ties */
  decisionGuide: string;
  examples: string[];
};

export const DESIGN_PRINCIPLES_PREAMBLE =
  'Design Principles™ are the philosophy of Studio World — the experience founders and collaborators should feel. When multiple valid architectural solutions exist, principles guide decision-making.';

export const DESIGN_PRINCIPLES: DesignPrinciple[] = [
  {
    id: 'immersion-over-pages',
    number: 1,
    title: 'Immersion Over Pages™',
    summary:
      'Every major capability should feel like a physical destination rather than a traditional webpage.',
    decisionGuide: 'Prefer rooms, wings, and destinations over dashboards and card grids.',
    examples: ['Constitution Hall™', 'Creative Direction Studio™ as department', 'Atlas overlay'],
  },
  {
    id: 'world-first',
    number: 2,
    title: 'World First™',
    summary:
      'Departments, headquarters, rooms, wings, and districts exist as connected places inside one living world.',
    decisionGuide: 'Ask where in Studio World this lives before asking what UI to build.',
    examples: ['Seven flagships', 'Global Atlas Layer™', 'Spatial continuity through Atlas'],
  },
  {
    id: 'reuse-before-regeneration',
    number: 3,
    title: 'Reuse Before Regeneration™',
    summary: 'Always reuse existing assets before generating new ones.',
    decisionGuide: 'Search Registry, Warehouse, Marketplace, and Genome before any generation sprint.',
    examples: ['Asset Registry™', 'Golden Build™', 'Blueprint Archive™'],
  },
  {
    id: 'memory-before-intelligence',
    number: 4,
    title: 'Memory Before Intelligence™',
    summary: 'The platform must understand itself before it can reason.',
    decisionGuide: 'Prioritize graph memory, canon registration, and Era 1 Knowledge work over proactive AI.',
    examples: ['World Graph™ Phase 1', 'Three Eras Roadmap™', 'Orb Archivist™ relationship queries'],
  },
  {
    id: 'progressive-disclosure',
    number: 5,
    title: 'Progressive Disclosure™',
    summary: 'Reveal complexity only when it becomes useful.',
    decisionGuide: 'Arrival zones, fog of discovery, and staged unlock beat showing everything at once.',
    examples: ['Arrival Zone™', 'Fog of discovery', 'Headquarters maturity unlock'],
  },
  {
    id: 'everything-has-a-home',
    number: 6,
    title: 'Everything Has A Home™',
    summary: 'No feature should exist without a physical or conceptual location inside Studio World.',
    decisionGuide: 'If it has no flagship, room, wing, or graph place — it is not ready.',
    examples: ['Route registry', 'Responsibility Framework™', 'Physical Place Law™'],
  },
  {
    id: 'beauty-through-function',
    number: 7,
    title: 'Beauty Through Function™',
    summary: 'Every interaction should be both elegant and purposeful.',
    decisionGuide: 'Reject decoration without purpose; reject utility without craft.',
    examples: ['Experience Intelligence Engine™', 'Scene Stack quality guard', 'Luxury HQ aesthetic'],
  },
  {
    id: 'founders-build-worlds',
    number: 8,
    title: 'Founders Build Worlds™',
    summary: 'Studio World exists to amplify creativity — not administrative work.',
    decisionGuide: 'Founder remains Creative Director; OS recommends, explains, simulates — never decides.',
    examples: ['Founder Taste Engine™', 'Future Tournament™', 'Chairman recommends — founder approves'],
  },
  {
    id: 'hero-objects-over-icons',
    number: 9,
    title: 'Hero Objects Over Icons™',
    summary:
      'Studio World navigation should be represented by collectible living artifacts, not software iconography.',
    decisionGuide:
      'When navigation needs a visual primitive, design a unique manufactured object with silhouette, material, history, motion, and graph identity before considering any icon-like mark.',
    examples: ['World Atlas Globe™', 'Production Board Slate™', 'Story Table Relic™', 'Hero Object Vault™'],
  },
  {
    id: 'careers-are-simulated',
    number: 10,
    title: 'Careers Are Simulated™',
    summary:
      'Studio World learning should feel like entering a profession on Day One, not taking a traditional course.',
    decisionGuide:
      'When building professional education, prefer workplace scenes, shifts, clients, challenges, projects, and promotions over lessons, modules, videos, quizzes, or assignments.',
    examples: ['Hair Profession™ ladder', 'Living Salon Workplace™', 'Mentor Stylist™', 'Promotion gates'],
  },
];

export function getDesignPrinciple(id: DesignPrincipleId): DesignPrinciple {
  const p = DESIGN_PRINCIPLES.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown design principle: ${id}`);
  return p;
}

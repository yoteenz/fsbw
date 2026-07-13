/**
 * Studio World Constitution™ — Supreme Articles (highest platform authority).
 * Nothing may bypass these articles.
 */

export const SUPREME_CONSTITUTION_VERSION = 'studio-world-constitution-supreme.v1' as const;

export type SupremeArticleId =
  | 'article-i-world-identity'
  | 'article-ii-canonical-infrastructure'
  | 'article-iii-founder-property'
  | 'article-iv-ai-generation'
  | 'article-v-blueprint-governance'
  | 'article-vi-mod-governance'
  | 'article-vii-municipal-governance'
  | 'article-viii-immutable-audit';

export type SupremeArticle = {
  id: SupremeArticleId;
  number: number;
  title: string;
  mission: string;
  rules: string[];
  prohibitions: string[];
  enforcement: string;
};

export const SUPREME_CONSTITUTION_PREAMBLE =
  'Studio World Constitution™ is the supreme governing authority of the platform. Every compiler, department, AI worker, Experience Lab process, Creative Director Studio workflow, Marketplace transaction, and founder action must ultimately obey the Constitution. Nothing may bypass it.';

export const SUPREME_ARTICLES: SupremeArticle[] = [
  {
    id: 'article-i-world-identity',
    number: 1,
    title: 'World Identity',
    mission: 'Studio World is a persistent operating system — not a website, not a collection of pages.',
    rules: [
      'Every department represents a real place inside Studio World',
      'Every interface exists within architecture',
      'Interactions must be expressible as physical acts inside headquarters',
    ],
    prohibitions: ['page-first thinking', 'isolated webpages', 'dashboard-as-home'],
    enforcement: 'Reject execution contexts that treat Studio World as a traditional web application.',
  },
  {
    id: 'article-ii-canonical-infrastructure',
    number: 2,
    title: 'Canonical Infrastructure',
    mission: 'Canonical Studio World departments exist exactly once.',
    rules: [
      'Only Studio World Administrators may modify canonical departments',
      'Founders may use canonical departments',
      'Founders may never own canonical departments',
    ],
    prohibitions: ['founder ownership of canonical infrastructure', 'tenant-specific canonical edits'],
    enforcement: 'Canonical modification requires admin role; founders receive read/use access only.',
  },
  {
    id: 'article-iii-founder-property',
    number: 3,
    title: 'Founder Property',
    mission: 'Founder property and Studio World infrastructure are permanently separated.',
    rules: [
      'Founders own: headquarters, brand, customizations, original mods, proprietary workflows, creator IP',
      'Studio World owns: the city, infrastructure, operating system, canonical departments',
    ],
    prohibitions: ['converting founder IP to canonical without licensing', 'studio-world claiming founder HQ'],
    enforcement: 'Ownership boundaries must be explicit in every transaction and handoff.',
  },
  {
    id: 'article-iv-ai-generation',
    number: 4,
    title: 'AI Generation',
    mission: 'AI generates architecture; React injects production UI.',
    rules: [
      'AI generates: architecture, lighting, materials, geometry, furniture, placeholder interfaces',
    ],
    prohibitions: [
      'production UI',
      'typography',
      'menus',
      'logos',
      'dynamic application interfaces',
    ],
    enforcement: 'Style Bible aiNeverRendersText and Architecture Law #001 must pass before any render.',
  },
  {
    id: 'article-v-blueprint-governance',
    number: 5,
    title: 'Blueprint Governance',
    mission: 'No department may exist without complete governed infrastructure.',
    rules: [
      'Department Bible',
      'Style Bible',
      'Architectural DNA',
      'Golden Reference Pack',
      'Blueprint',
      'Construction Plan',
      'Founder Approval',
    ],
    prohibitions: ['manual department assembly', 'bypassing Department Compiler', 'skipping Founder Approval'],
    enforcement: 'Department Compiler must succeed with all layers present before publication.',
  },
  {
    id: 'article-vi-mod-governance',
    number: 6,
    title: 'Mod Governance',
    mission: 'Founder-created content remains founder-owned.',
    rules: ['Creator IP lineage is immutable', 'Explicit licensing or acquisition required for canonical promotion'],
    prohibitions: ['rewriting creator lineage', 'silent canonicalization of founder mods'],
    enforcement: 'Mod registry and marketplace must preserve founder ownership metadata.',
  },
  {
    id: 'article-vii-municipal-governance',
    number: 7,
    title: 'Municipal Governance',
    mission: 'Commerce and construction obey City Council.',
    rules: [
      'Marketplace publication requires City Council governance',
      'Construction requires permits',
      'Licensing, certification, and royalties require municipal approval',
    ],
    prohibitions: ['bypassing City Council', 'unpermitted construction', 'uncertified marketplace publication'],
    enforcement: 'Marketplace and construction pipelines must declare municipal approval state.',
  },
  {
    id: 'article-viii-immutable-audit',
    number: 8,
    title: 'Immutable Audit',
    mission: 'Every constitutional decision produces an immutable audit record.',
    rules: ['All constitutional validations are logged', 'Audit records are append-only', 'Decisions are traceable'],
    prohibitions: ['silent constitutional bypass', 'mutable audit history', 'undocumented governance decisions'],
    enforcement: 'Constitutional gate writes audit record on every validation attempt.',
  },
];

export const GOVERNANCE_HIERARCHY = [
  'Studio World Constitution',
  'Studio World Style Bible',
  'Department Bible',
  'Department DNA',
  'Golden Reference Library',
  'Blueprint Author',
  'Construction Plan',
  'Founder Render',
  'Creative Director Studio',
  'Construction Mode',
  'Published Department',
] as const;

export function getSupremeArticle(id: SupremeArticleId): SupremeArticle {
  const article = SUPREME_ARTICLES.find((a) => a.id === id);
  if (!article) throw new Error(`Unknown supreme article: ${id}`);
  return article;
}

export function listSupremeArticles(): SupremeArticle[] {
  return [...SUPREME_ARTICLES];
}

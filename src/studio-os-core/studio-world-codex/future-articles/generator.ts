import { normalizeCodexArticle } from '../articles/schema';
import { createCodexRelationship } from '../relationships/engine';
import { CODEX_VOLUMES } from '../volumes';
import type {
  CodexArticleRecord,
  CodexArticleRelationship,
  CodexVolumeId,
} from '../types';

export type FutureCodexArticleProposal = {
  draft: CodexArticleRecord;
  suggestedVolume: CodexVolumeId;
  suggestedVolumeTitle: string;
  relatedArticles: string[];
  relationships: CodexArticleRelationship[];
  worldGraphHints: {
    nodeType: 'knowledge-object' | 'constitutional-law' | 'engine';
    suggestedSlug: string;
  };
  implementationReferences: string[];
};

const FEATURE_VOLUME_HINTS: Array<{ pattern: RegExp; volume: CodexVolumeId }> = [
  { pattern: /constitution|law|governance|canonical|codex/i, volume: 'volume-ii-constitution' },
  { pattern: /manifesto|philosophy|principle|civilization/i, volume: 'volume-i-manifesto' },
  { pattern: /world|district|room|headquarters|orb|atlas|npc|economy/i, volume: 'volume-iii-world-bible' },
  { pattern: /architecture|engine|registry|graph|route|simulation|foundry|compiler/i, volume: 'volume-iv-architecture-standards' },
  { pattern: /design|glass|material|motion|lighting|silhouette|hero object/i, volume: 'volume-v-design-language' },
  { pattern: /production|qa|completion|deploy|definition of done/i, volume: 'volume-vi-production-standards' },
  { pattern: /profession brain|teaching|research|mentor ai|skill/i, volume: 'volume-vii-profession-brains' },
  { pattern: /career|license|certification|simulation|retention|memory|exchange/i, volume: 'volume-viii-career-worlds' },
  { pattern: /knowledge|memory|canon|curation|wisdom|archive/i, volume: 'volume-ix-knowledge-core' },
  { pattern: /future|era|roadmap|expansion|creator|cross-career|ai council/i, volume: 'volume-x-future-vision' },
];

const SYSTEM_ARTICLE_MAP: Record<string, string[]> = {
  'Studio Foundry™': ['ARTICLE-A02', 'ARTICLE-A01'],
  'Hero Objects™': ['ARTICLE-D09', 'ARTICLE-D06'],
  'Career Worlds™': ['ARTICLE-E02', 'ARTICLE-E01'],
  'Knowledge Core™': ['ARTICLE-K22', 'ARTICLE-K23'],
  'World Graph™': ['ARTICLE-AR01', 'ARTICLE-C01'],
  'Orb™': ['ARTICLE-D09', 'ARTICLE-W05'],
  'Atlas™': ['ARTICLE-W05', 'ARTICLE-D05'],
  'Profession Brains™': ['ARTICLE-B01', 'ARTICLE-B05'],
  'Knowledge Retention Engine™': ['ARTICLE-E03', 'ARTICLE-B01'],
  'Professional Memory™': ['ARTICLE-E04', 'ARTICLE-E03'],
  'Studio Exchange™': ['ARTICLE-E05', 'ARTICLE-E02'],
};

function suggestVolume(featureName: string, summary: string): CodexVolumeId {
  const blob = `${featureName} ${summary}`;
  for (const hint of FEATURE_VOLUME_HINTS) {
    if (hint.pattern.test(blob)) return hint.volume;
  }
  return 'volume-iv-architecture-standards';
}

function slugify(value: string): string {
  return value
    .replace(/™/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function nextArticleId(volume: CodexVolumeId, featureName: string): string {
  const prefix: Record<CodexVolumeId, string> = {
    'volume-i-manifesto': 'M',
    'volume-ii-constitution': 'C',
    'volume-iii-world-bible': 'W',
    'volume-iv-architecture-standards': 'AR',
    'volume-v-design-language': 'D',
    'volume-vi-production-standards': 'P',
    'volume-vii-profession-brains': 'B',
    'volume-viii-career-worlds': 'E',
    'volume-ix-knowledge-core': 'K',
    'volume-x-future-vision': 'F',
  };
  const code = prefix[volume];
  const suffix = slugify(featureName).slice(0, 12).replace(/-/g, '').toUpperCase() || 'NEW';
  return `ARTICLE-${code}-${suffix}`;
}

export type ProposeFutureCodexArticleInput = {
  featureName: string;
  summary: string;
  philosophy?: string;
  relatedSystems?: string[];
  explicitVolume?: CodexVolumeId;
  docPaths?: string[];
  codePaths?: string[];
};

/**
 * Every future approved feature generates a Draft Codex Article proposal with
 * suggested volume, related articles, relationships, and World Graph hints.
 */
export function proposeFutureCodexArticle(
  input: ProposeFutureCodexArticleInput
): FutureCodexArticleProposal {
  const volume = input.explicitVolume ?? suggestVolume(input.featureName, input.summary);
  const volumeMeta = CODEX_VOLUMES.find((v) => v.id === volume)!;
  const articleId = nextArticleId(volume, input.featureName);

  const relatedArticles = new Set<string>(['ARTICLE-C01']);
  for (const system of input.relatedSystems ?? []) {
    for (const id of SYSTEM_ARTICLE_MAP[system] ?? []) {
      relatedArticles.add(id);
    }
  }

  const draft = normalizeCodexArticle({
    articleId,
    title: input.featureName.includes('™') ? input.featureName : `${input.featureName}™`,
    volume,
    category: 'Draft Proposal',
    status: 'Draft',
    pipelineStage: 'Idea',
    summary: input.summary,
    philosophy: input.philosophy ?? 'Every major feature must answer why it should exist before implementation.',
    relatedSystems: input.relatedSystems ?? [],
    relatedArticles: [...relatedArticles],
    tags: ['draft-proposal', 'future-article', slugify(input.featureName)],
    docPaths: input.docPaths,
    codePaths: input.codePaths,
  });

  const relationships: CodexArticleRelationship[] = [
    createCodexRelationship(articleId, 'ARTICLE-C01', 'depends-on', 'codex-first-gate'),
    ...[...relatedArticles]
      .filter((id) => id !== articleId)
      .map((id) => createCodexRelationship(articleId, id, 'related-to', 'suggested-related')),
  ];

  return {
    draft,
    suggestedVolume: volume,
    suggestedVolumeTitle: volumeMeta.title,
    relatedArticles: [...relatedArticles],
    relationships,
    worldGraphHints: {
      nodeType: volume === 'volume-ii-constitution' ? 'constitutional-law' : 'knowledge-object',
      suggestedSlug: slugify(input.featureName),
    },
    implementationReferences: [
      ...(input.docPaths ?? []),
      ...(input.codePaths ?? []),
      'docs/studio-os/codex/CODEX_ARTICLE_TEMPLATE.md',
    ],
  };
}

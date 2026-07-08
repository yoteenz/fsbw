import { createCodexRelationship } from '../../relationships/engine';
import type { CodexArticleRelationship } from '../../types';

const CREATED = '2026-07-08T00:00:00.000Z';

type RelSeed = {
  from: string;
  to: string;
  type: CodexArticleRelationship['type'];
  label?: string;
};

const RELATIONSHIP_SEEDS: RelSeed[] = [
  // User-specified examples
  { from: 'ARTICLE-D09', to: 'ARTICLE-A02', type: 'depends-on', label: 'hero-object-manufacturing' },
  { from: 'ARTICLE-A02', to: 'ARTICLE-A01', type: 'depends-on', label: 'uses-generation-recipes' },
  { from: 'ARTICLE-E02', to: 'ARTICLE-E01', type: 'depends-on', label: 'uses-simulation-engine' },
  { from: 'ARTICLE-E03', to: 'ARTICLE-B01', type: 'extends', label: 'retention-extends-profession-brain' },
  { from: 'ARTICLE-E04', to: 'ARTICLE-E03', type: 'extends', label: 'memory-extends-retention' },
  { from: 'ARTICLE-E05', to: 'ARTICLE-E02', type: 'related-to', label: 'exchange-connects-career-worlds' },
  { from: 'ARTICLE-D05', to: 'ARTICLE-W05', type: 'related-to', label: 'orb-atlas-behavior' },
  { from: 'ARTICLE-AR06', to: 'ARTICLE-K22', type: 'related-to', label: 'foundry-knowledge-core' },
  { from: 'ARTICLE-AR01', to: 'ARTICLE-K22', type: 'related-to', label: 'world-graph-knowledge-core' },

  // Manifesto → Constitution
  { from: 'ARTICLE-M01', to: 'ARTICLE-C01', type: 'supports', label: 'manifesto-supports-codex-law' },
  { from: 'ARTICLE-M02', to: 'ARTICLE-K18', type: 'supports', label: 'inhabited-presence' },
  { from: 'ARTICLE-M03', to: 'ARTICLE-K22', type: 'supports', label: 'wisdom-memory' },

  // Constitution chain
  { from: 'ARTICLE-C02', to: 'ARTICLE-C01', type: 'extends', label: 'complete-codex-extends-codex-first' },
  { from: 'ARTICLE-C02', to: 'ARTICLE-K22', type: 'depends-on', label: 'collection-discovery-memory' },
  { from: 'ARTICLE-C02', to: 'ARTICLE-AR01', type: 'depends-on', label: 'collection-world-graph' },
  { from: 'ARTICLE-C02', to: 'ARTICLE-F05', type: 'supports', label: 'decades-scale-roadmap' },
  { from: 'ARTICLE-C01', to: 'ARTICLE-K21', type: 'depends-on' },
  { from: 'ARTICLE-C01', to: 'ARTICLE-C02', type: 'supports', label: 'codex-expansion-law' },
  { from: 'ARTICLE-C01', to: 'ARTICLE-K22', type: 'supports' },
  { from: 'ARTICLE-C01', to: 'ARTICLE-K23', type: 'depends-on' },
  { from: 'ARTICLE-C01', to: 'ARTICLE-K24', type: 'related-to' },

  // Design & Foundry
  { from: 'ARTICLE-D09', to: 'ARTICLE-D06', type: 'extends', label: 'silhouette-law' },
  { from: 'ARTICLE-D01', to: 'ARTICLE-D09', type: 'supports' },

  // World Bible
  { from: 'ARTICLE-W01', to: 'ARTICLE-AR01', type: 'depends-on' },
  { from: 'ARTICLE-W06', to: 'ARTICLE-E02', type: 'related-to', label: 'world-canon' },
  { from: 'ARTICLE-W08', to: 'ARTICLE-E05', type: 'related-to' },

  // Knowledge pipeline
  { from: 'ARTICLE-K23', to: 'ARTICLE-K22', type: 'depends-on', label: 'memory-feeds-core' },
  { from: 'ARTICLE-K25', to: 'ARTICLE-B03', type: 'extends' },
  { from: 'ARTICLE-K27', to: 'ARTICLE-E04', type: 'extends' },

  // Career Worlds volume
  { from: 'ARTICLE-E06', to: 'ARTICLE-E02', type: 'extends' },
  { from: 'ARTICLE-E07', to: 'ARTICLE-E05', type: 'extends' },
  { from: 'ARTICLE-E08', to: 'ARTICLE-E05', type: 'extends' },

  // Production
  { from: 'ARTICLE-K24', to: 'ARTICLE-C01', type: 'depends-on', label: 'codex-checkpoint' },
  { from: 'ARTICLE-P05', to: 'ARTICLE-C01', type: 'supports' },

  // Future vision
  { from: 'ARTICLE-F01', to: 'ARTICLE-E02', type: 'extends' },
  { from: 'ARTICLE-F05', to: 'ARTICLE-AR01', type: 'depends-on' },
  { from: 'ARTICLE-F03', to: 'ARTICLE-C11', type: 'related-to' },
];

export function buildCanonicalRelationships(): CodexArticleRelationship[] {
  const rels: CodexArticleRelationship[] = [];

  for (const seed of RELATIONSHIP_SEEDS) {
    if (seed.from === seed.to) continue;
    rels.push(
      createCodexRelationship(seed.from, seed.to, seed.type, seed.label)
    );
    // Stamp consistent createdAt for archive
    rels[rels.length - 1]!.createdAt = CREATED;
  }

  const map = new Map<string, CodexArticleRelationship>();
  for (const rel of rels) map.set(rel.id, rel);
  return [...map.values()];
}

import { buildCanonicalArticle, buildRevisionSnapshots } from '../article-builder';
import { VOLUME_I_MANIFESTO_ARTICLES } from './volume-i-manifesto';
import { VOLUME_II_CONSTITUTION_ARTICLES } from './volume-ii-constitution';
import { VOLUME_III_WORLD_BIBLE_ARTICLES } from './volume-iii-world-bible';
import { VOLUME_IV_ARCHITECTURE_ARTICLES } from './volume-iv-architecture';
import { VOLUME_V_DESIGN_ARTICLES } from './volume-v-design-language';
import { VOLUME_VI_PRODUCTION_ARTICLES } from './volume-vi-production';
import { VOLUME_VII_PROFESSION_BRAINS_ARTICLES } from './volume-vii-profession-brains';
import { VOLUME_VIII_CAREER_WORLDS_ARTICLES } from './volume-viii-career-worlds';
import { VOLUME_IX_KNOWLEDGE_CORE_ARTICLES } from './volume-ix-knowledge-core';
import { VOLUME_X_FUTURE_VISION_ARTICLES } from './volume-x-future-vision';
import { buildCanonicalRelationships } from './relationships';
import type { CodexArticleRecord, CodexArticleRelationship } from '../../types';

const ALL_SEEDS = [
  ...VOLUME_I_MANIFESTO_ARTICLES,
  ...VOLUME_II_CONSTITUTION_ARTICLES,
  ...VOLUME_III_WORLD_BIBLE_ARTICLES,
  ...VOLUME_IV_ARCHITECTURE_ARTICLES,
  ...VOLUME_V_DESIGN_ARTICLES,
  ...VOLUME_VI_PRODUCTION_ARTICLES,
  ...VOLUME_VII_PROFESSION_BRAINS_ARTICLES,
  ...VOLUME_VIII_CAREER_WORLDS_ARTICLES,
  ...VOLUME_IX_KNOWLEDGE_CORE_ARTICLES,
  ...VOLUME_X_FUTURE_VISION_ARTICLES,
];

export const CANONICAL_ARCHIVE_ARTICLE_COUNT = ALL_SEEDS.length;

export function getCanonicalArchiveArticles(): CodexArticleRecord[] {
  const articles = ALL_SEEDS.map(buildCanonicalArticle);
  const map = new Map<string, CodexArticleRecord>();
  for (const article of articles) {
    map.set(article.articleId, article);
  }
  return [...map.values()];
}

export function getCanonicalArchiveRelationships(): CodexArticleRelationship[] {
  return buildCanonicalRelationships();
}

export function buildCanonicalArchiveStorePayload() {
  const articles = getCanonicalArchiveArticles();
  return {
    articles,
    relationships: getCanonicalArchiveRelationships(),
    revisionSnapshots: buildRevisionSnapshots(articles),
  };
}

export {
  VOLUME_I_MANIFESTO_ARTICLES,
  VOLUME_II_CONSTITUTION_ARTICLES,
  VOLUME_III_WORLD_BIBLE_ARTICLES,
  VOLUME_IV_ARCHITECTURE_ARTICLES,
  VOLUME_V_DESIGN_ARTICLES,
  VOLUME_VI_PRODUCTION_ARTICLES,
  VOLUME_VII_PROFESSION_BRAINS_ARTICLES,
  VOLUME_VIII_CAREER_WORLDS_ARTICLES,
  VOLUME_IX_KNOWLEDGE_CORE_ARTICLES,
  VOLUME_X_FUTURE_VISION_ARTICLES,
};

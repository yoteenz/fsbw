import type {
  CodexArticleRecord,
  CodexArticleRelationship,
  CodexRelationshipType,
} from '../types';

const INVERSE_RELATIONSHIP: Partial<Record<CodexRelationshipType, CodexRelationshipType>> = {
  'depends-on': 'referenced-by',
  supersedes: 'referenced-by',
};

function relId(from: string, type: CodexRelationshipType, to: string): string {
  return `rel-${from.toLowerCase()}-${type}-${to.toLowerCase()}`;
}

export function createCodexRelationship(
  fromArticleId: string,
  toArticleId: string,
  type: CodexRelationshipType,
  label?: string
): CodexArticleRelationship {
  const createdAt = new Date().toISOString();
  return {
    id: relId(fromArticleId, type, toArticleId),
    fromArticleId: fromArticleId.trim().toUpperCase(),
    toArticleId: toArticleId.trim().toUpperCase(),
    type,
    label,
    createdAt,
  };
}

/** Sync explicit relationship edges from article relatedArticles and relatedSystems fields. */
export function syncArticleRelationshipsFromFields(
  existing: CodexArticleRelationship[],
  article: CodexArticleRecord
): CodexArticleRelationship[] {
  const articleId = article.articleId;
  const withoutArticle = existing.filter(
    (r) => r.fromArticleId !== articleId || !r.id.startsWith(`rel-${articleId.toLowerCase()}-`)
  );

  const next = [...withoutArticle];

  for (const relatedId of article.relatedArticles) {
    next.push(createCodexRelationship(articleId, relatedId, 'related-to'));
  }

  for (const system of article.relatedSystems) {
    next.push(createCodexRelationship(articleId, system, 'related-to', `system:${system}`));
  }

  return dedupeRelationships(next);
}

function dedupeRelationships(rels: CodexArticleRelationship[]): CodexArticleRelationship[] {
  const map = new Map<string, CodexArticleRelationship>();
  for (const rel of rels) {
    map.set(rel.id, rel);
  }
  return [...map.values()];
}

export function listRelationshipsForArticle(
  relationships: CodexArticleRelationship[],
  articleId: string
): CodexArticleRelationship[] {
  const normalized = articleId.trim().toUpperCase();
  return relationships.filter(
    (r) => r.fromArticleId === normalized || r.toArticleId === normalized
  );
}

export function findRelatedArticleIds(
  relationships: CodexArticleRelationship[],
  articleId: string,
  type?: CodexRelationshipType
): string[] {
  const normalized = articleId.trim().toUpperCase();
  const ids = new Set<string>();

  for (const rel of relationships) {
    if (type && rel.type !== type) continue;

    if (rel.fromArticleId === normalized) ids.add(rel.toArticleId);
    if (rel.toArticleId === normalized) ids.add(rel.fromArticleId);
  }

  ids.delete(normalized);
  return [...ids];
}

export function findConflictingRelationships(
  relationships: CodexArticleRelationship[],
  articleId: string
): CodexArticleRelationship[] {
  const normalized = articleId.trim().toUpperCase();
  return relationships.filter(
    (r) =>
      (r.fromArticleId === normalized || r.toArticleId === normalized) &&
      r.type === 'contradicts'
  );
}

export function addCodexRelationship(
  relationships: CodexArticleRelationship[],
  rel: CodexArticleRelationship
): CodexArticleRelationship[] {
  return dedupeRelationships([...relationships, rel]);
}

export function codexRelationshipsToWorldGraphEdges(
  articleId: string,
  relationships: CodexArticleRelationship[]
): Array<{ type: string; from: string; to: string; label?: string }> {
  const nodeId = `codex-${articleId.toLowerCase()}`;
  return listRelationshipsForArticle(relationships, articleId).map((r) => ({
    type: r.type,
    from: r.fromArticleId === articleId ? nodeId : `codex-${r.fromArticleId.toLowerCase()}`,
    to: r.toArticleId === articleId ? nodeId : `codex-${r.toArticleId.toLowerCase()}`,
    label: r.label,
  }));
}

export { INVERSE_RELATIONSHIP };

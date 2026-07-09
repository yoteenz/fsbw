import { mutateConstitutionStore, readConstitutionStore } from '../persistence';
import type { ConstitutionRelationship, ConstitutionRelationshipType } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createRelationshipId(from: string, to: string, type: ConstitutionRelationshipType): string {
  return `con-rel-${from}-${type}-${to}-${Date.now().toString(36)}`;
}

/** Constitution Relationship Graph™ */
export function listConstitutionRelationships(): ConstitutionRelationship[] {
  return readConstitutionStore().relationships;
}

export function listConstitutionRelationshipsForArticle(
  articleId: string
): ConstitutionRelationship[] {
  return readConstitutionStore().relationships.filter(
    (r) => r.fromArticleId === articleId || r.toArticleId === articleId
  );
}

export function addConstitutionRelationship(input: {
  fromArticleId: string;
  toArticleId: string;
  type: ConstitutionRelationshipType;
  rationale?: string;
  required?: boolean;
}): ConstitutionRelationship {
  const relationship: ConstitutionRelationship = {
    id: createRelationshipId(input.fromArticleId, input.toArticleId, input.type),
    fromArticleId: input.fromArticleId,
    toArticleId: input.toArticleId,
    type: input.type,
    rationale: input.rationale,
    required: input.required,
    createdAt: now(),
  };

  mutateConstitutionStore((store) => ({
    ...store,
    relationships: [...store.relationships, relationship],
  }));

  return relationship;
}

export function syncConstitutionRelationshipsFromArticleFields(): number {
  let added = 0;

  mutateConstitutionStore((store) => {
    const existing = new Set(
      store.relationships.map((r) => `${r.fromArticleId}:${r.type}:${r.toArticleId}`)
    );
    const newRelationships = [...store.relationships];

    for (const article of store.articles) {
      for (const dep of article.dependencies) {
        const key = `${article.articleId}:depends-on:${dep}`;
        if (!existing.has(key)) {
          newRelationships.push({
            id: createRelationshipId(article.articleId, dep, 'depends-on'),
            fromArticleId: article.articleId,
            toArticleId: dep,
            type: 'depends-on',
            createdAt: now(),
          });
          existing.add(key);
          added++;
        }
      }
      for (const related of article.relatedArticles) {
        const key = `${article.articleId}:related-to:${related}`;
        if (!existing.has(key)) {
          newRelationships.push({
            id: createRelationshipId(article.articleId, related, 'related-to'),
            fromArticleId: article.articleId,
            toArticleId: related,
            type: 'related-to',
            createdAt: now(),
          });
          existing.add(key);
          added++;
        }
      }
    }

    return { ...store, relationships: newRelationships };
  });

  return added;
}

export function findConstitutionContradictions(): ConstitutionRelationship[] {
  return readConstitutionStore().relationships.filter((r) => r.type === 'contradicts');
}

export function getConstitutionGraphNeighbors(articleId: string) {
  const outgoing = readConstitutionStore().relationships.filter(
    (r) => r.fromArticleId === articleId
  );
  const incoming = readConstitutionStore().relationships.filter(
    (r) => r.toArticleId === articleId
  );
  return { outgoing, incoming, total: outgoing.length + incoming.length };
}

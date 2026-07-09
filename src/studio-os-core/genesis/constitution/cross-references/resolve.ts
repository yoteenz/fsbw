import { getConstitutionArticle } from '../articles/engine';
import { listConstitutionRelationshipsForArticle } from '../relationships/graph';
import type { ConstitutionCrossReference, ConstitutionRelationshipType } from '../types';

/** Cross References™ — resolve stable constitutional references. */
export function resolveConstitutionCrossReference(
  refId: string,
  label?: string,
  relationship?: ConstitutionRelationshipType
): ConstitutionCrossReference | undefined {
  const article = getConstitutionArticle(refId);
  if (!article) return undefined;

  return {
    refId: article.articleId,
    label: label ?? article.officialName,
    relationship,
    targetArticleId: article.articleId,
  };
}

export function listConstitutionCrossReferences(articleId: string): ConstitutionCrossReference[] {
  const article = getConstitutionArticle(articleId);
  if (!article) return [];

  const fromFields = article.relatedArticles.map((relatedId) => ({
    refId: relatedId,
    label: getConstitutionArticle(relatedId)?.officialName ?? relatedId,
    relationship: 'related-to' as const,
    targetArticleId: relatedId,
  }));

  const fromDeps = article.dependencies.map((depId) => ({
    refId: depId,
    label: getConstitutionArticle(depId)?.officialName ?? depId,
    relationship: 'depends-on' as const,
    targetArticleId: depId,
  }));

  const fromGraph = listConstitutionRelationshipsForArticle(articleId).map((rel) => {
    const targetId = rel.fromArticleId === articleId ? rel.toArticleId : rel.fromArticleId;
    return {
      refId: targetId,
      label: getConstitutionArticle(targetId)?.officialName ?? targetId,
      relationship: rel.type,
      targetArticleId: targetId,
    };
  });

  const seen = new Set<string>();
  return [...fromFields, ...fromDeps, ...fromGraph].filter((ref) => {
    const key = `${ref.targetArticleId}:${ref.relationship ?? 'ref'}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatConstitutionCitation(articleId: string): string {
  const article = getConstitutionArticle(articleId);
  if (!article) return articleId;
  return `${article.articleId} — ${article.officialName}`;
}

export function validateConstitutionCrossReferences(articleId: string): string[] {
  const broken: string[] = [];
  const article = getConstitutionArticle(articleId);
  if (!article) return [articleId];

  for (const dep of article.dependencies) {
    if (!getConstitutionArticle(dep)) broken.push(dep);
  }
  for (const related of article.relatedArticles) {
    if (!getConstitutionArticle(related)) broken.push(related);
  }

  return broken;
}

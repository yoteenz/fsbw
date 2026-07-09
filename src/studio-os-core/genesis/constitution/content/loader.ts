import type { RegisterConstitutionArticleInput } from '../articles/engine';
import { registerConstitutionArticle } from '../articles/engine';
import { syncConstitutionRelationshipsFromArticleFields } from '../relationships/graph';

/**
 * Data-driven constitutional article ingest.
 * Future articles can be added via JSON payloads without engineering changes.
 */
export type ConstitutionArticlePayload = RegisterConstitutionArticleInput;

export function ingestConstitutionArticlePayload(
  payload: ConstitutionArticlePayload
): ReturnType<typeof registerConstitutionArticle> {
  const article = registerConstitutionArticle(payload);
  syncConstitutionRelationshipsFromArticleFields();
  return article;
}

export function ingestConstitutionArticleBatch(payloads: ConstitutionArticlePayload[]): {
  ingested: string[];
  errors: string[];
} {
  const ingested: string[] = [];
  const errors: string[] = [];

  for (const payload of payloads) {
    try {
      const article = ingestConstitutionArticlePayload(payload);
      ingested.push(article.articleId);
    } catch (err) {
      errors.push(
        `${payload.articleId}: ${err instanceof Error ? err.message : 'unknown error'}`
      );
    }
  }

  return { ingested, errors };
}

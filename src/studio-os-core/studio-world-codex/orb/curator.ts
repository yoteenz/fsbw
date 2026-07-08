import { getCodexArticle, listCodexArticles } from '../articles/registry';
import { readCodexStore } from '../persistence/store';
import {
  findConflictingRelationships,
  findRelatedArticleIds,
} from '../relationships/engine';
import { resolveInstituteAdvice } from '../../institute-of-knowledge/orb/advisor';
import { resolveHeadquartersPrinciplesAdvice } from '../../headquarters-principles/orb/advisor';
import type { CodexArticleRecord, CodexOrbRecommendation } from '../types';

/** Orb Curator™ — constitutional memory advisor for the Codex. */
export function buildCodexCuratorLines(articles: CodexArticleRecord[]): string[] {
  const canonical = articles.filter((a) => a.status === 'Canonical');
  const titles = canonical.map((a) => a.title).slice(0, 2);

  return [
    `The Codex holds ${articles.length} articles — Studio World remembering itself before it builds.`,
    titles.length
      ? `Canonical law: ${titles.join(' · ')}`
      : 'Canonical articles await founder approval.',
    'Ask about philosophy, conflicts, or evolution — the Orb curates through relationship, not folders.',
  ];
}

export function getCodexOrbRecommendations(articleId?: string, limit = 8): CodexOrbRecommendation[] {
  const store = readCodexStore();
  const articles = listCodexArticles();
  const recommendations: CodexOrbRecommendation[] = [];

  if (!articleId) {
    const canonical = articles.filter((a) => a.status === 'Canonical').slice(0, 3);
    for (const article of canonical) {
      recommendations.push({
        kind: 'relevant-philosophy',
        title: article.title,
        detail: article.philosophy || article.summary,
        articleId: article.articleId,
      });
    }
    return recommendations.slice(0, limit);
  }

  const article = getCodexArticle(articleId);
  if (!article) return [];

  const relatedIds = findRelatedArticleIds(store.relationships, articleId);
  for (const relatedId of relatedIds.slice(0, 3)) {
    const related = getCodexArticle(relatedId);
    if (!related) continue;
    recommendations.push({
      kind: 'related-article',
      title: related.title,
      detail: related.summary,
      articleId: related.articleId,
    });
  }

  const conflicts = findConflictingRelationships(store.relationships, articleId);
  for (const conflict of conflicts.slice(0, 2)) {
    const otherId =
      conflict.fromArticleId === articleId ? conflict.toArticleId : conflict.fromArticleId;
    const other = getCodexArticle(otherId);
    recommendations.push({
      kind: 'architectural-conflict',
      title: other?.title ?? otherId,
      detail: conflict.label ?? 'Potential constitutional tension detected.',
      articleId: otherId,
    });
  }

  for (const revision of article.revisionHistory.slice(-2)) {
    recommendations.push({
      kind: 'historical-decision',
      title: `Revision ${revision.version}`,
      detail: revision.changeNote || revision.summary,
      articleId: article.articleId,
    });
  }

  if (article.philosophy) {
    recommendations.push({
      kind: 'relevant-philosophy',
      title: article.title,
      detail: article.philosophy,
      articleId: article.articleId,
    });
  }

  const futureTags = article.tags.filter((t) => /future|evolution|era/i.test(t));
  if (futureTags.length || article.volume === 'volume-x-future-vision') {
    recommendations.push({
      kind: 'future-evolution',
      title: 'Future evolution path',
      detail:
        article.architecturalDecisions.at(-1) ??
        'This article may unlock future platform capabilities.',
      articleId: article.articleId,
    });
  }

  return recommendations.slice(0, limit);
}

export function resolveCodexOrbLine(query: string): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  if (/codex|constitutional memory|codex first/i.test(q)) {
    const articles = listCodexArticles();
    const canonical = articles.filter((a) => a.status === 'Canonical').length;
    return `Studio World Codex™ holds ${articles.length} articles. ${canonical} are Canonical™ — they govern implementation.`;
  }

  if (/conflict|contradict/i.test(q)) {
    return 'The Orb scans relationship edges for contradicts and supersedes chains before major implementation.';
  }

  if (/revision|history|version/i.test(q)) {
    return 'Codex history is append-only — every edit creates a new revision snapshot. Canonical truth is never overwritten.';
  }

  return null;
}

export type CodexOrbAdvice = {
  response: string;
  concierge: 'Orb Curator™' | 'Orb Curator™ · Institute Advisor™' | 'Orb Curator™ · Headquarters Advisor™';
  articleCount: number;
};

export function resolveCodexAdvice(input: string): CodexOrbAdvice | null {
  const line = resolveCodexOrbLine(input);
  if (!line) return null;
  return {
    response: line,
    concierge: 'Orb Curator™',
    articleCount: listCodexArticles().length,
  };
}

/** Combined Orb response — constitutional memory + Institute + Headquarters principles. */
export function resolveCodexAndInstituteAdvice(input: string): CodexOrbAdvice | null {
  const headquarters = resolveHeadquartersPrinciplesAdvice(input);
  if (headquarters) {
    return {
      response: headquarters.response,
      concierge: 'Orb Curator™ · Headquarters Advisor™',
      articleCount: listCodexArticles().length,
    };
  }

  const institute = resolveInstituteAdvice(input);
  if (institute) {
    const citationNote =
      institute.citations.length > 0
        ? ` Sources: ${institute.citations.map((c) => `${c.title} (Ed.${c.edition} Rev.${c.revision})`).join(' · ')}.`
        : '';
    return {
      response: institute.response + citationNote,
      concierge: 'Orb Curator™ · Institute Advisor™',
      articleCount: institute.publicationCount,
    };
  }
  return resolveCodexAdvice(input);
}

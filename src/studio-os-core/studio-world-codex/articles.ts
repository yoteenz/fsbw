import { STUDIO_WORLD_CODEX_ARTICLE_ID } from './constants';
import type { CodexArticle } from './types';

export const CODEX_FIRST_PRINCIPLE_ARTICLE: CodexArticle = {
  articleId: STUDIO_WORLD_CODEX_ARTICLE_ID,
  title: 'The Codex First Principle™',
  category: 'volume-ii-constitution',
  status: 'Codex Article',
  origin:
    'Founder architecture sprint establishing that Studio World complexity now requires ideas to become Codex Articles before implementation.',
  purpose:
    'Make the Studio World Codex™ the constitutional memory and single source of truth for philosophy, systems, naming, architecture, and long-term vision.',
  corePhilosophy:
    'The Codex is not documentation; it is Studio World remembering itself before it builds.',
  guidingPrinciples: [
    'Document before implementation.',
    'Every major feature must answer why it should exist.',
    'Approved ideas become Codex Articles before engineering begins.',
    'The Codex must outlive individual AI models, conversations, contributors, and implementations.',
    'Reusable platform capabilities are preferred over one-off features.',
  ],
  architecturalImplications: [
    'Major feature work starts in the Codex lifecycle, not directly in code.',
    'Knowledge Core, World Bible, ADRs, and implementation plans become projections of Codex-approved truth.',
    'Constitution Review™ becomes the formal gate between article approval and implementation planning.',
    'Post-launch learnings must update the relevant article instead of living only in memory or chat.',
  ],
  affectedSystems: [
    'Knowledge Core™',
    'World Graph™',
    'Architecture Decision Records™',
    'World Bible™',
    'Studio Production Orchestrator™',
    'Production Completion System™',
    'Career Worlds™',
    'Profession Brains™',
  ],
  dependencies: ['ARTICLE-K21', 'ARTICLE-K22', 'ARTICLE-K23', 'ARTICLE-K24'],
  futureEvolution: [
    'Codex Review Room™ for founder approval.',
    'Automated Codex Article generation from architecture prompts.',
    'Codex diffing after production releases.',
    'Orb citations that cite Codex Articles before implementation files.',
  ],
  relatedArticles: ['ARTICLE-K21', 'ARTICLE-K22', 'ARTICLE-K23', 'ARTICLE-K24', 'ARTICLE-E02'],
  implementationStrategy: [
    'Create typed Codex Article and Volume schemas.',
    'Seed ARTICLE-C01 as canonical architecture.',
    'Register Codex nodes in World Graph.',
    'Add Knowledge Core entry for searchable institutional memory.',
    'Document article template and lifecycle.',
  ],
  revisionHistory: [
    {
      version: '1.0.0',
      date: '2026-07-08',
      summary: 'Initial accepted architecture for Codex-first governance.',
    },
  ],
  canonicalStatus: 'Accepted Architecture',
};

export const CODEX_ARTICLES: CodexArticle[] = [CODEX_FIRST_PRINCIPLE_ARTICLE];

export function listCodexArticles(): CodexArticle[] {
  return [...CODEX_ARTICLES];
}

export function getCodexArticle(articleId: string): CodexArticle | undefined {
  return CODEX_ARTICLES.find((article) => article.articleId === articleId);
}

import { readCodexStore } from '../persistence/store';
import type { CodexArticleRecord, CodexVolumeId } from '../types';

export function listCodexArticles(): CodexArticleRecord[] {
  return [...readCodexStore().articles];
}

export function getCodexArticle(articleId: string): CodexArticleRecord | undefined {
  const normalized = articleId.trim().toUpperCase();
  return readCodexStore().articles.find((article) => article.articleId === normalized);
}

export function listCodexArticlesByVolume(volume: CodexVolumeId): CodexArticleRecord[] {
  return listCodexArticles().filter((article) => article.volume === volume);
}

export function listCodexArticlesByStatus(status: CodexArticleRecord['status']): CodexArticleRecord[] {
  return listCodexArticles().filter((article) => article.status === status);
}

export function listCodexArticlesByTag(tag: string): CodexArticleRecord[] {
  const needle = tag.trim().toLowerCase();
  return listCodexArticles().filter((article) =>
    article.tags.some((t) => t.toLowerCase() === needle)
  );
}

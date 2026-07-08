import type { CodexArticleRecord, CodexArticleRevisionSnapshot } from '../types';

export function bumpVersion(current: string): string {
  const parts = current.replace(/^v/i, '').split('.').map((p) => Number.parseInt(p, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] = (parts[2] ?? 0) + 1;
  return parts.join('.');
}

export function appendRevisionSnapshot(
  snapshots: CodexArticleRevisionSnapshot[],
  article: CodexArticleRecord,
  meta: { version: string; author: string; changeNote: string }
): CodexArticleRevisionSnapshot[] {
  const revisionId = `rev-${article.articleId.toLowerCase()}-${meta.version}`;
  const snapshot: CodexArticleRevisionSnapshot = {
    revisionId,
    articleId: article.articleId,
    version: meta.version,
    snapshot: { ...article },
    createdAt: new Date().toISOString(),
    author: meta.author,
    changeNote: meta.changeNote,
  };

  return [...snapshots.filter((s) => s.revisionId !== revisionId), snapshot];
}

export function listArticleRevisionSnapshots(
  snapshots: CodexArticleRevisionSnapshot[],
  articleId: string
): CodexArticleRevisionSnapshot[] {
  const normalized = articleId.trim().toUpperCase();
  return snapshots
    .filter((s) => s.articleId === normalized)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getRevisionSnapshotById(
  snapshots: CodexArticleRevisionSnapshot[],
  revisionId: string
): CodexArticleRevisionSnapshot | undefined {
  return snapshots.find((s) => s.revisionId === revisionId);
}

export function formatCodexVersionLabel(version: string): string {
  return version.startsWith('v') || version.startsWith('V') ? version : `v${version}`;
}

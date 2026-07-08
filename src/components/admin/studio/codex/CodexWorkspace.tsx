import { useMemo, useState } from 'react';
import {
  CODEX_VOLUMES,
  getCodexArticleRevisionHistory,
  getCodexArticleRelationships,
  getCodexOrbRecommendations,
  getRelatedCodexArticles,
  type CodexPublicationStatus,
  type CodexVolumeId,
} from '../../../../studio-os-core/studio-world-codex';
import { useCodexSearch, useCodexState } from '../../../../hooks/useCodexState';

function CodexPanel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm ${className}`}
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * Studio World Codex™ — constitutional memory workspace.
 * Reusable platform shell; articles load from the Codex store, not hardcoded arrays.
 */
export function CodexWorkspace() {
  const { articles, stats, curatorLines, refresh } = useCodexState();
  const [activeVolume, setActiveVolume] = useState<CodexVolumeId>(
    CODEX_VOLUMES[1]?.id ?? 'volume-ii-constitution'
  );
  const [statusFilter, setStatusFilter] = useState<CodexPublicationStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filters = useMemo(
    () => ({
      volume: activeVolume,
      status: statusFilter ?? undefined,
    }),
    [activeVolume, statusFilter]
  );

  const searchHits = useCodexSearch(searchQuery, searchQuery.trim() ? undefined : filters);
  const volumeArticles = useMemo(
    () => articles.filter((a) => a.volume === activeVolume),
    [articles, activeVolume]
  );

  const displayedArticles = searchQuery.trim()
    ? searchHits.map((h) => h.article)
    : statusFilter
      ? volumeArticles.filter((a) => a.status === statusFilter)
      : volumeArticles;

  const [activeArticleId, setActiveArticleId] = useState<string>(
    displayedArticles[0]?.articleId ?? articles[0]?.articleId ?? 'ARTICLE-C01'
  );

  const activeArticle =
    displayedArticles.find((a) => a.articleId === activeArticleId) ??
    articles.find((a) => a.articleId === activeArticleId) ??
    articles[0];

  const relationships = useMemo(
    () => (activeArticle ? getCodexArticleRelationships(activeArticle.articleId) : []),
    [activeArticle]
  );

  const relatedArticles = useMemo(
    () => (activeArticle ? getRelatedCodexArticles(activeArticle.articleId) : []),
    [activeArticle]
  );

  const revisionHistory = useMemo(
    () => (activeArticle ? getCodexArticleRevisionHistory(activeArticle.articleId) : []),
    [activeArticle]
  );

  const orbRecommendations = useMemo(
    () => (activeArticle ? getCodexOrbRecommendations(activeArticle.articleId, 5) : []),
    [activeArticle]
  );

  if (!activeArticle) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/60">
        Initializing Studio World Codex™…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400/80">
              Studio World Codex™
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Constitutional Memory</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              The Codex is not documentation — it is Studio World remembering itself before it
              builds.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20"
          >
            Sync Codex
          </button>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-white/40">Articles</span>
            <p className="font-medium">{stats.totalArticles}</p>
          </div>
          <div>
            <span className="text-white/40">Canonical</span>
            <p className="font-medium">{stats.canonicalArticles}</p>
          </div>
          <div>
            <span className="text-white/40">Relationships</span>
            <p className="font-medium">{stats.totalRelationships}</p>
          </div>
          <div>
            <span className="text-white/40">Revisions</span>
            <p className="font-medium">{stats.totalRevisions}</p>
          </div>
        </div>
        <p className="text-xs text-white/40">{curatorLines.join(' · ')}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <CodexPanel title="Volume">
            <select
              value={activeVolume}
              onChange={(e) => setActiveVolume(e.target.value as CodexVolumeId)}
              className="w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm"
            >
              {CODEX_VOLUMES.map((volume) => (
                <option key={volume.id} value={volume.id}>
                  {volume.title.replace('Volume ', 'Vol. ')}
                </option>
              ))}
            </select>
          </CodexPanel>

          <CodexPanel title="Status">
            <div className="flex flex-wrap gap-2">
              {(['Draft', 'Approved', 'Canonical'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    statusFilter === status
                      ? 'bg-violet-500/30 text-violet-100'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </CodexPanel>

          <CodexPanel title="Search">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Semantic search…"
              className="w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm"
            />
          </CodexPanel>

          <CodexPanel title="Articles">
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {displayedArticles.map((article) => (
                <li key={article.articleId}>
                  <button
                    type="button"
                    onClick={() => setActiveArticleId(article.articleId)}
                    className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                      article.articleId === activeArticle.articleId
                        ? 'bg-violet-500/20 text-violet-100'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span className="block text-xs text-white/40">{article.articleId}</span>
                    {article.title}
                  </button>
                </li>
              ))}
            </ul>
          </CodexPanel>
        </aside>

        <main className="space-y-4">
          <CodexPanel title={activeArticle.articleId}>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{activeArticle.title}</h2>
                <p className="mt-1 text-sm text-white/50">
                  {activeArticle.status} · {activeArticle.category}
                </p>
              </div>
              <p className="text-sm text-white/80">{activeArticle.summary}</p>
              {activeArticle.philosophy && (
                <blockquote className="border-l-2 border-violet-500/50 pl-4 text-sm italic text-white/70">
                  {activeArticle.philosophy}
                </blockquote>
              )}
            </div>
          </CodexPanel>

          <div className="grid gap-4 md:grid-cols-2">
            <CodexPanel title="Guiding Principles">
              <ul className="space-y-2 text-sm text-white/80">
                {activeArticle.guidingPrinciples.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CodexPanel>
            <CodexPanel title="Architectural Decisions">
              <ul className="space-y-2 text-sm text-white/80">
                {activeArticle.architecturalDecisions.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </CodexPanel>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CodexPanel title="Related Systems">
              <ul className="space-y-1 text-sm text-white/70">
                {activeArticle.relatedSystems.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </CodexPanel>
            <CodexPanel title="Relationships">
              <ul className="space-y-2 text-sm text-white/70">
                {relationships.slice(0, 6).map((rel) => (
                  <li key={rel.id}>
                    <span className="text-violet-300">{rel.type}</span> → {rel.toArticleId}
                  </li>
                ))}
              </ul>
            </CodexPanel>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CodexPanel title="Revision History">
              <ul className="space-y-2 text-sm text-white/70">
                {revisionHistory.map((rev) => (
                  <li key={rev.revisionId}>
                    <span className="text-white/40">{rev.version}</span> — {rev.changeNote}
                  </li>
                ))}
              </ul>
            </CodexPanel>
            <CodexPanel title="Orb Curator™">
              <ul className="space-y-2 text-sm text-white/70">
                {orbRecommendations.map((rec) => (
                  <li key={`${rec.kind}-${rec.title}`}>
                    <span className="text-violet-300">{rec.kind}</span>: {rec.title}
                  </li>
                ))}
              </ul>
            </CodexPanel>
          </div>

          {relatedArticles.length > 0 && (
            <CodexPanel title="Related Articles">
              <ul className="space-y-1 text-sm text-white/70">
                {relatedArticles.map((a) => (
                  <li key={a.articleId}>
                    <button
                      type="button"
                      onClick={() => setActiveArticleId(a.articleId)}
                      className="text-violet-300 hover:underline"
                    >
                      {a.articleId} — {a.title}
                    </button>
                  </li>
                ))}
              </ul>
            </CodexPanel>
          )}
        </main>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  getInstitutePublicationGraphNeighbors,
  getInstituteOrbRecommendations,
  getInstituteWorldGraphSyncPayload,
  listChronicleEntries,
  type InstituteApprovalRecord,
  type InstitutePublicationRevision,
  type InstituteDivisionId,
  type InstitutePublicationStatus,
} from '../../../../studio-os-core/institute-of-knowledge';
import {
  useInstituteState,
  useInstituteSearch,
} from '../../../../hooks/useInstituteState';

function InstitutePanel({
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

const STATUS_OPTIONS: InstitutePublicationStatus[] = [
  'Draft',
  'Working',
  'Review',
  'Approved',
  'Canonical',
  'Deprecated',
  'Historical',
];

/**
 * The Institute of Knowledge™ — institutional knowledge governance workspace.
 * Not a documentation website — reusable institutional infrastructure.
 */
export function InstituteWorkspace() {
  const {
    publications,
    stats,
    advisorLines,
    divisions,
    pendingSubmissions,
    divisionStats,
    codexSync,
    refresh,
  } = useInstituteState();

  const [activeDivision, setActiveDivision] = useState<InstituteDivisionId>('publishing-bureau');
  const [statusFilter, setStatusFilter] = useState<InstitutePublicationStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'publications' | 'review' | 'divisions' | 'chronicle' | 'graph'
  >('publications');

  const searchHits = useInstituteSearch(searchQuery);
  const divisionPublications = useMemo(
    () => publications.filter((p) => p.divisionId === activeDivision),
    [publications, activeDivision]
  );

  const displayedPublications = searchQuery.trim()
    ? searchHits.map((h) => h.publication)
    : statusFilter
      ? divisionPublications.filter((p) => p.status === statusFilter)
      : divisionPublications;

  const [activePublicationId, setActivePublicationId] = useState<string>(
    displayedPublications[0]?.publicationId ?? publications[0]?.publicationId ?? ''
  );

  const activePublication =
    displayedPublications.find((p) => p.publicationId === activePublicationId) ??
    publications.find((p) => p.publicationId === activePublicationId) ??
    publications[0];

  const graphNeighbors = useMemo(
    () =>
      activePublication
        ? getInstitutePublicationGraphNeighbors(activePublication.publicationId)
        : [],
    [activePublication]
  );

  const orbRecommendations = useMemo(
    () =>
      activePublication
        ? getInstituteOrbRecommendations(undefined, activePublication.publicationId, 5)
        : getInstituteOrbRecommendations(undefined, undefined, 5),
    [activePublication]
  );

  const graphPayload = useMemo(() => getInstituteWorldGraphSyncPayload(), [publications.length]);
  const chronicle = useMemo(() => listChronicleEntries(), [publications.length]);

  if (!activePublication) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/60">
        Initializing The Institute of Knowledge™…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400/80">
              The Institute of Knowledge™
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Knowledge Governance</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Permanent institution governing every canonical publication, profession research
              artifact, constitutional article, and historical record — not a documentation website.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20"
          >
            Sync Institute
          </button>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-white/40">Publications</span>
            <p className="font-medium">{stats.totalPublications}</p>
          </div>
          <div>
            <span className="text-white/40">Canonical</span>
            <p className="font-medium">{stats.canonicalPublications}</p>
          </div>
          <div>
            <span className="text-white/40">Review queue</span>
            <p className="font-medium">{stats.pendingSubmissions}</p>
          </div>
          <div>
            <span className="text-white/40">Graph edges</span>
            <p className="font-medium">{stats.totalRelationships}</p>
          </div>
          <div>
            <span className="text-white/40">Codex governed</span>
            <p className="font-medium">{codexSync.codexArticleCount}</p>
          </div>
        </div>

        <p className="text-xs text-white/40">{advisorLines.join(' · ')}</p>

        <nav className="flex flex-wrap gap-2">
          {(
            [
              ['publications', 'Publications'],
              ['review', 'Review Pipeline'],
              ['divisions', 'Divisions'],
              ['chronicle', 'World Chronicle'],
              ['graph', 'Knowledge Graph'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`rounded-lg px-3 py-1.5 text-xs uppercase tracking-wider ${
                activeTab === id
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'publications' && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <InstitutePanel title="Division">
              <select
                value={activeDivision}
                onChange={(e) => setActiveDivision(e.target.value as InstituteDivisionId)}
                className="w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </InstitutePanel>

            <InstitutePanel title="Status">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStatusFilter(null)}
                  className={`rounded px-2 py-1 text-xs ${!statusFilter ? 'bg-emerald-500/20' : 'bg-white/5'}`}
                >
                  All
                </button>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`rounded px-2 py-1 text-xs ${statusFilter === s ? 'bg-emerald-500/20' : 'bg-white/5'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </InstitutePanel>

            <InstitutePanel title="Search">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search publications…"
                className="w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm"
              />
            </InstitutePanel>

            <InstitutePanel title="Publications">
              <ul className="max-h-80 space-y-1 overflow-y-auto">
                {displayedPublications.map((pub) => (
                  <li key={pub.publicationId}>
                    <button
                      type="button"
                      onClick={() => setActivePublicationId(pub.publicationId)}
                      className={`w-full rounded px-2 py-1.5 text-left text-sm ${
                        pub.publicationId === activePublication.publicationId
                          ? 'bg-emerald-500/15 text-emerald-100'
                          : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <span className="block font-medium">{pub.title}</span>
                      <span className="text-xs text-white/40">
                        {pub.type} · Ed.{pub.edition} · {pub.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </InstitutePanel>
          </aside>

          <main className="space-y-4">
            <InstitutePanel title={activePublication.title}>
              <div className="space-y-3 text-sm">
                <p className="text-white/70">{activePublication.summary}</p>
                <div className="flex flex-wrap gap-4 text-xs text-white/40">
                  <span>Edition {activePublication.edition}</span>
                  <span>Revision {activePublication.revision}</span>
                  <span>{activePublication.status}</span>
                  <span>{activePublication.type}</span>
                </div>
                {activePublication.codexArticleIds.length > 0 && (
                  <p className="text-xs text-emerald-300/80">
                    Codex: {activePublication.codexArticleIds.join(', ')}
                  </p>
                )}
                {activePublication.contributors.length > 0 && (
                  <p className="text-xs text-white/40">
                    Contributors: {activePublication.contributors.join(' · ')}
                  </p>
                )}
              </div>
            </InstitutePanel>

            <div className="grid gap-4 md:grid-cols-2">
              <InstitutePanel title="Approval history">
                {activePublication.approvalHistory.length ? (
                  <ul className="space-y-2 text-sm text-white/70">
                    {activePublication.approvalHistory.map((r: InstituteApprovalRecord) => (
                      <li key={r.recordId}>
                        {r.decision} → {r.statusAfter} by {r.reviewer}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white/40">No approvals recorded yet.</p>
                )}
              </InstitutePanel>

              <InstitutePanel title="Revision history">
                <ul className="max-h-40 space-y-2 overflow-y-auto text-sm text-white/70">
                  {activePublication.revisionHistory.map((r: InstitutePublicationRevision) => (
                    <li key={r.revisionId}>
                      Rev {r.revision} — {r.changeNote || r.summary}
                    </li>
                  ))}
                </ul>
              </InstitutePanel>
            </div>

            <InstitutePanel title="Knowledge graph neighbors">
              {graphNeighbors.length ? (
                <ul className="space-y-2 text-sm">
                  {graphNeighbors.map((n) => (
                    <li key={n.publicationId}>
                      <button
                        type="button"
                        onClick={() => setActivePublicationId(n.publicationId)}
                        className="text-emerald-300/90 hover:underline"
                      >
                        {n.title}
                      </button>
                      <span className="ml-2 text-white/40">({n.status})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/40">No graph relationships yet.</p>
              )}
            </InstitutePanel>

            <InstitutePanel title="Orb citations">
              <ul className="space-y-2 text-sm text-white/70">
                {orbRecommendations.map((rec, i) => (
                  <li key={`${rec.title}-${i}`}>
                    <span className="text-emerald-300/80">{rec.kind}</span> — {rec.title}:{' '}
                    {rec.detail}
                  </li>
                ))}
              </ul>
            </InstitutePanel>
          </main>
        </div>
      )}

      {activeTab === 'review' && (
        <div className="grid gap-4 md:grid-cols-2">
          <InstitutePanel title="Knowledge Review Pipeline">
            <p className="mb-3 text-sm text-white/60">
              Profession Brains™, Research Engine™, and Mentor AI™ submit proposed knowledge. The
              Institute reviews before canon promotion.
            </p>
            {pendingSubmissions.length ? (
              <ul className="space-y-3">
                {pendingSubmissions.map((sub) => (
                  <li
                    key={sub.submissionId}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
                  >
                    <p className="font-medium">{sub.proposedTitle}</p>
                    <p className="text-white/50">{sub.proposedSummary}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {sub.source} · {sub.status} · {sub.targetDivisionId}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/40">Review queue clear.</p>
            )}
          </InstitutePanel>

          <InstitutePanel title="Promotion candidates">
            <ul className="space-y-2 text-sm text-white/70">
              {publications
                .filter((p) => p.status === 'Review' || p.status === 'Approved')
                .slice(0, 12)
                .map((p) => (
                  <li key={p.publicationId}>
                    {p.title} — {p.status}
                  </li>
                ))}
            </ul>
          </InstitutePanel>
        </div>
      )}

      {activeTab === 'divisions' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {divisions.map((division) => (
            <InstitutePanel key={division.id} title={division.title}>
              <p className="mb-2 text-sm text-white/60">{division.purpose}</p>
              <p className="text-xs text-white/40">
                Module: /{division.modulePath} ·{' '}
                {publications.filter((p) => p.divisionId === division.id).length} publications
              </p>
              <ul className="mt-2 space-y-1 text-xs text-white/50">
                {division.responsibilities.slice(0, 3).map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </InstitutePanel>
          ))}
        </div>
      )}

      {activeTab === 'chronicle' && (
        <InstitutePanel title="World Chronicle™">
          <ul className="space-y-4">
            {chronicle.map((entry) => (
              <li key={entry.entryId} className="border-b border-white/10 pb-3">
                <p className="font-medium">{entry.title}</p>
                <p className="text-sm text-white/60">{entry.summary}</p>
                <p className="mt-1 text-xs text-white/40">
                  {new Date(entry.eventAt).toLocaleDateString()} · {entry.tags.join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </InstitutePanel>
      )}

      {activeTab === 'graph' && (
        <div className="grid gap-4 md:grid-cols-2">
          <InstitutePanel title="World Graph sync">
            <ul className="space-y-2 text-sm text-white/70">
              <li>Publications: {graphPayload.publicationCount}</li>
              <li>Relationships: {graphPayload.relationshipCount}</li>
              <li>Submissions: {graphPayload.submissionCount}</li>
              <li>Chronicle entries: {graphPayload.chronicleCount}</li>
              <li>Divisions: {graphPayload.divisionNodes.length}</li>
            </ul>
          </InstitutePanel>
          <InstitutePanel title="Division bureau stats">
            <ul className="space-y-2 text-sm text-white/70">
              <li>Research queue: {divisionStats.research.total}</li>
              <li>Constitutional: {divisionStats.constitution.total}</li>
              <li>Historical: {divisionStats.archives.historicalPublications}</li>
              <li>Standards: {divisionStats.standards.total}</li>
            </ul>
          </InstitutePanel>
        </div>
      )}
    </div>
  );
}

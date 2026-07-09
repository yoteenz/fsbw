import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  APL_PROMPT_CATEGORY_LABELS,
  APL_ROOM_PATH_LABELS,
  type AplExecutionRecord,
  type AplGraphEdge,
  type AplGraphNode,
  type AplModelPerformanceRecord,
  type AplPromptCollection,
  type AplPromptTemplate,
  type AplPromptVersion,
  type AplQualityScore,
  type AplReadyView,
  type AplRecommendation,
  type AplRoomPath,
  type AplValidationResult,
  type AplVersionComparison,
} from '../../../../studio-os-core/genesis';
import { useArchitectsPromptLibraryState } from '../../../../hooks/useArchitectsPromptLibraryState';
import { useStudioOrb } from '../studio-orb/StudioOrbProvider';
import { HQ, hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/prompt-library';

const WING_NAV: { slug: AplRoomPath; label: string; ring: 'catalog' | 'intelligence' | 'governance' }[] = [
  { slug: 'prompt-library', label: 'Library Arrival', ring: 'catalog' },
  { slug: 'prompt-registry', label: 'Prompt Registry™', ring: 'catalog' },
  { slug: 'prompt-collections', label: 'Collections™', ring: 'catalog' },
  { slug: 'prompt-search', label: 'Search™', ring: 'catalog' },
  { slug: 'prompt-history', label: 'Versioning & Lineage™', ring: 'intelligence' },
  { slug: 'prompt-relationships', label: 'Relationships & Dependencies™', ring: 'intelligence' },
  { slug: 'prompt-models', label: 'Model Intelligence™', ring: 'intelligence' },
  { slug: 'prompt-executions', label: 'Execution History™', ring: 'intelligence' },
  { slug: 'prompt-quality', label: 'Quality™', ring: 'governance' },
  { slug: 'prompt-validation', label: 'Validation & Canonization™', ring: 'governance' },
  { slug: 'prompt-analytics', label: 'Analytics™', ring: 'governance' },
  { slug: 'prompt-recommendations', label: 'Recommendations™', ring: 'governance' },
  { slug: 'prompt-archives', label: 'Archives™', ring: 'governance' },
];

/**
 * The Architect's Prompt Library™ — Institute of Knowledge™ wing.
 * Institutional prompt memory · Orb Librarian Mode™ · glass architectural library aesthetic.
 */
export function ArchitectsPromptLibraryWorkspace() {
  const navigate = useNavigate();
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const {
    view,
    searchQuery,
    setSearchQuery,
    selectedPromptId,
    setSelectedPromptId,
    toggleLibrarianMode,
    canonizeSelected,
    refresh,
  } = useArchitectsPromptLibraryState();

  const activeSlug = (roomSlug ?? 'prompt-library') as AplRoomPath;
  const selected = view.prompts.find((p) => p.promptId === selectedPromptId);

  return (
    <div
      className="relative min-h-[calc(100vh-120px)] overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, #f8f6f3 0%, #efeae4 30%, #f5f2ee 65%, #faf8f5 100%)',
      }}
    >
      <HqExperienceStyles />
      <LibraryStyles />
      <div className="apl-marble" aria-hidden />

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3" style={hqGlassPanel}>
        <div>
          <p style={{ ...hqLabel, color: HQ.red, margin: 0 }}>THE ARCHITECT&apos;S PROMPT LIBRARY™</p>
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', margin: '4px 0 0', color: HQ.black }}>
            {APL_ROOM_PATH_LABELS[activeSlug]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="apl-btn" onClick={() => navigate('/admin/studio/executive-reflection')}>
            Institute of Knowledge →
          </button>
          <button type="button" className="apl-btn" onClick={toggleLibrarianMode}>
            Orb Librarian {view.orbLibrarianMode ? 'ON' : 'OFF'}
          </button>
          <button type="button" className="apl-btn primary" onClick={refresh}>
            Refresh Library
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px]">
        <nav className="hidden w-56 shrink-0 overflow-y-auto border-r border-black/5 bg-white/30 p-3 lg:block" aria-label="Prompt Library wing">
          {(['catalog', 'intelligence', 'governance'] as const).map((ring) => (
            <div key={ring} className="mb-4">
              <p style={{ ...hqLabel, marginBottom: 6 }}>{ring}</p>
              {WING_NAV.filter((r) => r.ring === ring).map((room) => (
                <Link
                  key={room.slug}
                  to={`${BASE}/${room.slug}`}
                  className="mb-1 block rounded-lg px-3 py-2 text-[10px] uppercase tracking-wider transition hover:bg-white/70"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: activeSlug === room.slug ? HQ.black : HQ.gray,
                    background: activeSlug === room.slug ? 'rgba(255,255,255,0.85)' : 'transparent',
                    borderLeft: activeSlug === room.slug ? `2px solid ${HQ.red}` : '2px solid transparent',
                  }}
                >
                  {room.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <main className="flex flex-1 flex-col gap-4 p-4">
          <OrbLibrarianHeader brief={view.orbCuratorBrief} librarianMode={view.orbLibrarianMode} />

          {activeSlug === 'prompt-library' && <ArrivalPanel view={view} onSelect={setSelectedPromptId} />}
          {activeSlug === 'prompt-registry' && (
            <RegistryPanel prompts={view.prompts} selectedId={selectedPromptId} onSelect={setSelectedPromptId} />
          )}
          {activeSlug === 'prompt-collections' && <CollectionsPanel collections={view.collections} prompts={view.prompts} />}
          {activeSlug === 'prompt-search' && (
            <SearchPanel
              query={searchQuery}
              onQueryChange={setSearchQuery}
              results={view.searchResults}
              selectedId={selectedPromptId}
              onSelect={setSelectedPromptId}
            />
          )}
          {activeSlug === 'prompt-history' && (
            <HistoryPanel
              versions={view.versions}
              comparisons={view.comparisons}
              lineage={view.lineageForSelected}
              selected={selected}
            />
          )}
          {activeSlug === 'prompt-relationships' && (
            <RelationshipsPanel
              nodes={view.graphNodes}
              edges={view.graphEdges}
              selected={selected}
              dependencies={view.dependencies}
              relationships={view.relationships}
            />
          )}
          {activeSlug === 'prompt-models' && <ModelsPanel records={view.modelPerformance} />}
          {activeSlug === 'prompt-executions' && (
            <ExecutionsPanel timeline={view.executionTimeline} executions={view.executions} selected={selected} />
          )}
          {activeSlug === 'prompt-quality' && <QualityPanel scores={view.qualityScores} lessons={view.lessons} />}
          {activeSlug === 'prompt-validation' && (
            <ValidationPanel validations={view.validations} selected={selected} onCanonize={canonizeSelected} />
          )}
          {activeSlug === 'prompt-analytics' && <AnalyticsPanel view={view} />}
          {activeSlug === 'prompt-recommendations' && <RecommendationsPanel recommendations={view.recommendations} />}
          {activeSlug === 'prompt-archives' && <ArchivesPanel archivedIds={view.analytics.archivedCount} prompts={view.prompts} />}

          {selected && activeSlug !== 'prompt-library' && (
            <PromptDetailPanel prompt={selected} onNavigateRegistry={() => navigate(`${BASE}/prompt-registry`)} />
          )}

          <StatsRibbon stats={view.stats} />
        </main>
      </div>
    </div>
  );
}

function LibraryStyles() {
  return (
    <style>{`
      .apl-marble { position:absolute; inset:0; pointer-events:none; opacity:0.28;
        background-image:url('/assets/marble-half.png'); background-size:480px; }
      @keyframes apl-orb { 0%,100%{box-shadow:0 0 48px rgba(235,28,36,0.12)} 50%{box-shadow:0 0 72px rgba(99,102,241,0.15)} }
      .apl-orb { animation:apl-orb 6s ease-in-out infinite; }
      .apl-holo { background:linear-gradient(105deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78));
        border:1px solid rgba(255,255,255,0.85); box-shadow:0 12px 40px rgba(0,0,0,0.06); border-radius:16px; }
      .apl-btn { font-family:"Futura PT Medium"; font-size:10px; letter-spacing:0.08em; text-transform:uppercase;
        padding:8px 14px; border-radius:6px; border:1px solid rgba(0,0,0,0.1); background:rgba(255,255,255,0.7); cursor:pointer; }
      .apl-btn.primary { border-color:rgba(235,28,36,0.3); background:rgba(235,28,36,0.08); color:#EB1C24; }
      .apl-graph-node { display:inline-block; padding:6px 10px; margin:4px; border-radius:8px; font-size:9px;
        font-family:"Futura PT Medium"; background:rgba(255,255,255,0.85); border:1px solid rgba(0,0,0,0.08); }
      .apl-graph-node.canonical { border-color:rgba(235,28,36,0.35); }
    `}</style>
  );
}

function OrbLibrarianHeader({ brief, librarianMode }: { brief: string; librarianMode: boolean }) {
  const { toggleRadial } = useStudioOrb();

  return (
    <section className="apl-holo p-6 text-center">
      <button
        type="button"
        className="apl-orb mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-0 cursor-pointer"
        style={{ background: 'radial-gradient(circle,#fff,rgba(99,102,241,0.12))' }}
        onClick={toggleRadial}
        aria-label="Open Studio Orb menu"
      >
        <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', letterSpacing: '0.2em', color: HQ.accent }}>ORB</span>
      </button>
      <p style={hqLabel}>Orb Librarian Mode™ {librarianMode ? '· Active' : '· Standby'}</p>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: HQ.gray, maxWidth: 640, margin: '12px auto 0', lineHeight: 1.6 }}>{brief}</p>
    </section>
  );
}

function ArrivalPanel({ view, onSelect }: { view: AplReadyView; onSelect: (id: string) => void }) {
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Institute of Knowledge™ · Architectural Library</p>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '13px', color: HQ.black, marginTop: 8, lineHeight: 1.7 }}>
        The Architect&apos;s Prompt Library™ is Studio OS&apos;s permanent institutional memory for every prompt that designed, built, validated, and evolved the platform.
        Every prompt is versioned, searchable, connected to Genesis, and traceable through execution history.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active Prompts" value={String(view.stats.promptCount)} />
        <MetricCard label="Canonical" value={String(view.stats.canonicalCount)} />
        <MetricCard label="Executions" value={String(view.stats.executionCount)} />
        <MetricCard label="Avg Quality" value={`${view.stats.avgQualityScore}%`} />
      </div>
      <div className="mt-6">
        <p style={{ ...hqLabel, marginBottom: 8 }}>Featured Canonical Prompts</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {view.prompts.filter((p) => p.canonical).slice(0, 4).map((p) => (
            <button key={p.promptId} type="button" className="apl-btn text-left" onClick={() => onSelect(p.promptId)}>
              {p.officialName} · v{p.currentVersion}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function RegistryPanel({
  prompts,
  selectedId,
  onSelect,
}: {
  prompts: AplPromptTemplate[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Prompt Registry™</p>
      <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">
        {prompts.map((p) => (
          <button
            key={p.promptId}
            type="button"
            onClick={() => onSelect(p.promptId)}
            className="block w-full rounded-lg px-4 py-3 text-left transition hover:bg-white/80"
            style={{
              background: selectedId === p.promptId ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
              borderLeft: selectedId === p.promptId ? `3px solid ${HQ.red}` : '3px solid transparent',
            }}
          >
            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px', color: HQ.black }}>{p.officialName}</p>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: HQ.gray, marginTop: 4 }}>{p.purpose}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Tag label={APL_PROMPT_CATEGORY_LABELS[p.category]} />
              <Tag label={p.lifecycleStage} />
              {p.canonical && <Tag label="CANON" accent />}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function CollectionsPanel({ collections, prompts }: { collections: AplPromptCollection[]; prompts: AplPromptTemplate[] }) {
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Prompt Collections™</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {collections.map((c) => (
          <div key={c.collectionId} className="rounded-xl bg-white/60 p-4">
            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px', color: HQ.black }}>{c.officialName}</p>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: HQ.gray, marginTop: 6 }}>{c.purpose}</p>
            <p style={{ ...hqLabel, marginTop: 10 }}>Health {c.healthScore}% · {c.promptIds.length} prompts</p>
            <ul className="mt-2 space-y-1">
              {c.promptIds.map((id) => {
                const p = prompts.find((x) => x.promptId === id);
                return p ? <li key={id} style={{ fontSize: '10px', color: HQ.gray }}>{p.officialName}</li> : null;
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function SearchPanel({
  query,
  onQueryChange,
  results,
  selectedId,
  onSelect,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  results: AplPromptTemplate[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Prompt Search™</p>
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search prompts, tags, Genesis refs, deliverables…"
        className="mt-4 w-full rounded-lg border border-black/10 bg-white/80 px-4 py-3 text-sm"
        style={{ fontFamily: '"Futura PT Book"' }}
      />
      <p style={{ ...hqLabel, marginTop: 12 }}>{results.length} results</p>
      <div className="mt-2 max-h-[360px] space-y-2 overflow-y-auto">
        {results.map((p) => (
          <button key={p.promptId} type="button" className="apl-btn block w-full text-left" onClick={() => onSelect(p.promptId)}
            style={{ background: selectedId === p.promptId ? 'rgba(235,28,36,0.08)' : undefined }}>
            {p.officialName}
          </button>
        ))}
      </div>
    </section>
  );
}

function HistoryPanel({
  versions,
  comparisons,
  lineage,
  selected,
}: {
  versions: AplPromptVersion[];
  comparisons: AplVersionComparison[];
  lineage: AplPromptVersion[];
  selected?: AplPromptTemplate;
}) {
  const display = selected ? lineage : versions.slice(0, 8);
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Prompt Versioning & Lineage™ {selected ? `· ${selected.officialName}` : ''}</p>
      <div className="mt-4 space-y-3">
        {display.map((v) => (
          <div key={v.versionId} className="rounded-lg bg-white/60 p-4">
            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px' }}>v{v.semver} · {v.status}</p>
            <p style={{ fontSize: '10px', color: HQ.gray, marginTop: 4 }}>{v.rationale}</p>
            {v.supersedes && <p style={{ fontSize: '9px', color: HQ.accent, marginTop: 4 }}>Supersedes v{v.supersedes}</p>}
          </div>
        ))}
      </div>
      {comparisons.length > 0 && (
        <div className="mt-6">
          <p style={hqLabel}>Version Comparisons</p>
          {comparisons.map((c) => (
            <div key={c.comparisonId} className="mt-2 rounded-lg bg-white/60 p-3">
              <p style={{ fontSize: '10px' }}>{c.versionA} → {c.versionB}: {c.summary} (+{c.qualityDelta} quality)</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RelationshipsPanel({
  nodes,
  edges,
  selected,
  dependencies,
  relationships,
}: {
  nodes: AplGraphNode[];
  edges: AplGraphEdge[];
  selected?: AplPromptTemplate;
  dependencies: AplReadyView['dependencies'];
  relationships: AplReadyView['relationships'];
}) {
  const filteredNodes = selected
    ? nodes.filter((n) => n.nodeId === selected.promptId || edges.some((e) => (e.fromId === selected.promptId && e.toId === n.nodeId) || (e.toId === selected.promptId && e.fromId === n.nodeId)))
    : nodes.slice(0, 16);
  const filteredDeps = selected ? dependencies.filter((d) => d.promptId === selected.promptId) : dependencies;
  const filteredRels = selected ? relationships.filter((r) => r.fromPromptId === selected.promptId) : relationships.slice(0, 8);

  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Knowledge Graph · Relationships & Dependencies™</p>
      <div className="mt-4 flex flex-wrap">
        {filteredNodes.map((n) => (
          <span key={n.nodeId} className={`apl-graph-node${n.canonical ? ' canonical' : ''}`}>
            {n.label}
          </span>
        ))}
      </div>
      <p style={{ ...hqLabel, marginTop: 16 }}>{edges.length} graph edges · {filteredDeps.length} dependencies</p>
      <ul className="mt-2 space-y-1">
        {filteredRels.map((r) => (
          <li key={r.relationshipId} style={{ fontSize: '10px', color: HQ.gray }}>
            {r.relationshipType} → {r.toLabel}
          </li>
        ))}
      </ul>
      <ul className="mt-2 space-y-1">
        {filteredDeps.map((d) => (
          <li key={d.dependencyId} style={{ fontSize: '10px', color: d.satisfied ? HQ.gray : HQ.red }}>
            {d.required ? '●' : '○'} {d.label} {d.satisfied ? '✓' : '— unsatisfied'}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ModelsPanel({ records }: { records: AplModelPerformanceRecord[] }) {
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Prompt Model Intelligence™</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((r) => (
          <div key={r.recordId} className="rounded-xl bg-white/60 p-4">
            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px' }}>{r.model}</p>
            <p style={{ fontSize: '10px', color: HQ.gray, marginTop: 4 }}>{APL_PROMPT_CATEGORY_LABELS[r.category]}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MetricCard label="Success" value={`${r.successRate}%`} compact />
              <MetricCard label="Quality" value={`${r.avgQualityScore}%`} compact />
            </div>
            <p style={{ fontSize: '9px', color: HQ.gray, marginTop: 8 }}>{r.strengths.join(' · ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExecutionsPanel({
  timeline,
  executions,
  selected,
}: {
  timeline: AplExecutionRecord[];
  executions: AplExecutionRecord[];
  selected?: AplPromptTemplate;
}) {
  const items = selected ? timeline : executions;
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Execution Timeline™ {selected ? `· ${selected.officialName}` : ''}</p>
      <div className="mt-4 space-y-3">
        {items.map((e) => (
          <div key={e.executionId} className="relative rounded-lg border-l-2 border-indigo-300 bg-white/60 py-3 pl-4 pr-3">
            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px' }}>{new Date(e.startedAt).toLocaleDateString()} · {e.model}</p>
            <p style={{ fontSize: '10px', color: HQ.gray, marginTop: 4 }}>{e.outputSummary}</p>
            <p style={{ fontSize: '9px', color: HQ.accent, marginTop: 4 }}>Quality {e.qualityScore}% · {e.generatedArtifacts.length} artifacts</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function QualityPanel({ scores, lessons }: { scores: AplQualityScore[]; lessons: AplReadyView['lessons'] }) {
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Prompt Quality™</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {scores.map((s) => (
          <MetricCard key={s.dimension} label={s.dimension.replace(/-/g, ' ')} value={`${s.score}%`} />
        ))}
      </div>
      <div className="mt-6">
        <p style={hqLabel}>Lessons Learned</p>
        {lessons.map((l) => (
          <div key={l.lessonId} className="mt-2 rounded-lg bg-white/60 p-3">
            <p style={{ fontSize: '10px', fontWeight: 600 }}>{l.title}</p>
            <p style={{ fontSize: '10px', color: HQ.gray, marginTop: 4 }}>{l.insight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ValidationPanel({
  validations,
  selected,
  onCanonize,
}: {
  validations: AplValidationResult[];
  selected?: AplPromptTemplate;
  onCanonize: () => boolean;
}) {
  const filtered = selected ? validations.filter((v) => v.promptId === selected.promptId) : validations;
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Validation & Canonization™</p>
      {selected && !selected.canonical && (
        <button type="button" className="apl-btn primary mt-3" onClick={() => onCanonize()}>
          Promote to Canon (requires validation)
        </button>
      )}
      <div className="mt-4 space-y-3">
        {filtered.map((v) => (
          <div key={v.validationId} className="rounded-lg bg-white/60 p-4">
            <p style={{ fontSize: '10px' }}>
              {v.deliverablesComplete ? '✓' : '○'} Deliverables · {v.buildPassed ? '✓' : '○'} Build ·{' '}
              {v.founderApproved ? '✓' : '○'} Founder · {v.genesisUpdated ? '✓' : '○'} Genesis
            </p>
            <p style={{ fontSize: '10px', color: HQ.gray, marginTop: 4 }}>{v.notes}</p>
            {v.canonizationEligible && <p style={{ fontSize: '9px', color: HQ.red, marginTop: 4 }}>Canonization eligible</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function AnalyticsPanel({ view }: { view: AplReadyView }) {
  const a = view.analytics;
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Prompt Analytics™</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Draft" value={String(a.draftCount)} />
        <MetricCard label="Stale" value={String(a.stalePromptCount)} />
        <MetricCard label="Conflicts" value={String(a.conflictCount)} />
        <MetricCard label="Coverage Gaps" value={String(a.gapCount)} />
      </div>
      <div className="mt-6">
        <p style={hqLabel}>Category Coverage</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(a.categoryCoverage).map(([cat, count]) => (
            <Tag key={cat} label={`${cat}: ${count}`} />
          ))}
        </div>
      </div>
      <div className="mt-6">
        <p style={hqLabel}>Model Usage</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(a.modelUsage).map(([model, count]) => (
            <Tag key={model} label={`${model}: ${count}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RecommendationsPanel({ recommendations }: { recommendations: AplRecommendation[] }) {
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Orb Recommendations™</p>
      <div className="mt-4 space-y-3">
        {recommendations.map((r) => (
          <div key={r.recommendationId} className="rounded-lg bg-white/60 p-4">
            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px' }}>{r.title}</p>
            <p style={{ fontSize: '10px', color: HQ.gray, marginTop: 4 }}>{r.reason}</p>
            <p style={{ fontSize: '9px', color: HQ.accent, marginTop: 6, fontStyle: 'italic' }}>{r.orbCuratorNote}</p>
            <p style={{ ...hqLabel, marginTop: 6 }}>Confidence {r.confidence}% · {r.kind}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArchivesPanel({ archivedIds, prompts }: { archivedIds: number; prompts: AplPromptTemplate[] }) {
  const archived = prompts.filter((p) => p.lifecycleStage === 'archived');
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Prompt Archives™ · {archivedIds} archived</p>
      {archived.length === 0 ? (
        <p style={{ fontSize: '11px', color: HQ.gray, marginTop: 12 }}>No prompts archived yet. Retirement requires documented reason.</p>
      ) : (
        archived.map((p) => (
          <div key={p.promptId} className="mt-3 rounded-lg bg-white/50 p-3 opacity-75">
            <p style={{ fontSize: '10px' }}>{p.officialName}</p>
            <p style={{ fontSize: '9px', color: HQ.gray }}>{p.retirementReason}</p>
          </div>
        ))
      )}
    </section>
  );
}

function PromptDetailPanel({ prompt, onNavigateRegistry }: { prompt: AplPromptTemplate; onNavigateRegistry: () => void }) {
  return (
    <section className="apl-holo p-6">
      <p style={hqLabel}>Selected Prompt Manuscript</p>
      <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '16px', color: HQ.black, marginTop: 8 }}>{prompt.officialName}</p>
      <p style={{ fontSize: '11px', color: HQ.gray, marginTop: 8, lineHeight: 1.6 }}>{prompt.body.slice(0, 400)}{prompt.body.length > 400 ? '…' : ''}</p>
      <button type="button" className="apl-btn primary mt-4" onClick={onNavigateRegistry}>Open in Registry →</button>
    </section>
  );
}

function StatsRibbon({ stats }: { stats: AplReadyView['stats'] }) {
  return (
    <footer className="apl-holo flex flex-wrap gap-4 px-6 py-3">
      <Stat label="Prompts" value={stats.promptCount} />
      <Stat label="Canonical" value={stats.canonicalCount} />
      <Stat label="Collections" value={stats.collectionCount} />
      <Stat label="Executions" value={stats.executionCount} />
      <Stat label="Relationships" value={stats.relationshipCount} />
      <Stat label="Validation Pass" value={`${stats.validationPassRate}%`} />
    </footer>
  );
}

function MetricCard({ label, value, compact }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className="rounded-xl bg-white/60 p-3" style={{ padding: compact ? 8 : 12 }}>
      <p style={{ ...hqLabel, fontSize: compact ? 8 : undefined }}>{label}</p>
      <p style={{ fontFamily: '"Futura PT Demi"', fontSize: compact ? '14px' : '18px', color: HQ.black, marginTop: 4 }}>{value}</p>
    </div>
  );
}

function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[8px] uppercase tracking-wider"
      style={{
        fontFamily: '"Futura PT Medium"',
        color: accent ? HQ.red : HQ.gray,
        border: `1px solid ${accent ? 'rgba(235,28,36,0.3)' : 'rgba(0,0,0,0.1)'}`,
      }}
    >
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p style={{ ...hqLabel, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '14px', color: HQ.black }}>{value}</p>
    </div>
  );
}

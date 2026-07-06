import { useDesignGenomeState } from '../../../../hooks/useDesignGenomeState';
import {
  ExecutiveCollapsibleSection,
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutiveIconNav,
  ExecutivePageShell,
  ExecutiveVisualSummary,
} from '../executive-ia';
import type { ExecutiveIconNavItem } from '../executive-ia/ExecutiveIconNav';
import {
  ConnectedSystemsStrip,
  DesignMemorySearchPanel,
  FounderPromotionDemo,
  GenomeEntryCard,
  GenomeEntryDetail,
  PhilosophyBlock,
  PreBuildReviewPanel,
  PromotionLevelsReference,
  PromotionQueuePanel,
} from './DesignGenomePanels';
import type { DesignGenomeNavId } from '../../../../studio-os-core/design-genome/types';

const NAV_ITEMS: ExecutiveIconNavItem[] = [
  { id: 'genome-library', icon: '🧬', title: 'GENOME LIBRARY', subtitle: 'Approved visual DNA', status: 'active' },
  { id: 'promotions', icon: '✦', title: 'PROMOTIONS', subtitle: 'Founder approvals queue', status: 'attention' },
  { id: 'inheritance', icon: '🔗', title: 'INHERITANCE', subtitle: 'Pattern lineage', status: 'idle' },
  { id: 'design-memory', icon: '🔍', title: 'DESIGN MEMORY', subtitle: 'Consult before building', status: 'idle' },
  { id: 'pre-build-review', icon: '◈', title: 'PRE-BUILD', subtitle: 'Inherit · evolve · create', status: 'idle' },
];

export function DesignGenomeWorkspace() {
  const {
    store,
    selectedEntry,
    currentVersion,
    selectedReview,
    memoryMatches,
    selectEntry,
    setNav,
    setQuery,
    capturePromotion,
    promoteFromPhrase,
    runPreBuild,
  } = useDesignGenomeState();

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    status:
      item.id === store.activeNavId
        ? ('active' as const)
        : item.id === 'promotions' && store.dashboard.pendingPromotions > 0
          ? ('attention' as const)
          : ('idle' as const),
    onSelect: () => setNav(item.id as DesignGenomeNavId),
  }));

  return (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="DESIGN GENOME V1.0"
        title={store.genomeLabel}
        subtitle={store.dashboard.summary}
        stats={[
          { label: 'APPROVED PATTERNS', value: String(store.dashboard.approvedPatterns) },
          { label: 'CURRENT VERSIONS', value: String(store.dashboard.currentVersions) },
          { label: 'LINEAGE LINKS', value: String(store.dashboard.lineageLinks) },
          { label: 'PENDING', value: String(store.dashboard.pendingPromotions) },
        ]}
      />

      <div className="mt-4">
        <ExecutiveIconNav items={navItems} activeId={store.activeNavId} label="VISUAL MEMORY" />
      </div>

      {store.activeNavId === 'genome-library' ? (
        <>
          <ExecutiveVisualSummary title="ORGANIZATION GENOME · INDEPENDENT VISUAL MEMORY">
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 10 }}>
              Learn design thinking — not layouts · {store.organizationName} only · never leaks between orgs
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {store.entries.map((entry) => (
                <GenomeEntryCard
                  key={entry.id}
                  entry={entry}
                  selected={entry.id === store.selectedEntryId}
                  onSelect={() => selectEntry(entry.id)}
                />
              ))}
            </div>
          </ExecutiveVisualSummary>

          {selectedEntry && currentVersion ? (
            <div className="mt-4">
              <ExecutiveFocusPanel
                title="APPROVED DESIGN INTELLIGENCE"
                subtitle={selectedEntry.title}
                highlight={currentVersion.analysis.layoutPhilosophy}
              >
                <GenomeEntryDetail entry={selectedEntry} current={currentVersion} />
              </ExecutiveFocusPanel>
            </div>
          ) : null}
        </>
      ) : null}

      {store.activeNavId === 'promotions' ? (
        <>
          <ExecutiveVisualSummary title="FOUNDER PROMOTION SYSTEM">
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 10 }}>
              Approve naturally — Studio OS captures structure · reasoning · relationships automatically
            </p>
            <FounderPromotionDemo onPromote={promoteFromPhrase} />
          </ExecutiveVisualSummary>
          <div className="mt-4">
            <ExecutiveFocusPanel title="PENDING CAPTURES" subtitle="Automatic promotion queue">
              <PromotionQueuePanel promotions={store.pendingPromotions} onCapture={capturePromotion} />
            </ExecutiveFocusPanel>
          </div>
        </>
      ) : null}

      {store.activeNavId === 'inheritance' ? (
        <ExecutiveVisualSummary title="DESIGN LINEAGE">
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 10 }}>
            How approved patterns evolve and reference each other
          </p>
          {store.entries.map((entry) => (
            <p key={entry.id} style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 6 }}>
              <strong>{entry.title}</strong>
              {entry.references.length > 0 ? ` ← references ${entry.references.join(', ')}` : ''}
              {entry.referencedBy.length > 0 ? ` → referenced by ${entry.referencedBy.join(', ')}` : ''}
            </p>
          ))}
        </ExecutiveVisualSummary>
      ) : null}

      {store.activeNavId === 'design-memory' ? (
        <div className="mt-2">
          <ExecutiveFocusPanel
            title="CONSULT DESIGN GENOME"
            subtitle="Before generating any new interface"
            highlight={store.preBuildQuestion}
          >
            <DesignMemorySearchPanel
              query={store.memoryQuery}
              onQueryChange={setQuery}
              matches={memoryMatches}
              onRunPreBuild={() => runPreBuild(store.memoryQuery || 'New interface section')}
            />
          </ExecutiveFocusPanel>
        </div>
      ) : null}

      {store.activeNavId === 'pre-build-review' && selectedReview ? (
        <div className="mt-2">
          <ExecutiveFocusPanel title="PRE-BUILD REVIEW" subtitle="Inherit before inventing">
            <PreBuildReviewPanel review={selectedReview} />
          </ExecutiveFocusPanel>
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        <ExecutiveCollapsibleSection title="CORE PHILOSOPHY" subtitle="Organizational design intelligence" badge="V1.0">
          <PhilosophyBlock store={store} />
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection title="PROMOTION LEVELS" subtitle="Section-level intelligence">
          <PromotionLevelsReference />
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection
          title="PRE-BUILD REVIEW HISTORY"
          subtitle={`${store.preBuildReviews.length} consultations`}
        >
          {store.preBuildReviews.map((r) => (
            <p key={r.id} style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 4 }}>
              {r.problem} · {r.recommendation.toUpperCase()}
            </p>
          ))}
        </ExecutiveCollapsibleSection>
      </div>

      <ConnectedSystemsStrip />
    </ExecutivePageShell>
  );
}

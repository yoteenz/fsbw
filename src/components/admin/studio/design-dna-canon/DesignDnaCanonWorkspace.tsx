import { useDesignDnaCanonState } from '../../../../hooks/useDesignDnaCanonState';
import {
  ExecutiveCollapsibleSection,
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutiveIconNav,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
  ExecutiveSecondaryGrid,
  ExecutiveVisualSummary,
} from '../executive-ia';
import type { ExecutiveIconNavItem } from '../executive-ia/ExecutiveIconNav';
import {
  CanonPageCard,
  CanonPageDetail,
  ConnectedSystemsStrip,
  DesignReviewPanel,
  PhilosophyBlock,
  PrincipleGrid,
  ReviewSelector,
  SpatialRoomGrid,
} from './DesignDnaCanonPanels';
import type { DesignDnaNavId } from '../../../../studio-os-core/design-dna-canon/types';

const NAV_ITEMS: ExecutiveIconNavItem[] = [
  {
    id: 'canon-pages',
    icon: '🏛',
    title: 'CANON PAGES',
    subtitle: 'Protected architectural references',
    status: 'active',
  },
  {
    id: 'principles',
    icon: '🧬',
    title: 'DESIGN DNA',
    subtitle: 'Why pages feel luxurious',
    status: 'idle',
  },
  {
    id: 'design-review',
    icon: '✦',
    title: 'HQ REVIEW',
    subtitle: 'Confidence before completion',
    status: 'attention',
  },
  {
    id: 'spatial-rooms',
    icon: '🚪',
    title: 'SPATIAL ROOMS',
    subtitle: 'Headquarters room map',
    status: 'idle',
  },
];

export function DesignDnaCanonWorkspace() {
  const {
    store,
    selectedPage,
    selectedReview,
    selectPage,
    selectReview,
    setNav,
    markReviewPassed,
    markReviewRefinement,
  } = useDesignDnaCanonState();

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    status:
      item.id === store.activeNavId
        ? ('active' as const)
        : item.id === 'design-review' && store.dashboard.pendingReviews > 0
          ? ('attention' as const)
          : ('idle' as const),
    onSelect: () => setNav(item.id as DesignDnaNavId),
  }));

  return (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="DESIGN DNA & CANON SYSTEM V1.0"
        title="Preserve masterpieces · evolve unfinished spaces"
        subtitle={store.dashboard.summary}
        stats={[
          { label: 'PROTECTED CANON', value: String(store.dashboard.protectedCanonCount) },
          { label: 'DNA PRINCIPLES', value: String(store.dashboard.principleCount) },
          { label: 'AVG CONFIDENCE', value: `${store.dashboard.avgReviewConfidence}%` },
          { label: 'PENDING REVIEWS', value: String(store.dashboard.pendingReviews) },
        ]}
      />

      <div className="mt-4">
        <ExecutiveIconNav
          items={navItems}
          activeId={store.activeNavId}
          label="DESIGN COMPASS"
        />
      </div>

      {store.activeNavId === 'canon-pages' && selectedPage ? (
        <>
          <ExecutiveVisualSummary title="CANON PAGE REGISTRY">
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 10 }}>
              Study · understand · inherit — never copy pixels
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {store.canonPages.map((page) => (
                <CanonPageCard
                  key={page.id}
                  page={page}
                  selected={page.id === store.selectedCanonPageId}
                  onSelect={() => selectPage(page.id)}
                />
              ))}
            </div>
          </ExecutiveVisualSummary>

          <div className="mt-4">
            <ExecutiveFocusPanel
              title="SELECTED CANON PAGE"
              subtitle={selectedPage.label}
              highlight={selectedPage.dominantEmotion}
            >
              <CanonPageDetail page={selectedPage} />
            </ExecutiveFocusPanel>
          </div>
        </>
      ) : null}

      {store.activeNavId === 'principles' ? (
        <>
          <ExecutiveVisualSummary title="DESIGN DNA PRINCIPLES">
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 10 }}>
              Recurring patterns — not measurements
            </p>
            <PrincipleGrid principles={store.principles} />
          </ExecutiveVisualSummary>

          <div className="mt-4">
            <ExecutiveFocusPanel title="WHY LUXURY" subtitle="Understand rhythm · emotion · hierarchy · breathing room">
              <PhilosophyBlock store={store} />
            </ExecutiveFocusPanel>
          </div>
        </>
      ) : null}

      {store.activeNavId === 'design-review' && selectedReview ? (
        <>
          <ExecutiveVisualSummary title="HEADQUARTERS DESIGN REVIEW">
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 10 }}>
              Complete after every new page
            </p>
            <ReviewSelector
              reviews={store.reviews}
              selectedId={store.selectedReviewId}
              onSelect={selectReview}
            />
          </ExecutiveVisualSummary>

          <div className="mt-4">
            <ExecutiveFocusPanel
              title="REVIEW SCORECARD"
              subtitle={selectedReview.pageLabel}
              highlight={`${selectedReview.confidenceScore}% confidence`}
            >
              <DesignReviewPanel
                review={selectedReview}
                onMarkPassed={markReviewPassed}
                onMarkRefinement={markReviewRefinement}
              />
            </ExecutiveFocusPanel>
          </div>
        </>
      ) : null}

      {store.activeNavId === 'spatial-rooms' ? (
        <>
          <ExecutiveVisualSummary title="SPATIAL STORYTELLING">
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 10 }}>
              Every page · another room in the mansion
            </p>
            <SpatialRoomGrid pages={store.canonPages} onSelect={selectPage} />
          </ExecutiveVisualSummary>

          <div className="mt-4">
            <ExecutiveSecondaryGrid columns={2} title="ROOM EMOTIONS">
              {store.canonPages.slice(0, 4).map((p) => (
                <ExecutiveSecondaryCard key={p.id} title={p.label} accent="#EB1C24">
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px' }}>{p.roomMetaphor}</p>
                  <p
                    style={{
                      fontFamily: '"Covered By Your Grace"',
                      fontSize: '14px',
                      color: '#EB1C24',
                      marginTop: 6,
                    }}
                  >
                    {p.dominantEmotion}
                  </p>
                </ExecutiveSecondaryCard>
              ))}
            </ExecutiveSecondaryGrid>
          </div>
        </>
      ) : null}

      <div className="mt-4 space-y-2">
        <ExecutiveCollapsibleSection
          title="FULL CORE PHILOSOPHY"
          subtitle="Frontal Slayer is a luxury digital headquarters"
          badge="PERMANENT"
        >
          <PhilosophyBlock store={store} />
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection
          title="ALL DESIGN DNA PRINCIPLES"
          subtitle={`${store.principles.length} principles across ${new Set(store.principles.map((p) => p.category)).size} categories`}
        >
          <PrincipleGrid principles={store.principles} />
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection
          title="HEADQUARTERS REVIEW CRITERIA"
          subtitle="Ten dimensions · confidence score · iterate until aligned"
        >
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 8 }}>
            Evaluate luxury · brand consistency · hierarchy · breathing room · editorial composition ·
            interaction quality · emotional alignment · optical balance · immersion · design DNA alignment.
            If confidence is low — refine before considering the page complete.
          </p>
          {store.reviews.map((r) => (
            <p key={r.id} style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', marginBottom: 4 }}>
              {r.pageLabel} · {r.confidenceScore}% · {r.status.replace(/-/g, ' ').toUpperCase()}
            </p>
          ))}
        </ExecutiveCollapsibleSection>
      </div>

      <ConnectedSystemsStrip />
    </ExecutivePageShell>
  );
}

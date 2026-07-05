import { useConciergeApprovalFlowState } from '../../../../hooks/useConciergeApprovalFlowState';
import {
  ActiveConciergeReviewCard,
  ApprovalItemSelector,
  ConciergeApprovalDashboard,
  ConciergeApprovalFlowAnimationStyles,
  ConciergeApprovalFlowConnectedSystems,
  ConciergeApprovalFlowShell,
  ConciergeApprovalFlowTitleBar,
  ConciergeReviewHistory,
  FounderActionBar,
  FounderBriefPanel,
  ReviewPipelineStrip,
  TrustVisionNote,
} from './ConciergeApprovalFlowPanels';

export function ConciergeApprovalFlowWorkspace() {
  const {
    store,
    selectedItem,
    currentReview,
    completedReviews,
    awaitingFounder,
    selectItem,
    submitReview,
    runFounderAction,
  } = useConciergeApprovalFlowState();

  if (!selectedItem) {
    return (
      <ConciergeApprovalFlowShell>
        <ConciergeApprovalFlowTitleBar store={store} />
        <p style={{ textAlign: 'center', fontSize: '8px' }}>No content awaiting approval.</p>
      </ConciergeApprovalFlowShell>
    );
  }

  const showBrief = awaitingFounder && selectedItem.founderBrief;
  const showActiveReview = !awaitingFounder && currentReview && currentReview.conciergeId !== 'founder';

  return (
    <>
      <ConciergeApprovalFlowAnimationStyles />
      <ConciergeApprovalFlowShell>
        <ConciergeApprovalFlowTitleBar store={store} />
        <ConciergeApprovalDashboard store={store} />

        <ApprovalItemSelector items={store.items} selectedId={store.selectedItemId} onSelect={selectItem} />

        <ReviewPipelineStrip item={selectedItem} currentStepIndex={selectedItem.currentStepIndex} />

        <div className="max-w-2xl mx-auto mb-3 text-center px-2">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', letterSpacing: '0.06em' }}>
            {selectedItem.title}
          </p>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#666' }}>
            {selectedItem.pageRoute} · submitted {new Date(selectedItem.submittedAt).toLocaleDateString()}
          </p>
        </div>

        {!showBrief && <ConciergeReviewHistory reviews={completedReviews} />}

        {showActiveReview && (
          <ActiveConciergeReviewCard review={currentReview} onSubmitDemo={submitReview} />
        )}

        {showBrief && selectedItem.founderBrief && (
          <FounderBriefPanel brief={selectedItem.founderBrief} />
        )}

        {awaitingFounder && (
          <FounderActionBar
            onAction={runFounderAction}
            lastAction={store.lastAction}
            disabled={!!selectedItem.founderDecision}
            requiresFounderAlways={selectedItem.requiresFounderAlways}
          />
        )}

        {selectedItem.founderDecision && (
          <p
            style={{
              textAlign: 'center',
              fontFamily: '"Futura PT Medium"',
              fontSize: '7px',
              color: '#059669',
              marginTop: 12,
            }}
          >
            FOUNDER DECISION RECORDED · {selectedItem.founderDecision.action.replace(/-/g, ' ').toUpperCase()}
          </p>
        )}

        <TrustVisionNote vision={store.futureTrustVision} />
        <ConciergeApprovalFlowConnectedSystems />
      </ConciergeApprovalFlowShell>
    </>
  );
}

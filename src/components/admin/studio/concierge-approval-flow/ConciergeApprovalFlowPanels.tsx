import { Link } from 'react-router-dom';
import {
  APPROVAL_CONNECTED_SYSTEMS,
  FOUNDER_ACTIONS,
  REVIEW_ORDER,
  REVIEW_VERDICT_LABELS,
} from '../../../../studio-os-core/concierge-approval-flow/constants';
import type {
  ApprovalContentItem,
  ConciergeApprovalFlowStore,
  ConciergeReviewStep,
  FounderActionId,
  FounderBrief,
  ReviewVerdict,
} from '../../../../studio-os-core/concierge-approval-flow/types';
import {
  adminStudioConciergeApprovalFlowPath,
  adminStudioConciergeLayerPath,
  adminStudioProductionStudioPath,
  adminStudioPublishingQueuePath,
  adminStudioRenderQueuePath,
  adminStudioScreeningRoomPath,
} from '../../../../utils/adminStudioRoutes';
import {
  CAF_ANIMATION_CSS,
  CAF_VISUAL,
  cafGrace,
  cafLabel,
  cafPanelStyle,
  cafSectionTitle,
  cafValue,
  verdictColor,
} from './conciergeApprovalFlowTheme';

type FounderActionHandler = (action: FounderActionId, note: string) => void;

export function ConciergeApprovalFlowAnimationStyles() {
  return <style>{CAF_ANIMATION_CSS}</style>;
}

export function ConciergeApprovalFlowShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="concierge-approval-flow relative overflow-hidden rounded-sm studio-glass-sheen"
      style={{
        background: `${CAF_VISUAL.marble} center/cover, linear-gradient(180deg, #faf8f5 0%, #f5f0ea 100%)`,
        minHeight: 'min(85vh, 820px)',
        color: CAF_VISUAL.text,
      }}
    >
      <div className="absolute inset-0 pointer-events-none caf-ambient" style={{ background: CAF_VISUAL.ambient }} />
      <div className="relative z-10 p-3">{children}</div>
    </div>
  );
}

export function ConciergeApprovalFlowTitleBar({ store }: { store: ConciergeApprovalFlowStore }) {
  return (
    <header className="mb-4 text-center">
      <p style={{ ...cafLabel, color: CAF_VISUAL.textDim }}>CONCIERGE APPROVAL FLOW · EDITORIAL BOARD · V1.0</p>
      <p style={{ ...cafGrace, fontSize: '22px', marginTop: 4 }}>{store.companyName}</p>
      <p style={{ ...cafValue, color: CAF_VISUAL.textMuted, fontSize: '7px', marginTop: 6, maxWidth: 480, marginInline: 'auto' }}>
        {store.philosophy[0]} · {store.philosophy[1]}
      </p>
    </header>
  );
}

export function ConciergeApprovalDashboard({ store }: { store: ConciergeApprovalFlowStore }) {
  const stats = [
    { label: 'IN CONCIERGE REVIEW', value: store.dashboard.inConciergeReview },
    { label: 'AWAITING FOUNDER', value: store.dashboard.awaitingFounder },
    { label: 'APPROVED TODAY', value: store.dashboard.approvedToday },
    { label: 'AVG CONFIDENCE', value: `${store.dashboard.avgConfidencePct}%` },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 max-w-2xl mx-auto">
      {stats.map((s) => (
        <div key={s.label} className="text-center px-2 py-2 rounded-sm" style={cafPanelStyle}>
          <p style={cafLabel}>{s.label}</p>
          <p style={{ ...cafGrace, fontSize: '16px', marginTop: 4 }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ApprovalItemSelector({
  items,
  selectedId,
  onSelect,
}: {
  items: ApprovalContentItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 justify-center">
      {items.map((item) => {
        const active = item.id === selectedId;
        const awaiting = item.currentStepIndex >= 6 && !item.founderDecision;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="whitespace-nowrap px-3 py-1.5 transition-all duration-300 text-left"
            style={{
              ...cafPanelStyle,
              background: active ? CAF_VISUAL.champagneSoft : CAF_VISUAL.glass,
              borderColor: active ? 'rgba(201,169,98,0.4)' : 'rgba(0,0,0,0.08)',
              minWidth: 140,
            }}
          >
            <span style={{ ...cafLabel, color: active ? CAF_VISUAL.gold : CAF_VISUAL.textDim, display: 'block' }}>
              {item.contentType}
            </span>
            <span style={{ ...cafValue, fontSize: '6px', display: 'block', marginTop: 2 }}>{item.title}</span>
            {awaiting && (
              <span style={{ ...cafLabel, color: CAF_VISUAL.founder, fontSize: '5px', display: 'block', marginTop: 2 }}>
                AWAITING FOUNDER
              </span>
            )}
            {item.requiresFounderAlways && (
              <span style={{ ...cafLabel, color: CAF_VISUAL.gold, fontSize: '5px', display: 'block', marginTop: 2 }}>
                FOUNDER REQUIRED
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ReviewPipelineStrip({
  item,
  currentStepIndex,
}: {
  item: ApprovalContentItem;
  currentStepIndex: number;
}) {
  return (
    <div className="mb-4 px-2">
      <p style={{ ...cafSectionTitle, textAlign: 'center', marginBottom: 12 }}>REVIEW ORDER</p>
      <div className="flex flex-wrap justify-center gap-1 items-center">
        {REVIEW_ORDER.map((step, idx) => {
          const review = item.reviews[idx];
          const isActive = idx === currentStepIndex && !item.founderDecision;
          const isComplete = review?.status === 'complete';
          const isFounder = step.id === 'founder';
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={isActive ? 'caf-pipeline-active' : ''}
                style={{
                  ...cafPanelStyle,
                  padding: '6px 10px',
                  borderColor: isActive ? step.accent : isComplete ? 'rgba(5,150,105,0.35)' : 'rgba(0,0,0,0.06)',
                  background: isActive ? `${step.accent}12` : isComplete ? 'rgba(5,150,105,0.06)' : CAF_VISUAL.glass,
                  minWidth: isFounder ? 72 : 88,
                  textAlign: 'center',
                }}
              >
                <p style={{ ...cafLabel, fontSize: '5px', color: isActive ? step.accent : CAF_VISUAL.textDim }}>
                  {step.title}
                </p>
                {review?.verdict && (
                  <p style={{ ...cafLabel, fontSize: '4px', color: verdictColor(review.verdict), marginTop: 2 }}>
                    {REVIEW_VERDICT_LABELS[review.verdict]}
                  </p>
                )}
                {isActive && !review?.verdict && (
                  <p style={{ ...cafLabel, fontSize: '4px', color: step.accent, marginTop: 2 }}>IN REVIEW</p>
                )}
              </div>
              {idx < REVIEW_ORDER.length - 1 && (
                <span style={{ ...cafLabel, padding: '0 2px', color: CAF_VISUAL.textDim }}>↓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewDetailBlock({ review }: { review: ConciergeReviewStep }) {
  if (review.status !== 'complete' || !review.verdict) return null;
  return (
    <div className="mb-3 p-3 rounded-sm" style={{ ...cafPanelStyle, borderLeft: `3px solid ${review.accent}` }}>
      <div className="flex flex-wrap justify-between gap-2 mb-2">
        <p style={{ ...cafSectionTitle, margin: 0, color: review.accent }}>{review.title}</p>
        <span style={{ ...cafLabel, color: verdictColor(review.verdict) }}>
          {REVIEW_VERDICT_LABELS[review.verdict]}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        <div>
          <p style={cafLabel}>CONFIDENCE</p>
          <p style={{ ...cafGrace, fontSize: '14px' }}>{review.confidencePct ?? '—'}%</p>
        </div>
        <div className="col-span-2 sm:col-span-3">
          <p style={cafLabel}>CRITERIA</p>
          <p style={{ ...cafValue, fontSize: '6px' }}>{review.criteria.join(' · ')}</p>
        </div>
      </div>
      <p style={cafLabel}>REASONING</p>
      <p style={{ ...cafValue, marginBottom: 8 }}>{review.reasoning}</p>
      <p style={cafLabel}>HISTORICAL COMPARISON</p>
      <p style={{ ...cafValue, color: CAF_VISUAL.textMuted }}>{review.historicalComparison}</p>
    </div>
  );
}

export function ConciergeReviewHistory({ reviews }: { reviews: ConciergeReviewStep[] }) {
  const completed = reviews.filter((r) => r.status === 'complete' && r.verdict);
  if (completed.length === 0) return null;
  return (
    <div className="mb-4">
      <p style={{ ...cafSectionTitle, textAlign: 'center' }}>COMPLETED REVIEWS</p>
      {completed.map((r) => (
        <ReviewDetailBlock key={r.conciergeId} review={r} />
      ))}
    </div>
  );
}

export function ActiveConciergeReviewCard({
  review,
  onSubmitDemo,
}: {
  review: ConciergeReviewStep | null;
  onSubmitDemo?: (verdict: ReviewVerdict) => void;
}) {
  if (!review || review.conciergeId === 'founder') return null;
  return (
    <div className="mb-4 p-4 rounded-sm max-w-xl mx-auto" style={{ ...cafPanelStyle, borderTop: `3px solid ${review.accent}` }}>
      <p style={{ ...cafSectionTitle, color: review.accent }}>CURRENT · {review.title}</p>
      <p style={{ ...cafValue, color: CAF_VISUAL.textMuted, marginBottom: 8 }}>
        Reviewing according to discipline: {review.criteria.join(' · ')}
      </p>
      {review.status === 'in-review' && onSubmitDemo && (
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {(Object.keys(REVIEW_VERDICT_LABELS) as ReviewVerdict[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onSubmitDemo(v)}
              style={{
                ...cafLabel,
                padding: '4px 8px',
                border: CAF_VISUAL.glassBorder,
                background: CAF_VISUAL.champagneSoft,
                color: verdictColor(v),
                cursor: 'pointer',
              }}
            >
              {REVIEW_VERDICT_LABELS[v]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FounderBriefPanel({ brief }: { brief: FounderBrief }) {
  return (
    <div
      className="mb-4 p-4 rounded-sm max-w-2xl mx-auto"
      style={{
        ...cafPanelStyle,
        borderTop: `3px solid ${CAF_VISUAL.gold}`,
        background: 'linear-gradient(180deg, rgba(201,169,98,0.12) 0%, rgba(255,255,255,0.88) 100%)',
      }}
    >
      <p style={{ ...cafGrace, fontSize: '20px', textAlign: 'center', marginBottom: 4 }}>FOUNDER BRIEF</p>
      <p style={{ ...cafLabel, textAlign: 'center', marginBottom: 12 }}>CHIEF CONCIERGE · UNIFIED SUMMARY</p>
      <p style={{ ...cafValue, textAlign: 'center', marginBottom: 16, fontStyle: 'italic' }}>{brief.chiefSummary}</p>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <p style={cafLabel}>OVERALL READINESS</p>
          <p style={cafValue}>{brief.overallReadiness}</p>
        </div>
        <div>
          <p style={cafLabel}>CONFIDENCE</p>
          <p style={{ ...cafGrace, fontSize: '18px' }}>{brief.confidencePct}%</p>
        </div>
      </div>

      <p style={cafLabel}>RECOMMENDED CHANGES</p>
      <ul style={{ ...cafValue, paddingLeft: 12, marginBottom: 12 }}>
        {brief.recommendedChanges.map((c) => (
          <li key={c} style={{ marginBottom: 4 }}>
            {c}
          </li>
        ))}
      </ul>

      <p style={cafLabel}>PREDICTED OUTCOME</p>
      <p style={{ ...cafValue, marginBottom: 12 }}>{brief.predictedOutcome}</p>

      <p style={cafLabel}>REMAINING CONCERNS</p>
      <ul style={{ ...cafValue, paddingLeft: 12 }}>
        {brief.remainingConcerns.map((c) => (
          <li key={c} style={{ marginBottom: 4, color: CAF_VISUAL.textMuted }}>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FounderActionBar({
  onAction,
  lastAction,
  disabled,
  requiresFounderAlways,
}: {
  onAction: FounderActionHandler;
  lastAction?: ConciergeApprovalFlowStore['lastAction'];
  disabled?: boolean;
  requiresFounderAlways?: boolean;
}) {
  const notes: Record<FounderActionId, string> = {
    approve: 'Founder approved — organizational review complete.',
    publish: 'Published to distribution pipeline.',
    schedule: 'Scheduled for publication window.',
    'request-changes': 'Returned to production with founder guidance.',
    regenerate: 'Sent for regeneration across production stack.',
    'run-experiment': 'Experiment variant queued with Growth Concierge.',
    'save-draft': 'Saved as draft — publication paused.',
  };

  const btn = (label: string, action: FounderActionId, primary?: boolean) => (
    <button
      key={action}
      type="button"
      disabled={disabled}
      onClick={() => onAction(action, notes[action])}
      className="transition-all duration-300 disabled:opacity-40"
      style={{
        ...cafLabel,
        padding: '6px 12px',
        border: primary ? `1px solid ${CAF_VISUAL.founder}` : CAF_VISUAL.glassBorder,
        background: primary ? 'rgba(235,28,36,0.08)' : CAF_VISUAL.glass,
        color: primary ? CAF_VISUAL.founder : CAF_VISUAL.text,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
      {requiresFounderAlways && (
        <p style={{ ...cafLabel, textAlign: 'center', color: CAF_VISUAL.gold, marginBottom: 8 }}>
          HIGH-IMPACT CONTENT · FOUNDER APPROVAL REQUIRED
        </p>
      )}
      <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
        {FOUNDER_ACTIONS.map((a) =>
          btn(a.label, a.id, a.id === 'approve' || a.id === 'publish')
        )}
      </div>
      {lastAction && (
        <p style={{ ...cafLabel, textAlign: 'center', marginTop: 12 }}>
          LAST · {lastAction.action.replace(/-/g, ' ').toUpperCase()} · {lastAction.note}
        </p>
      )}
    </div>
  );
}

export function TrustVisionNote({ vision }: { vision: string }) {
  return (
    <div className="mt-4 p-3 rounded-sm max-w-xl mx-auto text-center" style={cafPanelStyle}>
      <p style={{ ...cafLabel, color: CAF_VISUAL.gold, marginBottom: 4 }}>FUTURE VISION · TRUST THRESHOLDS</p>
      <p style={{ ...cafValue, fontSize: '6px', color: CAF_VISUAL.textMuted }}>{vision}</p>
    </div>
  );
}

export function ConciergeApprovalFlowConnectedSystems() {
  return (
    <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        {APPROVAL_CONNECTED_SYSTEMS.map((s) => (
          <span key={s} className="text-[5px] font-futura px-1 py-0.5" style={{ ...cafLabel, border: CAF_VISUAL.glassBorder }}>
            {s}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to={adminStudioScreeningRoomPath()} style={{ ...cafLabel, fontSize: '6px', color: CAF_VISUAL.textMuted }}>
          ← SCREENING ROOM
        </Link>
        <Link to={adminStudioRenderQueuePath()} style={{ ...cafLabel, fontSize: '6px' }}>
          → RENDER QUEUE
        </Link>
        <Link to={adminStudioConciergeLayerPath()} style={{ ...cafLabel, fontSize: '6px', color: CAF_VISUAL.gold }}>
          → CONCIERGE LAYER
        </Link>
        <Link to={adminStudioPublishingQueuePath()} style={{ ...cafLabel, fontSize: '6px', color: CAF_VISUAL.founder }}>
          → PUBLISHING
        </Link>
        <Link to={adminStudioProductionStudioPath()} style={{ ...cafLabel, fontSize: '6px' }}>
          → PRODUCTION STUDIO
        </Link>
        <Link to={adminStudioConciergeApprovalFlowPath()} style={{ ...cafLabel, fontSize: '6px' }}>
          → EDITORIAL BOARD
        </Link>
      </div>
    </div>
  );
}

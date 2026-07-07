import { Link } from 'react-router-dom';
import type { CampaignDeliverable, CampaignRecord } from '../../../../studio-os-core/campaign-engine/types';
import { workflowStatusLabel, DELIVERABLE_WORKFLOW_CHAIN } from '../../../../studio-os-core/campaign-engine/deliverableUtils';
import type { DeliverableWorkflowAction } from '../../../../studio-os-core/campaign-engine/store';
import {
  adminStudioKnowledgeHubPath,
  adminStudioNdxbookNewsroomPath,
  adminStudioPublishingQueuePath,
} from '../../../../utils/adminStudioRoutes';
import { ceLabel, cePanel, ceSectionTitle } from './campaignEngineTheme';
import { ceGlassStrip, ceMarblePanel, workflowStatusBadgeStyle, workflowStatusColor } from './campaignDeliverablesTheme';

type Props = {
  deliverable: CampaignDeliverable;
  campaign: CampaignRecord;
  autoPublishEnabled: boolean;
  onClose: () => void;
  onAction: (action: DeliverableWorkflowAction) => void;
};

export function NewsroomEditorPanel({
  deliverable,
  campaign,
  autoPublishEnabled,
  onClose,
  onAction,
}: Props) {
  const canPublish =
    autoPublishEnabled ||
    deliverable.workflowStatus === 'approved' ||
    deliverable.workflowStatus === 'scheduled';

  return (
    <div
      className="fixed inset-0 z-[1200] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4"
      style={{ background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal
      aria-label="Newsroom Editor"
    >
      <div
        className="w-full max-h-[92vh] overflow-y-auto sm:max-w-lg"
        style={{
          ...ceMarblePanel,
          borderTop: '3px solid #D97706',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div className="sticky top-0 z-10 p-3 flex items-start justify-between gap-2" style={ceGlassStrip}>
          <div>
            <p style={{ ...ceSectionTitle, fontSize: '5px', marginBottom: 2 }}>NEWSROOM EDITOR™</p>
            <p className="text-[9px] font-futura" style={{ fontWeight: 515, color: '#0F172A' }}>
              {deliverable.title}
            </p>
            <p style={{ ...ceLabel, fontSize: '5px' }}>
              {campaign.name} · {deliverable.platform.toUpperCase()} · {(deliverable.format ?? deliverable.type).toUpperCase()}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[8px] font-futura px-2 py-1" style={{ color: '#808080' }}>
            CLOSE
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span style={workflowStatusBadgeStyle(deliverable.workflowStatus)}>
              {workflowStatusLabel(deliverable.workflowStatus)}
            </span>
            <span style={{ ...ceLabel, fontSize: '5px' }}>
              FACT-CHECK · {(deliverable.factCheckStatus ?? 'pending').toUpperCase()}
            </span>
          </div>

          {/* Workflow rail */}
          <div className="flex flex-wrap gap-1">
            {DELIVERABLE_WORKFLOW_CHAIN.map((step) => (
              <span
                key={step}
                className="text-[4px] font-futura px-1 py-0.5"
                style={{
                  opacity: deliverable.workflowStatus === step ? 1 : 0.45,
                  color: workflowStatusColor(step),
                  fontWeight: deliverable.workflowStatus === step ? 515 : 400,
                }}
              >
                {workflowStatusLabel(step)}
              </span>
            ))}
          </div>

          {deliverable.thumbnailPreview ? (
            <div className="p-3" style={{ ...cePanel, background: 'rgba(255,255,255,0.5)' }}>
              <p style={{ ...ceLabel, fontSize: '4px', marginBottom: 4 }}>VISUAL PREVIEW</p>
              <p style={{ ...ceLabel, fontSize: '6px', color: '#334155' }}>{deliverable.thumbnailPreview}</p>
            </div>
          ) : null}

          <div className="p-3" style={{ ...cePanel, background: 'rgba(255,255,255,0.5)' }}>
            <p style={{ ...ceLabel, fontSize: '4px', marginBottom: 4 }}>BODY / CONTENT</p>
            <p style={{ ...ceLabel, fontSize: '6px', color: '#334155', lineHeight: 1.6 }}>
              {deliverable.bodyPreview ?? 'Content draft loading from Newsroom pipeline…'}
            </p>
          </div>

          {deliverable.caption ? (
            <div className="p-3" style={{ ...cePanel, background: 'rgba(255,255,255,0.5)' }}>
              <p style={{ ...ceLabel, fontSize: '4px', marginBottom: 4 }}>CAPTION</p>
              <p style={{ ...ceLabel, fontSize: '6px', color: '#334155' }}>{deliverable.caption}</p>
            </div>
          ) : null}

          {(deliverable.researchSources?.length ?? 0) > 0 ? (
            <div className="p-3" style={cePanel}>
              <p style={{ ...ceSectionTitle, fontSize: '6px' }}>RESEARCH SOURCES</p>
              {deliverable.researchSources!.map((src) => (
                <p key={src} style={{ ...ceLabel, fontSize: '5px' }}>
                  · {src}
                </p>
              ))}
            </div>
          ) : null}

          {(deliverable.aiSuggestions?.length ?? 0) > 0 ? (
            <div className="p-3" style={{ ...cePanel, borderLeft: '2px solid #D97706' }}>
              <p style={{ ...ceSectionTitle, fontSize: '6px' }}>AI SUGGESTIONS</p>
              {deliverable.aiSuggestions!.map((s) => (
                <p key={s} style={{ ...ceLabel, fontSize: '5px', color: '#D97706' }}>
                  → {s}
                </p>
              ))}
            </div>
          ) : null}

          {(deliverable.approvalTimeline?.length ?? 0) > 0 ? (
            <div className="p-3" style={cePanel}>
              <p style={{ ...ceSectionTitle, fontSize: '6px' }}>APPROVAL TIMELINE</p>
              {deliverable.approvalTimeline!.slice(-4).map((ev) => (
                <p key={`${ev.at}-${ev.action}`} style={{ ...ceLabel, fontSize: '5px' }}>
                  {new Date(ev.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {ev.actor} · {ev.action}
                </p>
              ))}
            </div>
          ) : null}

          {(deliverable.comments?.length ?? 0) > 0 ? (
            <div className="p-3" style={cePanel}>
              <p style={{ ...ceSectionTitle, fontSize: '6px' }}>COMMENTS</p>
              {deliverable.comments!.map((c) => (
                <p key={c.id} style={{ ...ceLabel, fontSize: '5px' }}>
                  {c.author}: {c.text}
                </p>
              ))}
            </div>
          ) : null}

          {(deliverable.versionHistory?.length ?? 0) > 0 ? (
            <div className="p-3" style={cePanel}>
              <p style={{ ...ceSectionTitle, fontSize: '6px' }}>VERSION HISTORY</p>
              {deliverable.versionHistory!.map((v) => (
                <p key={v.version} style={{ ...ceLabel, fontSize: '5px' }}>
                  v{v.version} · {v.summary}
                </p>
              ))}
            </div>
          ) : null}

          {deliverable.learningMetrics ? (
            <div className="p-3" style={{ ...cePanel, borderLeft: '2px solid #7C3AED' }}>
              <p style={{ ...ceSectionTitle, fontSize: '6px' }}>STUDIO INTELLIGENCE™ · LEARNING</p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(deliverable.learningMetrics).map(([k, v]) =>
                  v ? (
                    <p key={k} style={{ ...ceLabel, fontSize: '5px' }}>
                      {k.replace(/([A-Z])/g, ' $1').toUpperCase()}: {v}
                    </p>
                  ) : null
                )}
              </div>
              {deliverable.studioIntelligenceNotes?.map((n) => (
                <p key={n} style={{ ...ceLabel, fontSize: '5px', color: '#7C3AED', marginTop: 4 }}>
                  {n}
                </p>
              ))}
            </div>
          ) : null}

          {/* Approval actions */}
          <div className="p-3" style={ceGlassStrip}>
            <p style={{ ...ceSectionTitle, fontSize: '6px' }}>APPROVAL CENTER™ · ACTIONS</p>
            {!autoPublishEnabled ? (
              <p style={{ ...ceLabel, fontSize: '5px', marginBottom: 8 }}>
                Publishing requires approval unless auto-publishing is enabled for the organization.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ['submit-review', 'SUBMIT FOR REVIEW', deliverable.workflowStatus === 'draft'],
                  ['approve', 'APPROVE', deliverable.workflowStatus === 'review'],
                  ['request-revision', 'REQUEST REVISION', deliverable.workflowStatus === 'review'],
                  ['reject', 'REJECT', deliverable.workflowStatus === 'review'],
                  ['schedule', 'SCHEDULE', deliverable.workflowStatus === 'approved'],
                  ['publish', 'PUBLISH', canPublish && deliverable.workflowStatus !== 'published' && deliverable.workflowStatus !== 'learning'],
                  ['learn', 'MARK LEARNING', deliverable.workflowStatus === 'published'],
                ] as const
              )
                .filter(([, , enabled]) => enabled)
                .map(([action, label]) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => onAction(action)}
                    className="px-2 py-1 text-[5px] font-futura border"
                    style={{
                      fontWeight: 515,
                      borderColor: action === 'publish' ? '#16A34A' : '#D97706',
                      color: action === 'publish' ? '#16A34A' : '#D97706',
                      background: 'white',
                    }}
                  >
                    {label}
                  </button>
                ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {deliverable.newsroomPageId ? (
              <Link to={adminStudioNdxbookNewsroomPath()} style={{ ...ceLabel, fontSize: '5px', color: '#334155' }}>
                → NEWSROOM · {deliverable.newsroomPageId}
              </Link>
            ) : null}
            {deliverable.knowledgeAssetId ? (
              <Link to={adminStudioKnowledgeHubPath()} style={{ ...ceLabel, fontSize: '5px', color: '#7C3AED' }}>
                → KNOWLEDGE LIBRARY™ · {deliverable.knowledgeAssetId}
              </Link>
            ) : null}
            <Link to={adminStudioPublishingQueuePath()} style={{ ...ceLabel, fontSize: '5px', color: '#0891B2' }}>
              → PUBLISHING ENGINE™
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

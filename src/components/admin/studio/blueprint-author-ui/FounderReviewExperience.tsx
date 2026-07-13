import type { CSSProperties, ReactNode } from 'react';
import type { UseBlueprintAuthorWorkflowReturn } from '../../../../hooks/useBlueprintAuthorWorkflow';
import { FounderReviewHero } from './FounderReviewHero';
import { FounderReviewMetadata } from './FounderReviewMetadata';
import { BlueprintDrawer } from './BlueprintDrawer';
import { LiveDiffPanel } from './LiveDiffPanel';
import { ConstructionTimelinePanel } from './ConstructionTimelinePanel';
import { LiveRoomAssemblyPanel } from './LiveRoomAssemblyPanel';
import { FounderInspectPanel } from './FounderInspectPanel';
import { ManufacturingQueuePanel } from './ManufacturingQueue';
import { WorkerStatus } from './WorkerStatus';
import { InspectionStatus } from './InspectionStatus';
import { FounderRenderDiagnosticsPanel } from './FounderRenderDiagnosticsPanel';

const btnPrimary: CSSProperties = {
  padding: '12px 20px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  background: '#eb1c24',
  color: '#fff',
};

const btnSecondary: CSSProperties = {
  padding: '12px 20px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  border: '1px solid #cbd5e1',
  borderRadius: 10,
  cursor: 'pointer',
  background: '#fff',
  color: '#334155',
};

const btnDisabled: CSSProperties = {
  ...btnPrimary,
  opacity: 0.45,
  cursor: 'not-allowed',
};

type Props = {
  workflow: UseBlueprintAuthorWorkflowReturn;
  renderAfterApproval?: ReactNode;
  /** preview-only: approve NBP render without manufacturing (canonical departments). */
  approvalMode?: 'build' | 'preview-only';
};

/**
 * Founder Review Experience™ — photoreal Founder Render first; engineering blueprint collapsed.
 */
export function FounderReviewExperience({ workflow, renderAfterApproval, approvalMode = 'build' }: Props) {
  const {
    step,
    summary,
    bundle,
    founderRenderJob,
    founderDiff,
    constructionTimeline,
    roomAssembly,
    manufacturingResult,
    error,
    isManufacturing,
    isApproved,
    isPreviewApproved,
    canApprove,
    isGeneratingPreview,
    revisionInput,
    setRevisionInput,
    generateFounderPreview,
    approveAndBuild,
    approvePreviewOnly,
    submitRevision,
    goBack,
    toggleBlueprintDrawer,
    openBlueprintDrawer,
    openInspect,
    closeInspect,
    selectedInspector,
    inspectMode,
    selectedAssetId,
    blueprintDrawerOpen,
    setPreviewImageLoaded,
  } = workflow;

  if (step === 'idle' || !bundle || !summary || !founderRenderJob || !founderDiff || !constructionTimeline) {
    return null;
  }

  const showManufacturing = approvalMode === 'build' && (step === 'manufacturing' || step === 'complete');
  const showPreviewApprovedBanner = approvalMode === 'preview-only' && step === 'complete' && isPreviewApproved;
  const liveView = manufacturingResult?.session.liveConstruction ?? bundle.session.liveConstruction;

  return (
    <div
      data-founder-review-experience
      style={{
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        borderBottom: '1px solid #e2e8f0',
        padding: '20px 16px 24px',
      }}
    >
      <header style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', color: '#eb1c24' }}>
          FOUNDER REVIEW™
        </p>
        <h2 style={{ margin: '6px 0 0', fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: '#0f172a' }}>
          {founderRenderJob.roomDisplayName}
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b', maxWidth: 520 }}>
          Review the photoreal full-room Founder Render before manufacturing begins.
        </p>
      </header>

      {error ? (
        <pre style={{ color: '#eb1c24', fontSize: '11px', whiteSpace: 'pre-wrap', marginBottom: 12 }}>{error}</pre>
      ) : null}

      {!showManufacturing && !showPreviewApprovedBanner ? (
        <>
          <FounderReviewHero
            job={founderRenderJob}
            onGenerate={() => void generateFounderPreview()}
            onRegenerate={() => void generateFounderPreview(revisionInput || null)}
            isGenerating={isGeneratingPreview}
            onImageLoaded={() => setPreviewImageLoaded(true)}
            onImageError={() => setPreviewImageLoaded(false)}
          />
          <FounderReviewMetadata
            summary={summary}
            plan={bundle.plan}
            renderJob={founderRenderJob}
            isGeneratingPreview={isGeneratingPreview}
            error={error}
          />
          <FounderRenderDiagnosticsPanel diagnostics={founderRenderJob.diagnostics} />

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
              Request revision (optional)
            </label>
            <textarea
              value={revisionInput}
              onChange={(e) => setRevisionInput(e.target.value)}
              placeholder="e.g. make room brighter, use exact brand marble, change landmark…"
              rows={2}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '12px', resize: 'vertical' }}
            />
            {revisionInput.trim() ? (
              <button type="button" style={{ ...btnSecondary, marginTop: 8 }} onClick={submitRevision} disabled={isGeneratingPreview}>
                Apply revision &amp; regenerate preview
              </button>
            ) : null}
          </div>

          <LiveDiffPanel diff={founderDiff} />

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 20,
              paddingTop: 20,
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <button type="button" style={btnSecondary} onClick={goBack}>
              Revise Plan
            </button>
            <button type="button" style={btnSecondary} onClick={() => void generateFounderPreview(revisionInput || null)} disabled={isGeneratingPreview}>
              Regenerate Preview
            </button>
            <button type="button" style={btnSecondary} onClick={toggleBlueprintDrawer}>
              Open Blueprint
            </button>
            <button
              type="button"
              style={canApprove ? { ...btnPrimary, marginLeft: 'auto' } : { ...btnDisabled, marginLeft: 'auto' }}
              disabled={!canApprove || isManufacturing}
              onClick={
                canApprove
                  ? () => void (approvalMode === 'preview-only' ? approvePreviewOnly() : approveAndBuild())
                  : undefined
              }
              title={
                !canApprove
                  ? 'Approve requires ready photoreal preview matching current blueprint revision'
                  : undefined
              }
            >
              {isManufacturing
                ? 'Approving…'
                : approvalMode === 'preview-only'
                  ? 'Approve Preview'
                  : 'Approve & Build'}
            </button>
          </div>

          <BlueprintDrawer
            open={blueprintDrawerOpen}
            onToggle={toggleBlueprintDrawer}
            worldPreview={bundle.session.worldPreview}
            session={bundle.session}
            selectedAssetId={selectedAssetId}
            onSelectAsset={openInspect}
          >
            <div style={{ marginTop: 12 }}>
              <WorkerStatus monitor={bundle.session.workerMonitor} />
            </div>
          </BlueprintDrawer>
        </>
      ) : showPreviewApprovedBanner ? (
        <>
          <FounderReviewHero
            job={{ ...founderRenderJob, status: 'approved' }}
            onImageLoaded={() => setPreviewImageLoaded(true)}
          />
          <p style={{ marginTop: 16, padding: 12, background: '#ecfdf5', borderRadius: 8, color: '#166534', fontSize: '12px' }}>
            Founder Render preview approved. Batch generation and portrait companion renders are unlocked below.
          </p>
          <button type="button" style={{ ...btnSecondary, marginTop: 12 }} onClick={goBack}>
            Revise department
          </button>
        </>
      ) : (
        <>
          <ConstructionTimelinePanel timeline={constructionTimeline} />
          {roomAssembly ? <LiveRoomAssemblyPanel assembly={roomAssembly} /> : null}
          {founderRenderJob.previewArtifactUrl ? (
            <div style={{ marginTop: 16 }}>
              <FounderReviewHero
                job={{ ...founderRenderJob, status: 'approved' }}
                onImageLoaded={() => setPreviewImageLoaded(true)}
              />
            </div>
          ) : null}
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <ManufacturingQueuePanel queue={bundle.queue} liveView={liveView} />
            <button type="button" style={{ ...btnSecondary, alignSelf: 'flex-start' }} onClick={openBlueprintDrawer}>
              Open Construction Jobs
            </button>
            <WorkerStatus monitor={bundle.session.workerMonitor} />
            {manufacturingResult ? <InspectionStatus qualityDisplays={manufacturingResult.qualityDisplays} /> : null}
          </div>
          <button type="button" style={{ ...btnSecondary, marginTop: 16 }} onClick={goBack}>
            Back
          </button>
        </>
      )}

      {inspectMode && selectedInspector ? (
        <FounderInspectPanel
          inspector={selectedInspector}
          onClose={closeInspect}
          onInspectBlueprint={() => {
            closeInspect();
            openBlueprintDrawer();
          }}
        />
      ) : null}

      {isApproved && renderAfterApproval ? (
        <div style={{ marginTop: 28 }} data-blueprint-post-approval-render>
          {renderAfterApproval}
        </div>
      ) : null}
    </div>
  );
}

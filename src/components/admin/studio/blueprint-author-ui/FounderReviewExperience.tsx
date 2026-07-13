import type { CSSProperties, ReactNode } from 'react';
import type { UseBlueprintAuthorWorkflowReturn } from '../../../../hooks/useBlueprintAuthorWorkflow';
import { FounderReviewHero } from './FounderReviewHero';
import { FounderReviewMetadata } from './FounderReviewMetadata';
import { VariantStrip } from './VariantStrip';
import { BlueprintDrawer } from './BlueprintDrawer';
import { LiveDiffPanel } from './LiveDiffPanel';
import { ConstructionTimelinePanel } from './ConstructionTimelinePanel';
import { LiveRoomAssemblyPanel } from './LiveRoomAssemblyPanel';
import { FounderInspectPanel } from './FounderInspectPanel';
import { ManufacturingQueuePanel } from './ManufacturingQueue';
import { WorkerStatus } from './WorkerStatus';
import { InspectionStatus } from './InspectionStatus';

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

type Props = {
  workflow: UseBlueprintAuthorWorkflowReturn;
  renderAfterApproval?: ReactNode;
};

/**
 * Founder Review Experience™ — Creative Director review workflow.
 * Founder View first (photoreal hero). Worker View in collapsed blueprint drawer.
 */
export function FounderReviewExperience({ workflow, renderAfterApproval }: Props) {
  const {
    step,
    summary,
    bundle,
    founderRender,
    founderDiff,
    constructionTimeline,
    roomAssembly,
    variantId,
    blueprintDrawerOpen,
    inspectMode,
    selectedAssetId,
    selectedInspector,
    manufacturingResult,
    error,
    isManufacturing,
    isApproved,
    manufacturingBlocked,
    founderRenderVariants,
    approveAndBuild,
    goBack,
    toggleBlueprintDrawer,
    openBlueprintDrawer,
    openInspect,
    closeInspect,
    selectVariant,
    enableInspectMode,
  } = workflow;

  if (step === 'idle' || !bundle || !summary || !founderRender || !founderDiff || !constructionTimeline) {
    return null;
  }

  const showManufacturing = step === 'manufacturing' || step === 'complete';
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
          Construction Plan
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b', maxWidth: 520 }}>
          Review and approve before AI workers begin.
        </p>
      </header>

      {error ? (
        <pre style={{ color: '#eb1c24', fontSize: '11px', whiteSpace: 'pre-wrap', marginBottom: 12 }}>{error}</pre>
      ) : null}

      {!showManufacturing ? (
        <>
          <FounderReviewHero
            model={founderRender}
            selectedAssetId={selectedAssetId}
            onSelectAsset={inspectMode ? openInspect : undefined}
            inspectMode={inspectMode}
          />
          <FounderReviewMetadata summary={summary} plan={bundle.plan} />
          <VariantStrip variants={founderRenderVariants} activeVariantId={variantId} onSelect={selectVariant} />
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
              Revise
            </button>
            <button type="button" style={btnSecondary} onClick={toggleBlueprintDrawer}>
              Open Blueprint
            </button>
            <button type="button" style={btnSecondary} onClick={enableInspectMode}>
              Inspect Mode
            </button>
            <button
              type="button"
              style={{ ...btnPrimary, marginLeft: 'auto', opacity: manufacturingBlocked && !isManufacturing ? 1 : 0.5 }}
              disabled={!manufacturingBlocked || isManufacturing}
              onClick={manufacturingBlocked ? approveAndBuild : undefined}
            >
              {isManufacturing ? 'Approving…' : 'Approve Construction'}
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
      ) : (
        <>
          <ConstructionTimelinePanel timeline={constructionTimeline} />
          {roomAssembly ? <LiveRoomAssemblyPanel assembly={roomAssembly} /> : null}
          <div style={{ marginTop: 16 }}>
            <FounderReviewHero model={founderRender} inspectMode={false} />
          </div>
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

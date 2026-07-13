import type { ReactNode, CSSProperties } from 'react';
import type { UseBlueprintAuthorWorkflowReturn } from '../../../../hooks/useBlueprintAuthorWorkflow';
import { ConstructionPlanCard } from './ConstructionPlanCard';
import { BlueprintPreview } from './BlueprintPreview';
import { ObjectInspector } from './ObjectInspector';
import { ManufacturingQueuePanel } from './ManufacturingQueue';
import { WorkerStatus } from './WorkerStatus';
import { InspectionStatus } from './InspectionStatus';
import { ApprovalFooter } from './ApprovalFooter';

const sectionStyle: CSSProperties = {
  padding: 16,
  fontFamily: 'system-ui, sans-serif',
};

type Props = {
  workflow: UseBlueprintAuthorWorkflowReturn;
  /** Hide render preview child until manufacturing approved */
  renderAfterApproval?: ReactNode;
};

/**
 * Shared Blueprint Author workflow shell — Experience Lab + Creative Director Studio.
 * Presentation layer only; consumes Blueprint Author / Construction Mode APIs.
 */
export function BlueprintAuthorWorkflowShell({ workflow, renderAfterApproval }: Props) {
  const {
    step,
    view,
    summary,
    bundle,
    manufacturingResult,
    selectedInspector,
    selectedAssetId,
    error,
    isManufacturing,
    isApproved,
    manufacturingBlocked,
    approveAndBuild,
    goBack,
    openPreview,
    openInspector,
  } = workflow;

  if (step === 'idle') return null;

  if (!bundle || !summary) {
    return (
      <div style={sectionStyle}>
        <p style={{ color: '#eb1c24' }}>Blueprint Author session unavailable.</p>
      </div>
    );
  }

  const showPlan = view === 'plan' && step !== 'manufacturing' && step !== 'complete';
  const showPreview = view === 'preview';
  const showInspector = view === 'inspector' && selectedInspector;
  const showManufacturing = step === 'manufacturing' || step === 'complete';

  return (
    <div data-blueprint-author-workflow style={{ ...sectionStyle, background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
      <header style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
          BLUEPRINT AUTHOR™
        </p>
        <h2 style={{ margin: '4px 0 0', fontSize: '15px' }}>Construction Plan — Founder Review</h2>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
          {manufacturingBlocked
            ? 'Review and approve before any AI worker runs.'
            : isApproved
              ? 'Manufacturing complete — living result ready.'
              : 'Authoring construction specification…'}
        </p>
      </header>

      {error ? (
        <pre style={{ color: '#eb1c24', fontSize: '11px', whiteSpace: 'pre-wrap', marginBottom: 12 }}>{error}</pre>
      ) : null}

      {showPlan ? (
        <>
          <ConstructionPlanCard summary={summary} planId={bundle.plan.planId} />
          <div style={{ marginTop: 16 }}>
            <WorkerStatus monitor={bundle.session.workerMonitor} />
          </div>
        </>
      ) : null}

      {showPreview ? (
        <BlueprintPreview
          worldPreview={bundle.session.worldPreview}
          session={bundle.session}
          selectedAssetId={selectedAssetId}
          onSelectAsset={openInspector}
        />
      ) : null}

      {showInspector && selectedInspector ? <ObjectInspector inspector={selectedInspector} /> : null}

      {showManufacturing ? (
        <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
          <ManufacturingQueuePanel
            queue={bundle.queue}
            liveView={manufacturingResult?.session.liveConstruction ?? bundle.session.liveConstruction}
          />
          <WorkerStatus monitor={bundle.session.workerMonitor} />
          {manufacturingResult ? <InspectionStatus qualityDisplays={manufacturingResult.qualityDisplays} /> : null}
        </div>
      ) : null}

      {!showManufacturing ? (
        <ApprovalFooter
          onBack={goBack}
          onPreviewWorld={openPreview}
          onInspectObjects={() => {
            const first = bundle.session.worldPreview.placeholderAssets[0];
            if (first) openInspector(first.assetId);
            else openPreview();
          }}
          onApproveAndBuild={manufacturingBlocked ? approveAndBuild : undefined}
          approveDisabled={!manufacturingBlocked || isManufacturing}
          isManufacturing={isManufacturing}
        />
      ) : (
        <ApprovalFooter onBack={goBack} showManufacturingActions={false} />
      )}

      {isApproved && renderAfterApproval ? (
        <div style={{ marginTop: 24 }} data-blueprint-post-approval-render>
          {renderAfterApproval}
        </div>
      ) : null}
    </div>
  );
}

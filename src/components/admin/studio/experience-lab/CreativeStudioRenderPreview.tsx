import { useMemo, type CSSProperties } from 'react';
import type { CreativePreviewCompanyId } from '../../../../studio-os-core/creative-studio-preview';
import { WORLD_COMPILER_STAGES, worldCompilerStageLabel } from '../../../../studio-os-core/scene-stack/world-compiler/constants';
import { useCreativeStudioRenderPreview } from '../../../../hooks/useCreativeStudioRenderPreview';
import { SceneStackViewport } from '../../studio-os/creative-direction-studio/SceneStackViewport';
import { CDS_GENESIS_INTERACTION_STYLES } from '../../studio-os/creative-direction-studio/cdsInteractionLayerTheme';
import { CDS_IMMERSION_STYLES } from '../../studio-os/creative-direction-studio/cdsImmersionTheme';

type Props = {
  companyId: CreativePreviewCompanyId;
  conceptId: 'a' | 'b' | 'c';
  blindMode?: boolean;
};

/**
 * Final Creative Studio render — World Compiler™ + Scene Stack viewport.
 * No wireframes, placeholders, or schematic layouts.
 */
export function CreativeStudioRenderPreview({ companyId, conceptId, blindMode = false }: Props) {
  const {
    binding,
    stack,
    stationId,
    layers,
    status,
    pipeline,
    sceneGraph,
    compileReport,
    retryPipeline,
  } = useCreativeStudioRenderPreview(companyId, conceptId);

  const isBuilding = stack.isStationPipelineActive(stationId) || status === 'building';
  const approvedCount = layers.filter((l) => l.publicUrl && l.status !== 'failed').length;
  const stageResults = compileReport?.stages ?? [];

  const pipelineSummary = useMemo(() => {
    if (isBuilding && pipeline.phase !== 'idle') {
      return pipeline.currentLayerLabel
        ? `Generating ${pipeline.currentLayerLabel}…`
        : 'Compiling environment…';
    }
    if (compileReport?.headline) return compileReport.headline;
    if (approvedCount > 0) return `Final render — ${approvedCount} layers composed`;
    return 'Invoking Creative Studio rendering pipeline…';
  }, [approvedCount, compileReport?.headline, isBuilding, pipeline]);

  return (
    <div
      data-creative-studio-render
      data-company={blindMode ? 'hidden' : companyId}
      data-concept={conceptId}
      data-blind={blindMode ? 'true' : 'false'}
      data-department={blindMode ? undefined : binding.departmentId}
      data-station={stationId}
      style={shellStyle}
    >
      <style>{CDS_GENESIS_INTERACTION_STYLES}</style>
      <style>{CDS_IMMERSION_STYLES}</style>
      <style>{XELAB_RENDER_SCOPE_STYLES}</style>

      <div className="xelab-cds-render">
        <SceneStackViewport
          layers={layers}
          status={status}
          stationLabel={blindMode ? 'Environment preview' : binding.stationLabel}
          pipeline={isBuilding ? pipeline : undefined}
          sceneGraph={sceneGraph}
          compilationHeadline={blindMode ? undefined : compileReport?.headline ?? undefined}
          sceneIntegrityPct={blindMode ? undefined : compileReport?.sceneIntegrityPct ?? undefined}
          onRegenerateLayer={
            blindMode
              ? undefined
              : (layerId) => void stack.regenerateLayer(stationId, layerId as import('../../../../studio-os-core/scene-stack').SceneStackLayerId)
          }
        />
      </div>

      {!blindMode ? (
        <footer style={footerStyle}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '10px', letterSpacing: '0.06em' }}>
            CREATIVE STUDIO RENDER PIPELINE
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#555', lineHeight: 1.5 }}>
            {binding.pipelineTarget} · {pipelineSummary}
            {compileReport?.sceneIntegrityPct != null
              ? ` · Integrity ${compileReport.sceneIntegrityPct}%`
              : ''}
          </p>
          {stageResults.length > 0 ? (
            <div style={stageRowStyle}>
              {WORLD_COMPILER_STAGES.map((stage) => {
                const result = stageResults.find((s) => s.stage === stage);
                const done = result?.success === true;
                const failed = result?.success === false;
                return (
                  <span
                    key={stage}
                    title={result?.detail ?? worldCompilerStageLabel(stage)}
                    style={{
                      ...stageChipStyle,
                      background: failed ? '#fef2f2' : done ? '#ecfdf5' : '#f3f4f6',
                      color: failed ? '#991b1b' : done ? '#166534' : '#6b7280',
                      borderColor: failed ? '#fecaca' : done ? '#bbf7d0' : '#e5e7eb',
                    }}
                  >
                    {worldCompilerStageLabel(stage).replace(/™/g, '')}
                  </span>
                );
              })}
            </div>
          ) : null}
          {(status === 'failed' || (status === 'idle' && approvedCount === 0 && !isBuilding)) ? (
            <button type="button" style={retryBtnStyle} onClick={retryPipeline}>
              Run full render pipeline
            </button>
          ) : null}
          {approvedCount === 0 && !isBuilding && status !== 'failed' ? (
            <p style={{ margin: '8px 0 0', fontSize: '10px', color: '#555' }}>
              Invoking World Compiler™ — Creative DNA → Scene Graph → Layer Stack → final render.
            </p>
          ) : null}
        </footer>
      ) : null}
    </div>
  );
}

/** @deprecated Use CreativeStudioRenderPreview — schematic previews removed Phase 3 */
export { CreativeStudioRenderPreview as CreativePreviewEnvironment };

const shellStyle: CSSProperties = {
  borderRadius: 12,
  overflow: 'hidden',
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  background: '#080706',
};

const footerStyle: CSSProperties = {
  padding: '10px 12px',
  background: '#fafafa',
  borderTop: '1px solid #e5e7eb',
  fontFamily: 'system-ui, sans-serif',
};

const stageRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
  marginTop: 8,
};

const stageChipStyle: CSSProperties = {
  fontSize: '8px',
  padding: '2px 6px',
  borderRadius: 99,
  border: '1px solid',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const retryBtnStyle: CSSProperties = {
  marginTop: 8,
  padding: '6px 10px',
  fontSize: '10px',
  border: '1px solid #333',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
};

const XELAB_RENDER_SCOPE_STYLES = `
.xelab-cds-render {
  position: relative;
  width: 100%;
  min-height: 420px;
  aspect-ratio: 9 / 16;
  max-height: 520px;
  margin: 0 auto;
  background: #080706;
  overflow: hidden;
}
.xelab-cds-render .cds-stack__viewport {
  position: absolute;
  inset: 0;
}
.xelab-cds-render .cds-stack__viewport-hint,
.xelab-cds-render .cds-stack__layer-strip {
  display: none;
}
`;

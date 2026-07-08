import type { ArchitectDebugViewState } from '../../../../studio-os-core/scene-stack';
import {
  ARCHITECT_DEBUG_LAYER_LABELS,
  type ArchitectDebugLayer,
} from '../../../../studio-os-core/scene-stack/world-compiler/debug-view';

type Props = {
  debugView: ArchitectDebugViewState;
  onToggle: () => void;
  onToggleLayer: (layer: ArchitectDebugLayer) => void;
  compilationHeadline?: string | null;
  sceneIntegrityPct?: number | null;
};

/**
 * Architect Debug View™ — toggle visibility of scene graph debug overlays.
 */
export function ArchitectDebugPanel({
  debugView,
  onToggle,
  onToggleLayer,
  compilationHeadline,
  sceneIntegrityPct,
}: Props) {
  const layers = Object.keys(ARCHITECT_DEBUG_LAYER_LABELS) as ArchitectDebugLayer[];

  return (
    <div className="cds-stack__debug-panel" aria-label="Architect Debug View">
      <button type="button" className="cds-stack__debug-toggle" onClick={onToggle}>
        {debugView.enabled ? 'Debug On' : 'Debug Off'}
      </button>
      {compilationHeadline ? (
        <p className="cds-stack__debug-report">{compilationHeadline}</p>
      ) : null}
      {sceneIntegrityPct != null ? (
        <p className="cds-stack__debug-integrity">Integrity {sceneIntegrityPct}%</p>
      ) : null}
      {debugView.enabled ? (
        <div className="cds-stack__debug-layers">
          {layers.map((layer) => (
            <button
              key={layer}
              type="button"
              className={`cds-stack__debug-layer-btn${debugView.visibleLayers.has(layer) ? ' is-active' : ''}`}
              onClick={() => onToggleLayer(layer)}
            >
              {ARCHITECT_DEBUG_LAYER_LABELS[layer]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

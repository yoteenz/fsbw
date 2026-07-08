import { useMemo } from 'react';
import {
  GlobalAtlasProvider,
  pickVisibleDestinations,
  useGlobalAtlasLayer,
  ATLAS_TRAVEL_LABELS,
} from './GlobalAtlasProvider';
import { GLOBAL_ATLAS_LAYER_STYLES } from './globalAtlasTheme';
import type { AtlasTravelMode } from '../../../../studio-os-core/studio-world-atlas';
import { GLOBAL_ATLAS_TRAVEL_MODES } from '../../../../studio-os-core/global-atlas-layer';

function GlobalAtlasLayerInner() {
  const gal = useGlobalAtlasLayer();
  const {
    isOpen,
    anchor,
    locationLabel,
    currentNodeId,
    shortcuts,
    orbGuideLine,
    collaboratorLine,
    atlasCollaborators,
    traveling,
    closeAtlas,
    travelToNode,
    atlas,
    selectedNodeId,
    setSelectedNodeId,
  } = gal;

  const focusNode = atlas.focusNode;
  const selectedId = selectedNodeId ?? focusNode.id;

  const markers = useMemo(
    () => pickVisibleDestinations(atlas.visibleNodes, focusNode.id, currentNodeId, 10),
    [atlas.visibleNodes, focusNode.id, currentNodeId]
  );

  if (!isOpen) return null;

  return (
    <>
      <style>{GLOBAL_ATLAS_LAYER_STYLES}</style>
      <div className={`gal-root is-open ${anchor.overlayClass}`} role="dialog" aria-modal="true" aria-label="Global Atlas Layer">
        <button type="button" className="gal-backdrop" aria-label="Close Atlas" onClick={closeAtlas} />
        <div className="gal-panel">
          <header className="gal-hud">
            <button type="button" className="gal-close" onClick={closeAtlas} aria-label="Close">
              ×
            </button>
            <div className="gal-title-block">
              <p className="gal-eyebrow">ONE ATLAS · GLOBAL LAYER™</p>
              <p className="gal-title">STUDIO WORLD ATLAS™</p>
              <p className="gal-anchor-line">{anchor.projectionLine}</p>
            </div>
          </header>

          <p className="gal-location">
            <strong>YOU ARE HERE</strong>
            <br />
            {locationLabel}
          </p>

          {collaboratorLine ? (
            <div className="gal-collaborators" aria-label="Live collaborators">
              <p className="gal-collaborators-title">LIVE COLLABORATORS</p>
              {atlasCollaborators
                .filter((c) => c.status === 'active')
                .slice(0, 4)
                .map((c) => (
                  <p key={c.id} className="gal-collaborator-row">
                    <span className="gal-collaborator-dot" />
                    {c.role} · {c.roomLabel}
                  </p>
                ))}
            </div>
          ) : null}

          <div className="gal-table" aria-label="Holographic navigation table">
            <div className="gal-table-surface">
              {markers.map((node) => {
                const h = 8 + node.extrusion * 28;
                const isHere = node.id === currentNodeId;
                const isSelected = node.id === selectedId;
                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`gal-marker${isHere ? ' is-here' : ''}${isSelected ? ' is-selected' : ''}`}
                    style={{ left: `${node.mapX}%`, top: `${node.mapY}%` }}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      if (node.childIds.length > 0 && node.level < 5) atlas.focusOn(node.id);
                    }}
                    title={node.displayName}
                  >
                    <div className="gal-marker-pillar" style={{ height: `${h}px` }} />
                    <span className="gal-marker-label">{node.displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="gal-shortcuts" aria-label="Intelligent shortcuts">
            {shortcuts.map((s) => (
              <button
                key={s.id}
                type="button"
                className="gal-shortcut"
                onClick={() => {
                  setSelectedNodeId(s.nodeId);
                  void travelToNode(s.nodeId);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="gal-travel-bar" aria-label="Travel mode">
            {GLOBAL_ATLAS_TRAVEL_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={`gal-travel-pill${atlas.view.travelMode === mode ? ' is-active' : ''}`}
                onClick={() => atlas.setTravelMode(mode as AtlasTravelMode)}
              >
                {ATLAS_TRAVEL_LABELS[mode as AtlasTravelMode]}
              </button>
            ))}
          </div>

          {orbGuideLine ? <p className="gal-orb-hint">{orbGuideLine}</p> : null}

          <div className="gal-actions">
            <button
              type="button"
              className="gal-go-btn"
              disabled={traveling || selectedId === currentNodeId}
              onClick={() => void travelToNode(selectedId)}
            >
              {traveling ? 'TRAVELING…' : `GO · ${atlas.catalog.find((n) => n.id === selectedId)?.displayName ?? 'DESTINATION'}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** Global Atlas Layer™ overlay — projects the one Atlas into any workspace. */
export function GlobalAtlasLayer() {
  return <GlobalAtlasLayerInner />;
}

export { GlobalAtlasProvider };

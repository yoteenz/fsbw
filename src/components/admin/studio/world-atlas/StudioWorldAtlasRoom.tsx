import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  ATLAS_MAP_MODE_LABELS,
  ATLAS_TRAVEL_LABELS,
  ATLAS_ZOOM_LABELS,
  activityGlowClass,
  fogOpacity,
  type AtlasMapMode,
  type AtlasNode,
  type AtlasTravelMode,
} from '../../../../studio-os-core/studio-world-atlas';
import { useStudioWorldAtlas } from '../../../../hooks/useStudioWorldAtlas';
import { STUDIO_WORLD_ATLAS_STYLES } from './studioWorldAtlasTheme';

const MAP_MODES = Object.keys(ATLAS_MAP_MODE_LABELS) as AtlasMapMode[];
const TRAVEL_MODES = Object.keys(ATLAS_TRAVEL_LABELS) as AtlasTravelMode[];

function BuildingMarker({
  node,
  focusNodeId,
  onSelect,
}: {
  node: AtlasNode;
  focusNodeId: string;
  onSelect: (id: string) => void;
}) {
  const heightPx = 12 + node.extrusion * 48;
  const opacity = fogOpacity(node.unlocked, node.fogged);

  return (
    <button
      type="button"
      className={[
        'swa__building',
        activityGlowClass(node.activity),
        node.fogged ? 'is-fogged' : '',
        node.hidden ? 'is-hidden' : '',
        node.id === focusNodeId ? 'is-focused' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: `${node.mapX}%`,
        top: `${node.mapY}%`,
        opacity,
      }}
      onClick={() => onSelect(node.id)}
      disabled={node.fogged && !node.unlocked}
      title={node.displayName}
      aria-label={node.displayName}
    >
      <div className="swa__extrusion" style={{ height: `${heightPx}px` }} />
      <span className="swa__building-label">{node.displayName}</span>
      <span className="swa__building-level">L{node.level}</span>
    </button>
  );
}

/**
 * Studio World Atlas™ — living holographic blueprint inside Executive Atrium™.
 * Spatial civilization navigation — not a sitemap, sidebar, or file explorer.
 */
export function StudioWorldAtlasRoom() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const atlas = useStudioWorldAtlas({
    companyName: workspace.displayName,
    liveRefreshMs: 45_000,
  });

  const [traveling, setTraveling] = useState(false);
  const [travelOverlay, setTravelOverlay] = useState<{
    message: string;
    cinematicClass: string;
  } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () =>
      selectedNodeId
        ? atlas.catalog.find((n) => n.id === selectedNodeId) ?? atlas.focusNode
        : atlas.focusNode,
    [selectedNodeId, atlas.catalog, atlas.focusNode]
  );

  const roadPaths = useMemo(() => {
    const focus = atlas.focusNode;
    return atlas.visibleNodes
      .filter((n) => n.id !== focus.id)
      .map((n) => {
        const x1 = focus.mapX;
        const y1 = focus.mapY;
        const x2 = n.mapX;
        const y2 = n.mapY;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - 4;
        return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
      });
  }, [atlas.focusNode, atlas.visibleNodes]);

  const handleSelect = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      const node = atlas.catalog.find((n) => n.id === nodeId);
      if (!node) return;
      if (node.childIds.length > 0 && node.level < 6) {
        atlas.focusOn(nodeId);
      }
    },
    [atlas]
  );

  const handleTravel = useCallback(
    async (nodeId?: string) => {
      const targetId = nodeId ?? selectedNode.id;
      const resolution = atlas.resolveTravel(targetId);
      if (!resolution) return;
      setTraveling(true);
      setTravelOverlay({
        message: `${resolution.verb} ${atlas.catalog.find((n) => n.id === targetId)?.displayName ?? 'destination'}…`,
        cinematicClass: resolution.cinematicClass.replace('atlas-travel-', ''),
      });
      await new Promise((r) => window.setTimeout(r, resolution.transitionMs));
      navigate(resolution.path);
      setTraveling(false);
      setTravelOverlay(null);
    },
    [atlas, navigate, selectedNode.id]
  );

  return (
    <>
      <style>{STUDIO_WORLD_ATLAS_STYLES}</style>
      <div className="swa" role="application" aria-label="Studio World Atlas">
        <header className="swa__hud">
          <button
            type="button"
            className="swa__back"
            onClick={() => navigate('/admin/studio/world/command-center')}
            aria-label="Return to Executive Atrium"
          >
            ←
          </button>
          <div className="swa__title-block">
            <p className="swa__eyebrow">STUDIO COMMAND CENTER™ · EXECUTIVE ATRIUM™</p>
            <p className="swa__title">STUDIO WORLD ATLAS™</p>
            <p className="swa__zoom">{ATLAS_ZOOM_LABELS[atlas.view.zoomLevel]}</p>
          </div>
          {atlas.focusNode.parentId ? (
            <button type="button" className="swa__zoom-out" onClick={atlas.zoomOut}>
              ZOOM OUT
            </button>
          ) : (
            <button type="button" className="swa__zoom-out" onClick={atlas.resetToWorld}>
              WORLD VIEW
            </button>
          )}
        </header>

        <nav className="swa__breadcrumb" aria-label="Atlas focus trail">
          {atlas.breadcrumb.map((node, i) => (
            <button
              key={node.id}
              type="button"
              className={`swa__crumb${i === atlas.breadcrumb.length - 1 ? ' is-current' : ''}`}
              onClick={() => atlas.focusOn(node.id)}
            >
              {node.displayName}
            </button>
          ))}
        </nav>

        <aside className="swa__focus-panel" aria-live="polite">
          <p className="swa__focus-name">{selectedNode.displayName}</p>
          <p className="swa__focus-meta">
            {ATLAS_ZOOM_LABELS[selectedNode.level]}
            <br />
            {selectedNode.activity.toUpperCase()} · {selectedNode.physicalType.toUpperCase()}
            {selectedNode.migrationStatus ? (
              <>
                <br />
                {selectedNode.migrationStatus.replace(/-/g, ' ').toUpperCase()}
              </>
            ) : null}
          </p>
          <button
            type="button"
            className="swa__travel-btn"
            onClick={() => void handleTravel(selectedNode.id)}
            disabled={traveling || (selectedNode.fogged && !selectedNode.unlocked)}
          >
            {ATLAS_TRAVEL_LABELS[atlas.view.travelMode]} → {selectedNode.displayName}
          </button>
        </aside>

        <aside className="swa__orb" aria-label="Studio Orb world guide">
          <div className="swa__orb-sphere" aria-hidden />
          <p className="swa__orb-title">STUDIO ORB™</p>
          {atlas.orbRecommendations.map((rec) => (
            <button
              key={rec.id}
              type="button"
              className={`swa__orb-rec is-${rec.priority}`}
              onClick={() => {
                atlas.focusOn(rec.targetNodeId);
                setSelectedNodeId(rec.targetNodeId);
              }}
            >
              {rec.message}
            </button>
          ))}
        </aside>

        <div className="swa__table-stage">
          <div className={`swa__table${atlas.view.transitionMs > 800 ? ' is-zooming' : ''}`}>
            <div className="swa__table-surface">
              <div className="swa__table-glow" aria-hidden />
              <svg className="swa__roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {roadPaths.map((d, i) => (
                  <path key={i} className="swa__road" d={d} vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
              <div className="swa__buildings">
                {atlas.visibleNodes.map((node) => (
                  <BuildingMarker
                    key={node.id}
                    node={node}
                    focusNodeId={selectedNodeId ?? atlas.focusNode.id}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="swa__mode-rail" role="tablist" aria-label="Map modes">
          {MAP_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={atlas.view.mapMode === mode}
              className={`swa__mode-pill${atlas.view.mapMode === mode ? ' is-active' : ''}`}
              onClick={() => atlas.setMapMode(mode)}
            >
              {ATLAS_MAP_MODE_LABELS[mode]}
            </button>
          ))}
        </div>

        <div className="swa__travel-rail" role="group" aria-label="Travel mode">
          {TRAVEL_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`swa__travel-pill${atlas.view.travelMode === mode ? ' is-active' : ''}`}
              onClick={() => atlas.setTravelMode(mode)}
            >
              {ATLAS_TRAVEL_LABELS[mode]}
            </button>
          ))}
        </div>

        <p className="swa__fog-legend">
          FOG OF DISCOVERY™ · {atlas.discovery.discoveredNodeIds.length} destinations revealed
        </p>

        {travelOverlay ? (
          <div
            className={`swa__travel-overlay is-${travelOverlay.cinematicClass}`}
            aria-live="assertive"
          >
            <p className="swa__travel-msg">{travelOverlay.message}</p>
          </div>
        ) : null}
      </div>
    </>
  );
}

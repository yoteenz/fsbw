import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  ATLAS_CONSTRUCTION_PHASE_LABELS,
  ATLAS_ENGINE_LABELS,
  ATLAS_MAP_MODE_LABELS,
  ATLAS_TRAVEL_LABELS,
  ATLAS_ZOOM_LABELS,
  MASTER_PLAN_PHASE_LABELS,
  RESERVE_LAND_PRESETS,
  activityGlowClass,
  fogOpacity,
  forecastHorizonLabel,
  getBuildingMemory,
  livingSignalClass,
  planPhaseProgress,
  type AtlasMapMode,
  type AtlasNode,
  type AtlasTravelMode,
} from '../../../../studio-os-core/studio-world-atlas';
import { useStudioWorldAtlas } from '../../../../hooks/useStudioWorldAtlas';
import { STUDIO_WORLD_ATLAS_STYLES } from './studioWorldAtlasTheme';

const MAP_MODES = Object.keys(ATLAS_MAP_MODE_LABELS) as AtlasMapMode[];
const TRAVEL_MODES = Object.keys(ATLAS_TRAVEL_LABELS) as AtlasTravelMode[];
const FORECAST_HORIZONS = [1, 3, 5, 10] as const;

function BuildingMarker({
  node,
  focusNodeId,
  onSelect,
  draggable,
  onDrag,
}: {
  node: AtlasNode;
  focusNodeId: string;
  onSelect: (id: string) => void;
  draggable?: boolean;
  onDrag?: (planId: string, mapX: number, mapY: number) => void;
}) {
  const heightPx = 12 + node.extrusion * 48;
  const opacity = fogOpacity(node.unlocked, node.fogged);
  const signalClasses = (node.livingSignals ?? []).map(livingSignalClass);
  const surfaceRef = useRef<HTMLElement | null>(null);

  const pointerToMap = useCallback((clientX: number, clientY: number) => {
    const surface = surfaceRef.current?.closest('.swa__table-surface') as HTMLElement | null;
    if (!surface) return { mapX: node.mapX, mapY: node.mapY };
    const rect = surface.getBoundingClientRect();
    const mapX = ((clientX - rect.left) / rect.width) * 100;
    const mapY = ((clientY - rect.top) / rect.height) * 100;
    return { mapX, mapY };
  }, [node.mapX, node.mapY]);

  return (
    <button
      type="button"
      ref={(el) => {
        surfaceRef.current = el;
      }}
      className={[
        'swa__building',
        activityGlowClass(node.activity),
        node.fogged ? 'is-fogged' : '',
        node.hidden ? 'is-hidden' : '',
        node.id === focusNodeId ? 'is-focused' : '',
        node.isPlanned ? 'is-planned' : '',
        node.isConcept ? 'is-planned' : '',
        draggable && node.planId ? 'is-draggable' : '',
        ...signalClasses,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: `${node.mapX}%`,
        top: `${node.mapY}%`,
        opacity,
      }}
      onClick={() => onSelect(node.id)}
      onPointerDown={(e) => {
        if (!draggable || !node.planId || !onDrag) return;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!draggable || !node.planId || !onDrag || !(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId))
          return;
        const { mapX, mapY } = pointerToMap(e.clientX, e.clientY);
        onDrag(node.planId, mapX, mapY);
      }}
      onPointerUp={(e) => {
        if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        }
      }}
      disabled={node.fogged && !node.unlocked}
      title={node.displayName}
      aria-label={node.displayName}
    >
      <div className="swa__extrusion" style={{ height: `${heightPx}px` }} />
      <span className="swa__building-label">{node.displayName}</span>
      <span className="swa__building-level">
        L{node.level}
        {node.planPhase ? ` · ${MASTER_PLAN_PHASE_LABELS[node.planPhase]}` : null}
        {!node.planPhase && node.constructionPhase && node.constructionPhase !== 'complete'
          ? ` · ${ATLAS_CONSTRUCTION_PHASE_LABELS[node.constructionPhase]}`
          : null}
      </span>
    </button>
  );
}

/**
 * Studio World Atlas™ — living holographic blueprint inside Executive Atrium™.
 * Phase 3: Master Planner™ strategic planning table — extend, never redesign.
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

  const selectedMemory = useMemo(
    () => getBuildingMemory(selectedNode.id, atlas.discovery.buildingMemories),
    [selectedNode.id, atlas.discovery.buildingMemories]
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
      if (node.planId) atlas.setSelectedPlanId(node.planId);
      if (node.childIds.length > 0 && node.level < 6) {
        atlas.focusOn(nodeId);
      }
      if (nodeId.startsWith('discovery-') && node.fogged) {
        atlas.focusOn(nodeId);
      }
    },
    [atlas]
  );

  const handleTravel = useCallback(
    async (nodeId?: string) => {
      const targetId = nodeId ?? selectedNode.id;
      if (selectedNode.isPlanned || selectedNode.isConcept) return;
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
      atlas.clearTravelingRoads();
    },
    [atlas, navigate, selectedNode.id, selectedNode.isPlanned, selectedNode.isConcept]
  );

  const showPlanner = atlas.isMasterPlannerMode;

  return (
    <>
      <style>{STUDIO_WORLD_ATLAS_STYLES}</style>
      <div
        className={`swa${showPlanner ? ' is-master-planner' : ''}`}
        role="application"
        aria-label="Studio World Atlas"
      >
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
            <p className="swa__zoom">
              {showPlanner ? 'MASTER PLANNER™ · PLANNING MODE' : ATLAS_ZOOM_LABELS[atlas.view.zoomLevel]}
            </p>
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

        <div className="swa__ticker" aria-live="polite">
          <span className="swa__ticker-inner">
            {showPlanner
              ? `MASTER PLANNER™ · ${atlas.discovery.masterPlan.length} RESERVED · SIMULATE BEFORE YOU GENERATE · ${atlas.worldForecast.narrative}`
              : atlas.worldTicker}{' '}
            &nbsp;&nbsp;&nbsp;{' '}
            {showPlanner ? atlas.worldForecast.narrative : atlas.worldTicker}
          </span>
        </div>

        {!showPlanner ? (
          <div className="swa__engine-strip" aria-hidden>
            {atlas.activeEngines.slice(0, 8).map((engine) => (
              <span key={engine} className="swa__engine-chip">
                {ATLAS_ENGINE_LABELS[engine]}
              </span>
            ))}
          </div>
        ) : null}

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
            {selectedNode.planPhase
              ? MASTER_PLAN_PHASE_LABELS[selectedNode.planPhase]
              : ATLAS_ZOOM_LABELS[selectedNode.level]}
            <br />
            {selectedNode.isConcept ? 'FUTURE VISION™ CONCEPT' : selectedNode.activity.toUpperCase()}
            {selectedNode.planPhase ? (
              <>
                <br />
                {planPhaseProgress(selectedNode.planPhase)}% TO OPERATIONAL™
              </>
            ) : null}
          </p>
          {atlas.selectedPlanBudget && (selectedNode.isPlanned || atlas.selectedPlan) ? (
            <div className="swa__budget-line">
              GEN {atlas.selectedPlanBudget.generationCost} · BUILD {atlas.selectedPlanBudget.constructionCost}
              <br />
              BUDGET +{atlas.selectedPlanBudget.budgetImpactPct}% · EQUITY {atlas.selectedPlanBudget.projectedEquity}
              {atlas.selectedPlanBudget.marketplaceValue ? (
                <>
                  <br />
                  MARKETPLACE: {atlas.selectedPlanBudget.marketplaceValue}
                </>
              ) : null}
              <br />
              REUSE: {atlas.selectedPlanBudget.reuseOpportunities}
            </div>
          ) : null}
          {atlas.activeSimulation && selectedNode.planId === atlas.activeSimulation.planId ? (
            <div className="swa__sim-panel">
              <p className="swa__sim-score">SIMULATION {atlas.activeSimulation.placementScore}</p>
              {atlas.activeSimulation.summary}
              <br />
              <span style={{ opacity: 0.65 }}>{atlas.activeSimulation.navigationImpact}</span>
            </div>
          ) : null}
          {selectedMemory ? (
            <div className="swa__memory-block">
              BUILT {new Date(selectedMemory.constructedAt).toLocaleDateString()}
              <br />
              {selectedMemory.reason}
            </div>
          ) : null}
          {!selectedNode.isPlanned && !selectedNode.isConcept ? (
            <button
              type="button"
              className="swa__travel-btn"
              onClick={() => void handleTravel(selectedNode.id)}
              disabled={traveling || (selectedNode.fogged && !selectedNode.unlocked)}
            >
              {ATLAS_TRAVEL_LABELS[atlas.view.travelMode]} → {selectedNode.displayName}
            </button>
          ) : null}
          {showPlanner && atlas.selectedPlan ? (
            <>
              <button
                type="button"
                className="swa__travel-btn"
                onClick={() => atlas.runSimulation(atlas.selectedPlan!.id)}
              >
                RUN SIMULATION MODE™
              </button>
              <button
                type="button"
                className="swa__travel-btn"
                style={{ marginTop: 4, opacity: 0.85 }}
                onClick={() => atlas.advancePlan(atlas.selectedPlan!.id)}
              >
                ADVANCE PHASE →
              </button>
            </>
          ) : null}
        </aside>

        {showPlanner ? (
          <aside className="swa__planner-panel" aria-label="Master Planner reservations">
            <p className="swa__planner-title">RESERVED LAND™</p>
            {atlas.discovery.masterPlan.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className="swa__planner-item"
                onClick={() => {
                  atlas.selectMasterPlan(plan);
                  setSelectedNodeId(`plan-${plan.id}`);
                }}
              >
                {plan.label}
                <br />
                <span style={{ opacity: 0.55 }}>
                  {MASTER_PLAN_PHASE_LABELS[plan.phase ?? 'reserved-land']}
                </span>
              </button>
            ))}
            <p className="swa__planner-title" style={{ marginTop: 8 }}>
              EXPANSION RECOMMENDATIONS™
            </p>
            {atlas.expansionRecommendations.map((rec) => (
              <p key={rec.id} className="swa__planner-item" style={{ cursor: 'default' }}>
                {rec.message}
              </p>
            ))}
          </aside>
        ) : null}

        {showPlanner ? (
          <aside className="swa__planner-toolbar" aria-label="Master Planner tools">
            <p className="swa__planner-toolbar-title">RESERVE LAND™</p>
            {RESERVE_LAND_PRESETS.slice(0, 4).map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="swa__planner-btn"
                onClick={() => {
                  const plan = atlas.reserveLand(
                    preset.label,
                    preset.category,
                    40 + Math.random() * 20,
                    30 + Math.random() * 25
                  );
                  setSelectedNodeId(`plan-${plan.id}`);
                }}
              >
                + {preset.label}
              </button>
            ))}
            <p className="swa__planner-toolbar-title" style={{ marginTop: 8 }}>
              DISTRICT PLANNING™
            </p>
            <button
              type="button"
              className="swa__planner-btn"
              onClick={() => atlas.addDistrictFeature('plaza', 'Central Plaza™', 52, 48)}
            >
              + Plaza
            </button>
            <button
              type="button"
              className="swa__planner-btn"
              onClick={() => atlas.addDistrictFeature('transit-hub', 'Transit Hub™', 50, 58)}
            >
              + Transit Hub
            </button>
            <button
              type="button"
              className="swa__planner-btn"
              onClick={() => atlas.addDistrictFeature('skybridge', 'Skybridge™', 45, 35)}
            >
              + Skybridge
            </button>
            {atlas.selectedPlan ? (
              <button
                type="button"
                className="swa__planner-btn"
                onClick={() => atlas.addPlanAmenity(atlas.selectedPlan!.id, 'observation-tower')}
              >
                + Observation Tower
              </button>
            ) : null}
            <p className="swa__planner-toolbar-title" style={{ marginTop: 8 }}>
              WORLD FORECAST™
            </p>
            <div className="swa__forecast-row">
              {FORECAST_HORIZONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={`swa__forecast-pill${atlas.discovery.forecastHorizon === y ? ' is-active' : ''}`}
                  onClick={() => atlas.changeForecastHorizon(y)}
                >
                  {forecastHorizonLabel(y)}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 3, opacity: 0.7, margin: '4px 0', lineHeight: 1.4 }}>
              {atlas.worldForecast.buildingCount} buildings · {atlas.worldForecast.districtCount} districts
            </p>
            <button
              type="button"
              className="swa__planner-btn is-primary"
              style={{ marginTop: 6 }}
              onClick={() => atlas.addVisionConcept('Experimental Headquarters™')}
            >
              + FUTURE VISION™ CONCEPT
            </button>
          </aside>
        ) : null}

        <aside className="swa__orb" aria-label="Studio Orb world guide">
          <div className="swa__orb-sphere" aria-hidden />
          <p className="swa__orb-title">
            {showPlanner ? 'STUDIO ORB™ · MASTER PLANNER' : 'STUDIO ORB™ · WORLD GUIDE'}
          </p>
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
              {showPlanner ? (
                <div
                  className="swa__expansion-zone"
                  style={{ left: '15%', top: '18%', width: '70%', height: '65%' }}
                  aria-hidden
                />
              ) : null}
              <svg className="swa__roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {roadPaths.map((d, i) => (
                  <path
                    key={`r-${i}`}
                    className={`swa__road${atlas.view.travelingRoads ? ' is-illuminated' : ''}`}
                    d={d}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {atlas.plannerRoadPaths.map((d, i) => (
                  <path
                    key={`p-${i}`}
                    className="swa__road is-potential"
                    d={d}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
              <div className="swa__buildings">
                {atlas.visibleNodes.map((node) => (
                  <BuildingMarker
                    key={node.id}
                    node={node}
                    focusNodeId={selectedNodeId ?? atlas.focusNode.id}
                    onSelect={handleSelect}
                    draggable={showPlanner && !!node.planId}
                    onDrag={atlas.movePlanReservation}
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

        {!showPlanner ? (
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
        ) : null}

        <p className="swa__fog-legend">
          {showPlanner
            ? `MASTER PLANNER™ · ${atlas.discovery.masterPlan.length} reserved · ${atlas.discovery.futureVisionConcepts.length} vision concepts`
            : `FOG OF DISCOVERY™ · ${atlas.discovery.discoveredNodeIds.length} revealed · ${atlas.discovery.collectibles.length} collectibles`}
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

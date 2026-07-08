import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { ensureProjectGenome, resolveActiveProjectGenome } from '../../../../studio-os-core/project-genome';
import type { SceneStackLayerId } from '../../../../studio-os-core/scene-stack';
import type { CommandCenterCameraZoneId } from '../../../../studio-os-core/studio-command-center';
import { useSceneStack } from '../../../../hooks/useSceneStack';
import { useCdsImmersion } from '../../../../hooks/useCdsImmersion';
import { SceneStackViewport } from '../../studio-os/creative-direction-studio/SceneStackViewport';
import { CDS_GENESIS_INTERACTION_STYLES } from '../../studio-os/creative-direction-studio/cdsInteractionLayerTheme';
import { CDS_IMMERSION_STYLES } from '../../studio-os/creative-direction-studio/cdsImmersionTheme';
import { DEPARTMENT_SLICE_STYLES } from '../../studio-os/department-vertical-slice/departmentSliceTheme';
import {
  ADMIN_STUDIO_DASHBOARD_FOOTER,
  ADMIN_STUDIO_DASHBOARD_METRIC,
} from '../../../../utils/adminStudioDemo';
import {
  getModulesForGroup,
  STUDIO_NAV_GROUPS,
} from '../../../../utils/adminStudioNavigation';
import { buildDailyBriefingLines } from '../../../../studio-os-core/headquarters-principles';
import { getWorkspaceStudioHubFooter, getWorkspaceStudioHubSubtitle } from '../../../../studio-os-core/workspace/loader';
import { OrganizationPulseCore } from './OrganizationPulseCore';
import { COMMAND_CENTER_DESTINATION_STYLES } from './commandCenterDestinationTheme';
import {
  COMMAND_CENTER_CAMERA_ZONES,
  commandCenterZonePanVw,
  getCommandCenterZone,
} from './commandCenterCameraZones';
import {
  COMMAND_CENTER_WING_PORTALS,
  commandCenterTotalModules,
  commandCenterWingCount,
  type CommandCenterWingId,
} from './commandCenterWings';

const DEPARTMENT_ID = 'studio-command-center';

function hotspotStyle(bounds: { left: string; top: string; width: string; height: string }): CSSProperties {
  return bounds;
}

/**
 * Studio Command Center™ / Executive Atrium™ — founder operational arrival space.
 * Not a dashboard. Not cards. Physical command center inside Studio World™.
 */
export function StudioCommandCenterRoom() {
  const navigate = useNavigate();
  const { workspace, workspaceId } = useWorkspace();

  const [arrivalComplete, setArrivalComplete] = useState(false);
  const [activeZoneId, setActiveZoneId] = useState<CommandCenterCameraZoneId>('threshold');
  const [focusedWingId, setFocusedWingId] = useState<CommandCenterWingId | null>(null);

  useEffect(() => {
    ensureProjectGenome(DEPARTMENT_ID);
  }, []);

  const project = useMemo(() => resolveActiveProjectGenome(DEPARTMENT_ID), []);
  const stack = useSceneStack(DEPARTMENT_ID, project.projectId, workspaceId);
  const immersion = useCdsImmersion(true, stack.isAnyPipelineActive);

  useEffect(() => {
    document.body.classList.add('scc-world-active');
    document.body.classList.remove('cds-stack-active', 'cds-genesis-active', 'wh-world-active');
    return () => document.body.classList.remove('scc-world-active');
  }, []);

  const hubSubtitle = getWorkspaceStudioHubSubtitle(workspace);
  const hubFooter = getWorkspaceStudioHubFooter(workspace) || ADMIN_STUDIO_DASHBOARD_FOOTER;
  const studioPulse = workspace.id === 'frontal-slayer' ? ADMIN_STUDIO_DASHBOARD_METRIC : 12;
  const totalModules = useMemo(() => commandCenterTotalModules(), []);
  const liveSystems = useMemo(
    () => STUDIO_NAV_GROUPS.reduce((sum, g) => sum + getModulesForGroup(g.id).filter((m) => m.status === 'live').length, 0),
    []
  );
  const companyHealthPct = useMemo(
    () => Math.min(98, 68 + Math.round(totalModules / 8)),
    [totalModules]
  );

  const activeZone = useMemo(() => getCommandCenterZone(activeZoneId), [activeZoneId]);
  const cameraPan = commandCenterZonePanVw(activeZone);
  const activePipeline = useMemo(
    () => stack.getStationPipelineProgress(activeZoneId),
    [stack, activeZoneId]
  );
  const stackButtonBusy = stack.isStationPipelineActive(activeZoneId);

  const pulseMetrics = useMemo(
    () => [
      { label: 'STUDIO PULSE', value: String(studioPulse), accent: true },
      { label: 'ACTIVE WINGS', value: String(commandCenterWingCount()) },
      { label: 'MODULES', value: String(totalModules) },
      { label: 'LIVE SYSTEMS', value: String(liveSystems) },
      { label: 'COMPANY HEALTH', value: `${companyHealthPct}%`, accent: true },
      { label: 'DEPARTMENTS', value: String(STUDIO_NAV_GROUPS.length) },
    ],
    [companyHealthPct, liveSystems, studioPulse, totalModules]
  );

  const briefingLines = useMemo(() => buildDailyBriefingLines(), []);
  const priorityLine = focusedWingId
    ? `PRIORITY · ${COMMAND_CENTER_WING_PORTALS.find((w) => w.id === focusedWingId)?.label ?? 'WING'}`
    : briefingLines[0] ?? 'WHAT SHOULD THE FOUNDER REVIEW FIRST TODAY?';

  const focusedModules = useMemo(() => {
    if (!focusedWingId) return [];
    const groupMap: Partial<Record<CommandCenterWingId, typeof STUDIO_NAV_GROUPS[number]['id']>> = {
      create: 'create',
      intelligence: 'intelligence',
      distribution: 'distribution',
      operations: 'production',
      'studio-archives': 'legacy',
    };
    if (focusedWingId === 'studio-archives') {
      return [
        ...getModulesForGroup('legacy', { overviewOnly: true }),
        ...getModulesForGroup('visuals', { overviewOnly: true }).filter(
          (m) => m.id === 'studio-warehouse' || m.id === 'studio-museum'
        ),
      ].slice(0, 5);
    }
    if (focusedWingId === 'creative-direction') {
      return getModulesForGroup('visuals', { overviewOnly: true }).filter((m) => m.id.includes('creative') || m.title.includes('CREATIVE')).slice(0, 3);
    }
    if (focusedWingId === 'customer-experience') {
      return getModulesForGroup('overview', { overviewOnly: true }).filter((m) => m.id.includes('experience')).slice(0, 3);
    }
    if (focusedWingId === 'finance') {
      return getModulesForGroup('overview', { overviewOnly: true }).filter(
        (m) => m.id.includes('health') || m.id.includes('pulse') || m.id === 'mission-control'
      ).slice(0, 4);
    }
    const gid = groupMap[focusedWingId];
    return gid ? getModulesForGroup(gid, { overviewOnly: true }).slice(0, 4) : [];
  }, [focusedWingId]);

  const completeArrival = useCallback(() => {
    setArrivalComplete(true);
    setActiveZoneId('executive-atrium');
  }, []);

  const goToZone = useCallback(
    (zoneId: CommandCenterCameraZoneId) => {
      const zone = getCommandCenterZone(zoneId);
      if (zone.requiresArrival && !arrivalComplete) return;
      setActiveZoneId(zoneId);
    },
    [arrivalComplete]
  );

  const enterWing = useCallback(
    (wingId: CommandCenterWingId, navigateNow = false) => {
      const wing = COMMAND_CENTER_WING_PORTALS.find((w) => w.id === wingId);
      if (!wing) return;
      if (navigateNow) {
        navigate(wing.resolveRoute());
        return;
      }
      setFocusedWingId((prev) => (prev === wingId ? null : wingId));
    },
    [navigate]
  );

  const renderZoneInteractions = (zoneId: CommandCenterCameraZoneId) => {
    switch (zoneId) {
      case 'threshold':
        return (
          <div
            className="scc-world__hotspot scc-world__hotspot--ghost"
            style={hotspotStyle({ left: '26%', top: '58%', width: '48%', height: '14%' })}
          >
            {!arrivalComplete ? (
              <button type="button" className="scc-world__enter-btn" onClick={completeArrival}>
                Enter Executive Atrium™ →
              </button>
            ) : (
              <button type="button" className="scc-world__enter-btn" onClick={() => goToZone('executive-atrium')}>
                Continue to Command Center™ →
              </button>
            )}
          </div>
        );

      case 'executive-atrium':
        return (
          <>
            <div
              className="scc-world__hotspot scc-world__hotspot--ghost"
              style={hotspotStyle({ left: '8%', top: '6%', width: '84%', height: '10%' })}
            >
              <div className="scc-world__env-display">{hubFooter}</div>
            </div>

            <div
              className="scc-world__hotspot scc-world__hotspot--ghost"
              style={hotspotStyle({ left: '30%', top: '32%', width: '40%', height: '36%' })}
            >
              <OrganizationPulseCore
                metrics={pulseMetrics}
                priorityLine={priorityLine}
                workspaceName={workspace.displayName.toUpperCase()}
              />
            </div>

            {COMMAND_CENTER_WING_PORTALS.map((wing) => (
              <div
                key={wing.id}
                className="scc-world__hotspot"
                style={hotspotStyle(wing.bounds)}
              >
                <button
                  type="button"
                  className={`scc-wing-portal${focusedWingId === wing.id ? ' is-focused' : ''}`}
                  onClick={() => enterWing(wing.id)}
                  onDoubleClick={() => enterWing(wing.id, true)}
                  title={`${wing.label} — double-click to enter`}
                >
                  <span className="scc-wing-portal__icon" aria-hidden>{wing.icon}</span>
                  <p className="scc-wing-portal__label">{wing.label}</p>
                  <p className="scc-wing-portal__tagline">{wing.tagline}</p>
                  <p className="scc-wing-portal__stat">
                    {wing.moduleCount()} modules · {wing.liveCount()} live
                  </p>
                </button>
              </div>
            ))}

            <div
              className="scc-world__hotspot scc-world__hotspot--ghost"
              style={hotspotStyle({ left: '18%', top: '72%', width: '64%', height: '18%' })}
            >
              <button
                type="button"
                className="scc-world__enter-btn"
                onClick={() => navigate('/admin/studio/world-atlas')}
              >
                Studio World Atlas™ — Holographic Table →
              </button>
            </div>

            {focusedWingId && focusedModules.length > 0 ? (
              <div className="scc-world__station-list">
                <p style={{ fontSize: 5, color: '#c9a962', margin: '0 0 6px' }}>
                  {COMMAND_CENTER_WING_PORTALS.find((w) => w.id === focusedWingId)?.label} · STATIONS
                </p>
                {focusedModules.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    className="scc-world__station-btn"
                    onClick={() => navigate(mod.route)}
                  >
                    {mod.title} · {mod.metric}
                  </button>
                ))}
                <button
                  type="button"
                  className="scc-world__station-btn"
                  style={{ borderColor: 'rgba(201,169,98,0.5)', color: '#c9a962' }}
                  onClick={() => {
                    const wing = COMMAND_CENTER_WING_PORTALS.find((w) => w.id === focusedWingId);
                    if (wing) navigate(wing.resolveRoute());
                  }}
                >
                  Enter Wing →
                </button>
              </div>
            ) : null}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{DEPARTMENT_SLICE_STYLES}</style>
      <style>{CDS_GENESIS_INTERACTION_STYLES}</style>
      <style>{CDS_IMMERSION_STYLES}</style>
      <style>{COMMAND_CENTER_DESTINATION_STYLES}</style>
      <div className="scc-world" onPointerMove={immersion.onPointerMove} style={immersion.parallaxStyle}>
        <header className="scc-world__hud">
          <button
            type="button"
            className="scc-world__back"
            onClick={() => navigate('/admin/dashboard')}
            aria-label="Exit Executive Atrium"
          >
            ←
          </button>
          <div className="scc-world__identity">
            <p className="scc-world__title">Studio Command Center™</p>
            <p className="scc-world__sub">{hubSubtitle}</p>
          </div>
          <button
            type="button"
            className="scc-world__pill-btn"
            onClick={() => navigate('/admin/studio/world-atlas')}
          >
            Studio World Atlas™
          </button>
          <button
            type="button"
            className="scc-world__pill-btn"
            onClick={() => navigate('/admin/studio/experience-observatory')}
          >
            Experience Observatory™
          </button>
          <button
            type="button"
            className="scc-world__pill-btn"
            onClick={() => navigate('/admin/studio/architecture-observatory')}
          >
            Architecture Observatory™
          </button>
          <button
            type="button"
            className={`scc-world__pill-btn${stackButtonBusy ? ' is-building' : ''}`}
            onClick={() => void stack.ensureStation(activeZoneId)}
            disabled={stackButtonBusy}
            aria-busy={stackButtonBusy}
          >
            {stackButtonBusy
              ? `Stacking ${activePipeline.currentLayerLabel ?? 'shell'}…`
              : `Stack ${stack.readyStationCount}/${stack.totalStationCount}`}
          </button>
        </header>

        <div className="scc-world__camera">
          <div
            className="scc-world__camera-track"
            style={{ transform: `translate3d(-${cameraPan}vw, 0, 0)` }}
          >
            {COMMAND_CENTER_CAMERA_ZONES.map((zone) => {
              const locked = zone.requiresArrival && !arrivalComplete;
              return (
                <section
                  key={zone.id}
                  className={`scc-world__zone-panel${activeZoneId === zone.id ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
                  aria-label={zone.label}
                >
                  <SceneStackViewport
                    layers={stack.getLayerViews(zone.id)}
                    status={stack.getCompositeStatus(zone.id)}
                    stationLabel={zone.label}
                    parallaxStyle={activeZoneId === zone.id ? immersion.parallaxStyle : undefined}
                    pipeline={
                      activeZoneId === zone.id ? stack.getStationPipelineProgress(zone.id) : undefined
                    }
                    sceneGraph={
                      activeZoneId === zone.id ? stack.getStationSceneGraph(zone.id) : undefined
                    }
                    debugView={stack.debugView}
                    onDebugToggle={stack.toggleDebugView}
                    onDebugLayerToggle={stack.toggleDebugViewLayer}
                    compilationHeadline={
                      activeZoneId === zone.id
                        ? stack.getStationCompileReport(zone.id)?.headline
                        : undefined
                    }
                    sceneIntegrityPct={
                      activeZoneId === zone.id
                        ? stack.getStationCompileReport(zone.id)?.sceneIntegrityPct
                        : undefined
                    }
                    onRegenerateLayer={(layerId) =>
                      void stack.regenerateLayer(zone.id, layerId as SceneStackLayerId)
                    }
                  />
                  <div className="scc-world__interaction-layer">{renderZoneInteractions(zone.id)}</div>
                </section>
              );
            })}
          </div>
        </div>

        {arrivalComplete ? (
          <nav style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 18, display: 'flex', gap: 6 }}>
            {COMMAND_CENTER_CAMERA_ZONES.filter((z) => !z.requiresArrival || arrivalComplete).map((zone) => (
              <button
                key={zone.id}
                type="button"
                className={`scc-world__pill-btn${activeZoneId === zone.id ? '' : ''}`}
                style={{
                  opacity: activeZoneId === zone.id ? 1 : 0.55,
                  borderColor: activeZoneId === zone.id ? 'rgba(201,169,98,0.75)' : undefined,
                }}
                onClick={() => goToZone(zone.id)}
              >
                {zone.shortLabel}
              </button>
            ))}
          </nav>
        ) : null}
      </div>
    </>
  );
}

import { useMemo, useState } from 'react';
import { DESKTOP_DEBUG_REGISTRY } from '../../constants/desktopDebugRegistry';
import type { MansionDebugRegion } from '../../types/desktopMansionDebug';
import { useMansionDebug } from './MansionDebugProvider';
import { MansionDebugEditableRect } from './MansionDebugEditableRect';
import { MansionDebugRegionOverlay } from './MansionDebugRegionOverlay';

function regionMatchesViewport(region: MansionDebugRegion, viewportPage: string, viewportZone?: string): boolean {
  if (region.page !== viewportPage) return false;
  if (region.pageZone && region.pageZone !== viewportZone) return false;
  return true;
}

export function MansionDebugLayer() {
  const debug = useMansionDebug();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const visibleRegions = useMemo(() => {
    if (!debug?.available || !debug.enabled || !debug.viewport) return [];

    const { page, pageZone } = debug.viewport;
    const combined = [...DESKTOP_DEBUG_REGISTRY, ...debug.runtimeRegions];

    return combined
      .filter((region) => {
        if (!regionMatchesViewport(region, page, pageZone)) return false;
        if (debug.pageFilter !== 'all' && region.page !== debug.pageFilter) return false;
        if (!debug.filters[region.filterGroup]) return false;
        return true;
      })
      .map((region) => debug.resolveRegion(region));
  }, [debug]);

  if (!debug?.available || !debug.enabled || !debug.viewport || visibleRegions.length === 0) {
    return null;
  }

  const hovered = visibleRegions.find((region) => region.id === hoveredId) ?? null;

  return (
    <div className={`mansion-debug-layer${debug.editMode ? ' mansion-debug-layer--edit' : ''}`} aria-hidden>
      {visibleRegions.map((region) =>
        debug.editMode ? (
          <MansionDebugEditableRect
            key={region.id}
            measureRef={debug.viewport!.measureRef}
            region={region}
            bounds={region.bounds}
          />
        ) : (
          <MansionDebugRegionOverlay
            key={region.id}
            region={region}
            measureRef={debug.viewport!.measureRef}
            displayMode={debug.displayMode}
            onHoverChange={(active) => setHoveredId(active ? region.id : null)}
          />
        ),
      )}
      {!debug.editMode && hovered ? (
        <div className="mansion-debug-inspect" role="tooltip">
          <p className="mansion-debug-inspect__title">{hovered.label}</p>
          {hovered.component ? <p>Component: {hovered.component}</p> : null}
          {hovered.route ? <p>Route: {hovered.route}</p> : null}
          {hovered.dataSource ? <p>Data: {hovered.dataSource}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

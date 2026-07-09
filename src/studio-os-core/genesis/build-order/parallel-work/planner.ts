import { BUILD_ORDER_PARALLEL_TRACKS } from '../seeds/studio-os-systems';
import { listBuildOrderRegistry } from '../build-order/registry';
import type { ParallelTrack, ParallelWorkView } from '../types';

function isUpstreamReady(
  systemIds: string[],
  byId: Map<string, ReturnType<typeof listBuildOrderRegistry>[number]>
): boolean {
  return systemIds.every((id) => {
    const sys = byId.get(id);
    return sys?.currentStatus === 'implemented';
  });
}

function isSystemReady(system: ReturnType<typeof listBuildOrderRegistry>[number]): boolean {
  return (
    (system.currentStatus === 'planned' || system.currentStatus === 'in_progress') &&
    system.blockedBy.length === 0 &&
    system.implementationReadiness !== 'low'
  );
}

/** Parallel Work Planner™ */
export function getParallelWorkView(): ParallelWorkView {
  const registry = listBuildOrderRegistry();
  const byId = new Map(registry.map((s) => [s.systemId, s]));

  const tracks: ParallelTrack[] = BUILD_ORDER_PARALLEL_TRACKS.map((track) => {
    const upstreamReady = isUpstreamReady([...track.canProceedAfter], byId);
    const readySystemIds: string[] = [];
    const blockedSystemIds: string[] = [];

    for (const systemId of track.systemIds) {
      const system = byId.get(systemId);
      if (!system) continue;
      if (upstreamReady && isSystemReady(system)) {
        readySystemIds.push(systemId);
      } else {
        blockedSystemIds.push(systemId);
      }
    }

    return {
      trackId: track.trackId,
      label: track.label,
      canProceedAfter: [...track.canProceedAfter],
      systemIds: [...track.systemIds],
      readySystemIds,
      blockedSystemIds,
    };
  });

  return {
    tracks,
    readyTrackCount: tracks.filter((t) => t.readySystemIds.length > 0).length,
  };
}

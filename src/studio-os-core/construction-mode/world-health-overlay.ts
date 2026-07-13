import type { HealthOverlayColor } from './contract';
import { HEALTH_OVERLAY_MAP } from './contract';

export const WORLD_HEALTH_OVERLAY_VERSION = 'world-health-overlay.v1';

export type HealthOverlayNode = {
  nodeId: string;
  nodeType: 'asset' | 'socket' | 'subsystem';
  label: string;
  health: HealthOverlayColor;
  healthLabel: string;
};

export function resolveHealthOverlay(health: HealthOverlayColor): { color: HealthOverlayColor; label: string } {
  return HEALTH_OVERLAY_MAP[health];
}

export function buildHealthOverlayNodes(input: {
  assets: Array<{ assetId: string; health: HealthOverlayColor }>;
  sockets: Array<{ socketId: string; health: HealthOverlayColor }>;
}): HealthOverlayNode[] {
  const nodes: HealthOverlayNode[] = [];

  for (const asset of input.assets) {
    const overlay = resolveHealthOverlay(asset.health);
    nodes.push({
      nodeId: asset.assetId,
      nodeType: 'asset',
      label: asset.assetId,
      health: overlay.color,
      healthLabel: overlay.label,
    });
  }

  for (const socket of input.sockets) {
    const overlay = resolveHealthOverlay(socket.health);
    nodes.push({
      nodeId: socket.socketId,
      nodeType: 'socket',
      label: socket.socketId,
      health: overlay.color,
      healthLabel: overlay.label,
    });
  }

  return nodes;
}

export function mapInspectionToHealth(approved: boolean, repairing: boolean, waitingDeps: boolean): HealthOverlayColor {
  if (waitingDeps) return 'purple';
  if (repairing) return 'red';
  if (!approved) return 'yellow';
  return 'green';
}

export function mapJobStatusToHealth(status: string): HealthOverlayColor {
  switch (status) {
    case 'rendering':
    case 'running':
      return 'blue';
    case 'inspecting':
      return 'yellow';
    case 'completed':
      return 'green';
    case 'failed':
      return 'red';
    case 'pending':
    case 'queued':
      return 'gray';
    default:
      return 'purple';
  }
}

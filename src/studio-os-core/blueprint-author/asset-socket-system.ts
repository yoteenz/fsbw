import type { AssetSocket } from '../studio-world-architecture-v2/room-blueprint';

export const ASSET_SOCKET_SYSTEM_VERSION = 'asset-socket-system.v1';

export type SocketPlacementSpec = {
  socketId: string;
  role: AssetSocket['role'];
  label: string;
  bounds: AssetSocket['bounds'];
  compatibleAssetClasses: string[];
  required: boolean;
};

export function defineAssetSockets(sockets: SocketPlacementSpec[]): AssetSocket[] {
  return sockets.map((s) => ({
    socketId: s.socketId,
    role: s.role,
    label: s.label,
    bounds: s.bounds,
    compatibleAssetClasses: s.compatibleAssetClasses,
    required: s.required,
  }));
}

export function assertAssetInSocket(input: {
  assetClass: string;
  socketId: string;
  sockets: AssetSocket[];
}): { ok: true; socket: AssetSocket } | { ok: false; code: string; reason: string } {
  const socket = input.sockets.find((s) => s.socketId === input.socketId);
  if (!socket) {
    return { ok: false, code: 'SOCKET_NOT_FOUND', reason: `Socket ${input.socketId} not in blueprint` };
  }
  if (!socket.compatibleAssetClasses.includes(input.assetClass)) {
    return {
      ok: false,
      code: 'SOCKET_INCOMPATIBLE',
      reason: `${input.assetClass} not compatible with socket ${input.socketId}`,
    };
  }
  return { ok: true, socket };
}

export function listRequiredSockets(sockets: AssetSocket[]): AssetSocket[] {
  return sockets.filter((s) => s.required);
}

export function assertAllRequiredSocketsFilled(input: {
  sockets: AssetSocket[];
  assignedSocketIds: string[];
}): { ok: true } | { ok: false; unfilled: string[] } {
  const required = listRequiredSockets(input.sockets);
  const unfilled = required
    .filter((s) => !input.assignedSocketIds.includes(s.socketId))
    .map((s) => s.socketId);
  if (unfilled.length > 0) return { ok: false, unfilled };
  return { ok: true };
}

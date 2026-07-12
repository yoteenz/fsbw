import type { RoomOperationalStatus, RoomOperationalSubsystem, SubsystemHealthState } from './contract';

export const ROOM_HEALTH_VERSION = 'room-health.v1';

export type SubsystemHealthRecord = {
  subsystem: RoomOperationalSubsystem;
  state: SubsystemHealthState;
  lastCheckedAt: string;
  message: string | null;
};

export type RoomHealthSnapshot = {
  roomId: string;
  organizationId: string;
  buildingId: string;
  floorId: string;
  operationalStatus: RoomOperationalStatus;
  subsystems: SubsystemHealthRecord[];
  overallScore: number;
  computedAt: string;
};

const HEALTH_SCORE: Record<SubsystemHealthState, number> = {
  healthy: 1,
  warning: 0.7,
  repairing: 0.5,
  updating: 0.6,
  critical: 0.2,
  offline: 0,
  unknown: 0.4,
};

export function computeRoomHealth(subsystems: SubsystemHealthRecord[]): {
  operationalStatus: RoomOperationalStatus;
  overallScore: number;
} {
  if (subsystems.length === 0) {
    return { operationalStatus: 'offline', overallScore: 0 };
  }

  const scores = subsystems.map((s) => HEALTH_SCORE[s.state]);
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const architecture = subsystems.find((s) => s.subsystem === 'architecture');
  if (architecture?.state === 'critical' || architecture?.state === 'offline') {
    return { operationalStatus: 'offline', overallScore };
  }

  const anyRepairing = subsystems.some((s) => s.state === 'repairing' || s.state === 'updating');
  if (anyRepairing) {
    return { operationalStatus: 'repairing', overallScore };
  }

  const anyCritical = subsystems.some((s) => s.state === 'critical' || s.state === 'offline');
  if (anyCritical) {
    return { operationalStatus: 'degraded', overallScore };
  }

  const anyWarning = subsystems.some((s) => s.state === 'warning');
  if (anyWarning) {
    return { operationalStatus: 'degraded', overallScore };
  }

  return { operationalStatus: 'online', overallScore };
}

export function buildRoomHealthSnapshot(input: {
  roomId: string;
  organizationId: string;
  buildingId: string;
  floorId: string;
  subsystems: SubsystemHealthRecord[];
}): RoomHealthSnapshot {
  const { operationalStatus, overallScore } = computeRoomHealth(input.subsystems);
  return {
    roomId: input.roomId,
    organizationId: input.organizationId,
    buildingId: input.buildingId,
    floorId: input.floorId,
    operationalStatus,
    subsystems: input.subsystems,
    overallScore,
    computedAt: new Date().toISOString(),
  };
}

export type BuildingHealthSummary = {
  buildingId: string;
  organizationId: string;
  rooms: Array<{ roomId: string; status: RoomOperationalStatus; score: number }>;
  aggregateScore: number;
};

export function summarizeBuildingHealth(rooms: RoomHealthSnapshot[]): BuildingHealthSummary | null {
  if (rooms.length === 0) return null;
  const buildingId = rooms[0].buildingId;
  const organizationId = rooms[0].organizationId;
  const roomSummaries = rooms.map((r) => ({
    roomId: r.roomId,
    status: r.operationalStatus,
    score: r.overallScore,
  }));
  const aggregateScore = roomSummaries.reduce((a, r) => a + r.score, 0) / roomSummaries.length;
  return { buildingId, organizationId, rooms: roomSummaries, aggregateScore };
}

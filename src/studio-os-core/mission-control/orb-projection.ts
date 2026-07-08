import type { MissionControlOrbLine } from './types';
import type { SpatialAnnotation } from './spatial-annotations';

export type OrbProjectionBeam = {
  id: string;
  targetNodeId: string;
  mapX: number;
  mapY: number;
  intensity: number;
  kind: 'highlight' | 'recommendation' | 'narration';
};

export type OrbProjectionCard = {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  targetNodeId?: string;
  mapX: number;
  mapY: number;
};

export type OrbProjectionState = {
  beams: OrbProjectionBeam[];
  cards: OrbProjectionCard[];
  accentLine: string;
};

type BuildOrbProjectionInput = {
  orbLines: MissionControlOrbLine[];
  recommendations: Array<{ id: string; title: string; targetNodeId?: string; priority?: string }>;
  focusAnnotation?: SpatialAnnotation;
  accentLine?: string;
};

export function buildOrbProjection(input: BuildOrbProjectionInput): OrbProjectionState {
  const { orbLines, recommendations, focusAnnotation, accentLine } = input;

  const beams: OrbProjectionBeam[] = [];
  if (focusAnnotation) {
    beams.push({
      id: `beam-${focusAnnotation.nodeId}`,
      targetNodeId: focusAnnotation.nodeId,
      mapX: focusAnnotation.mapX,
      mapY: focusAnnotation.mapY,
      intensity: focusAnnotation.emphasis ? 0.9 : 0.55,
      kind: 'highlight',
    });
  }

  for (const rec of recommendations.slice(0, 3)) {
    if (!rec.targetNodeId) continue;
    beams.push({
      id: `beam-rec-${rec.id}`,
      targetNodeId: rec.targetNodeId,
      mapX: focusAnnotation?.mapX ?? 50,
      mapY: focusAnnotation?.mapY ?? 50,
      intensity: rec.priority === 'critical' || rec.priority === 'high' ? 0.75 : 0.45,
      kind: 'recommendation',
    });
  }

  const cards: OrbProjectionCard[] = orbLines.slice(0, 2).map((line, idx) => ({
    id: line.id,
    message: line.message,
    priority: line.priority,
    targetNodeId: focusAnnotation?.nodeId,
    mapX: 72 + idx * 4,
    mapY: 14 + idx * 8,
  }));

  for (const rec of recommendations.slice(0, 2)) {
    cards.push({
      id: `card-${rec.id}`,
      message: rec.title,
      priority: rec.priority === 'critical' ? 'high' : 'medium',
      targetNodeId: rec.targetNodeId,
      mapX: 68,
      mapY: 28 + cards.length * 6,
    });
  }

  return {
    beams,
    cards,
    accentLine: accentLine ?? 'Orb Projection System™ — intelligence travels through light.',
  };
}

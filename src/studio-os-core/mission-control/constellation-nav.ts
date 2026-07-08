import type { AtlasNode } from '../studio-world-atlas/types';
import type { ConstellationStar } from './types';

export function buildConstellationStars(nodes: AtlasNode[], focusLevel: number): ConstellationStar[] {
  const candidates = nodes.filter(
    (n) => !n.fogged && !n.hidden && n.level <= Math.max(2, focusLevel) && n.extrusion >= 0.35
  );

  return candidates.slice(0, 14).map((node) => ({
    id: `star-${node.id}`,
    title: node.displayName,
    mapX: node.mapX,
    mapY: node.mapY,
    brightness: Math.min(100, 30 + node.extrusion * 55 + (node.activity === 'pulse' ? 20 : 0)),
    orbitCount: node.childIds.length,
    knowledgeBridges: Math.min(6, node.engineIds?.length ?? 1),
    headquarters: node.physicalType.includes('headquarters') || node.level === 2,
  }));
}

export function summarizeConstellationNavigation(stars: ConstellationStar[]): string {
  const hq = stars.filter((s) => s.headquarters).length;
  return `${stars.length} stars · ${hq} headquarters · navigate by constellation, not folders`;
}

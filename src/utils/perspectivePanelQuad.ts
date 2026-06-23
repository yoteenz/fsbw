import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import type { PerspectivePanelPoint, PerspectivePanelQuad } from '../types/perspectivePanel';
import {
  clampQuad,
  clampQuadPoint,
  quadsEqual,
  roundQuadCoord,
  type Quad4,
} from './quadPerspectiveTransform';

export function rectToPerspectivePanelQuad(rect: FinalSceneHitRect): PerspectivePanelQuad {
  const left = rect.left;
  const top = rect.top;
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  return clampPerspectivePanelQuad({
    topLeft: { x: left, y: top },
    topRight: { x: right, y: top },
    bottomRight: { x: right, y: bottom },
    bottomLeft: { x: left, y: bottom },
  });
}

export function perspectivePanelQuadToQuad4(quad: PerspectivePanelQuad): Quad4 {
  return {
    tl: quad.topLeft,
    tr: quad.topRight,
    br: quad.bottomRight,
    bl: quad.bottomLeft,
  };
}

export function quad4ToPerspectivePanelQuad(quad: Quad4): PerspectivePanelQuad {
  return {
    topLeft: quad.tl,
    topRight: quad.tr,
    bottomRight: quad.br,
    bottomLeft: quad.bl,
  };
}

export function clampPerspectivePanelPoint(point: PerspectivePanelPoint): PerspectivePanelPoint {
  return clampQuadPoint(point);
}

export function clampPerspectivePanelQuad(quad: PerspectivePanelQuad): PerspectivePanelQuad {
  const q = clampQuad(perspectivePanelQuadToQuad4(quad));
  return quad4ToPerspectivePanelQuad(q);
}

export function perspectivePanelQuadsEqual(a: PerspectivePanelQuad, b: PerspectivePanelQuad): boolean {
  return quadsEqual(perspectivePanelQuadToQuad4(a), perspectivePanelQuadToQuad4(b));
}

export function formatPerspectivePanelQuadForExport(
  id: string,
  quad: PerspectivePanelQuad,
): string {
  const q = clampPerspectivePanelQuad(quad);
  const fmt = (p: PerspectivePanelPoint) =>
    `{ x: ${roundQuadCoord(p.x)}, y: ${roundQuadCoord(p.y)} }`;
  return `// ${id}
points: {
  topLeft: ${fmt(q.topLeft)},
  topRight: ${fmt(q.topRight)},
  bottomRight: ${fmt(q.bottomRight)},
  bottomLeft: ${fmt(q.bottomLeft)},
},`;
}

export function formatPerspectivePanelMapForExport(map: Record<string, PerspectivePanelQuad>): string {
  const lines = Object.entries(map).map(([id, quad]) => formatPerspectivePanelQuadForExport(id, quad));
  return `{\n${lines.join('\n\n')}\n}`;
}

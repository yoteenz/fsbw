import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import type { SceneHitResizeCorner, SceneHitResizeEdge } from './sceneHitLayoutEditorGestures';

const MIN_NORM = 0.012;

function clampRect(rect: FinalSceneHitRect): FinalSceneHitRect {
  const width = Math.max(MIN_NORM, rect.width);
  const height = Math.max(MIN_NORM, rect.height);
  const left = Math.min(Math.max(0, rect.left), 1 - width);
  const top = Math.min(Math.max(0, rect.top), 1 - height);
  return { left, top, width, height };
}

function normDelta(dx: number, dy: number, containerWidth: number, containerHeight: number) {
  const safeW = containerWidth > 0 ? containerWidth : 1;
  const safeH = containerHeight > 0 ? containerHeight : 1;
  return { ndx: dx / safeW, ndy: dy / safeH };
}

/** Drag the whole TV frame — image-normalized rect (responsive to cover background). */
export function rectFromMoveGesture(
  base: FinalSceneHitRect,
  dx: number,
  dy: number,
  containerWidth: number,
  containerHeight: number,
): FinalSceneHitRect {
  const { ndx, ndy } = normDelta(dx, dy, containerWidth, containerHeight);
  return clampRect({
    ...base,
    left: base.left + ndx,
    top: base.top + ndy,
  });
}

export function rectFromEdgeResizeGesture(
  edge: SceneHitResizeEdge,
  base: FinalSceneHitRect,
  dx: number,
  dy: number,
  containerWidth: number,
  containerHeight: number,
): FinalSceneHitRect {
  const { ndx, ndy } = normDelta(dx, dy, containerWidth, containerHeight);

  switch (edge) {
    case 'e':
      return clampRect({ ...base, width: base.width + ndx });
    case 'w':
      return clampRect({ ...base, left: base.left + ndx, width: base.width - ndx });
    case 's':
      return clampRect({ ...base, height: base.height + ndy });
    case 'n':
      return clampRect({ ...base, top: base.top + ndy, height: base.height - ndy });
  }
}

export function rectFromCornerResizeGesture(
  corner: SceneHitResizeCorner,
  base: FinalSceneHitRect,
  dx: number,
  dy: number,
  containerWidth: number,
  containerHeight: number,
): FinalSceneHitRect {
  const { ndx, ndy } = normDelta(dx, dy, containerWidth, containerHeight);

  switch (corner) {
    case 'se':
      return clampRect({ ...base, width: base.width + ndx, height: base.height + ndy });
    case 'sw':
      return clampRect({
        ...base,
        left: base.left + ndx,
        width: base.width - ndx,
        height: base.height + ndy,
      });
    case 'ne':
      return clampRect({
        ...base,
        top: base.top + ndy,
        width: base.width + ndx,
        height: base.height - ndy,
      });
    case 'nw':
      return clampRect({
        ...base,
        left: base.left + ndx,
        top: base.top + ndy,
        width: base.width - ndx,
        height: base.height - ndy,
      });
  }
}

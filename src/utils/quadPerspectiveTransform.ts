export type Point2 = { x: number; y: number };

export type Quad4 = {
  tl: Point2;
  tr: Point2;
  br: Point2;
  bl: Point2;
};

export type QuadCornerId = keyof Quad4;

const CORNER_ORDER: QuadCornerId[] = ['tl', 'tr', 'br', 'bl'];

export function quadCornerList(quad: Quad4): Point2[] {
  return CORNER_ORDER.map((id) => quad[id]);
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function roundQuadCoord(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function clampQuadPoint(point: Point2): Point2 {
  return {
    x: roundQuadCoord(clamp01(point.x)),
    y: roundQuadCoord(clamp01(point.y)),
  };
}

export function clampQuad(quad: Quad4): Quad4 {
  return {
    tl: clampQuadPoint(quad.tl),
    tr: clampQuadPoint(quad.tr),
    br: clampQuadPoint(quad.br),
    bl: clampQuadPoint(quad.bl),
  };
}

export type QuadBBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

export function quadBoundingBox(points: Point2[]): QuadBBox {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0.0001, maxX - minX),
    height: Math.max(0.0001, maxY - minY),
  };
}

/** Quad corners as fractions inside the axis-aligned bounding box (for clip-path). */
export function quadClipPathPolygon(quad: Quad4, bbox: QuadBBox): string {
  const toPct = (p: Point2) => {
    const x = ((p.x - bbox.minX) / bbox.width) * 100;
    const y = ((p.y - bbox.minY) / bbox.height) * 100;
    return `${x}% ${y}%`;
  };
  return `polygon(${toPct(quad.tl)}, ${toPct(quad.tr)}, ${toPct(quad.br)}, ${toPct(quad.bl)})`;
}

function solveLinearSystem8(a: number[][], b: number[]): number[] {
  const n = 8;
  const m = a.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
    }
    if (Math.abs(m[pivot][col]) < 1e-12) continue;
    [m[col], m[pivot]] = [m[pivot], m[col]];

    const div = m[col][col];
    for (let j = col; j <= n; j += 1) m[col][j] /= div;

    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = m[row][col];
      if (factor === 0) continue;
      for (let j = col; j <= n; j += 1) {
        m[row][j] -= factor * m[col][j];
      }
    }
  }

  return m.map((row) => row[n]);
}

/**
 * Homography mapping the unit square (0,0)-(1,0)-(1,1)-(0,1) to an arbitrary quad.
 * Returns 9 coefficients [h0..h8] with h8 = 1.
 */
export function computeHomographyUnitSquareToQuad(dst: [Point2, Point2, Point2, Point2]): number[] {
  const from: [Point2, Point2, Point2, Point2] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];

  const a: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i += 1) {
    const { x, y } = from[i];
    const { x: xp, y: yp } = dst[i];
    a.push([x, y, 1, 0, 0, 0, -xp * x, -xp * y]);
    b.push(xp);
    a.push([0, 0, 0, x, y, 1, -yp * x, -yp * y]);
    b.push(yp);
  }

  const h = solveLinearSystem8(a, b);
  return [...h, 1];
}

/** CSS matrix3d for a unit-square element warped to `dst` quad (same coordinate space as element box). */
export function homographyToMatrix3d(h: number[]): string {
  const a = h[0];
  const b = h[1];
  const c = h[2];
  const d = h[3];
  const e = h[4];
  const f = h[5];
  const g = h[6];
  const h7 = h[7];

  return `matrix3d(${[
    a,
    d,
    0,
    g,
    b,
    e,
    0,
    h7,
    0,
    0,
    1,
    0,
    c,
    f,
    0,
    1,
  ].join(',')})`;
}

export function quadPerspectiveMatrix3d(quad: Quad4, bbox: QuadBBox): string {
  const local: [Point2, Point2, Point2, Point2] = [
    { x: (quad.tl.x - bbox.minX) / bbox.width, y: (quad.tl.y - bbox.minY) / bbox.height },
    { x: (quad.tr.x - bbox.minX) / bbox.width, y: (quad.tr.y - bbox.minY) / bbox.height },
    { x: (quad.br.x - bbox.minX) / bbox.width, y: (quad.br.y - bbox.minY) / bbox.height },
    { x: (quad.bl.x - bbox.minX) / bbox.width, y: (quad.bl.y - bbox.minY) / bbox.height },
  ];
  return homographyToMatrix3d(computeHomographyUnitSquareToQuad(local));
}

export function quadsEqual(a: Quad4, b: Quad4): boolean {
  return CORNER_ORDER.every((id) => a[id].x === b[id].x && a[id].y === b[id].y);
}

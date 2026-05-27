/**
 * H3-aligned **hex prisms** for order/view “pillars” — same H3 resolution as **`hexBinResolution(3.55)`**
 * (h3-js floors fractional res → **3**).
 *
 * Vertices use the same **inset** as land hexes (**`hexMargin`**): each ring vertex is lerped toward the
 * cell center so the footprint **matches** the merged **`hexBinMerge`** mesh (not the full raw H3 outline).
 * Input **`lat`/`lng`** are snapped to **`cellToLatLng(latLngToCell(...))`** so stacks sit in the cell center.
 */

import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshLambertMaterial, Vector3 } from 'three';
import { cellToBoundary, cellToLatLng, latLngToCell } from 'h3-js';

import { ADMIN_GLOBE_ORDER_PILLAR_RGBA } from '@fsbw/adminGlobeOrderPillarColor';

/** Must match **`globe.hexBinResolution(3.55)`** (fractional res floors to **3** in h3-js). */
export const ORDER_PRISM_H3_RES = 3;

/**
 * Must match **`globe.hexMargin(0.04)`** — same lerp as three-globe hex bins toward **`cellToLatLng`** center.
 */
export const ORDER_PRISM_HEX_MARGIN = 0.04;

/** Dark translucent blue — pairs with mint/sky land gradient (same as main app **`ADMIN_GLOBE_ORDER_PILLAR_RGBA`**). */
export const ORDER_PRISM_COLOR = ADMIN_GLOBE_ORDER_PILLAR_RGBA;
/** Views: brand red, translucent. */
export const VIEW_PRISM_COLOR = 'rgba(235, 28, 36, 0.5)';

function parseRgba(rgba: string): { hex: number; opacity: number } {
  const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (m) {
    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    const a = m[4] !== undefined ? Number(m[4]) : 1;
    return { hex: (r << 16) | (g << 8) | b, opacity: a };
  }
  return { hex: 0x1c3e6c, opacity: 0.55 };
}

const orderMatParsed = parseRgba(ORDER_PRISM_COLOR);
const viewMatParsed = parseRgba(VIEW_PRISM_COLOR);

const orderPrismMaterial = new MeshLambertMaterial({
  color: orderMatParsed.hex,
  transparent: true,
  opacity: orderMatParsed.opacity,
  side: DoubleSide,
});
const viewPrismMaterial = new MeshLambertMaterial({
  color: viewMatParsed.hex,
  transparent: true,
  opacity: viewMatParsed.opacity,
  side: DoubleSide,
});

function polarToVec(lat: number, lng: number, relAlt: number, globeR: number): Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lng) * Math.PI) / 180;
  const r = globeR * (1 + relAlt);
  const sinPhi = Math.sin(phi);
  return new Vector3(r * sinPhi * Math.cos(theta), r * Math.cos(phi), r * sinPhi * Math.sin(theta));
}

/**
 * Snap to the **H3 cell center** for this resolution — keeps stacks + postcard aligned with one honeycomb cell.
 */
export function snapLatLngToH3Cell(lat: number, lng: number, res: number): [number, number] {
  const idx = latLngToCell(lat, lng, res);
  return cellToLatLng(idx) as [number, number];
}

/** Drop GeoJSON closing duplicate if present. */
function stripClosingDuplicate(ring: Array<[number, number]>): Array<[number, number]> {
  if (ring.length < 2) return ring;
  const a = ring[0]!;
  const b = ring[ring.length - 1]!;
  if (a[0] === b[0] && a[1] === b[1]) return ring.slice(0, -1);
  return ring;
}

/**
 * Same vertex inset as **`three-globe`** hex bins: lerp each **[lng, lat]** toward cell center.
 */
function applyHexMargin(
  ring: Array<[number, number]>,
  clat: number,
  clng: number,
  margin: number
): Array<[number, number]> {
  const m = Math.max(0, Math.min(1, margin));
  if (m === 0) return ring.map((p) => [p[0], p[1]] as [number, number]);
  return ring.map(([elng, elat]) => {
    const nlng = elng - (elng - clng) * m;
    const nlat = elat - (elat - clat) * m;
    return [nlng, nlat] as [number, number];
  });
}

/**
 * H3 cell ring **[lng, lat][]** with anti-meridian stitch + **hexMargin** inset (matches land mesh).
 */
function h3InsetRingLngLat(lat: number, lng: number, res: number, margin: number): Array<[number, number]> {
  const h3Idx = latLngToCell(lat, lng, res);
  const center = cellToLatLng(h3Idx) as [number, number];
  const clat = center[0];
  const clng = center[1];
  let ring = cellToBoundary(h3Idx, true) as Array<[number, number]>;
  for (const d of ring) {
    const edgeLng = d[0];
    if (Math.abs(clng - edgeLng) > 170) d[0] += clng > edgeLng ? 360 : -360;
  }
  ring = stripClosingDuplicate(ring);
  return applyHexMargin(ring, clat, clng, margin);
}

function pushTri(positions: number[], a: Vector3, b: Vector3, c: Vector3): void {
  positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
}

/**
 * Extruded prism from **`bottomRelAlt`** to **`topRelAlt`** (globe.gl relative altitude, same units as hex bins).
 */
export function buildHexPrismMesh(
  lat: number,
  lng: number,
  bottomRelAlt: number,
  topRelAlt: number,
  globeR: number,
  res: number,
  margin: number,
  isView: boolean
): Mesh {
  const h3Idx = latLngToCell(lat, lng, res);
  const [snapLat, snapLng] = cellToLatLng(h3Idx) as [number, number];
  const ring = h3InsetRingLngLat(snapLat, snapLng, res, margin);
  const n = ring.length;
  if (n < 3) {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(0), 3));
    return new Mesh(g, isView ? viewPrismMaterial : orderPrismMaterial);
  }

  const bottom: Vector3[] = ring.map(([elng, elat]) => polarToVec(elat, elng, bottomRelAlt, globeR));
  const top: Vector3[] = ring.map(([elng, elat]) => polarToVec(elat, elng, topRelAlt, globeR));

  const positions: number[] = [];

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const b0 = bottom[i]!;
    const b1 = bottom[j]!;
    const t0 = top[i]!;
    const t1 = top[j]!;
    pushTri(positions, b0, b1, t0);
    pushTri(positions, b1, t1, t0);
  }

  const b0 = bottom[0]!;
  for (let i = 1; i < n - 1; i++) {
    pushTri(positions, b0, bottom[i + 1]!, bottom[i]!);
  }

  const t0 = top[0]!;
  for (let i = 1; i < n - 1; i++) {
    pushTri(positions, t0, top[i]!, top[i + 1]!);
  }

  const geom = new BufferGeometry();
  geom.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geom.computeVertexNormals();

  const mesh = new Mesh(geom, isView ? viewPrismMaterial : orderPrismMaterial);
  mesh.userData = { lat, lng, isView };
  return mesh;
}

/**
 * H3-aligned **hex prisms** for order/view “pillars” — same H3 resolution as **`hexBinResolution(3.55)`**
 * (h3-js floors fractional res → **3**), so caps match the land honeycomb instead of **`CylinderGeometry`** points.
 */

import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshLambertMaterial, Vector3 } from 'three';
import { cellToBoundary, cellToLatLng, latLngToCell } from 'h3-js';

/** Must match **`globe.hexBinResolution(3.55)`** (fractional res floors to **3** in h3-js). */
export const ORDER_PRISM_H3_RES = 3;

import { ADMIN_GLOBE_ORDER_PILLAR_RGBA } from '@fsbw/adminGlobeOrderPillarColor';

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
 * One H3 cell boundary as **[lng, lat][]** (GeoJSON), anti-meridian stitched like three-globe hex bins.
 */
function h3RingLngLat(lat: number, lng: number, res: number): Array<[number, number]> {
  const h3Idx = latLngToCell(lat, lng, res);
  const ring = cellToBoundary(h3Idx, true) as Array<[number, number]>;
  const center = cellToLatLng(h3Idx) as [number, number];
  const centerLng = center[1];
  for (const d of ring) {
    const edgeLng = d[0];
    if (Math.abs(centerLng - edgeLng) > 170) d[0] += centerLng > edgeLng ? 360 : -360;
  }
  return ring;
}

function pushTri(
  positions: number[],
  a: Vector3,
  b: Vector3,
  c: Vector3
): void {
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
  isView: boolean
): Mesh {
  const ring = h3RingLngLat(lat, lng, res);
  const n = ring.length;
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

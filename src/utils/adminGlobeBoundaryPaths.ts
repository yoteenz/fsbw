/**
 * Country / land international boundary polylines from Natural Earth 110m admin lines GeoJSON.
 * Used for globe.gl `pathsData` (gradient strokes) and optionally SVG.
 */

export type LatLngPair = [number, number];

const CDN_PATH =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_boundary_lines_land.geojson';
const LOCAL_PATH = '/ne_110m_admin_0_boundary_lines_land.geojson';

function wrapLng(lng: number): number {
  let x = lng;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

/** GeoJSON positions are [lng, lat]. Output [lat, lng] for globe paths. */
function ringToPath(ring: number[][]): LatLngPair[] {
  const out: LatLngPair[] = [];
  for (const c of ring) {
    if (!Array.isArray(c) || c.length < 2) continue;
    const lng = Number(c[0]);
    const lat = Number(c[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    out.push([lat, wrapLng(lng)]);
  }
  return out.length >= 2 ? out : [];
}

function geometryToPaths(geom: { type?: string; coordinates?: unknown }): LatLngPair[][] {
  const out: LatLngPair[][] = [];
  if (!geom?.coordinates) return out;
  if (geom.type === 'LineString') {
    const p = ringToPath(geom.coordinates as number[][]);
    if (p.length >= 2) out.push(p);
  } else if (geom.type === 'MultiLineString') {
    for (const line of geom.coordinates as number[][][]) {
      const p = ringToPath(line);
      if (p.length >= 2) out.push(p);
    }
  }
  return out;
}

/**
 * Parse admin boundary GeoJSON into path arrays `[[lat,lng], ...][]`.
 * Caps path count for WebGL performance.
 */
export function boundaryPathsFromAdminGeoJson(geo: unknown, maxPaths = 450): LatLngPair[][] {
  const paths: LatLngPair[][] = [];
  const g = geo as { type?: string; features?: unknown[] };
  if (g.type !== 'FeatureCollection' || !Array.isArray(g.features)) return paths;

  for (const f of g.features) {
    if (paths.length >= maxPaths) break;
    const geom = (f as { geometry?: { type?: string; coordinates?: unknown } }).geometry;
    if (!geom) continue;
    for (const p of geometryToPaths(geom as { type?: string; coordinates?: unknown })) {
      if (paths.length >= maxPaths) break;
      paths.push(p);
    }
  }
  return paths;
}

export async function fetchAdminBoundaryLinesGeoJson(basePath = LOCAL_PATH): Promise<unknown> {
  const tryFetch = async (url: string) => {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error(String(res.status));
    return res.json() as Promise<unknown>;
  };
  try {
    return await tryFetch(basePath);
  } catch {
    return tryFetch(CDN_PATH);
  }
}

export async function loadBoundaryPathsForGlobe(maxPaths = 450, basePath = LOCAL_PATH): Promise<LatLngPair[][]> {
  const geo = await fetchAdminBoundaryLinesGeoJson(basePath);
  return boundaryPathsFromAdminGeoJson(geo, maxPaths);
}

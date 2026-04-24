/**
 * Land dots for admin analytics globe from Natural Earth 110m land GeoJSON.
 * Used by the embed (`embed/admin-globe`) and the SVG fallback in the main app.
 */

export type LandSample = { lat: number; lng: number };

type Ring = [number, number][];

function wrapLng(lng: number): number {
  let x = lng;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

function pointInRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  const n = ring.length;
  if (n < 3) return false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i]![0];
    const yi = ring[i]![1];
    const xj = ring[j]![0];
    const yj = ring[j]![1];
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-14) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** GeoJSON Polygon: first ring outer, rest holes. */
function pointInPolygonCoords(lng: number, lat: number, rings: number[][][]): boolean {
  const outer = rings[0] as Ring;
  if (!outer || !pointInRing(lng, lat, outer)) return false;
  for (let h = 1; h < rings.length; h++) {
    const hole = rings[h] as Ring;
    if (hole && pointInRing(lng, lat, hole)) return false;
  }
  return true;
}

/** One GeoJSON MultiPolygon: array of polygons, each polygon = array of rings. */
function pointInMultiPolygon(lng: number, lat: number, multipolygon: number[][][][]): boolean {
  const x = wrapLng(lng);
  for (const polygon of multipolygon) {
    if (pointInPolygonCoords(x, lat, polygon)) return true;
  }
  return false;
}

function collectPolygons(geo: unknown): number[][][][][] {
  const out: number[][][][][] = [];
  const g = geo as { type?: string; features?: unknown[]; geometry?: unknown };
  if (g.type === 'FeatureCollection' && Array.isArray(g.features)) {
    for (const f of g.features) {
      const geom = (f as { geometry?: { type?: string; coordinates?: unknown } }).geometry;
      if (!geom?.coordinates) continue;
      if (geom.type === 'Polygon') out.push([geom.coordinates as number[][][]]);
      else if (geom.type === 'MultiPolygon') out.push(geom.coordinates as number[][][][]);
    }
  } else if (g.type === 'Feature' && g.geometry && typeof g.geometry === 'object') {
    const geom = g.geometry as { type?: string; coordinates?: unknown };
    if (geom.type === 'Polygon' && geom.coordinates) out.push([geom.coordinates as number[][][]]);
    else if (geom.type === 'MultiPolygon' && geom.coordinates) out.push(geom.coordinates as number[][][][]);
  }
  return out;
}

function isLandLatLng(lat: number, lng: number, multipolygons: number[][][][][]): boolean {
  for (const mp of multipolygons) {
    if (pointInMultiPolygon(lng, lat, mp)) return true;
  }
  return false;
}

/**
 * **Uniform random points on the unit sphere**, keep land → spread across **all** continents.
 * Taking the first N land hits along a **Fibonacci** walk clusters on one landmass (spiral is local).
 */
function uniformSphereLandSamples(multipolygons: number[][][][][], maxDots: number): LandSample[] {
  const out: LandSample[] = [];
  /** Deterministic PRNG so SVG/embed match across reloads. */
  let state = 0x6eed_9e37 | (maxDots & 0xffff);
  const u32 = () => {
    state = Math.imul(state ^ (state >>> 13), 0x85eb_ca6b);
    state ^= state >>> 15;
    return state >>> 0;
  };
  const rand01 = () => u32() / 0x1_0000_0000;
  const maxTries = Math.min(4_000_000, Math.max(200_000, maxDots * 400));
  for (let t = 0; t < maxTries && out.length < maxDots; t++) {
    const u = rand01() * 2 - 1;
    const ang = 2 * Math.PI * rand01();
    const rr = Math.sqrt(Math.max(0, 1 - u * u));
    const x = rr * Math.cos(ang);
    const z = rr * Math.sin(ang);
    const lat = (Math.asin(u) * 180) / Math.PI;
    const lng = (Math.atan2(z, x) * 180) / Math.PI;
    if (isLandLatLng(lat, lng, multipolygons)) {
      out.push({ lat, lng: wrapLng(lng) });
    }
  }
  return out;
}

/**
 * Parse ne_110m_land GeoJSON and return up to `maxDots` land samples (uniform on land).
 */
export function landSamplesFromNe110mGeoJson(geo: unknown, maxDots: number): LandSample[] {
  const mp = collectPolygons(geo);
  if (mp.length === 0) return [];
  return uniformSphereLandSamples(mp, maxDots);
}

const DEFAULT_GEO_PATH = '/ne_110m_land.geojson';
const CDN_FALLBACK =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_land.geojson';

export async function fetchNe110mLandGeoJson(basePath = DEFAULT_GEO_PATH): Promise<unknown> {
  const tryFetch = async (url: string) => {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    return res.json() as Promise<unknown>;
  };
  try {
    return await tryFetch(basePath);
  } catch {
    return tryFetch(CDN_FALLBACK);
  }
}

export async function loadLandSamplesForGlobe(maxDots: number, basePath = DEFAULT_GEO_PATH): Promise<LandSample[]> {
  const geo = await fetchNe110mLandGeoJson(basePath);
  return landSamplesFromNe110mGeoJson(geo, maxDots);
}

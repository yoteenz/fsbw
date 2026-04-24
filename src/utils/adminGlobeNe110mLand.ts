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

function densifyRing(ring: Ring, maxSegKm: number): LandSample[] {
  const out: LandSample[] = [];
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const segLen = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(wrapLng(lng2 - lng1));
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
    return R * c;
  };
  const m = ring.length;
  if (m < 2) return out;
  for (let i = 0; i < m - 1; i++) {
    const [lng1, lat1] = ring[i]!;
    const [lng2, lat2] = ring[i + 1]!;
    const km = segLen(lat1, lng1, lat2, lng2);
    const steps = Math.max(1, Math.ceil(km / maxSegKm));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push({
        lat: lat1 + (lat2 - lat1) * t,
        lng: wrapLng(lng1 + wrapLng(lng2 - lng1) * t),
      });
    }
  }
  return out;
}

function boundarySamples(multipolygons: number[][][][][], maxSegKm: number): LandSample[] {
  const pts: LandSample[] = [];
  for (const mp of multipolygons) {
    for (const poly of mp) {
      const outer = poly[0] as Ring | undefined;
      if (!outer) continue;
      pts.push(...densifyRing(outer, maxSegKm));
    }
  }
  return pts;
}

function interiorGridSamples(
  multipolygons: number[][][][][],
  latStep: number,
  lngStep: number,
  maxOut: number
): LandSample[] {
  const out: LandSample[] = [];
  for (let lat = -56; lat <= 74 && out.length < maxOut; lat += latStep) {
    for (let lng = -180; lng < 180 && out.length < maxOut; lng += lngStep) {
      if (isLandLatLng(lat, lng, multipolygons)) {
        out.push({ lat, lng: wrapLng(lng) });
      }
    }
  }
  return out;
}

function strideEvery<T>(arr: T[], maxKeep: number): T[] {
  if (arr.length <= maxKeep) return arr;
  const step = Math.ceil(arr.length / maxKeep);
  const out: T[] = [];
  for (let i = 0; i < arr.length && out.length < maxKeep; i += step) {
    out.push(arr[i]!);
  }
  return out;
}

/**
 * Parse ne_110m_land GeoJSON and return up to `maxDots` land samples.
 * **Interior-first** fine grid so continents read as **filled dot fields**, not coast-only rings;
 * coast samples are capped and appended after interior downsampling.
 */
export function landSamplesFromNe110mGeoJson(geo: unknown, maxDots: number): LandSample[] {
  const mp = collectPolygons(geo);
  if (mp.length === 0) return [];

  const maxCoast = Math.min(2200, Math.max(400, Math.floor(maxDots * 0.14)));
  const interiorBudget = Math.max(0, maxDots - maxCoast);

  /** Dense lat/lng grid over land — fills continent interiors. */
  const interiorAll = interiorGridSamples(mp, 0.32, 0.42, Math.max(interiorBudget * 12, 80_000));
  const interior = strideEvery(interiorAll, interiorBudget);

  const coastAll = boundarySamples(mp, 24);
  const coast = strideEvery(coastAll, maxCoast);

  const merged: LandSample[] = [...interior, ...coast];
  if (merged.length <= maxDots) return merged;
  return merged.slice(0, maxDots);
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

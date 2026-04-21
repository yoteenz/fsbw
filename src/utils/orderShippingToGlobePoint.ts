/**
 * Map order shipping (city/state/country) to a globe coordinate for admin Live View.
 * Uses approximate region centers + deterministic jitter so repeat cities cluster stably (no external geocoder).
 */

const US_STATE_CENTERS: Record<string, [number, number]> = {
  AL: [32.8, -86.8], AK: [64.2, -152.9], AZ: [34.3, -111.7], AR: [34.9, -92.4], CA: [36.8, -119.4],
  CO: [39.0, -105.5], CT: [41.6, -72.7], DE: [38.9, -75.5], FL: [27.8, -81.7], GA: [32.7, -83.4],
  HI: [20.8, -156.3], ID: [44.4, -114.6], IL: [40.0, -89.0], IN: [40.3, -86.1], IA: [42.0, -93.5],
  KS: [38.5, -98.4], KY: [37.8, -84.9], LA: [31.2, -92.3], ME: [45.4, -69.2], MD: [39.0, -76.7],
  MA: [42.4, -71.9], MI: [44.3, -85.4], MN: [46.4, -94.6], MS: [32.7, -89.7], MO: [38.4, -92.5],
  MT: [47.1, -110.0], NE: [41.5, -99.9], NV: [39.4, -116.9], NH: [43.9, -71.6], NJ: [40.1, -74.4],
  NM: [34.5, -106.1], NY: [43.0, -75.5], NC: [35.6, -79.4], ND: [47.4, -100.5], OH: [40.4, -82.8],
  OK: [35.6, -97.5], OR: [44.0, -120.5], PA: [41.0, -77.7], RI: [41.7, -71.5], SC: [33.8, -80.9],
  SD: [44.4, -100.2], TN: [35.8, -86.3], TX: [31.5, -99.5], UT: [39.3, -111.7], VT: [44.0, -72.7],
  VA: [37.5, -78.7], WA: [47.4, -121.5], WV: [38.6, -80.6], WI: [44.6, -89.6], WY: [43.0, -107.5],
  DC: [38.9, -77.0],
};

const COUNTRY_CENTERS: Record<string, [number, number]> = {
  US: [39.8, -98.5],
  USA: [39.8, -98.5],
  CA: [56.1, -106.3],
  CANADA: [56.1, -106.3],
  GB: [54.0, -2.5],
  UK: [54.0, -2.5],
  'UNITED KINGDOM': [54.0, -2.5],
  AU: [-25.0, 133.0],
  AUSTRALIA: [-25.0, 133.0],
  OTHER: [20, 0],
};

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function jitterFromKey(key: string, maxDegLat: number, maxDegLng: number): [number, number] {
  const h = hashString(key);
  const r1 = (h & 0xffff) / 0xffff;
  const r2 = ((h >> 16) & 0xffff) / 0xffff;
  return [(r1 - 0.5) * 2 * maxDegLat, (r2 - 0.5) * 2 * maxDegLng];
}

function normalizeCountry(c: unknown): string {
  const u = String(c ?? '')
    .trim()
    .toUpperCase();
  if (!u) return 'US';
  if (u === 'UNITED STATES' || u === 'UNITED STATES OF AMERICA' || u === 'USA') return 'US';
  if (u === 'CANADA') return 'CA';
  if (u === 'UK' || u === 'UNITED KINGDOM' || u === 'GREAT BRITAIN') return 'GB';
  if (u === 'AUSTRALIA') return 'AU';
  return u.length <= 2 ? u : u.slice(0, 2);
}

function normalizeState(s: unknown): string {
  return String(s ?? '')
    .trim()
    .toUpperCase()
    .slice(0, 2);
}

export type ShippingLike = {
  city?: string;
  state?: string;
  country?: string;
};

export function orderShippingToGlobePoint(ship: ShippingLike | null | undefined): {
  lat: number;
  lng: number;
  label: string;
} | null {
  if (!ship || typeof ship !== 'object') return null;
  const city = String(ship.city ?? '').trim();
  const state = normalizeState(ship.state);
  const countryRaw = normalizeCountry(ship.country);
  const country = countryRaw === 'US' || countryRaw === 'USA' ? 'US' : countryRaw;

  let base: [number, number];
  let jitterKey: string;

  if (country === 'US' && state && US_STATE_CENTERS[state]) {
    base = US_STATE_CENTERS[state];
    jitterKey = `${city}|${state}|US`;
  } else {
    const cc =
      COUNTRY_CENTERS[country] ||
      COUNTRY_CENTERS[String(ship.country ?? '')
        .trim()
        .toUpperCase()] ||
      COUNTRY_CENTERS.OTHER;
    base = cc;
    jitterKey = `${city}|${state}|${country}`;
  }

  const [jLat, jLng] = jitterFromKey(jitterKey, 1.2, 2.0);
  const lat = Math.max(-85, Math.min(85, base[0] + jLat));
  let lng = base[1] + jLng;
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;

  const label = [city, state, countryRaw]
    .filter(Boolean)
    .join(', ')
    .trim() || 'ORDER';

  return { lat, lng, label };
}

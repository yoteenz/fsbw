import type { CarrierLoadBoardResult } from './freightTypes';
import type { TruckDispatchProfile } from '../dispatch/dispatchTypes';
import type { LoadMapData, MapLoadMarker, TruckLocationMarker } from './freightRepositoryTypes';

/** Static US city coordinates — cache only; prefer stored lat/lng from Supabase when present. */
const US_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'atlanta,ga': { lat: 33.749, lng: -84.388 },
  'austin,tx': { lat: 30.2672, lng: -97.7431 },
  'charlotte,nc': { lat: 35.2271, lng: -80.8431 },
  'chicago,il': { lat: 41.8781, lng: -87.6298 },
  'columbus,oh': { lat: 39.9612, lng: -82.9988 },
  'dallas,tx': { lat: 32.7767, lng: -96.797 },
  'detroit,mi': { lat: 42.3314, lng: -83.0458 },
  'houston,tx': { lat: 29.7604, lng: -95.3698 },
  'jacksonville,fl': { lat: 30.3322, lng: -81.6557 },
  'kansas city,mo': { lat: 39.0997, lng: -94.5786 },
  'memphis,tn': { lat: 35.1495, lng: -90.049 },
  'miami,fl': { lat: 25.7617, lng: -80.1918 },
  'nashville,tn': { lat: 36.1627, lng: -86.7816 },
  'phoenix,az': { lat: 33.4484, lng: -112.074 },
  'tampa,fl': { lat: 27.9506, lng: -82.4572 },
};

function cityKey(city: string, state: string): string {
  return `${city.trim().toLowerCase()},${state.trim().toLowerCase()}`;
}

export function resolveCityCoordinates(
  city: string,
  state: string,
  storedLat?: number | null,
  storedLng?: number | null,
): { lat: number; lng: number } | null {
  if (storedLat != null && storedLng != null) {
    return { lat: storedLat, lng: storedLng };
  }
  return US_CITY_COORDS[cityKey(city, state)] ?? null;
}

export function buildLoadMapDataFromResults(
  results: CarrierLoadBoardResult[],
  _truckProfileId?: string,
): LoadMapData {
  const loads: MapLoadMarker[] = [];
  for (const r of results) {
    const pickup = resolveCityCoordinates(r.originCity, r.originState);
    if (pickup) {
      loads.push({
        loadId: r.loadId,
        loadNumber: r.loadNumber,
        lat: pickup.lat,
        lng: pickup.lng,
        kind: 'pickup',
        city: r.originCity,
        state: r.originState,
      });
    }
    const delivery = resolveCityCoordinates(r.destinationCity, r.destinationState);
    if (delivery) {
      loads.push({
        loadId: r.loadId,
        loadNumber: r.loadNumber,
        lat: delivery.lat,
        lng: delivery.lng,
        kind: 'delivery',
        city: r.destinationCity,
        state: r.destinationState,
      });
    }
  }
  return { loads, trucks: [] };
}

export function buildLoadMapDataFromDemo(
  results: CarrierLoadBoardResult[],
  trucks: TruckDispatchProfile[],
  truckProfileId?: string,
): LoadMapData {
  const base = buildLoadMapDataFromResults(results, truckProfileId);
  const selected = truckProfileId ? trucks.find((t) => t.id === truckProfileId) : undefined;
  const truckMarkers: TruckLocationMarker[] = [];

  for (const truck of trucks) {
    if (truck.lastKnownLat != null && truck.lastKnownLng != null) {
      truckMarkers.push({
        truckId: truck.id,
        nickname: truck.nickname,
        lat: truck.lastKnownLat,
        lng: truck.lastKnownLng,
        label: 'LAST KNOWN LOCATION',
        updatedAt: truck.lastKnownLocationAt,
      });
    } else if (truck.nextAvailableCity && truck.nextAvailableState) {
      const coords = resolveCityCoordinates(truck.nextAvailableCity, truck.nextAvailableState);
      if (coords) {
        truckMarkers.push({
          truckId: truck.id,
          nickname: truck.nickname,
          lat: coords.lat,
          lng: coords.lng,
          label: 'LAST KNOWN LOCATION',
          updatedAt: truck.updatedAt,
        });
      }
    }
  }

  if (selected && !truckMarkers.some((t) => t.truckId === selected.id)) {
    const coords =
      selected.lastKnownLat != null && selected.lastKnownLng != null
        ? { lat: selected.lastKnownLat, lng: selected.lastKnownLng }
        : selected.nextAvailableCity && selected.nextAvailableState
          ? resolveCityCoordinates(selected.nextAvailableCity, selected.nextAvailableState)
          : null;
    if (coords) {
      truckMarkers.push({
        truckId: selected.id,
        nickname: selected.nickname,
        lat: coords.lat,
        lng: coords.lng,
        label: 'LAST KNOWN LOCATION',
        updatedAt: selected.lastKnownLocationAt ?? selected.updatedAt,
      });
    }
  }

  return { loads: base.loads, trucks: truckMarkers };
}

export function computeMapBounds(markers: Array<{ lat: number; lng: number }>): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} | null {
  if (!markers.length) return null;
  let minLat = markers[0].lat;
  let maxLat = markers[0].lat;
  let minLng = markers[0].lng;
  let maxLng = markers[0].lng;
  for (const m of markers) {
    minLat = Math.min(minLat, m.lat);
    maxLat = Math.max(maxLat, m.lat);
    minLng = Math.min(minLng, m.lng);
    maxLng = Math.max(maxLng, m.lng);
  }
  const pad = 0.5;
  return { minLat: minLat - pad, maxLat: maxLat + pad, minLng: minLng - pad, maxLng: maxLng + pad };
}

export function projectToMapPercent(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
): { x: number; y: number } {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
  return { x: Math.min(98, Math.max(2, x)), y: Math.min(98, Math.max(2, y)) };
}

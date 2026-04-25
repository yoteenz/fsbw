/**
 * Build **city, region, country** (and optional second line) for admin live globe map labels.
 * Parent sends full `label` for modals; embed/SVG use these fields when zoomed in.
 */

export type GlobePlaceFields = {
  /** Primary map line, e.g. `Los Angeles, CA, United States` */
  placeLine: string;
  /** Secondary line, e.g. `VISITOR` or `ORDER #331` */
  placeDetail?: string;
};

/** Strip common prefixes so the map line is geographic, not the full tooltip. */
export function visitorPlaceFieldsFromHeartbeatLabel(label: string): GlobePlaceFields {
  const s = String(label ?? '').trim();
  const lower = s.toLowerCase();
  let rest = s;
  if (lower.startsWith('visitor ·')) {
    rest = s.slice(10).trim();
  } else if (lower.startsWith('visitor·')) {
    rest = s.slice(8).trim();
  }
  const pathIdx = rest.indexOf(' · ');
  const geo = pathIdx >= 0 ? rest.slice(0, pathIdx).trim() : rest;
  return { placeLine: geo || 'ACTIVE', placeDetail: 'VISITOR' };
}

export function orderPlaceFieldsFromGlobeLabel(label: string): GlobePlaceFields {
  const s = String(label ?? '').trim();
  const sep = s.indexOf(' · ');
  if (sep < 0) return { placeLine: s || 'ORDER', placeDetail: 'ORDER' };
  const detail = s.slice(0, sep).trim();
  const place = s.slice(sep + ' · '.length).trim();
  return { placeLine: place || detail, placeDetail: detail || 'ORDER' };
}

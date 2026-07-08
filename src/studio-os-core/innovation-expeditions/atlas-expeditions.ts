import type { AtlasExpeditionJourney, InnovationExpedition } from './types';

export function resolveAtlasExpeditionJourneys(
  expeditions: InnovationExpedition[],
  activeExpeditionId: string | null
): AtlasExpeditionJourney[] {
  const active = activeExpeditionId
    ? expeditions.find((e) => e.id === activeExpeditionId)
    : expeditions.find((e) => e.featured);

  if (!active) return [];

  return [
    {
      expeditionId: active.id,
      title: active.title,
      routeIntensity: Math.min(100, active.stopCount * 18 + (active.featured ? 20 : 0)),
      activatedBuildings: active.stops.map((s) => s.locationLabel),
      label: `${active.title} — ${active.stopCount} stops · route illuminating`,
    },
  ];
}

export function formatAtlasExpeditionLine(journeys: AtlasExpeditionJourney[]): string | null {
  if (journeys.length === 0) return null;
  const top = journeys[0]!;
  return `Expedition route active — ${top.label}`;
}

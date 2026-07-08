import type { LiveExpeditionEvent } from './types';

export function buildLiveExpeditionEvents(): LiveExpeditionEvent[] {
  const base = new Date();
  const addDays = (d: number) => {
    const dt = new Date(base);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString();
  };

  return [
    {
      id: 'live-founder-talk',
      type: 'founder-talk',
      title: 'Founder Talks™ — Luxury Beauty Evolution',
      scheduledAt: addDays(2),
      host: 'Studio Archives™',
      seatsRemaining: 48,
    },
    {
      id: 'live-arch-review',
      type: 'architecture-review',
      title: 'Architecture Reviews™ — Headquarters Growth Patterns',
      scheduledAt: addDays(5),
      host: 'Command Center™',
      seatsRemaining: 24,
    },
    {
      id: 'live-marketplace',
      type: 'marketplace-spotlight',
      title: 'Marketplace Spotlights™ — Bestseller Lineage Tour',
      scheduledAt: addDays(7),
      host: 'Marketplace Pavilion™',
      seatsRemaining: 120,
    },
    {
      id: 'live-museum-night',
      type: 'museum-night',
      title: 'Museum Nights™ — Innovation Lineage After Dark',
      scheduledAt: addDays(10),
      host: 'Museum Wing™',
      seatsRemaining: 64,
    },
  ];
}

export function summarizeLiveEvents(events: LiveExpeditionEvent[]): string {
  const upcoming = events.filter((e) => new Date(e.scheduledAt) > new Date()).length;
  return `${events.length} live events scheduled · ${upcoming} upcoming`;
}

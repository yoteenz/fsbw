import type { MuseumExhibit } from './types';

export function resolveMuseumHistorianQuote(
  exhibit: MuseumExhibit | null,
  context: 'enter' | 'timeline' | 'replay' | 'marketplace' | 'idle'
): string {
  if (!exhibit) {
    return 'Welcome to Studio Museum™ — where your company remembers who it became.';
  }

  if (exhibit.historianQuotes.length > 0 && context !== 'idle') {
    const idx =
      context === 'enter' ? 0 : context === 'timeline' ? 1 : context === 'replay' ? 2 : 3;
    return exhibit.historianQuotes[idx] ?? exhibit.historianQuotes[0]!;
  }

  const fallbacks: Record<string, string> = {
    enter: `This was your ${exhibit.type === 'golden-build' ? 'first Golden Build™' : 'historic milestone'}: ${exhibit.title}.`,
    timeline: `Watch ${exhibit.company} evolve from ${exhibit.timeline[0]?.label ?? 'the beginning'} to ${exhibit.timeline[exhibit.timeline.length - 1]?.label ?? 'today'}.`,
    replay: `Replay Mode™ — relive every decision from Founder Intent™ through Launch™.`,
    marketplace: exhibit.marketplace
      ? `This creation influenced ${exhibit.marketplace.companiesUsing} companies and generated $${exhibit.marketplace.revenueUsd.toLocaleString()} in marketplace revenue.`
      : 'This masterpiece remains private to your organization — a preserved legacy.',
    idle: 'The Museum Orb tells your story. Select an exhibit to begin.',
  };

  return fallbacks[context] ?? fallbacks.idle;
}

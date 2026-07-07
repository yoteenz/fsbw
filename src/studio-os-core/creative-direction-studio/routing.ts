import type { CreativeConciergeId } from './types';

export function routeCreativeNote(body: string): CreativeConciergeId {
  const text = body.toLowerCase();
  if (/visual|design|thumbnail|color|layout|packaging|photo|lighting|typography/.test(text)) return 'visual';
  if (/hook|script|caption|copy|rewrite|editorial|tone|wording|corporate|luxurious|authoritative/.test(text)) return 'editorial';
  if (/brand|on-brand|off-brand|ndxbook|voice|identity/.test(text)) return 'brand';
  if (/motion|animation|pacing|reel|cut|camera|trailer/.test(text)) return 'motion';
  if (/campaign|audience|marketing|instagram|social|cta|launch/.test(text)) return 'marketing';
  return 'studio-orb';
}

export function conciergeLabel(id: CreativeConciergeId): string {
  const labels: Record<CreativeConciergeId, string> = {
    visual: 'Visual Concierge™',
    editorial: 'Editorial Concierge™',
    brand: 'Brand Concierge™',
    motion: 'Motion Concierge™',
    marketing: 'Marketing Concierge™',
    'studio-orb': 'Studio Orb · Studio Intelligence™',
  };
  return labels[id];
}

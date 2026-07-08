import type { CommunityExpedition } from './types';

export function buildCommunityExpeditions(): CommunityExpedition[] {
  return [
    {
      id: 'comm-luxury-retail',
      title: 'My Luxury Retail Journey',
      authorName: 'Elena Voss',
      storySummary: 'How we built a million-dollar luxury retail headquarters from Blueprint to Marketplace.',
      marketplaceListed: true,
      rating: 4.9,
    },
    {
      id: 'comm-ai-automation',
      title: 'Our AI Automation System',
      authorName: 'Marcus Chen',
      storySummary: 'Joint innovation expedition — co-invention through Innovation District to enterprise scale.',
      marketplaceListed: false,
      rating: 4.7,
    },
    {
      id: 'comm-frontal-slayer',
      title: 'The Evolution of Frontal Slayer',
      authorName: 'Founder',
      storySummary: 'Community-authored company expedition — idea to enterprise inside Studio World.',
      marketplaceListed: true,
      rating: 5.0,
    },
  ];
}

export function summarizeCommunityExpeditions(expeditions: CommunityExpedition[]): string {
  const listed = expeditions.filter((e) => e.marketplaceListed).length;
  return `${expeditions.length} community expeditions · ${listed} Marketplace experiences`;
}

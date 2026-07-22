import type { LoungeTvContentCollection } from './loungeTvStreamingTypes';
import type { LoungeContentPack } from './loungeTvContentPack';
import { getContentPackById } from './loungeTvContentPack';

export const LOUNGE_TV_CONTENT_COLLECTIONS: LoungeTvContentCollection[] = [
  {
    id: 'getting-started',
    title: 'GETTING STARTED',
    description: 'FIRST EPISODES AND FREE PREVIEWS FOR NEW MEMBERS.',
    packIds: ['psa-welcome-frontal-slayer', 'cutting-lace', 'slay-school-first-install', 'baw-academy-intro'],
  },
  {
    id: 'summer-essentials',
    title: 'SUMMER ESSENTIALS',
    description: 'SEASONAL SLAY — TRENDS, TEXTURE, AND LIGHT STYLING.',
    packIds: ['trend-report-summer', 'styling-layers-demo', 'texture-spotlight-ocean-curl'],
    seasonal: true,
  },
  {
    id: 'vacation-ready',
    title: 'VACATION READY',
    description: 'TRAVEL-FRIENDLY INSTALL AND MAINTENANCE.',
    packIds: ['cleaning-lace', 'melting-lace', 'customer-favorite-middle-part'],
  },
  {
    id: 'beginner-favorites',
    title: 'BEGINNER FAVORITES',
    description: 'CURATED FOR YOUR FIRST SEASON ON FRONTAL SLAYER TV.',
    packIds: ['cutting-lace', 'cleaning-lace', 'baw-academy-intro', 'psa-answers-lace-faq'],
  },
  {
    id: 'editors-picks',
    title: "EDITOR'S PICKS",
    description: 'PSA-SELECTED EPISODES UPDATED WEEKLY IN METADATA.',
    packIds: ['cutting-lace', 'bleaching-knots', 'brand-film-noir', 'product-reveal-soft-wave'],
  },
  {
    id: 'founder-favorites',
    title: 'FOUNDER FAVORITES',
    description: 'STORIES AND SESSIONS FROM THE FOUNDER DESK.',
    packIds: ['founder-story-origin', 'psa-session-lace-qa', 'behind-brand-studio'],
  },
  {
    id: 'psa-favorites',
    title: 'PSA FAVORITES',
    description: 'HAND-PICKED BY YOUR HOST.',
    packIds: ['cutting-lace', 'tinting-lace', 'psa-answers-lace-faq', 'luxury-hair-science-fiber-care'],
  },
  {
    id: 'best-sellers',
    title: 'BEST SELLERS',
    description: 'MOST-REPLAYED LESSONS THIS MONTH (SEED METRICS).',
    packIds: ['cutting-lace', 'plucking-lace', 'color-lab-swatches', 'customer-favorite-middle-part'],
  },
  {
    id: 'color-mastery',
    title: 'COLOR MASTERY',
    description: 'COLOR LAB AND UNDERTONE SCIENCE.',
    packIds: ['color-lab-swatches', 'tinting-lace', 'trend-report-summer'],
  },
  {
    id: 'install-essentials',
    title: 'INSTALL ESSENTIALS',
    description: 'LACE THROUGH MELT — THE CORE INSTALL PATH.',
    packIds: ['cutting-lace', 'bleaching-knots', 'tinting-lace', 'melting-lace', 'extending-install'],
  },
  {
    id: 'holiday-collection',
    title: 'HOLIDAY COLLECTION',
    description: 'LIMITED-TIME SEASONAL PROGRAMMING.',
    packIds: ['trend-report-summer', 'brand-film-noir'],
    seasonal: true,
  },
];

const collectionById = new Map(LOUNGE_TV_CONTENT_COLLECTIONS.map((c) => [c.id, c]));

export function getCollectionById(id: string): LoungeTvContentCollection | undefined {
  return collectionById.get(id);
}

export function packsForCollection(collectionId: string): LoungeContentPack[] {
  const col = getCollectionById(collectionId);
  if (!col) return [];
  return col.packIds
    .map((id) => getContentPackById(id))
    .filter((p): p is LoungeContentPack => Boolean(p));
}

export function collectionsForPack(packId: string): LoungeTvContentCollection[] {
  return LOUNGE_TV_CONTENT_COLLECTIONS.filter((c) => c.packIds.includes(packId));
}

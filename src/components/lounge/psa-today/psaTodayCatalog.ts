import type { PSATodayEpisode, PSATodayMediaSlotKey } from './types';
import { PSA_TODAY_EPISODES } from '../../../content/psa-today';

const byId = new Map(PSA_TODAY_EPISODES.map((ep) => [ep.id, ep]));
const bySlug = new Map(PSA_TODAY_EPISODES.map((ep) => [ep.slug, ep]));
const byPackId = new Map(
  PSA_TODAY_EPISODES.filter((ep) => ep.linkedContentPackId).map((ep) => [
    ep.linkedContentPackId!,
    ep,
  ])
);

export function getAllPsaTodayEpisodes(): PSATodayEpisode[] {
  return PSA_TODAY_EPISODES.filter((ep) => ep.published !== false);
}

export function getPsaTodayEpisodeById(id: string): PSATodayEpisode | undefined {
  return byId.get(id);
}

export function getPsaTodayEpisodeBySlug(slug: string): PSATodayEpisode | undefined {
  return bySlug.get(slug);
}

export function getPsaTodayEpisodeForContentPack(packId: string): PSATodayEpisode | undefined {
  return byPackId.get(packId);
}

export function getFeaturedPsaTodayEpisodes(): PSATodayEpisode[] {
  return getAllPsaTodayEpisodes().filter((ep) => ep.featured);
}

export function getPsaTodayEpisodesByTag(tag: string): PSATodayEpisode[] {
  const needle = tag.toLowerCase();
  return getAllPsaTodayEpisodes().filter((ep) =>
    ep.tags?.some((t) => t.toLowerCase() === needle)
  );
}

/** Resolve a media slot URL for content entry / debug. */
export function resolvePsaTodayMediaSlot(
  episode: PSATodayEpisode,
  slot: PSATodayMediaSlotKey
): string | undefined {
  switch (slot) {
    case 'cameraAPreview':
      return episode.cameraA?.previewVideoUrl;
    case 'cameraAPoster':
      return episode.cameraA?.posterUrl;
    case 'cameraAThumbnail':
      return episode.thumbnailUrl ?? episode.cameraA?.posterUrl;
    case 'classKitImage':
      return episode.classKit?.flatLayImageUrl;
    case 'classKitVideo':
      return episode.classKit?.flatLayVideoUrl;
    case 'cameraBVideo':
      return episode.cameraB?.fullLessonVideoUrl;
    case 'cameraBPoster':
      return episode.cameraB?.posterUrl;
    case 'heroPoster':
      return episode.heroPosterUrl;
    case 'thumbnail':
      return episode.thumbnailUrl;
    case 'mobilePoster':
      return episode.heroPosterUrl ?? episode.thumbnailUrl;
    default:
      return undefined;
  }
}

export function episodeHasPsaTodayFormat(episode: PSATodayEpisode): boolean {
  return Boolean(episode.cameraA || episode.classKit || episode.cameraB);
}

/** Learn-tab row groupings (metadata only — no fake episode libraries). */
export const PSA_TODAY_LEARN_RAILS = [
  { id: 'psa-today', title: 'PSA TODAY' },
  { id: 'new-lessons', title: 'NEW LESSONS' },
  { id: 'lace-frontal', title: 'LACE & FRONTAL EDUCATION' },
] as const;

export function getPsaTodayLearnRailEpisodes(railId: string): PSATodayEpisode[] {
  const all = getAllPsaTodayEpisodes();
  switch (railId) {
    case 'psa-today':
      return all;
    case 'new-lessons':
      return all.filter((ep) => ep.episodeNumber <= 2);
    case 'lace-frontal':
      return all.filter((ep) => ep.tags?.includes('lace') || ep.tags?.includes('plucking'));
    default:
      return [];
  }
}

/** Future Supabase table names — no migration this sprint (local config first). */
export const PSA_TODAY_SUPABASE_TABLES = {
  episodes: 'psa_episodes',
  chapters: 'psa_episode_chapters',
  classKits: 'psa_class_kits',
  classKitItems: 'psa_class_kit_items',
  access: 'psa_episode_access',
  progress: 'psa_episode_progress',
  saved: 'psa_saved_episodes',
} as const;

/** Future admin CMS field groups (documentation only). */
export const PSA_TODAY_ADMIN_FIELD_GROUPS = {
  episode: [
    'title',
    'episodeNumber',
    'shortDescription',
    'cameraA.previewVideoUrl',
    'cameraB.fullLessonVideoUrl',
    'poster',
    'thumbnail',
    'slayTicketCost',
    'published',
  ],
  classKit: ['flatLayImageUrl', 'tools', 'fullKit links'],
  chapters: ['label', 'startSeconds', 'type', 'gated'],
} as const;

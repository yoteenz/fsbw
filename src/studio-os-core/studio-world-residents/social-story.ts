import type { SocialStoryDomainType, SocialStoryOutline } from './types';

export const SOCIAL_STORY_DOMAIN_TYPES: readonly SocialStoryDomainType[] = [
  'OFFICE_TODAY',
  'CONFESSIONAL',
  'MEETING_FOOTAGE',
  'AFTER_HOURS',
  'CLIENT_DAY',
  'CASTING_DAY',
  'PRODUCTION_DAY',
  'OFFICE_RUMOR',
  'PERFORMANCE_REVIEW',
  'NEW_RESIDENT',
  'OFFICE_EVENT',
  'CROSSOVER',
  'CLIENT_ROLE_BEHIND_THE_SCENES',
] as const;

export function createSocialStoryOutline(
  partial: Omit<SocialStoryOutline, 'status'>
): SocialStoryOutline {
  return {
    ...partial,
    status: 'schema_only',
  };
}

export function storyAdvancesAllFourLayers(outline: SocialStoryOutline): boolean {
  const { layers } = outline;
  return Boolean(
    layers.episodicStoryId &&
      layers.characterArcId &&
      layers.relationshipArcId &&
      layers.studioWorldEventId
  );
}

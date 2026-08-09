import type { EducationSeason } from '../types';

/** Resolve required episode ref ids for certification (PSA episode id or care lesson id). */
export function resolveRequiredEpisodeIdsForSeason(season: EducationSeason): string[] {
  const config = season.certification;
  if (config?.requiredEpisodeIds?.length) {
    return config.requiredEpisodeIds;
  }
  return season.episodeSlots
    .map((slot) => slot.psaEpisodeId ?? slot.careLessonId)
    .filter((id): id is string => Boolean(id));
}

export function isSeasonCertificationEnabled(season: EducationSeason): boolean {
  return season.certification?.enabled === true;
}

export function resolveSeasonCertificationTitle(season: EducationSeason, masteryTitle?: string): string {
  if (season.certification?.title) return season.certification.title;
  const mastery = masteryTitle ?? 'Frontal Slayer';
  return `${season.title} — ${mastery} Certified`;
}

export function computeCertificationProgress(
  season: EducationSeason,
  completedEpisodeIds: Set<string> | string[],
): { completed: number; total: number; percent: number; isComplete: boolean } {
  const required = resolveRequiredEpisodeIdsForSeason(season);
  const done = new Set(completedEpisodeIds);
  const completed = required.filter((id) => done.has(id)).length;
  const total = required.length;
  const percent = total > 0 ? (completed / total) * 100 : 0;
  return {
    completed,
    total,
    percent,
    isComplete: total > 0 && completed >= total,
  };
}

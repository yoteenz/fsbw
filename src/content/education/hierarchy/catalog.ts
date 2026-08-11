import type {
  CurriculumBibleEntry,
  EducationMastery,
  EducationSeason,
  HierarchyOverlapIssue,
} from '../types';
import { EDUCATION_MASTERIES } from './masteries';
import { LACE_MASTERY_SEASONS } from './lace/seasons';
import { INSTALL_MASTERY_SEASONS } from './install/seasons';
import { CARE_MASTERY_SEASONS } from './care/seasons';
import { applyCurriculumHierarchyLink } from './curriculumLinks';
import { getAllCurriculumBibleEntries, validateCurriculumRegistry } from '../curriculum/registry';
import { validateEducationHierarchy, validateSeasonReleases } from './validateHierarchy';
import { validatePsaTodayCurriculum } from '../validatePsaTodayCurriculum';
import { PSA_TODAY_EPISODES } from '../../../content/psa-today';
import { getAllCareLessons } from '../care/catalog';

export const ALL_EDUCATION_SEASONS: EducationSeason[] = [
  ...LACE_MASTERY_SEASONS,
  ...INSTALL_MASTERY_SEASONS,
  ...CARE_MASTERY_SEASONS,
];

const masteryById = new Map(EDUCATION_MASTERIES.map((m) => [m.id, m]));
const seasonById = new Map(ALL_EDUCATION_SEASONS.map((s) => [s.id, s]));

export function getAllEducationMasteries(): EducationMastery[] {
  return EDUCATION_MASTERIES.filter((m) => m.published !== false);
}

export function getEducationMasteryById(id: string): EducationMastery | undefined {
  return masteryById.get(id);
}

export function getEducationMasteryBySlug(slug: string): EducationMastery | undefined {
  return EDUCATION_MASTERIES.find((m) => m.slug === slug);
}

export function getAllEducationSeasons(): EducationSeason[] {
  return ALL_EDUCATION_SEASONS;
}

export function getEducationSeasonById(id: string): EducationSeason | undefined {
  return seasonById.get(id);
}

export function getSeasonsForMastery(masteryId: string, options?: { includeHidden?: boolean }): EducationSeason[] {
  return ALL_EDUCATION_SEASONS.filter((s) => {
    if (s.masteryId !== masteryId) return false;
    if (options?.includeHidden) return true;
    if (s.published === false) return false;
    if (s.customerVisible === false) return false;
    return true;
  }).sort((a, b) => a.seasonNumber - b.seasonNumber);
}

export function getPublishedMasteriesWithSeasons(): EducationMastery[] {
  return getAllEducationMasteries().filter((m) =>
    getSeasonsForMastery(m.id).some((s) => s.published !== false)
  );
}

export function getCurriculumBibleEntryWithHierarchy(
  entry: CurriculumBibleEntry
): CurriculumBibleEntry {
  return applyCurriculumHierarchyLink(entry);
}

export function getAllCurriculumBibleEntriesWithHierarchy(): CurriculumBibleEntry[] {
  return getAllCurriculumBibleEntries().map(applyCurriculumHierarchyLink);
}

export function resolvePsaEpisodeForSlot(season: EducationSeason, slotId: string) {
  const slot = season.episodeSlots.find((s) => s.slotId === slotId);
  if (!slot?.psaEpisodeId) return undefined;
  return PSA_TODAY_EPISODES.find((ep) => ep.id === slot.psaEpisodeId);
}

export function resolveSlotPsaEpisode(slot: EducationSeason['episodeSlots'][number]) {
  if (!slot.psaEpisodeId) return undefined;
  return PSA_TODAY_EPISODES.find((ep) => ep.id === slot.psaEpisodeId);
}

export function getReleasedPsaEpisodesForSeason(seasonId: string) {
  const season = getEducationSeasonById(seasonId);
  if (!season) return [];
  return season.episodeSlots
    .map((slot) => resolveSlotPsaEpisode(slot))
    .filter((ep): ep is NonNullable<typeof ep> => Boolean(ep));
}

export { CURRICULUM_HIERARCHY_LINKS } from './curriculumLinks';
export {
  resolveEpisodeReleaseState,
  isEpisodeFullLessonReleased,
  isEpisodePreviewAvailable,
  formatEpisodeReleaseLabel,
  resolveEpisodeTicketCost,
} from './releaseResolver';

export { validateEducationHierarchy, validateSeasonReleases } from './validateHierarchy';

/** Combined curriculum + hierarchy + PSA Today validation for dev tooling. */
export function validateEducationProgram(): HierarchyOverlapIssue[] {
  const curriculumIssues = validateCurriculumRegistry().map(
    (issue): HierarchyOverlapIssue => ({
      kind: issue.kind,
      message: issue.message,
      curriculumCode: issue.curriculumCode,
      details: { entryId: issue.entryId, ...issue.details },
    })
  );
  return [
    ...curriculumIssues,
    ...validateEducationHierarchy(),
    ...validateSeasonReleases(),
    ...validatePsaTodayCurriculum(),
  ];
}

export function seasonUsesPurchaseIncludedAccess(seasonId: string): boolean {
  const season = getEducationSeasonById(seasonId);
  if (!season) return false;
  const mastery = getEducationMasteryById(season.masteryId);
  const config = season.accessConfig;
  if (config?.qualifyingProductEntitlementEnabled && !config?.paidEducationEnabled) {
    return true;
  }
  return mastery?.careAccessModel === 'purchase-included';
}

export function seasonHasDualAccess(seasonId: string): boolean {
  const season = getEducationSeasonById(seasonId);
  if (!season) return false;
  const mastery = getEducationMasteryById(season.masteryId);
  if (mastery?.careAccessModel === 'dual-access') return true;
  const config = season.accessConfig;
  return Boolean(config?.paidEducationEnabled && config?.qualifyingProductEntitlementEnabled);
}

export function getCareLessonForSlot(slot: EducationSeason['episodeSlots'][number]) {
  if (!slot.careLessonId) return undefined;
  return getAllCareLessons().find((l) => l.id === slot.careLessonId);
}

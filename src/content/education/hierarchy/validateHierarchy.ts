import type { HierarchyOverlapIssue } from '../types';
import { EDUCATION_MASTERIES } from './masteries';
import { LACE_MASTERY_SEASONS } from './lace/seasons';
import { INSTALL_MASTERY_SEASONS } from './install/seasons';
import { CARE_MASTERY_SEASONS } from './care/seasons';
import { CURRICULUM_HIERARCHY_LINKS } from './curriculumLinks';
import { getAllCurriculumBibleEntries } from '../curriculum/registry';
import { PSA_TODAY_EPISODES } from '../../../content/psa-today';
import { getAllSlayTips } from '../catalog';
import { getAllCareLessons } from '../care/catalog';
import {
  isEpisodeFullLessonReleased,
  resolveEpisodeReleaseState,
} from './releaseResolver';

const ALL_EDUCATION_SEASONS = [
  ...LACE_MASTERY_SEASONS,
  ...INSTALL_MASTERY_SEASONS,
  ...CARE_MASTERY_SEASONS,
];

function getEducationMasteryById(id: string) {
  return EDUCATION_MASTERIES.find((m) => m.id === id);
}

function getEducationSeasonById(id: string) {
  return ALL_EDUCATION_SEASONS.find((s) => s.id === id);
}

export function validateEducationHierarchy(): HierarchyOverlapIssue[] {
  const issues: HierarchyOverlapIssue[] = [];
  const seasonNumbers = new Map<string, Map<number, string>>();
  const episodeNumbers = new Map<string, Map<number, string>>();
  const psaEpisodeSeasons = new Map<string, string[]>();

  for (const mastery of EDUCATION_MASTERIES) {
    for (const seasonId of mastery.seasonIds) {
      if (!getEducationSeasonById(seasonId)) {
        issues.push({
          kind: 'broken-season-id',
          message: `Mastery ${mastery.id} references missing season ${seasonId}`,
          masteryId: mastery.id,
          seasonId,
        });
      }
    }
  }

  for (const season of ALL_EDUCATION_SEASONS) {
    if (!getEducationMasteryById(season.masteryId)) {
      issues.push({
        kind: 'broken-mastery-id',
        message: `Season ${season.id} references missing mastery ${season.masteryId}`,
        seasonId: season.id,
        masteryId: season.masteryId,
      });
    }

    const masteryMap = seasonNumbers.get(season.masteryId) ?? new Map<number, string>();
    if (masteryMap.has(season.seasonNumber)) {
      issues.push({
        kind: 'duplicate-season-number',
        message: `Duplicate season number ${season.seasonNumber} in mastery ${season.masteryId}`,
        masteryId: season.masteryId,
        seasonId: season.id,
        details: { alsoUsedBy: masteryMap.get(season.seasonNumber) },
      });
    } else {
      masteryMap.set(season.seasonNumber, season.id);
      seasonNumbers.set(season.masteryId, masteryMap);
    }

    if (season.allowSeasonPass && season.episodeSlots.length === 0 && !isCurriculumPendingSeason(season)) {
      issues.push({
        kind: 'season-pass-no-episodes',
        message: `Season ${season.id} allows Season Pass but has no episodes`,
        seasonId: season.id,
      });
    }

    if (
      !season.allowSeasonPass &&
      !season.allowEpisodePurchase &&
      !seasonUsesCareOnlyAccess(season.masteryId)
    ) {
      issues.push({
        kind: 'no-access-path',
        message: `Season ${season.id} has no episode purchase or season pass path`,
        seasonId: season.id,
      });
    }

    const epMap = episodeNumbers.get(season.id) ?? new Map<number, string>();
    for (const slot of season.episodeSlots) {
      const bible = getAllCurriculumBibleEntries().find((e) => e.id === slot.curriculumBibleId);
      if (!bible) {
        issues.push({
          kind: 'broken-episode-id',
          message: `Season slot references missing bible entry ${slot.curriculumBibleId}`,
          seasonId: season.id,
          details: { slotId: slot.slotId },
        });
      }

      if (epMap.has(slot.seasonEpisodeNumber)) {
        issues.push({
          kind: 'duplicate-episode-number',
          message: `Duplicate episode number ${slot.seasonEpisodeNumber} in season ${season.id}`,
          seasonId: season.id,
          details: { alsoUsedBy: epMap.get(slot.seasonEpisodeNumber) },
        });
      } else {
        epMap.set(slot.seasonEpisodeNumber, slot.slotId);
      }

      if (slot.psaEpisodeId && !PSA_TODAY_EPISODES.some((ep) => ep.id === slot.psaEpisodeId)) {
        issues.push({
          kind: 'broken-episode-id',
          message: `Slot references missing PSA episode ${slot.psaEpisodeId}`,
          seasonId: season.id,
          episodeId: slot.psaEpisodeId,
        });
      }

      if (slot.psaEpisodeId) {
        const list = psaEpisodeSeasons.get(slot.psaEpisodeId) ?? [];
        list.push(season.id);
        psaEpisodeSeasons.set(slot.psaEpisodeId, list);
      }

      if (slot.careLessonId && !getAllCareLessons().some((l) => l.id === slot.careLessonId)) {
        issues.push({
          kind: 'broken-episode-id',
          message: `Slot references missing Care lesson ${slot.careLessonId}`,
          seasonId: season.id,
        });
      }
    }
    episodeNumbers.set(season.id, epMap);
  }

  for (const [psaId, seasons] of psaEpisodeSeasons) {
    if (seasons.length > 1) {
      issues.push({
        kind: 'episode-in-multiple-seasons',
        message: `PSA episode ${psaId} assigned to multiple seasons`,
        episodeId: psaId,
        details: { seasons },
      });
    }
  }

  for (const entry of getAllCurriculumBibleEntries()) {
    const link = CURRICULUM_HIERARCHY_LINKS[entry.id];
    if (!link) continue;
    if (!getEducationMasteryById(link.masteryId)) {
      issues.push({
        kind: 'broken-mastery-id',
        message: `Bible ${entry.curriculumCode} links to missing mastery ${link.masteryId}`,
        curriculumCode: entry.curriculumCode,
      });
    }
    if (!getEducationSeasonById(link.seasonId)) {
      issues.push({
        kind: 'broken-season-id',
        message: `Bible ${entry.curriculumCode} links to missing season ${link.seasonId}`,
        curriculumCode: entry.curriculumCode,
      });
    }
    for (const tipId of entry.companionSlayTipIds ?? []) {
      if (!getAllSlayTips().some((t) => t.id === tipId)) {
        issues.push({
          kind: 'missing-companion-slay-tip',
          message: `Bible ${entry.curriculumCode} missing companion tip ${tipId}`,
          curriculumCode: entry.curriculumCode,
        });
      }
    }
  }

  return issues;
}

function seasonUsesCareOnlyAccess(masteryId: string): boolean {
  const mastery = getEducationMasteryById(masteryId);
  return (
    mastery?.careAccessModel === 'purchase-included' ||
    (mastery?.careAccessModel === 'dual-access' &&
      !getEducationSeasonById(mastery.seasonIds[0] ?? '')?.accessConfig?.paidEducationEnabled)
  );
}

function isCurriculumPendingSeason(season: (typeof ALL_EDUCATION_SEASONS)[number]): boolean {
  return season.curriculumStatus === 'curriculum_pending';
}

export function validateSeasonReleases(): HierarchyOverlapIssue[] {
  const issues: HierarchyOverlapIssue[] = [];

  for (const season of ALL_EDUCATION_SEASONS) {
    if (season.status === 'complete') {
      for (const slot of season.episodeSlots) {
        if (!slot.psaEpisodeId) {
          issues.push({
            kind: 'invalid-release-dates',
            message: `Season ${season.id} marked complete but slot ${slot.slotId} has no published episode`,
            seasonId: season.id,
          });
        }
      }
    }

    for (const slot of season.episodeSlots) {
      if (!slot.psaEpisodeId) continue;
      const ep = PSA_TODAY_EPISODES.find((e) => e.id === slot.psaEpisodeId);
      if (!ep) continue;

      const announce = ep.announcementAt ? Date.parse(ep.announcementAt) : NaN;
      const preview = ep.previewAvailableAt ? Date.parse(ep.previewAvailableAt) : NaN;
      const release = ep.releaseAt ? Date.parse(ep.releaseAt) : NaN;

      if (Number.isFinite(announce) && Number.isFinite(release) && announce > release) {
        issues.push({
          kind: 'invalid-release-dates',
          message: `Episode ${ep.id}: announcementAt after releaseAt`,
          episodeId: ep.id,
          seasonId: season.id,
        });
      }

      if (
        Number.isFinite(preview) &&
        Number.isFinite(release) &&
        preview > release &&
        ep.releaseState !== 'released'
      ) {
        issues.push({
          kind: 'invalid-release-dates',
          message: `Episode ${ep.id}: previewAvailableAt after releaseAt (unintended)`,
          episodeId: ep.id,
          seasonId: season.id,
        });
      }

      const state = resolveEpisodeReleaseState(ep);
      if (season.status === 'complete' && !isEpisodeFullLessonReleased(ep)) {
        issues.push({
          kind: 'invalid-release-dates',
          message: `Season ${season.id} complete but episode ${ep.id} not released (${state})`,
          seasonId: season.id,
          episodeId: ep.id,
        });
      }
    }
  }

  return issues;
}

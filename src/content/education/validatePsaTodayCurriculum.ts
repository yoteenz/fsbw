import type { HierarchyOverlapIssue } from './types';
import { PSA_TODAY_EPISODES } from '../psa-today';
import {
  getActiveSignatureUnitEducationProfiles,
  isKnownSignatureUnitId,
} from './signature-units/registry';
import type { PSATodayEpisode, PSAEpisodeChapter } from '../../components/lounge/psa-today/types';

export type PsaTodayCurriculumIssue = HierarchyOverlapIssue;

function chapterOrders(chapters: PSAEpisodeChapter[]): number[] {
  return chapters.map((c, i) => c.order ?? i + 1);
}

function validateEpisodeUnitEducation(episode: PSATodayEpisode): PsaTodayCurriculumIssue[] {
  const issues: PsaTodayCurriculumIssue[] = [];
  const config = episode.unitEducation;
  if (!config?.supportsDynamicUnits) return issues;

  const preferred = config.preferredDemonstrationUnitIds ?? [];
  for (const unitId of preferred) {
    if (!isKnownSignatureUnitId(unitId)) {
      issues.push({
        kind: 'invalid-demonstration-unit',
        message: `Episode ${episode.id} references unknown demonstration unit ${unitId}`,
        episodeId: episode.id,
      });
    }
  }

  if (config.continuityStage && typeof config.continuityStage !== 'string') {
    issues.push({
      kind: 'invalid-continuity-unit',
      message: `Episode ${episode.id} has invalid continuity stage`,
      episodeId: episode.id,
    });
  }

  return issues;
}

function validateChapter(
  episode: PSATodayEpisode,
  chapter: PSAEpisodeChapter,
  index: number
): PsaTodayCurriculumIssue[] {
  const issues: PsaTodayCurriculumIssue[] = [];
  const order = chapter.order ?? index + 1;

  if (chapter.unitSpecificModules) {
    const hasPersonalized = Object.keys(chapter.unitSpecificModules).length > 0;
    const hasShared =
      Boolean(chapter.sharedModule?.mediaUrl || chapter.sharedModule?.posterUrl) ||
      Boolean(chapter.mediaUrl || chapter.posterUrl || chapter.fallbackPosterUrl);

    for (const unitId of Object.keys(chapter.unitSpecificModules)) {
      if (!isKnownSignatureUnitId(unitId)) {
        issues.push({
          kind: 'invalid-signature-unit-ref',
          message: `Chapter ${chapter.id} references unknown unit ${unitId}`,
          episodeId: episode.id,
          details: { chapterId: chapter.id },
        });
        continue;
      }
      const profile = getActiveSignatureUnitEducationProfiles().find((p) => p.unitId === unitId);
      if (!profile) {
        issues.push({
          kind: 'inactive-education-profile',
          message: `Chapter ${chapter.id} references inactive/missing profile for ${unitId}`,
          episodeId: episode.id,
          details: { chapterId: chapter.id, unitId },
        });
      }
    }

    if (hasPersonalized && !hasShared && !chapter.fallbackPosterUrl && !episode.heroPosterUrl) {
      issues.push({
        kind: 'personalized-no-fallback',
        message: `Chapter ${chapter.id} has unit-specific modules but no shared/fallback media`,
        episodeId: episode.id,
        details: { chapterId: chapter.id },
      });
    }
  }

  if (
    !chapter.unitSpecificModules &&
    !chapter.sharedModule &&
    !chapter.mediaUrl &&
    chapter.type === 'camera-b' &&
    episode.unitEducation?.supportsDynamicUnits
  ) {
    issues.push({
      kind: 'missing-shared-fallback',
      message: `Chapter ${chapter.id} lacks shared or fallback media`,
      episodeId: episode.id,
      details: { chapterId: chapter.id },
    });
  }

  if (order < 1) {
    issues.push({
      kind: 'broken-chapter-order',
      message: `Chapter ${chapter.id} has invalid order ${order}`,
      episodeId: episode.id,
      details: { chapterId: chapter.id },
    });
  }

  return issues;
}

function validateEpisodesNotDuplicatedByUnit(episodes: PSATodayEpisode[]): PsaTodayCurriculumIssue[] {
  const issues: PsaTodayCurriculumIssue[] = [];
  const byBase = new Map<string, PSATodayEpisode[]>();

  for (const ep of episodes) {
    if (!ep.unitEducation?.supportsDynamicUnits) continue;
    const key = `${ep.masteryId ?? ''}:${ep.seasonEpisodeNumber ?? ep.episodeNumber}`;
    const list = byBase.get(key) ?? [];
    list.push(ep);
    byBase.set(key, list);
  }

  for (const [key, list] of byBase) {
    if (list.length > 1) {
      issues.push({
        kind: 'duplicated-episode-by-unit',
        message: `Multiple dynamic episodes share slot key ${key} — use ONE canonical episode with unit modules`,
        details: { episodeIds: list.map((e) => e.id) },
      });
    }
  }

  return issues;
}

/** Development validation for PSA Today curriculum + dynamic unit education. */
export function validatePsaTodayCurriculum(
  episodes: PSATodayEpisode[] = PSA_TODAY_EPISODES
): PsaTodayCurriculumIssue[] {
  const issues: PsaTodayCurriculumIssue[] = [];

  for (const episode of episodes) {
    issues.push(...validateEpisodeUnitEducation(episode));

    const chapters = episode.chapters ?? [];
    const orders = chapterOrders(chapters);
    const seen = new Map<number, string>();

    chapters.forEach((ch: PSAEpisodeChapter, index: number) => {
      issues.push(...validateChapter(episode, ch, index));
      const order = ch.order ?? index + 1;
      if (seen.has(order)) {
        issues.push({
          kind: 'duplicate-chapter-number',
          message: `Duplicate chapter order ${order} in episode ${episode.id}`,
          episodeId: episode.id,
          details: { alsoUsedBy: seen.get(order), chapterId: ch.id },
        });
      } else {
        seen.set(order, ch.id);
      }

      if (!ch.id.startsWith(episode.id.split('-ep-')[0]?.replace('psa-', '') ?? '') &&
          !ch.id.includes('care-ep01') &&
          !ch.id.includes('ch-')) {
        // Soft check — chapter ids should be episode-scoped
      }
    });

    for (let i = 1; i < orders.length; i++) {
      if (orders[i] < orders[i - 1]) {
        issues.push({
          kind: 'broken-chapter-order',
          message: `Chapter order not ascending in episode ${episode.id}`,
          episodeId: episode.id,
        });
        break;
      }
    }
  }

  issues.push(...validateEpisodesNotDuplicatedByUnit(episodes));

  return issues;
}

import type { EducationSeason } from '../../../content/education/types';
import { getCareProgress, getCareProgressMap } from '../care/careProgress';
import { getWatchProgressMap, isPackCompleted } from '../../../utils/loungeTvLibrary';
import { getPsaTodayEpisodeById } from '../psa-today/psaTodayCatalog';
import { syncEpisodeCompletion } from './certificationApi';
import { trackEducationHierarchyEvent } from './educationHierarchyAnalytics';

const STORAGE_KEY = 'lounge_season_progress_v1';

type SeasonProgressRow = {
  seasonId: string;
  completedEpisodeIds: string[];
  lastUpdatedAt: number;
  completedAt?: number;
};

function readAll(): Record<string, SeasonProgressRow> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SeasonProgressRow>) : {};
  } catch {
    return {};
  }
}

function writeAll(rows: Record<string, SeasonProgressRow>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    window.dispatchEvent(new Event('loungeSeasonProgressUpdated'));
  } catch {
    /* ignore */
  }
}

export function getSeasonProgress(seasonId: string): SeasonProgressRow | undefined {
  return readAll()[seasonId];
}

export function markSeasonEpisodeCompleted(seasonId: string, episodeOrLessonId: string): void {
  const rows = readAll();
  const prev = rows[seasonId] ?? {
    seasonId,
    completedEpisodeIds: [],
    lastUpdatedAt: Date.now(),
  };
  const set = new Set(prev.completedEpisodeIds);
  set.add(episodeOrLessonId);
  rows[seasonId] = {
    ...prev,
    completedEpisodeIds: [...set],
    lastUpdatedAt: Date.now(),
  };
  writeAll(rows);
  void syncCompletedEpisodeToServer(seasonId, episodeOrLessonId);
}

async function syncCompletedEpisodeToServer(seasonId: string, episodeRefId: string): Promise<void> {
  try {
    const episodeType = episodeRefId.startsWith('care-') ? 'care-lesson' : 'psa-today';
    await syncEpisodeCompletion({ episodeRefId, episodeType, seasonId });
  } catch {
    /* non-blocking */
  }
}

export function getCompletedEpisodeIdsForSeason(season: EducationSeason): string[] {
  const tracked = getSeasonProgress(season.id);
  const completedSet = new Set(tracked?.completedEpisodeIds ?? []);

  const psaProgress = getWatchProgressMap();
  const careProgress = getCareProgressMap();

  for (const slot of season.episodeSlots) {
    if (slot.psaEpisodeId) {
      const ep = getPsaTodayEpisodeById(slot.psaEpisodeId);
      const packId = ep?.linkedContentPackId ?? slot.psaEpisodeId;
      if (isPackCompleted(packId) || (psaProgress[packId]?.percent ?? 0) >= 95) {
        completedSet.add(slot.psaEpisodeId);
      }
    }
    if (slot.careLessonId) {
      const row = careProgress[slot.careLessonId] ?? getCareProgress(slot.careLessonId);
      if (row?.completed) completedSet.add(slot.careLessonId);
    }
  }

  return [...completedSet];
}

export function computeSeasonProgress(season: EducationSeason): {
  completed: number;
  total: number;
  percent: number;
  isComplete: boolean;
} {
  const completedSet = new Set(getCompletedEpisodeIdsForSeason(season));
  const total = season.episodeSlots.length;
  const completed = Math.min(total, completedSet.size);
  const percent = total > 0 ? (completed / total) * 100 : 0;
  return { completed, total, percent, isComplete: total > 0 && completed >= total };
}

export function markSeasonCompletedIfReady(season: EducationSeason): boolean {
  const { isComplete } = computeSeasonProgress(season);
  if (!isComplete) return false;
  const rows = readAll();
  const prev = rows[season.id];
  if (prev?.completedAt) return false;
  rows[season.id] = {
    ...(prev ?? { seasonId: season.id, completedEpisodeIds: [], lastUpdatedAt: Date.now() }),
    completedAt: Date.now(),
    lastUpdatedAt: Date.now(),
  };
  writeAll(rows);
  trackEducationHierarchyEvent('education_season_completed', {
    seasonId: season.id,
    masteryId: season.masteryId,
  });
  return true;
}

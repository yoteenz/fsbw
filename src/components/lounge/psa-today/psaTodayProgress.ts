import {
  getWatchProgress,
  getWatchProgressMap,
  isPackCompleted,
  isPackSaved,
  setWatchProgress,
  togglePackSaved,
} from '../../../utils/loungeTvLibrary';
import type { PSAEpisodeProgress, PSATodayEpisode } from './types';

const CHAPTER_KEY = 'psaTodayEpisodeChapter';

function progressPackId(episode: PSATodayEpisode): string {
  return episode.linkedContentPackId ?? episode.id;
}

export function getPsaEpisodeProgress(episode: PSATodayEpisode): PSAEpisodeProgress {
  const packId = progressPackId(episode);
  const row = getWatchProgress(packId);
  const completed = isPackCompleted(packId);
  return {
    episodeId: episode.id,
    progressSeconds: row?.positionSec ?? 0,
    durationSeconds: row?.durationSec ?? episode.runtimeSeconds,
    completed,
    lastWatchedAt: row?.lastWatchedAt ?? row?.updatedAt ?? 0,
    currentChapterId: readStoredChapter(episode.id),
  };
}

function readStoredChapter(episodeId: string): string | undefined {
  try {
    const raw = localStorage.getItem(CHAPTER_KEY);
    if (!raw) return undefined;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[episodeId];
  } catch {
    return undefined;
  }
}

export function setPsaEpisodeChapter(episodeId: string, chapterId: string): void {
  try {
    const raw = localStorage.getItem(CHAPTER_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[episodeId] = chapterId;
    localStorage.setItem(CHAPTER_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function updatePsaEpisodeProgress(
  episode: PSATodayEpisode,
  positionSec: number,
  options?: { durationSec?: number; chapterId?: string; markComplete?: boolean }
): void {
  const packId = progressPackId(episode);
  setWatchProgress(packId, positionSec, {
    durationSec: options?.durationSec ?? episode.runtimeSeconds,
    markComplete: options?.markComplete,
  });
  if (options?.chapterId) setPsaEpisodeChapter(episode.id, options.chapterId);
}

export function isPsaEpisodeSaved(episode: PSATodayEpisode): boolean {
  const packId = episode.linkedContentPackId ?? episode.id;
  return isPackSaved(packId);
}

export function togglePsaEpisodeSaved(episode: PSATodayEpisode): boolean {
  const packId = episode.linkedContentPackId ?? episode.id;
  return togglePackSaved(packId);
}

export function getContinueWatchingPsaEpisodes(
  episodes: PSATodayEpisode[]
): PSATodayEpisode[] {
  const map = getWatchProgressMap();
  return episodes
    .filter((ep) => {
      const packId = progressPackId(ep);
      const row = map[packId];
      if (!row) return false;
      if (isPackCompleted(packId)) return false;
      return (row.positionSec ?? 0) > 0 && (row.percent ?? 0) < 95;
    })
    .sort((a, b) => {
      const pa = map[progressPackId(a)]?.updatedAt ?? 0;
      const pb = map[progressPackId(b)]?.updatedAt ?? 0;
      return pb - pa;
    });
}

export function computePsaChapterProgress(
  episode: PSATodayEpisode,
  currentChapterId?: string
): { percent: number; currentChapterId?: string; currentChapterLabel?: string } {
  const chapters = (episode.chapters ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (!chapters.length) {
    const progress = getPsaEpisodeProgress(episode);
    const duration = progress.durationSeconds ?? episode.runtimeSeconds ?? 0;
    const pct =
      duration > 0 ? Math.min(100, Math.round((progress.progressSeconds / duration) * 100)) : 0;
    return { percent: pct, currentChapterId: progress.currentChapterId };
  }

  const activeId = currentChapterId ?? readStoredChapter(episode.id) ?? chapters[0]?.id;
  const index = chapters.findIndex((c) => c.id === activeId);
  const safeIndex = index >= 0 ? index : 0;
  const percent = Math.round(((safeIndex + 1) / chapters.length) * 100);

  return {
    percent,
    currentChapterId: chapters[safeIndex]?.id,
    currentChapterLabel: chapters[safeIndex]?.label,
  };
}

export function resumePositionSec(episode: PSATodayEpisode): number {
  const packId = progressPackId(episode);
  const row = getWatchProgress(packId);
  if (!row || isPackCompleted(packId)) return 0;
  if (row.percent != null && row.percent >= 95) return 0;
  return Math.max(0, row.positionSec ?? 0);
}

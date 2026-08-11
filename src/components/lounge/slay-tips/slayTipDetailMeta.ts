import type { SlayTip } from '../../../content/education/types';
import type { PSATodayEpisode } from '../psa-today/types';
import { getEducationMasteryById, getEducationSeasonById } from '../../../content/education';

const PILLAR_CATEGORY_LABEL: Record<string, string> = {
  lace: 'LACE',
  color: 'COLOR',
  style: 'STYLING',
  styling: 'STYLING',
  care: 'CARE',
  installation: 'INSTALLATION',
  install: 'INSTALLATION',
  'after-care': 'UPKEEP',
  upkeep: 'UPKEEP',
};

/** Detail eyebrow category — SLAY TIP · LACE */
export function slayTipDetailCategoryLabel(tip: SlayTip): string {
  const key = String(tip.pillar).toLowerCase();
  if (PILLAR_CATEGORY_LABEL[key]) return PILLAR_CATEGORY_LABEL[key];
  const pillar = String(tip.pillar).trim().toUpperCase();
  return pillar || 'SLAY';
}

export function slayTipPreviewImageUrl(tip: SlayTip): string | undefined {
  return tip.thumbnailUrl ?? tip.coverImageUrl ?? tip.pages?.find((p) => p.imageUrl)?.imageUrl;
}

/** Mastery · Season line for GO DEEPER related class row. */
export function slayTipRelatedClassMetaLine(episode: PSATodayEpisode): string | null {
  const parts: string[] = [];
  const mastery = episode.masteryId ? getEducationMasteryById(episode.masteryId) : undefined;
  const season = episode.seasonId ? getEducationSeasonById(episode.seasonId) : undefined;

  if (mastery?.title) parts.push(mastery.title);
  if (season?.seasonNumber != null) {
    parts.push(`SEASON ${String(season.seasonNumber).padStart(2, '0')}`);
  }

  if (parts.length) return parts.join(' · ');
  if (episode.subtitle?.trim()) return episode.subtitle.trim();
  return null;
}

export function slayTipRelatedClassThumbnail(episode: PSATodayEpisode): string | undefined {
  return (
    episode.thumbnailUrl ??
    episode.heroPosterUrl ??
    episode.cameraA?.posterUrl ??
    undefined
  );
}

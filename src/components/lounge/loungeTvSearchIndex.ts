import {
  getAllCareLessons,
  getAllEducationFamilies,
  getAllEducationMasteries,
  getAllEducationSeasons,
  getAllSlayTips,
} from '../../content/education';
import { LOUNGE_TV_CONTENT_PACKS } from './loungeTvContentPack';
import { LOUNGE_TV_SIDEBAR } from './loungeTvContent';
import { getAllPsaTodayEpisodes } from './psa-today/psaTodayCatalog';
import { listMasteryTrackPresentations } from '../../content/education/hierarchy/masteryTracks';
import { slayTipPublicHaystack, slayTipPublicTitle, slayTipPreviewCopy } from './slay-tips/slayTipContent';

export type LoungeTvSearchResultKind =
  | 'content-pack'
  | 'slay-tip'
  | 'care-lesson'
  | 'psa-episode'
  | 'mastery'
  | 'season'
  | 'education-family';

export type LoungeTvSearchIndexEntry = {
  id: string;
  kind: LoungeTvSearchResultKind;
  entityId: string;
  title: string;
  subtitle?: string;
  typeLabel: string;
  /** Lowercase normalized haystack for token matching. */
  haystack: string;
  /** Lowercase normalized title for prefix / exact scoring. */
  titleNorm: string;
};

const LEARN_PATH_LABELS = Object.fromEntries(
  LOUNGE_TV_SIDEBAR.learn.map((s) => [s.id, s.label]),
) as Record<string, string>;

const EXPLORE_SECTION_LABELS = Object.fromEntries(
  LOUNGE_TV_SIDEBAR.explore.map((s) => [s.id, s.label]),
) as Record<string, string>;

function normalizePart(value: string | number | undefined | null): string {
  if (value == null) return '';
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function joinParts(...parts: Array<string | number | undefined | null>): string {
  return parts.map(normalizePart).filter(Boolean).join(' ');
}

function packHaystack(pack: (typeof LOUNGE_TV_CONTENT_PACKS)[number]): string {
  const article = pack.article;
  const articleText = [
    article?.intro,
    ...(article?.takeaways ?? []),
    ...(article?.steps?.map((s) => `${s.title} ${s.body}`) ?? []),
  ].join(' ');
  const products = pack.productsUsed?.map((p) => p.name).join(' ');
  const pathLabel = pack.learningPathId ? LEARN_PATH_LABELS[pack.learningPathId] : '';
  const exploreLabel = pack.exploreSectionId ? EXPLORE_SECTION_LABELS[pack.exploreSectionId] : '';
  const transcriptExcerpt = pack.transcript?.slice(0, 1200) ?? '';

  return joinParts(
    pack.title,
    pack.subtitle,
    pack.category,
    pack.series,
    pack.originalSeries,
    pack.programSeries,
    pack.host,
    pack.difficulty,
    pack.episodeTitle,
    pack.season != null ? `season ${pack.season}` : '',
    pack.episode != null ? `episode ${pack.episode}` : '',
    pack.runtime,
    pack.readTime,
    pack.tags?.join(' '),
    pack.featuredRows?.join(' '),
    pack.featuredPremiere,
    pack.learningPathId,
    pathLabel,
    pack.exploreSectionId,
    exploreLabel,
    articleText,
    pack.checklist?.join(' '),
    products,
    transcriptExcerpt,
  );
}

function slayTipHaystack(tip: ReturnType<typeof getAllSlayTips>[number]): string {
  return slayTipPublicHaystack(tip);
}

function careLessonHaystack(lesson: ReturnType<typeof getAllCareLessons>[number]): string {
  return joinParts(
    lesson.title,
    lesson.subtitle,
    lesson.shortDescription,
    lesson.category,
    lesson.contentType,
    lesson.format,
    lesson.tags?.join(' '),
  );
}

function psaEpisodeHaystack(ep: ReturnType<typeof getAllPsaTodayEpisodes>[number]): string {
  const chapters = ep.chapters?.map((c) => `${c.label} ${c.title ?? ''} ${c.description ?? ''}`).join(' ');
  return joinParts(
    ep.title,
    ep.subtitle,
    ep.shortDescription,
    ep.fullDescription,
    ep.category,
    ep.pillar,
    ep.tags?.join(' '),
    ep.series,
    ep.episodeNumber != null ? `episode ${ep.episodeNumber}` : '',
    ep.seasonNumber != null ? `season ${ep.seasonNumber}` : '',
    chapters,
    ep.social?.socialCaption,
  );
}

let cachedIndex: LoungeTvSearchIndexEntry[] | null = null;

/** Build once — lounge catalog is static in dev/prod bundles. */
export function buildLoungeTvSearchIndex(): LoungeTvSearchIndexEntry[] {
  if (cachedIndex) return cachedIndex;

  const entries: LoungeTvSearchIndexEntry[] = [];

  for (const pack of LOUNGE_TV_CONTENT_PACKS) {
    const titleNorm = normalizePart(pack.title);
    entries.push({
      id: `content-pack:${pack.id}`,
      kind: 'content-pack',
      entityId: pack.id,
      title: pack.title,
      subtitle: pack.subtitle ?? pack.category,
      typeLabel: 'LOUNGE LESSON',
      haystack: packHaystack(pack),
      titleNorm,
    });
  }

  for (const tip of getAllSlayTips()) {
    if (tip.comingSoon && !tip.published) continue;
    const publicTitle = slayTipPublicTitle(tip);
    const titleNorm = normalizePart(publicTitle);
    entries.push({
      id: `slay-tip:${tip.id}`,
      kind: 'slay-tip',
      entityId: tip.id,
      title: publicTitle,
      subtitle: slayTipPreviewCopy(tip) ?? undefined,
      typeLabel: 'SLAY TIP',
      haystack: slayTipHaystack(tip),
      titleNorm,
    });
  }

  for (const lesson of getAllCareLessons()) {
    if (lesson.comingSoon && !lesson.published) continue;
    const titleNorm = normalizePart(lesson.title);
    entries.push({
      id: `care-lesson:${lesson.id}`,
      kind: 'care-lesson',
      entityId: lesson.id,
      title: lesson.title,
      subtitle: lesson.subtitle ?? lesson.shortDescription,
      typeLabel: 'CARE GUIDE',
      haystack: careLessonHaystack(lesson),
      titleNorm,
    });
  }

  for (const ep of getAllPsaTodayEpisodes()) {
    if (ep.comingSoon && ep.published === false) continue;
    const titleNorm = normalizePart(ep.title);
    entries.push({
      id: `psa-episode:${ep.id}`,
      kind: 'psa-episode',
      entityId: ep.id,
      title: ep.title,
      subtitle: ep.subtitle ?? ep.shortDescription,
      typeLabel: 'PSA TODAY',
      haystack: psaEpisodeHaystack(ep),
      titleNorm,
    });
  }

  for (const track of listMasteryTrackPresentations()) {
    const titleNorm = normalizePart(track.title);
    entries.push({
      id: `mastery:${track.id}`,
      kind: 'mastery',
      entityId: track.mastery?.id ?? track.id,
      title: track.title,
      subtitle: track.description,
      typeLabel: track.status === 'available' ? 'MASTERY' : 'MASTERY · COMING SOON',
      haystack: joinParts(track.title, track.description, track.id, track.mastery?.pillar),
      titleNorm,
    });
  }

  for (const mastery of getAllEducationMasteries()) {
    if (entries.some((e) => e.kind === 'mastery' && e.entityId === mastery.id)) continue;
    const titleNorm = normalizePart(mastery.title);
    entries.push({
      id: `mastery:${mastery.id}`,
      kind: 'mastery',
      entityId: mastery.id,
      title: mastery.title,
      subtitle: mastery.subtitle ?? mastery.description,
      typeLabel: 'MASTERY',
      haystack: joinParts(mastery.title, mastery.subtitle, mastery.description, mastery.pillar),
      titleNorm,
    });
  }

  for (const season of getAllEducationSeasons()) {
    const titleNorm = normalizePart(season.title);
    entries.push({
      id: `season:${season.id}`,
      kind: 'season',
      entityId: season.id,
      title: season.title,
      subtitle: season.subtitle ?? season.learningObjective,
      typeLabel: `SEASON ${season.seasonNumber}`,
      haystack: joinParts(
        season.title,
        season.subtitle,
        season.description,
        season.learningObjective,
        season.masteryId,
        `season ${season.seasonNumber}`,
      ),
      titleNorm,
    });
  }

  for (const family of getAllEducationFamilies()) {
    if (!family.published && family.published !== undefined) continue;
    const titleNorm = normalizePart(family.title);
    entries.push({
      id: `education-family:${family.id}`,
      kind: 'education-family',
      entityId: family.id,
      title: family.title,
      subtitle: family.description,
      typeLabel: 'TOPIC',
      haystack: joinParts(family.title, family.description, family.pillar, family.tags?.join(' ')),
      titleNorm,
    });
  }

  cachedIndex = entries;
  return entries;
}

/** Test helper — reset memoized index. */
export function resetLoungeTvSearchIndexCache(): void {
  cachedIndex = null;
}

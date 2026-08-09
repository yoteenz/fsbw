import type { PSAEpisodeChapter } from '../../../components/lounge/psa-today/types';
import type { WigUnitSlug } from '../care/productCatalog';
import type { ChapterMediaResolution } from './types';
import { getSignatureUnitEducationProfile } from './registry';
import { UNIT_SLUG_TEXTURE } from '../care/productCatalog';

export type ResolveChapterMediaInput = {
  chapter: PSAEpisodeChapter;
  demonstrationUnitId?: WigUnitSlug | null;
  learnerUnitId?: WigUnitSlug | null;
  episodePosterUrl?: string;
};

function pickUnitMedia(
  chapter: PSAEpisodeChapter,
  unitId: WigUnitSlug
): { videoUrl?: string; posterUrl?: string } | null {
  const module = chapter.unitSpecificModules?.[unitId];
  if (module?.mediaUrl || module?.posterUrl) {
    return { videoUrl: module.mediaUrl, posterUrl: module.posterUrl };
  }

  const profile = getSignatureUnitEducationProfile(unitId);
  const slot = chapter.unitMediaSlot;
  if (profile?.educationMedia && slot) {
    const url = profile.educationMedia[slot as keyof typeof profile.educationMedia];
    if (url) return { videoUrl: url, posterUrl: profile.educationMedia.heroPosterUrl };
  }

  return null;
}

/** Resolve chapter media with unit-specific → texture-family → shared → fallback chain. */
export function resolveChapterMedia(input: ResolveChapterMediaInput): ChapterMediaResolution {
  const { chapter, demonstrationUnitId, learnerUnitId, episodePosterUrl } = input;
  const unitForInsert = demonstrationUnitId ?? learnerUnitId;

  if (unitForInsert) {
    const unitMedia = pickUnitMedia(chapter, unitForInsert);
    if (unitMedia?.videoUrl || unitMedia?.posterUrl) {
      return {
        videoUrl: unitMedia.videoUrl ?? chapter.mediaUrl ?? chapter.sharedModule?.mediaUrl,
        posterUrl: unitMedia.posterUrl ?? chapter.posterUrl ?? chapter.sharedModule?.posterUrl,
        source: 'unit-specific',
        resolvedUnitId: unitForInsert,
      };
    }

    if (chapter.allowTextureFamilyFallback && unitForInsert) {
      const family = UNIT_SLUG_TEXTURE[unitForInsert];
      const familyModule = chapter.textureFamilyModules?.[family];
      if (familyModule?.mediaUrl || familyModule?.posterUrl) {
        return {
          videoUrl: familyModule.mediaUrl ?? chapter.sharedModule?.mediaUrl,
          posterUrl: familyModule.posterUrl ?? chapter.posterUrl,
          source: 'texture-family',
          resolvedUnitId: unitForInsert,
        };
      }
    }
  }

  if (chapter.sharedModule?.mediaUrl || chapter.sharedModule?.posterUrl) {
    return {
      videoUrl: chapter.sharedModule.mediaUrl ?? chapter.mediaUrl,
      posterUrl: chapter.sharedModule.posterUrl ?? chapter.posterUrl,
      source: 'shared',
    };
  }

  if (chapter.mediaUrl || chapter.posterUrl) {
    return {
      videoUrl: chapter.mediaUrl,
      posterUrl: chapter.posterUrl,
      source: 'shared',
    };
  }

  const fallbackPoster =
    chapter.fallbackPosterUrl ?? episodePosterUrl ?? chapter.sharedModule?.posterUrl;
  if (fallbackPoster || chapter.fallbackMediaUrl) {
    return {
      videoUrl: chapter.fallbackMediaUrl,
      posterUrl: fallbackPoster,
      source: 'fallback',
    };
  }

  return { source: 'fallback', posterUrl: episodePosterUrl };
}

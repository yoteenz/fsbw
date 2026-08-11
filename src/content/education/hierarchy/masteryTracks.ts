import { loungeTvLivePreviewPublicUrl } from '../../../components/lounge/loungeTvAssets';
import type { EducationMastery } from '../types';
import {
  getEducationMasteryBySlug,
  getSeasonsForMastery,
} from './catalog';

/** Canonical six-track Mastery selector — PSA Today → Masteries format. */
export type MasteryTrackId =
  | 'lace'
  | 'care'
  | 'color'
  | 'installation'
  | 'styling'
  | 'after-care';

export type MasteryTrackStatus = 'available' | 'coming-soon';

export type MasteryTrack = {
  id: MasteryTrackId;
  title: string;
  slug: string;
  description: string;
  /** Links to {@link EducationMastery.slug} when hierarchy data exists. */
  masterySlug: string;
  sortOrder: number;
  /** Optional 9:16 still poster (`posterImage` / staticHero) — initial frame and fallback. */
  heroImageUrl?: string;
  /** Optional living cover loop (`previewVideo` / animatedHero) — crossfades from {@link heroImageUrl}. */
  heroVideoUrl?: string;
  /** CSS object-position for hero crop (e.g. `center center`). */
  heroPosition?: string;
  /** Optional gradient scrim over poster media. */
  heroOverlay?: string;
};

export const MASTERY_TRACKS: MasteryTrack[] = [
  {
    id: 'care',
    title: 'CARE MASTERY',
    slug: 'care-mastery',
    description: 'Protect the quality, longevity and performance of your hair.',
    masterySlug: 'care-mastery',
    sortOrder: 1,
    heroImageUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Lounge/B9D50594-39D4-4061-ADC8-CF1A3312881D.png',
    ),
    heroVideoUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Lounge/openart-output_1786365216511_26b33fb9.mp4',
    ),
    heroPosition: '50% 40%',
  },
  {
    id: 'lace',
    title: 'LACE MASTERY',
    slug: 'lace-mastery',
    description: 'Understand, customize and troubleshoot lace.',
    masterySlug: 'lace-mastery',
    sortOrder: 2,
    heroImageUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Lounge/812D4CE3-9ACB-426E-829E-18676EEA0A58.png',
    ),
    heroVideoUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Lounge/openart-output_1786367568171_b5f1bae1.mp4',
    ),
    heroPosition: '50% 40%',
  },
  {
    id: 'color',
    title: 'COLOR MASTERY',
    slug: 'color-mastery',
    description: 'Learn controlled coloring, formulation and hair-safe technique.',
    masterySlug: 'color-mastery',
    sortOrder: 3,
    heroImageUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Mastery/D9495FB6-76E2-42A8-8FD1-EC1D250CBF4B.png',
    ),
    heroVideoUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Mastery/openart-output_1786340750410_4553aa10.mp4',
    ),
    heroPosition: '50% 38%',
  },
  {
    id: 'installation',
    title: 'INSTALLATION MASTERY',
    slug: 'install-mastery',
    description: 'Build confidence across preparation, placement and secure installation.',
    masterySlug: 'install-mastery',
    sortOrder: 4,
    heroImageUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Lounge/B95A07A7-C259-486D-AA1D-56C16AD75934.png',
    ),
    heroVideoUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Lounge/openart-output_1786370111799_bfed58aa.mp4',
    ),
    heroPosition: '50% 40%',
  },
  {
    id: 'styling',
    title: 'STYLING MASTERY',
    slug: 'style-mastery',
    description: 'Learn finishing, shaping and styling techniques.',
    masterySlug: 'style-mastery',
    sortOrder: 5,
    heroImageUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Mastery/35EC8711-DC6A-4E3A-AC37-61BBEF87874C.png',
    ),
    heroVideoUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Mastery/openart-output_1786341851345_fd20c39c.mp4',
    ),
    heroPosition: '50% 40%',
  },
  {
    id: 'after-care',
    title: 'UPKEEP MASTERY',
    slug: 'after-care-mastery',
    description: 'Maintain your install and hair between styling sessions.',
    masterySlug: 'after-care-mastery',
    sortOrder: 6,
    heroImageUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Lounge/6391D0B6-C7C1-4E5D-8B34-2D39FF340ECF.png',
    ),
    heroVideoUrl: loungeTvLivePreviewPublicUrl(
      '3D%20Stock/Lounge/openart-output_1786369562904_a3e44b2e.mp4',
    ),
    heroPosition: '50% 40%',
  },
];

export function getMasteryTrackById(id: MasteryTrackId): MasteryTrack | undefined {
  return MASTERY_TRACKS.find((t) => t.id === id);
}

/** Focus id for Learn Mastery grid (`data-lounge-tv-focus-id`). */
export function masteryTrackFocusId(trackId: MasteryTrackId): string {
  return `learn-mastery-${trackId}`;
}

export function masteryTrackFocusIdForMastery(masteryId: string): string | null {
  for (const track of MASTERY_TRACKS) {
    const mastery = resolveMasteryForTrack(track);
    if (mastery?.id === masteryId) return masteryTrackFocusId(track.id);
  }
  return null;
}

export function seasonFocusId(seasonId: string): string {
  return `season-${seasonId}`;
}

export function resolveMasteryForTrack(track: MasteryTrack): EducationMastery | undefined {
  return getEducationMasteryBySlug(track.masterySlug);
}

export function resolveMasteryTrackStatus(track: MasteryTrack): MasteryTrackStatus {
  const mastery = resolveMasteryForTrack(track);
  if (!mastery) return 'coming-soon';
  const publishedSeasons = getSeasonsForMastery(mastery.id);
  return publishedSeasons.length > 0 ? 'available' : 'coming-soon';
}

export type MasteryTrackPresentation = MasteryTrack & {
  status: MasteryTrackStatus;
  mastery?: EducationMastery;
  seasonCount: number;
  episodeCount: number;
};

export function listMasteryTrackPresentations(): MasteryTrackPresentation[] {
  return MASTERY_TRACKS.map((track) => {
    const mastery = resolveMasteryForTrack(track);
    const seasons = mastery ? getSeasonsForMastery(mastery.id) : [];
    const episodeCount = seasons.reduce((n, s) => n + s.episodeSlots.length, 0);
    return {
      ...track,
      status: resolveMasteryTrackStatus(track),
      mastery,
      seasonCount: seasons.length,
      episodeCount,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** PSA Today umbrella copy for Learn tab. */
export const PSA_TODAY_LEARN_UMBRELLA = {
  title: 'PSA TODAY',
  tagline: 'THE KNOWLEDGE YOU NEED TODAY, THE SKILLS YOU\'LL KEEP MASTERING.',
  description:
    'Education designed to help you understand, customize, install, style, color and care for your hair with confidence.',
  masteriesTitle: 'SERIES',
  masteriesSubtitle: 'Structured PSA Today learning programs — season by season.',
} as const;

/**
 * Frontal Slayer Academy (future) — hands-on enrollment, kits, assignments, certification.
 * NOT a video Mastery track. Do not surface in Learn until explicitly built.
 */
export const FRONTAL_SLAYER_ACADEMY_FUTURE_NOTE =
  'Academy = future hands-on enrollment (physical kit, assignments, checkpoints). Distinct from PSA Today Masteries.';

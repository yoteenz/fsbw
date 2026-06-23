import {
  DESKTOP_GALLERY_PATH,
  DESKTOP_LOBBY_PATH,
  DESKTOP_PENTHOUSE_PATH,
} from '../constants/desktopFloors';
import { buildDesktopDestinationHref } from '../constants/desktopNavQuickRoutes';
import { DESKTOP_NO_TEXT_ROOM_BACKGROUNDS } from '../constants/desktopNoTextBackgrounds';

export type ReceptionDiscoveryCard = {
  id: string;
  title: string;
  metric: string;
  subtext?: string;
  cta: string;
  href: string;
  iconSrc: string;
  thumbSrc?: string;
  ariaLabel: string;
};

export type ReceptionFeaturedExperience = {
  kicker: string;
  title: string;
  metric: string;
  subtext: string;
  cta: string;
  href: string;
  thumbSrc?: string;
  ariaLabel: string;
};

export type ReceptionDashboardContent = {
  featured: ReceptionFeaturedExperience;
  todayInMansion: ReceptionDiscoveryCard[];
  recommendedDestinations: ReceptionDiscoveryCard[];
};

const ICONS = {
  lounge: '/assets/hub-icon.svg',
  slayCam: '/assets/media-icon.svg',
  collectible: '/assets/membership-icon.svg',
  baw: '/assets/hub-icon.svg',
  community: '/assets/more-ways-earn-icon.svg',
  analysis: '/assets/line-icon.svg',
  atelier: '/assets/hub-icon.svg',
  rewards: '/assets/challenge-icon.svg',
  camera: '/assets/media-icon.svg',
} as const;

export function buildReceptionDashboardContent(): ReceptionDashboardContent {
  const loungeHref = buildDesktopDestinationHref(DESKTOP_LOBBY_PATH, 'lounge');
  const slayCamHref = buildDesktopDestinationHref(DESKTOP_GALLERY_PATH, 'slay-cam-gallery');
  const rewardsHref = buildDesktopDestinationHref(DESKTOP_GALLERY_PATH, 'rewards-gallery');
  const bawHref = buildDesktopDestinationHref(DESKTOP_LOBBY_PATH, 'build-a-wig-atelier');
  const membersHref = buildDesktopDestinationHref(DESKTOP_GALLERY_PATH, 'members-lounge');
  const analysisHref = buildDesktopDestinationHref(DESKTOP_PENTHOUSE_PATH, 'analysis-lab');

  return {
    featured: {
      kicker: 'Featured Experience',
      title: 'The Lounge',
      metric: 'New episode available',
      subtext: 'Watch the latest salon cinema drop',
      cta: 'Watch now →',
      href: loungeHref,
      thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS.lounge,
      ariaLabel: 'Featured lounge experience',
    },
    todayInMansion: [
      {
        id: 'loungeContent',
        title: 'New Lounge Content',
        metric: 'Fresh drop',
        subtext: 'Salon cinema update',
        cta: 'Explore →',
        href: loungeHref,
        iconSrc: ICONS.lounge,
        thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS.lounge,
        ariaLabel: 'New lounge content',
      },
      {
        id: 'slayCamUploads',
        title: 'New Slay Cam Uploads',
        metric: 'Just posted',
        subtext: 'Community spotlight reels',
        cta: 'View →',
        href: slayCamHref,
        iconSrc: ICONS.slayCam,
        thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['slay-cam-gallery'],
        ariaLabel: 'New slay cam uploads',
      },
      {
        id: 'newCollectible',
        title: 'New Collectible',
        metric: 'Limited reward',
        subtext: 'Unlock in rewards gallery',
        cta: 'Collect →',
        href: rewardsHref,
        iconSrc: ICONS.collectible,
        thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['rewards-gallery'],
        ariaLabel: 'New collectible',
      },
      {
        id: 'bawTrends',
        title: 'Build-A-Wig Trends',
        metric: 'Trending now',
        subtext: 'Atelier customizations',
        cta: 'Design →',
        href: bawHref,
        iconSrc: ICONS.baw,
        thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['build-a-wig-atelier'],
        ariaLabel: 'Build-A-Wig trends',
      },
      {
        id: 'communitySpotlight',
        title: 'Community Spotlight',
        metric: 'Members rising',
        subtext: 'See who is slaying',
        cta: 'Discover →',
        href: membersHref,
        iconSrc: ICONS.community,
        thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['members-lounge'],
        ariaLabel: 'Community spotlight',
      },
    ],
    recommendedDestinations: [
      {
        id: 'hairAnalysisLab',
        title: 'Hair Analysis Lab',
        metric: 'Analyze & perfect',
        cta: 'Enter →',
        href: analysisHref,
        iconSrc: ICONS.analysis,
        thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['analysis-lab'],
        ariaLabel: 'Hair Analysis Lab',
      },
      {
        id: 'bawAtelier',
        title: 'Build-A-Wig Atelier',
        metric: 'Customize units',
        cta: 'Enter →',
        href: bawHref,
        iconSrc: ICONS.atelier,
        thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['build-a-wig-atelier'],
        ariaLabel: 'Build-A-Wig Atelier',
      },
      {
        id: 'theLounge',
        title: 'The Lounge',
        metric: 'Watch & learn',
        cta: 'Enter →',
        href: loungeHref,
        iconSrc: ICONS.lounge,
        thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS.lounge,
        ariaLabel: 'The Lounge',
      },
      {
        id: 'rewardsGallery',
        title: 'Rewards Gallery',
        metric: 'Collect & unlock',
        cta: 'Enter →',
        href: rewardsHref,
        iconSrc: ICONS.rewards,
        thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['rewards-gallery'],
        ariaLabel: 'Rewards Gallery',
      },
      {
        id: 'slayCam',
        title: 'Slay Cam',
        metric: 'Share your slay',
        cta: 'Enter →',
        href: slayCamHref,
        iconSrc: ICONS.camera,
        thumbSrc: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['slay-cam-gallery'],
        ariaLabel: 'Slay Cam',
      },
    ],
  };
}

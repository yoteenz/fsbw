import {
  DESKTOP_CONCIERGE_PATH,
  DESKTOP_GALLERY_PATH,
  DESKTOP_LOBBY_PATH,
  DESKTOP_PENTHOUSE_PATH,
} from './desktopFloors';

/** Full-bleed Grand Lobby hero — 21:9 with baked panel art (do not crop or edit). */
export const DESKTOP_GRAND_LOBBY_BACKGROUND_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/Panels/2C0F492C-FD9E-442F-BE81-F7180060E713.png';

/** Measured asset dimensions — use for cover-locked overlay mapping. */
export const DESKTOP_GRAND_LOBBY_IMAGE = {
  width: 1881,
  height: 836,
} as const;

export const GRAND_LOBBY_MEMBERSHIP_BENEFITS = [
  'Hairstyle Analysis Credits',
  'Early Access Releases',
  'Exclusive Collectibles',
  'Lounge TV Content',
  'Member Rewards',
  'Bonus Challenges',
] as const;

export const GRAND_LOBBY_ECONOMY_EARN = [
  'Loyalty Points',
  'Slay Tickets',
  'Vouchers',
  'Exclusive Collectibles',
  'Member Rewards',
] as const;

export const GRAND_LOBBY_ECONOMY_PROGRESS = [
  'Complete Challenges',
  'Purchase Products',
  'Share Slay Cam Content',
  'Refer Friends',
  'Maintain Membership',
] as const;

export type GrandLobbyDirectoryRoom = {
  label: string;
  floorPath: string;
  destinationId: string;
};

export type GrandLobbyDirectoryFloor = {
  level: number;
  name: string;
  rooms: readonly GrandLobbyDirectoryRoom[];
};

/** Mansion directory — each room maps to an existing desktop destination. */
export const GRAND_LOBBY_DIRECTORY_FLOORS: readonly GrandLobbyDirectoryFloor[] = [
  {
    level: 4,
    name: 'PENTHOUSE',
    rooms: [
      { label: 'Hair Analysis Lab', floorPath: DESKTOP_PENTHOUSE_PATH, destinationId: 'analysis-lab' },
      { label: 'Hair Showroom', floorPath: DESKTOP_PENTHOUSE_PATH, destinationId: 'showroom' },
      { label: 'Extensions Boutique', floorPath: DESKTOP_PENTHOUSE_PATH, destinationId: 'boutique' },
    ],
  },
  {
    level: 3,
    name: 'LOBBY',
    rooms: [{ label: 'Grand Lobby', floorPath: DESKTOP_LOBBY_PATH, destinationId: 'grand-lobby' }],
  },
  {
    level: 2,
    name: 'GALLERY',
    rooms: [
      { label: 'The Lounge', floorPath: DESKTOP_LOBBY_PATH, destinationId: 'lounge' },
      { label: 'Slay Cam', floorPath: DESKTOP_GALLERY_PATH, destinationId: 'slay-cam-gallery' },
      { label: 'Rewards Gallery', floorPath: DESKTOP_GALLERY_PATH, destinationId: 'rewards-gallery' },
    ],
  },
  {
    level: 1,
    name: 'CONCIERGE',
    rooms: [
      { label: 'Concierge', floorPath: DESKTOP_CONCIERGE_PATH, destinationId: 'reception' },
      { label: 'Founder Suite', floorPath: DESKTOP_CONCIERGE_PATH, destinationId: 'founder-suite' },
      { label: 'PSA Suite', floorPath: DESKTOP_CONCIERGE_PATH, destinationId: 'psa-suite' },
    ],
  },
] as const;

export const GRAND_LOBBY_WELCOME_COPY = {
  headline: 'Luxury shopping. Entertainment. Education. Rewards.',
  body:
    'Explore interactive experiences, discover premium hair collections, earn exclusive collectibles, and unlock member-only benefits throughout the mansion. This is more than hair. This is your kingdom.',
  footer: '4 FLOORS • 12+ EXPERIENCES • ONE DESTINATION',
} as const;

export const GRAND_LOBBY_HOUSE_INFO_LINKS = [
  { label: 'About Us', href: '/brand/about' },
  { label: 'Contact', href: '/brand/contact' },
  { label: 'FAQ', href: '/brand/faq' },
  { label: 'Reviews', href: '/brand/reviews' },
  { label: 'Shipping & Processing', href: '/brand/terms' },
  { label: 'Returns & Policies', href: '/brand/terms' },
  { label: 'Terms of Service', href: '/brand/terms' },
  { label: 'Privacy Policy', href: '/brand/terms' },
] as const;

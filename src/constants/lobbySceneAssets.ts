import { isAdminEmail, isSignedIn } from '../utils/adminAuth';
import { getCurrentUserEmailFromStorage } from '../utils/perUserStorage';
import { LOBBY_LOUNGE_SEEDANCE_COPY_BLOCK } from './lobbyLoungeSeedancePrompt';
import { LOBBY_NEON_LOGO_FAL_EDIT } from './sceneNeonLogoFal';
import {
  LOBBY_NEON_BOOKING_FAL_EDIT,
  LOBBY_NEON_PRODUCTS_FAL_EDIT,
  LOBBY_NEON_TOOLS_FAL_EDIT,
} from './sceneLobbyNeonNavFal';
import {
  LOBBY_ROSE_BACKGROUND_FAL_EDIT,
  SCENE_ROSE_BACKGROUND_FAL_NEGATIVE,
  sceneRoseBackgroundFalWorkflowNote,
} from './sceneRoseBackgroundFal';

/** Lobby scene art paths (see `src/pages/lobby/page.tsx`). */

export const LOBBY_NEON_LOGO_SRC = '/assets/neon-logo.png';

/** Main neon logo rendered height on lobby slide (263px baseline −5%). */
export const LOBBY_NEON_LOGO_HEIGHT_PX = 250;

/** PRODUCTS / TOOLS / BOOKING word signs under main logo (16px baseline +30%). */
export const LOBBY_NEON_NAV_HEIGHT_PX = 21;
/** Bump when re-baking `neon-products.png` (`npm run lobby:bake-neon-products`). */
export const LOBBY_NEON_PRODUCTS_ASSET_VERSION = '20O0Gotz-v1';

export const LOBBY_NEON_PRODUCTS_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/20O0GotzW7q-QmvLveXN9_YgD84Oqi.jpeg';

export const LOBBY_NEON_PRODUCTS_SRC = `/assets/neon-products.png?v=${LOBBY_NEON_PRODUCTS_ASSET_VERSION}`;

/** Bump when re-baking `neon-tools.png` (`npm run lobby:bake-neon-tools`). */
export const LOBBY_NEON_TOOLS_ASSET_VERSION = 'I78ubr42-v1';

export const LOBBY_NEON_TOOLS_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/I78ubr42NjxdhQf0HyE9b_r0ibbtRX.jpeg';

export const LOBBY_NEON_TOOLS_SRC = `/assets/neon-tools.png?v=${LOBBY_NEON_TOOLS_ASSET_VERSION}`;

/** Bump when re-baking `neon-booking.png` (`npm run lobby:bake-neon-booking`). */
export const LOBBY_NEON_BOOKING_ASSET_VERSION = 'SnSxe3vt-v1';

export const LOBBY_NEON_BOOKING_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/SnSxe3vtBubRiiMMlOn7M_O2Trudyn.jpeg';

export const LOBBY_NEON_BOOKING_SRC = `/assets/neon-booking.png?v=${LOBBY_NEON_BOOKING_ASSET_VERSION}`;
export const LOBBY_NEON_BOOKING_FALLBACK_SRC = '/assets/neon-booking.svg';

/** Bump when replacing `public/assets/landing-background.png` (Vercel caches `/assets/*`). */
export const LOBBY_BACKGROUND_ASSET_VERSION = 'dmdfZH-v1';

export const LOBBY_ROSE_BACKGROUND_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/dmdfZH_WdaOAJqCFVHi7K_jiWmVT0U.jpeg';

export const LOBBY_ROSE_BACKGROUND_SRC = `/assets/landing-background.png?v=${LOBBY_BACKGROUND_ASSET_VERSION}`;

/** Bump when re-baking shelf PNGs (`npm run lobby:bake-shelves`). */
export const LOBBY_SHELF_ASSET_VERSION = '5Cof6W3Y-v3';

export const LOBBY_SHELF_HD_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/5Cof6W3Y0p6Eyq8ew7Sil_dzSVHBRK.jpeg';

export const LOBBY_SHELF_TRANSPARENT_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/7h5bbuiitNAnalQhkOszS_pP56MlDZ.jpeg';

export const LOBBY_SHELF_CUSTOM_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/7iUsTnn1PQRK9Io3291KW_pHVg5Q26.jpeg';

export const LOBBY_SHELF_HD_SRC = `/assets/hd-group.png?v=${LOBBY_SHELF_ASSET_VERSION}`;
export const LOBBY_SHELF_TRANSPARENT_SRC = `/assets/transparent-group.png?v=${LOBBY_SHELF_ASSET_VERSION}`;
export const LOBBY_SHELF_CUSTOM_SRC = `/assets/custom-group.png?v=${LOBBY_SHELF_ASSET_VERSION}`;
export { LOBBY_CASE_SRC, LOBBY_CASE_SRC_REMOTE } from './lobbyCaseAssets';
export const LOBBY_CASE_REGISTER_SRC = '/assets/REGISTER.png';
export const LOBBY_CASE_PHONE_DOWNLOAD_SRC = '/assets/lobby-phone.png';

/** Set when user opens `/lobby?lobbyAssets=1` so carousel swipes keep downloads visible. */
export const LOBBY_ASSET_DOWNLOADS_SESSION_KEY = 'baw_lobby_asset_downloads';

/** Show small DOWNLOAD links on lobby art (dev, `?lobbyAssets=1`, or signed-in admin). */
export function isLobbyAssetDownloadsVisibleFromSearch(search: string): boolean {
  if (import.meta.env.DEV) return true;
  const params = new URLSearchParams(search);
  if (params.get('lobbyAssets') === '1') {
    try {
      sessionStorage.setItem(LOBBY_ASSET_DOWNLOADS_SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    return true;
  }
  try {
    return sessionStorage.getItem(LOBBY_ASSET_DOWNLOADS_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function isLobbyAssetDownloadsVisibleForAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isSignedIn()) return false;
  const email = getCurrentUserEmailFromStorage();
  return Boolean(email && isAdminEmail(email));
}

/** Fal / image-model prompts for replacing lobby PNGs (transparent PNG where noted). */
export const LOBBY_SCENE_FAL_PROMPTS = {
  neonLogo: `[FAL] fal-ai/nano-banana-pro/edit. neon-logo.png. ${LOBBY_NEON_LOGO_FAL_EDIT}`,

  roseBackground: `${sceneRoseBackgroundFalWorkflowNote('landing-background')} ${LOBBY_ROSE_BACKGROUND_FAL_EDIT} Negative: ${SCENE_ROSE_BACKGROUND_FAL_NEGATIVE}`,

  neonProducts: LOBBY_NEON_PRODUCTS_FAL_EDIT,

  neonTools: LOBBY_NEON_TOOLS_FAL_EDIT,

  neonBooking: LOBBY_NEON_BOOKING_FAL_EDIT,

  shelfHdLace: `Photorealistic wall-mounted retail shelf graphic for "HD LACE" luxury wigs. Slim floating shelf with 3–4 premium wig boxes in neutral packaging, subtle HD LACE label area. Front-facing or slight 3/4 view, soft studio light, boutique styling. PNG with fully transparent background, no wall, no text outside product labels on boxes.`,

  shelfTransparentLace: `Photorealistic wall-mounted retail shelf graphic for "TRANSPARENT LACE" luxury wigs. Same visual language as a high-end salon product bay: slim shelf, 3–4 elegant wig boxes, airy transparent-lace branding feel. Front-facing, soft shadows, PNG with fully transparent background, no wall.`,

  shelfCustomUnits: `Photorealistic wall-mounted retail shelf graphic for "CUSTOM UNITS" made-to-order wigs. Slim shelf with 3–4 luxury boxes, bespoke / atelier packaging cues. Front-facing, premium salon lighting, PNG with fully transparent background, no wall.`,

  /** Prefer neutral gray, white, or magenta backdrop for new shelf/case photos — green spill on clear acrylic is hard to key cleanly. */
  shelfBackdropNote:
    'For Supabase source JPEGs: gray or off-white studio wall keys better than green for acrylic shelves/cases (less green cast on glass). If stuck on green screen, export high-res and use npm run lobby:bake-shelves / lobby:bake-case.',

  displayCase: `Photorealistic clear acrylic boutique display case for a wig salon counter. Front view, rounded corners, subtle reflections and thickness on edges, empty interior ready for small props on top. Soft studio lighting, PNG with fully transparent background, no products inside unless minimal glare only.`,

  caseRegister: `Small photorealistic vintage-modern cash register prop for a luxury retail display case, 3/4 front angle. Metallic and matte materials, boutique styling, no brand text. PNG with fully transparent background, isolated product shot.`,

  casePhone: `Small photorealistic salon desk telephone prop for a luxury wig boutique display, 3/4 front angle. Elegant classic handset on base, neutral black or charcoal, no readable brand. PNG with fully transparent background, isolated product shot.`,

  /** Seedance 2 — horizontal lobby → lounge transition (start/end frame URLs in copy block). */
  roomTransitionSeedance: LOBBY_LOUNGE_SEEDANCE_COPY_BLOCK,
} as const;

import { isAdminEmail, isSignedIn } from '../utils/adminAuth';
import { getCurrentUserEmailFromStorage } from '../utils/perUserStorage';
import {
  LOBBY_ROSE_BACKGROUND_FAL_BASE,
  SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT,
} from './sceneRoseBackgroundFal';

/** Lobby scene art paths (see `src/pages/lobby/page.tsx`). */

export const LOBBY_NEON_LOGO_SRC = '/assets/neon-logo.png';
export const LOBBY_NEON_PRODUCTS_SRC = '/assets/neon-products.png';
export const LOBBY_NEON_TOOLS_SRC = '/assets/neon-tools.png';
export const LOBBY_NEON_BOOKING_SRC = '/assets/neon-booking.png';
export const LOBBY_NEON_BOOKING_FALLBACK_SRC = '/assets/neon-booking.svg';
export const LOBBY_ROSE_BACKGROUND_SRC = '/assets/landing-background.png';
export const LOBBY_SHELF_HD_SRC = '/assets/hd-group.png';
export const LOBBY_SHELF_TRANSPARENT_SRC = '/assets/transparent-group.png';
export const LOBBY_SHELF_CUSTOM_SRC = '/assets/custom-group.png';
export const LOBBY_CASE_SRC = '/assets/CASE.png';
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
  neonLogo: `Photorealistic neon sign for a luxury wig boutique brand "Frontal Slayer". Hot pink and red neon glass tubing, soft bloom and wall reflection, shot straight-on on a dark charcoal wall. Premium salon aesthetic, crisp letterforms, no extra text. Export as a high-resolution PNG with a fully transparent background (alpha), no border, no floor, no mockup frame.`,

  roseBackground: `${LOBBY_ROSE_BACKGROUND_FAL_BASE} ${SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT}`,

  neonProducts: `Photorealistic neon sign reading "PRODUCTS" for a luxury wig boutique. Hot pink and red neon glass tubing, same typeface weight and glow as the "Frontal Slayer" main logo, soft bloom. Straight-on, PNG with fully transparent background, no extra text.`,

  neonTools: `Photorealistic neon sign reading "TOOLS" for a luxury wig boutique. Hot pink and red neon glass tubing, matching PRODUCTS/BOOKING neon style, soft bloom. Straight-on, PNG with fully transparent background, no extra text.`,

  neonBooking: `Photorealistic neon sign reading "BOOKING" for a luxury wig boutique. Hot pink and red neon glass tubing, matching PRODUCTS/TOOLS neon style, soft bloom. Straight-on, PNG with fully transparent background, no extra text.`,

  shelfHdLace: `Photorealistic wall-mounted retail shelf graphic for "HD LACE" luxury wigs. Slim floating shelf with 3–4 premium wig boxes in neutral packaging, subtle HD LACE label area. Front-facing or slight 3/4 view, soft studio light, boutique styling. PNG with fully transparent background, no wall, no text outside product labels on boxes.`,

  shelfTransparentLace: `Photorealistic wall-mounted retail shelf graphic for "TRANSPARENT LACE" luxury wigs. Same visual language as a high-end salon product bay: slim shelf, 3–4 elegant wig boxes, airy transparent-lace branding feel. Front-facing, soft shadows, PNG with fully transparent background, no wall.`,

  shelfCustomUnits: `Photorealistic wall-mounted retail shelf graphic for "CUSTOM UNITS" made-to-order wigs. Slim shelf with 3–4 luxury boxes, bespoke / atelier packaging cues. Front-facing, premium salon lighting, PNG with fully transparent background, no wall.`,

  displayCase: `Photorealistic clear acrylic boutique display case for a wig salon counter. Front view, rounded corners, subtle reflections and thickness on edges, empty interior ready for small props on top. Soft studio lighting, PNG with fully transparent background, no products inside unless minimal glare only.`,

  caseRegister: `Small photorealistic vintage-modern cash register prop for a luxury retail display case, 3/4 front angle. Metallic and matte materials, boutique styling, no brand text. PNG with fully transparent background, isolated product shot.`,

  casePhone: `Small photorealistic salon desk telephone prop for a luxury wig boutique display, 3/4 front angle. Elegant classic handset on base, neutral black or charcoal, no readable brand. PNG with fully transparent background, isolated product shot.`,
} as const;

import {
  LOUNGE_ROSE_BACKGROUND_FAL_BASE,
  SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT,
} from './sceneRoseBackgroundFal';
import { LOBBY_NEON_LOGO_SRC } from './lobbySceneAssets';

/** Lounge slide background (see `LoungePage` in `src/pages/lobby/page.tsx`). */
export const LOUNGE_ROSE_BACKGROUND_SRC = '/assets/landing2-background.png';

export const LOUNGE_SALON_CHAIRS_SRC = '/assets/salon-chairs.png';

/** Re-export for download links on lounge neon (same file as lobby). */
export { LOBBY_NEON_LOGO_SRC as LOUNGE_NEON_LOGO_SRC };

export const LOUNGE_CURTAIN_LEFT_SRC = '/assets/lounge-curtain-left.jpeg';
export const LOUNGE_CURTAIN_RIGHT_SRC = '/assets/lounge-curtain-right.jpeg';
export const LOUNGE_TV_REMOTE_HAND_SRC = '/assets/lounge-tv-remote-hand.png';

/** Fal prompts for replacing lounge scene PNGs/JPEGs. */
export const LOUNGE_SCENE_FAL_PROMPTS = {
  roseBackground: `${LOUNGE_ROSE_BACKGROUND_FAL_BASE} ${SCENE_ROSE_BACKGROUND_FAL_ALIGNMENT}`,

  neonLogo: `Photorealistic neon sign for a luxury wig boutique brand "Frontal Slayer". Hot pink and red neon glass tubing, soft bloom and wall reflection, shot straight-on on a dark charcoal wall. Premium salon aesthetic, crisp letterforms, no extra text. PNG with fully transparent background (alpha), no border, no floor, no mockup frame.`,

  salonChairs: `Photorealistic pair of luxury salon styling chairs for a high-end wig boutique lounge. Front 3/4 view, neutral upholstery (taupe or charcoal), chrome bases, boutique styling. PNG with fully transparent background, no floor shadow plate, no room behind chairs.`,

  curtainLeft: `Left half of closed gray velvet theater curtains for a mobile lounge TV overlay. See loungeCurtainFalPrompts.ts WORKFLOW B step 1 for full style-lock wording.`,

  curtainRight: `Right half matching the exported left curtain panel — mirror pleats, lighting, and gray tone. See loungeCurtainFalPrompts.ts WORKFLOW B step 2.`,

  tvRemoteHand: `Photorealistic hand holding a TV remote, lower edge of frame, soft studio light, PNG with fully transparent background for compositing over lounge TV overlay.`,
} as const;

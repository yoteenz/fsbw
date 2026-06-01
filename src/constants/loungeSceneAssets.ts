import { LOBBY_LOUNGE_SEEDANCE_COPY_BLOCK } from './lobbyLoungeSeedancePrompt';
import { LOUNGE_BACKGROUND_FAL_EDIT, loungeBackgroundFalWorkflowNote } from './sceneLoungeBackgroundFal';
import { LOBBY_NEON_LOGO_SRC } from './lobbySceneAssets';

/** Bump when replacing `public/assets/landing2-background.png` (Vercel caches `/assets/*`). */
export const LOUNGE_BACKGROUND_ASSET_VERSION = 'lpreC-MSzG';

export const LOUNGE_BACKGROUND_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/reC-MSzGPYe2PUbnVanQN_Kmj5vXBq.jpeg';

/** Lounge slide background — sofa, table/wine, plant, white curtains (`LoungePage`). 3072×5504 art. */
export const LOUNGE_BACKGROUND_SRC = `/assets/landing2-background.png?v=${LOUNGE_BACKGROUND_ASSET_VERSION}`;

/** @deprecated Misnamed — same file as {@link LOUNGE_BACKGROUND_SRC}. */
export const LOUNGE_ROSE_BACKGROUND_SRC = LOUNGE_BACKGROUND_SRC;

export const LOUNGE_SALON_CHAIRS_SRC = '/assets/salon-chairs.png';

/** Re-export for download links on lounge neon (same file as lobby). */
export { LOBBY_NEON_LOGO_SRC as LOUNGE_NEON_LOGO_SRC };

export const LOUNGE_CURTAIN_LEFT_SRC = '/assets/lounge-curtain-left.jpeg';
export const LOUNGE_CURTAIN_RIGHT_SRC = '/assets/lounge-curtain-right.jpeg';
export const LOUNGE_TV_REMOTE_HAND_SRC = '/assets/lounge-tv-remote-hand.png';

/** Fal prompts for replacing lounge scene PNGs/JPEGs. */
export const LOUNGE_SCENE_FAL_PROMPTS = {
  loungeBackground: `${loungeBackgroundFalWorkflowNote()} ${LOUNGE_BACKGROUND_FAL_EDIT}`,

  /** @deprecated use loungeBackground */
  roseBackground: `${loungeBackgroundFalWorkflowNote()} ${LOUNGE_BACKGROUND_FAL_EDIT}`,

  neonLogo: `Same as lobby — see LOBBY_SCENE_FAL_PROMPTS.neonLogo (two-pass glow then transparent cutout).`,

  salonChairs: `Photorealistic pair of luxury salon styling chairs for a high-end wig boutique lounge. Front 3/4 view, neutral upholstery (taupe or charcoal), chrome bases, boutique styling. PNG with fully transparent background, no floor shadow plate, no room behind chairs.`,

  curtainLeft: `Left half of closed gray velvet theater curtains for a mobile lounge TV overlay. See loungeCurtainFalPrompts.ts WORKFLOW B step 1 for full style-lock wording.`,

  curtainRight: `Right half matching the exported left curtain panel — mirror pleats, lighting, and gray tone. See loungeCurtainFalPrompts.ts WORKFLOW B step 2.`,

  tvRemoteHand: `Photorealistic hand holding a TV remote, lower edge of frame, soft studio light, PNG with fully transparent background for compositing over lounge TV overlay.`,

  /** Seedance 2 — horizontal lobby → lounge transition (start/end frame URLs in copy block). */
  roomTransitionSeedance: LOBBY_LOUNGE_SEEDANCE_COPY_BLOCK,
} as const;

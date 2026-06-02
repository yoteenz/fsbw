/**
 * Bump when re-baking lobby case/phone PNGs — `/assets/*` is cached immutable for 1y on Vercel
 * (`vercel.json`), so same filename without `?v=` keeps serving the old PNG.
 */

/** Display-case acrylic (`CASE.png`) — `npm run lobby:bake-case`. */
export const LOBBY_CASE_ASSET_VERSION = '7mfZBdMQ-v1';

export const LOBBY_CASE_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/7mfZBdMQEOXkht8MamYaG_DIB2ZDCl.jpeg';

export const LOBBY_CASE_SRC = `/assets/CASE.png?v=${LOBBY_CASE_ASSET_VERSION}`;

/** Lobby slide: acrylic case width (230px baseline −20%). Register/phone icon px sizes stay fixed. */
export const LOBBY_CASE_DISPLAY_WIDTH_PX = 184;

/** Horizontal nudge for case block on lobby slide (`translateX` after center). */
export const LOBBY_CASE_SLIDE_OFFSET_X_PX = 32;

/** Scales register/phone anchor offsets with the case; does not scale icon bitmaps. */
export const LOBBY_CASE_PROP_LAYOUT_SCALE = 0.8;

const lobbyCasePropOffset = (px: number) => Math.round(px * LOBBY_CASE_PROP_LAYOUT_SCALE);

/** Register anchor on case (`left-8` / `top: -39px` at 100% case scale). */
export const LOBBY_CASE_REGISTER_ANCHOR_LEFT_PX = lobbyCasePropOffset(32);
export const LOBBY_CASE_REGISTER_ANCHOR_TOP_PX = lobbyCasePropOffset(-39);

/** Phone anchor on case (`right-8` / `top: -33px` / `translateX(-6px)` at 100% scale). */
export const LOBBY_CASE_PHONE_ANCHOR_RIGHT_PX = lobbyCasePropOffset(32);
export const LOBBY_CASE_PHONE_ANCHOR_TOP_PX = lobbyCasePropOffset(-33);
export const LOBBY_CASE_PHONE_ANCHOR_TRANSLATE_X_PX = lobbyCasePropOffset(-6);

/** Extra nudge left for phone only (px, not scaled with case). */
export const LOBBY_CASE_PHONE_NUDGE_LEFT_PX = 22;

export const LOBBY_PHONE_ASSET_VERSION = 'q-oa7o8';

/** Lobby display-case phone (chroma-keyed PNG). */
export const LOBBY_PHONE_SRC = `/assets/lobby-phone.png?v=${LOBBY_PHONE_ASSET_VERSION}`;

/** Supabase green-screen original (re-bake with `npm run lobby:bake-phone`). */
export const LOBBY_PHONE_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder/q-oa7o-GX24j6k742w0p8_omgBoTaL.jpeg';

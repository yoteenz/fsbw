/**
 * Bump when re-baking lobby case/phone PNGs — `/assets/*` is cached immutable for 1y on Vercel
 * (`vercel.json`), so same filename without `?v=` keeps serving the old PNG.
 */

/** Display-case acrylic (`CASE.png`) — `npm run lobby:bake-case`. */
export const LOBBY_CASE_ASSET_VERSION = '37jR_8sO-v1';

export const LOBBY_CASE_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/37jR_8sOmtkmHDonwcu9i_RolTShHD.jpeg';

export const LOBBY_CASE_SRC = `/assets/CASE.png?v=${LOBBY_CASE_ASSET_VERSION}`;

export const LOBBY_PHONE_ASSET_VERSION = 'q-oa7o8';

/** Lobby display-case phone (chroma-keyed PNG). */
export const LOBBY_PHONE_SRC = `/assets/lobby-phone.png?v=${LOBBY_PHONE_ASSET_VERSION}`;

/** Supabase green-screen original (re-bake with `npm run lobby:bake-phone`). */
export const LOBBY_PHONE_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder/q-oa7o-GX24j6k742w0p8_omgBoTaL.jpeg';

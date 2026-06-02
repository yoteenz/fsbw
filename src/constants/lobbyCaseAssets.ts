/**
 * Bump when re-baking lobby case/phone PNGs — `/assets/*` is cached immutable for 1y on Vercel
 * (`vercel.json`), so same filename without `?v=` keeps serving the old PNG.
 */

/** Display-case acrylic (`CASE.png`) — original asset (restored pre–Jun 2026 rebake churn). */
export const LOBBY_CASE_ASSET_VERSION = 'original-v1';

/** @deprecated Rebake sources from Jun 2026 experiments — keep `public/assets/CASE.png` as canonical. */
export const LOBBY_CASE_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/RRrEEA6lu1lkeleVPTgsP_wgs8vmEv.jpeg';

export const LOBBY_CASE_SRC = `/assets/CASE.png?v=${LOBBY_CASE_ASSET_VERSION}`;

/** Lobby slide: acrylic case rendered width (230px original −30px). */
export const LOBBY_CASE_DISPLAY_WIDTH_PX = 200;

/** Horizontal nudge for case block on lobby slide (`translateX` after center); moves case + register + phone together. */
export const LOBBY_CASE_SLIDE_OFFSET_X_PX = 26;

/** Register/phone anchors use full case scale (1:1 with pre–Jun 2026 lobby). */
export const LOBBY_CASE_PROP_LAYOUT_SCALE = 1;

const lobbyCasePropOffset = (px: number) => Math.round(px * LOBBY_CASE_PROP_LAYOUT_SCALE);

/** Register anchor on case (`left-8` / `top: -39px`). */
export const LOBBY_CASE_REGISTER_ANCHOR_LEFT_PX = lobbyCasePropOffset(26);
export const LOBBY_CASE_REGISTER_ANCHOR_TOP_PX = lobbyCasePropOffset(-39);

/** Phone anchor on case (`right-8` / `top: -33px` / `translateX(-6px)`). */
export const LOBBY_CASE_PHONE_ANCHOR_RIGHT_PX = lobbyCasePropOffset(32);
export const LOBBY_CASE_PHONE_ANCHOR_TOP_PX = lobbyCasePropOffset(-33);
export const LOBBY_CASE_PHONE_ANCHOR_TRANSLATE_X_PX = lobbyCasePropOffset(-6);

/** Extra nudge left for phone only (px, not scaled with case). */
export const LOBBY_CASE_PHONE_NUDGE_LEFT_PX = 34;

export const LOBBY_PHONE_ASSET_VERSION = 'q-oa7o8';

/** Lobby display-case phone (chroma-keyed PNG). */
export const LOBBY_PHONE_SRC = `/assets/lobby-phone.png?v=${LOBBY_PHONE_ASSET_VERSION}`;

/** Supabase green-screen original (re-bake with `npm run lobby:bake-phone`). */
export const LOBBY_PHONE_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder/q-oa7o-GX24j6k742w0p8_omgBoTaL.jpeg';

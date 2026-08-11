import { loungeTvGlassCqw } from './loungeTvResponsive';

/** 10-foot TV type scale — LEVEL 1 (hero/page) through LEVEL 4 (helper). */
export const LOUNGE_TV_TYPE = {
  /** Primary title / hero / page title */
  l1: loungeTvGlassCqw(2.4, 6, 12),
  /** Section heading / card title / Mastery title */
  l2: loungeTvGlassCqw(1.95, 4.8, 9.5),
  /** Primary metadata — EP · duration · schedule */
  l3: loungeTvGlassCqw(1.55, 3.6, 7),
  /** Secondary helper copy (use sparingly) */
  l4: loungeTvGlassCqw(1.25, 2.8, 5.5),
} as const;

/**
 * Nested education screens (Mastery → Season → Certification).
 * Smaller than root browse/hero — readable hierarchy without display-scale body copy.
 */
export const LOUNGE_TV_NESTED_TYPE = {
  /** Mastery / season page title */
  pageTitle: loungeTvGlassCqw(2.2, 5.2, 10),
  /** In-screen section headings (CERTIFICATION PROGRESS, GET THE SEASON) */
  sectionTitle: loungeTvGlassCqw(1.5, 3.4, 6.5),
  /** Episode row titles, season card subtitles */
  cardTitle: loungeTvGlassCqw(1.35, 3, 5.8),
  /** Supporting sentences, descriptions */
  body: loungeTvGlassCqw(1.15, 2.5, 4.8),
  /** Availability, preview labels, metadata lines */
  meta: loungeTvGlassCqw(1.1, 2.35, 4.5),
  /** Nested inline CTAs (WATCH >, GET SEASON >) */
  cta: loungeTvGlassCqw(1.2, 2.7, 5),
  /** Certificate / reward title inside certification card */
  certificationTitle: loungeTvGlassCqw(1.4, 3.2, 6),
  /** Completion counts and progress status */
  certificationStatus: loungeTvGlassCqw(1.25, 2.8, 5.2),
  /** Earned reward headline (contained, not page-hero scale) */
  rewardTitle: loungeTvGlassCqw(1.4, 3.2, 6),
} as const;

/**
 * Detail / drill-in screens (Slay Tip, Explore, Library article).
 * Compact TV scale with mobile-readable floors on metadata.
 */
export const LOUNGE_TV_DETAIL_TYPE = {
  /** LEVEL 1 — page / detail title */
  pageTitle: loungeTvGlassCqw(1.85, 4.2, 8),
  /** LEVEL 2 — section heading */
  sectionTitle: loungeTvGlassCqw(1.45, 3.2, 6),
  /** LEVEL 3 — card / episode / related titles */
  cardTitle: loungeTvGlassCqw(1.35, 3, 5.8),
  /** LEVEL 4 — body / description */
  body: loungeTvGlassCqw(1.2, 2.65, 5),
  /** LEVEL 5 — metadata / status (readable minimum) */
  meta: loungeTvGlassCqw(1.1, 2.35, 4.5),
  /** Eyebrow / category line above title */
  eyebrow: loungeTvGlassCqw(1.05, 2.25, 4.3),
  /** Primary CTA */
  ctaPrimary: loungeTvGlassCqw(1.15, 2.6, 5),
  /** Secondary CTA */
  ctaSecondary: loungeTvGlassCqw(1.1, 2.45, 4.8),
  /** Tertiary / quiet actions */
  ctaTertiary: loungeTvGlassCqw(1.05, 2.2, 4.4),
} as const;

export const LOUNGE_TV_FOCUS_GLOW =
  '0 0 0 2px rgba(255,255,255,0.92), 0 0 24px rgba(255,255,255,0.18)';

export const LOUNGE_TV_FOCUS_SCALE = 'scale(1.03)';

import type { CareTextureFamily, WigUnitSlug } from '../care/productCatalog';

/** Education-facing metadata layered on canonical commerce unit ids — not a duplicate SKU record. */
export type SignatureUnitEducationMedia = {
  heroVideoUrl?: string;
  heroPosterUrl?: string;
  untouchedUnitVideoUrl?: string;
  untouchedUnitImageUrl?: string;
  hairMovementVideoUrl?: string;
  hairCloseupUrl?: string;
  laceMacroUrl?: string;
  knotMacroUrl?: string;
  hairlineMacroUrl?: string;
  interiorCapUrl?: string;
  fullUnitTurntableUrl?: string;
};

export type SignatureUnitEducationNotes = {
  introduction?: string;
  textureBehavior?: string;
  careConsiderations?: string[];
  relevantCourseTags?: string[];
};

export type SignatureUnitEducationProfile = {
  unitId: WigUnitSlug;
  /** Canonical commerce product id when distinct from unit slug. */
  productId?: string;
  displayName: string;
  textureFamily: CareTextureFamily;
  textureName?: string;
  hairOrigin?: string;
  hairType?: string;
  density?: string;
  defaultLength?: string;
  laceType?: string;
  laceDimensions?: string;
  constructionProfileId?: string;
  educationMedia?: SignatureUnitEducationMedia;
  educationNotes?: SignatureUnitEducationNotes;
  active?: boolean;
};

export type UnitContextSource =
  | 'owned'
  | 'selected'
  | 'follow-preference'
  | 'curriculum-selected'
  | 'general';

export type DemonstrationUnitStrategy =
  | 'continuity'
  | 'learner-selected'
  | 'curriculum-selected'
  | 'any-compatible';

export type ContinuityStage =
  | 'untouched'
  | 'lace-customized'
  | 'knots-processed'
  | 'lace-tinted'
  | 'colored'
  | 'installed'
  | 'styled'
  | 'aftercare'
  | string;

export type ResolvedEducationUnitContext = {
  /** Unit the learner is following for personalization (may differ from demonstration). */
  learnerUnitId: WigUnitSlug | null;
  /** Unit shown in the lesson when pedagogically selected. */
  demonstrationUnitId: WigUnitSlug | null;
  /** Hero / continuity unit carried across related classes when applicable. */
  continuityUnitId: WigUnitSlug | null;
  contextSource: UnitContextSource;
  generalMode: boolean;
  /** When demonstration intentionally differs from learner continuity unit. */
  demonstrationUnitReason?: string;
  ownedUnitIds: WigUnitSlug[];
  multipleOwnedUnits: boolean;
};

export type ChapterMediaResolution = {
  videoUrl?: string;
  posterUrl?: string;
  source: 'unit-specific' | 'texture-family' | 'shared' | 'fallback';
  resolvedUnitId?: WigUnitSlug;
};

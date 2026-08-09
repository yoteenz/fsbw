import type { WigUnitSlug, CareProductType, CareTextureFamily } from './productCatalog';
import type { CareEntitlementStatus } from '../types';

/**
 * CLASS UNIT — controlled Signature Unit used in PSA Today production/teaching.
 * Independent of the customer's purchased configuration.
 */
export type ClassUnitReference = {
  unitId: WigUnitSlug;
  continuityStage?: string;
  /** Editorial note — Class Unit specs come from Signature Unit education registry. */
  teachingStandard: 'signature-unit-class-spec';
};

/**
 * CONSTRUCTION DNA — what the product fundamentally is (approved catalog facts).
 */
export type OwnedUnitConstructionDna = {
  baseUnitId?: WigUnitSlug;
  productType?: CareProductType;
  textureFamily?: CareTextureFamily;
  hairOrigin?: string;
  laceType?: string;
  laceDimensions?: string;
};

/**
 * CUSTOMER CONFIGURATION — immutable order-time snapshot (Build-A-Wig selections).
 */
export type OwnedUnitCustomerConfiguration = {
  length?: string;
  density?: string;
  color?: string;
  texture?: string;
  lace?: string;
  capSize?: string;
  hairline?: string;
  styling?: string;
  partSelection?: string;
  addOns?: string[];
  hairOrigin?: string;
  /** Derived traits for rule matching — e.g. blonde, layered, curled */
  configurationTraits?: string[];
};

/**
 * TRANSFORMATION / CURRENT STATE — what has happened to the unit over time.
 * Defaults to order-time inferred state; may be updated by future owner workflows.
 */
export type OwnedUnitTransformationState = {
  stage?: string;
  colorProcessed?: boolean;
  blondeProcessed?: boolean;
  layered?: boolean;
  curled?: boolean;
  straightened?: boolean;
  installed?: boolean;
  /** Extensible string tags for future care rules */
  stateTags?: string[];
};

/**
 * YOUR UNIT — customer's actual purchased/configured product (entitlement driver).
 */
export type YourOwnedUnit = {
  id: string;
  userId: string;
  orderId: string;
  orderLineKey: string;
  displayName: string;
  productName: string;
  status: CareEntitlementStatus;
  grantedAt: string;
  constructionDna: OwnedUnitConstructionDna;
  customerConfiguration: OwnedUnitCustomerConfiguration;
  transformationState: OwnedUnitTransformationState;
};

export type CareEntitlementSourceType =
  | 'paid_episode'
  | 'paid_season'
  | 'qualifying_product'
  | 'promotion'
  | 'admin_grant';

export type CareContentEntitlementSource = {
  sourceType: CareEntitlementSourceType;
  orderId?: string;
  orderLineKey?: string;
  ownedUnitId?: string;
  careRuleId?: string;
};

export type ResolvedCareContentEntitlement = {
  contentId: string;
  contentKind: 'care-guide';
  /** Canonical library entry — deduped across units */
  sources: CareContentEntitlementSource[];
  appliesToOwnedUnitIds: string[];
};

/**
 * Mastery Class Kit — data model for lesson materials (self-source vs future official kit).
 *
 * Standard access: view lesson, source tools/products individually (FS storefront, Amazon, external).
 * Premium (future): eligible for curated official Frontal Slayer Mastery Kit when fulfillment exists.
 *
 * No checkout, inventory, entitlement grants, or fulfillment in this sprint.
 */

export type MasteryKitSourceType = 'frontal-slayer' | 'amazon' | 'external';

export type MasteryKitItem = {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  sourceType?: MasteryKitSourceType;
  productId?: string;
  externalUrl?: string;
  thumbnail?: string;
  quantity?: number;
  notes?: string;
};

export type MasteryKitPresentationMode = 'self-source' | 'official-kit-future';

/** Feature flag — official physical Mastery Kit fulfillment not live. */
export const OFFICIAL_MASTERY_KIT_FULFILLMENT_ENABLED = false;

export const MASTERY_KIT_COPY = {
  selfSourceTitle: 'CLASS KIT',
  selfSourceIntro:
    'Gather the tools and products needed for this lesson. Source items individually — a physical kit is not included with standard access.',
  selfSourceNote:
    'Shop Frontal Slayer, Amazon, or your preferred source for each required item.',
  premiumFutureIntro:
    'Premium members will be eligible for the official curated Frontal Slayer Mastery Kit when physical kits become available.',
  premiumFutureDisabled:
    'Official Mastery Kits are not available yet. Continue with self-sourced materials for now.',
} as const;

export function resolveMasteryKitPresentationMode(isPremiumMember: boolean): MasteryKitPresentationMode {
  if (OFFICIAL_MASTERY_KIT_FULFILLMENT_ENABLED && isPremiumMember) {
    return 'official-kit-future';
  }
  return 'self-source';
}

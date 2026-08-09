/**
 * Centralized commerce / affiliate configuration for Lounge PSA Today and related surfaces.
 * Do NOT scatter Amazon or FS storefront URLs across JSX — insert them here or in episode class-kit config.
 */

export type CommerceDestination = 'fs' | 'amazon' | 'choice';

/** Per-item or per-kit link set — all fields optional until production URLs are supplied. */
export type CommerceLinkSet = {
  fsStorefrontUrl?: string;
  fsProductUrl?: string;
  fsCollectionUrl?: string;
  amazonStorefrontUrl?: string;
  amazonIdeaListUrl?: string;
  amazonProductUrl?: string;
  preferredDestination?: CommerceDestination;
};

export type CommerceGlobalConfig = {
  /** Site-wide Frontal Slayer shop entry (fallback when item has no specific FS URL). */
  fsDefaultStorefrontUrl: string;
  /** Future Amazon Influencer / affiliate storefront — null until configured. */
  amazonStorefrontUrl?: string;
  /** Future Amazon Idea List for full lesson kits — null until configured. */
  amazonDefaultIdeaListUrl?: string;
  /** Configurable affiliate disclosure — null until legal copy is approved. */
  affiliateDisclosure?: string;
};

export const COMMERCE_CONFIG: CommerceGlobalConfig = {
  fsDefaultStorefrontUrl: '/home/shop',
  amazonStorefrontUrl: undefined,
  amazonDefaultIdeaListUrl: undefined,
  affiliateDisclosure: undefined,
};

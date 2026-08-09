import { COMMERCE_CONFIG, type CommerceDestination, type CommerceLinkSet } from '../../../config/commerce';
import type { PSAClassKitItem } from './types';

export type ShoppingRoute = {
  destination: 'fs' | 'amazon';
  url: string;
  label: string;
};

export type ShoppingResolution =
  | { kind: 'direct'; route: ShoppingRoute }
  | { kind: 'choice'; routes: ShoppingRoute[] }
  | { kind: 'unavailable' };

function fsUrl(links: CommerceLinkSet): string | undefined {
  return links.fsProductUrl ?? links.fsCollectionUrl ?? links.fsStorefrontUrl;
}

function amazonUrl(links: CommerceLinkSet): string | undefined {
  return (
    links.amazonProductUrl ??
    links.amazonIdeaListUrl ??
    links.amazonStorefrontUrl ??
    COMMERCE_CONFIG.amazonDefaultIdeaListUrl ??
    COMMERCE_CONFIG.amazonStorefrontUrl
  );
}

function resolveByPreference(
  links: CommerceLinkSet,
  fsLabel: string,
  amazonLabel: string
): ShoppingResolution {
  const fs = fsUrl(links) ?? COMMERCE_CONFIG.fsDefaultStorefrontUrl;
  const amz = amazonUrl(links);
  const pref: CommerceDestination = links.preferredDestination ?? 'choice';

  if (fs && amz) {
    if (pref === 'fs') {
      return { kind: 'direct', route: { destination: 'fs', url: fs, label: fsLabel } };
    }
    if (pref === 'amazon') {
      return { kind: 'direct', route: { destination: 'amazon', url: amz, label: amazonLabel } };
    }
    return {
      kind: 'choice',
      routes: [
        { destination: 'fs', url: fs, label: 'SHOP FS' },
        { destination: 'amazon', url: amz, label: 'SHOP AMAZON' },
      ],
    };
  }
  if (fs) {
    return { kind: 'direct', route: { destination: 'fs', url: fs, label: fsLabel } };
  }
  if (amz) {
    return { kind: 'direct', route: { destination: 'amazon', url: amz, label: amazonLabel } };
  }
  return { kind: 'unavailable' };
}

export function resolveClassKitItemShopping(item: PSAClassKitItem): ShoppingResolution {
  return resolveByPreference(
    item,
    'SHOP AT FRONTAL SLAYER',
    'SHOP ON AMAZON'
  );
}

export function resolveFullKitShopping(
  fullKit: NonNullable<import('./types').PSAClassKit['fullKit']>
): ShoppingResolution {
  return resolveByPreference(fullKit, 'SHOP FS', 'SHOP AMAZON');
}

export function openShoppingRoute(route: ShoppingRoute): void {
  if (typeof window === 'undefined') return;
  window.open(route.url, '_blank', 'noopener,noreferrer');
}

export function getAffiliateDisclosure(): string | undefined {
  return COMMERCE_CONFIG.affiliateDisclosure;
}

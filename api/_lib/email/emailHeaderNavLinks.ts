import { resolveSiteOrigin } from './brandAssets.js';

export type EmailHeaderNavLink = {
  label: string;
  path: string;
};

/** Top nav strip below the FRONTAL SLAYER wordmark — JLUX-style editorial links. */
export const EMAIL_HEADER_NAV_LINKS: readonly EmailHeaderNavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/home/shop' },
  { label: 'Build-a-Wig', path: '/build-a-wig' },
  { label: 'Rewards', path: '/account/rewards' },
] as const;

export function resolveEmailHeaderNavUrl(path: string): string {
  const origin = resolveSiteOrigin();
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${clean}`;
}

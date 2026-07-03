import { resolveSiteOrigin } from './brandAssets.js';

/** Same platforms/icons as src/constants/socialLinks.ts MENU_SOCIAL_LINKS — PNG for email clients. */
export const EMAIL_SOCIAL_LINKS = [
  {
    href: 'https://www.instagram.com/frontalslayer/',
    label: 'Instagram',
    iconPath: 'email/icons/instagram-icon.png',
  },
  {
    href: 'https://x.com/frontalslayer',
    label: 'X (Twitter)',
    iconPath: 'email/icons/twitter-icon.png',
  },
  {
    href: 'https://www.facebook.com/bookfrontalslayer',
    label: 'Facebook',
    iconPath: 'email/icons/facebook-icon.png',
  },
] as const;

export function resolveEmailSocialIconUrl(iconPath: string): string {
  const origin = resolveSiteOrigin();
  const clean = iconPath.replace(/^\/+/, '');
  return `${origin}/assets/${clean.startsWith('assets/') ? clean.slice('assets/'.length) : clean}`;
}

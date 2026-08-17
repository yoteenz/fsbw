import { homePathways } from './homePathways';
import { aioPaths } from '../utils/paths';
import { aioPlatformIcons, AIO_ICON_ASSET_VERSION } from '../config/aioIconRegistry';

const v = (path: string) => `${path}?v=${AIO_ICON_ASSET_VERSION}`;

export type MobileDrawerLink = {
  label: string;
  href: string;
  iconSrc?: string;
};

/** Primary solutions — all six discovery categories + bookkeeping */
export const mobileDrawerSolutions: MobileDrawerLink[] = [
  ...homePathways.map((p) => ({
    label: p.title.replace(/\s+/g, ' '),
    href: p.href,
    iconSrc: p.iconSrc,
  })),
  {
    label: 'Bookkeeping',
    href: aioPaths.bookkeeping,
    iconSrc: v(aioPlatformIcons.bookkeeping),
  },
];

export const mobileDrawerCompany: MobileDrawerLink[] = [
  { label: 'About Us', href: aioPaths.about },
  { label: 'How It Works', href: aioPaths.roadReadyPublic },
  { label: 'Resources', href: aioPaths.resources },
  { label: 'Contact Us', href: aioPaths.contact },
];

/** Curated homepage service preview — all six primary categories */
export const mobileHomeServices = homePathways;

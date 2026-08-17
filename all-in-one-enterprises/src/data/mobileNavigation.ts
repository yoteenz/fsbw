import { homePathways } from './homePathways';
import { aioPaths } from '../utils/paths';

export type MobileDrawerLink = {
  label: string;
  href: string;
  iconSrc?: string;
};

/** Primary solutions shown in mobile drawer — mirrors approved reference + existing routes */
export const mobileDrawerSolutions: MobileDrawerLink[] = homePathways.map((p) => ({
  label: p.title.replace(/\s+/g, ' '),
  href: p.href,
  iconSrc: p.iconSrc,
}));

export const mobileDrawerCompany: MobileDrawerLink[] = [
  { label: 'About Us', href: aioPaths.about },
  { label: 'How It Works', href: aioPaths.roadReadyPublic },
  { label: 'Resources', href: aioPaths.resources },
  { label: 'Contact Us', href: aioPaths.contact },
];

/** Curated homepage service preview (first four + view all) */
export const mobileHomeServices = homePathways.slice(0, 4);

/**
 * Authenticated SITE 00 ecosystem navigation — desktop rail + mobile bottom nav.
 */

import { SITE00_ROUTES } from './routes';

export type EcosystemNavId = 'control' | 'projects' | 'sites' | 'bldr' | 'idnty';

export type EcosystemRailItem = {
  id: string;
  label: string;
  href: string;
  dividerBefore?: boolean;
};

export type EcosystemMobileNavItem = {
  id: EcosystemNavId;
  topLabel: string;
  bottomLabel: string;
  href: string;
};

/** Desktop left rail for authenticated ecosystem (storyboard IA). */
export const ECOSYSTEM_RAIL_NAV: EcosystemRailItem[] = [
  { id: 'control', label: 'CTRL ROOM', href: SITE00_ROUTES.control },
  { id: 'projects', label: 'PROJECTS', href: SITE00_ROUTES.projects },
  { id: 'sites', label: 'SITES', href: SITE00_ROUTES.controlSites },
  { id: 'bldr', label: 'BLDR / START BUILD', href: SITE00_ROUTES.bldr, dividerBefore: true },
  { id: 'services', label: 'SERVICES', href: SITE00_ROUTES.services },
  { id: 'journal', label: 'JOURNAL', href: SITE00_ROUTES.journal },
  { id: 'support', label: 'SUPPORT', href: SITE00_ROUTES.support },
  { id: 'idnty', label: 'IDNTY', href: SITE00_ROUTES.idnty },
];

/** Mobile bottom nav — five primary destinations. */
export const ECOSYSTEM_MOBILE_NAV: EcosystemMobileNavItem[] = [
  { id: 'control', topLabel: 'CTRL', bottomLabel: 'ROOM', href: SITE00_ROUTES.control },
  { id: 'projects', topLabel: 'PROJ', bottomLabel: 'ECTS', href: SITE00_ROUTES.projects },
  { id: 'sites', topLabel: 'SITES', bottomLabel: '', href: SITE00_ROUTES.controlSites },
  { id: 'bldr', topLabel: 'BLDR', bottomLabel: '', href: SITE00_ROUTES.bldr },
  { id: 'idnty', topLabel: 'IDNTY', bottomLabel: '', href: SITE00_ROUTES.idnty },
];

export function ecosystemNavIdFromPath(pathname: string): EcosystemNavId {
  if (pathname.startsWith(SITE00_ROUTES.projects)) return 'projects';
  if (pathname.startsWith(SITE00_ROUTES.controlSites)) return 'sites';
  if (pathname.startsWith(SITE00_ROUTES.bldr)) return 'bldr';
  if (pathname.startsWith(SITE00_ROUTES.idnty)) return 'idnty';
  if (pathname.startsWith(SITE00_ROUTES.control)) return 'control';
  return 'control';
}

export function isEcosystemRailActive(pathname: string, item: EcosystemRailItem): boolean {
  if (item.id === 'control') {
    return pathname === SITE00_ROUTES.control;
  }
  if (item.id === 'projects') {
    return pathname.startsWith(SITE00_ROUTES.projects);
  }
  if (item.id === 'sites') {
    return pathname.startsWith(SITE00_ROUTES.controlSites);
  }
  if (item.id === 'bldr') {
    return pathname.startsWith(SITE00_ROUTES.bldr);
  }
  if (item.id === 'idnty') {
    return pathname.startsWith(SITE00_ROUTES.idnty);
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isEcosystemMobileNavActive(pathname: string, id: EcosystemNavId): boolean {
  return ecosystemNavIdFromPath(pathname) === id;
}

export type EcosystemPageMeta = {
  title: string;
  subtitle: string;
};

export function ecosystemPageMeta(pathname: string): EcosystemPageMeta {
  if (pathname.startsWith(SITE00_ROUTES.projects)) {
    return { title: 'PROJECTS', subtitle: 'ALL PROJECTS AND WORKSPACES.' };
  }
  if (pathname.startsWith(SITE00_ROUTES.controlSites)) {
    return { title: 'SITES', subtitle: 'MANAGE ALL OF YOUR SITE 00 PROPERTIES.' };
  }
  return { title: 'CTRL ROOM', subtitle: 'COMMAND CENTER. YOUR UNIVERSE AT A GLANCE.' };
}

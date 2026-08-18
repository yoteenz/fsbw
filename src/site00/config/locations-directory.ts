/**
 * SITE 00 Screen 01 — Locations Directory content.
 * Mobile-only composition; desktop unchanged.
 */

import { SITE00_ROUTES } from './routes';

export type LocationsDirectoryEntry = {
  id: string;
  index: string;
  title: string;
  descriptionLines: [string, string];
  href: string;
  enabled: boolean;
};

export const SITE00_LOCATIONS_BACKGROUND_PATH = '0E226A0B-7533-433F-A9D0-7DD5109D77AC.png';

export const SITE00_LOCATIONS_DIRECTORY: LocationsDirectoryEntry[] = [
  {
    id: 'bldr',
    index: '01',
    title: 'BLDR',
    descriptionLines: ['DEFINE WHAT', "WE'RE BUILDING."],
    href: SITE00_ROUTES.bldr,
    enabled: true,
  },
  {
    id: 'sites',
    index: '02',
    title: 'SITES',
    descriptionLines: ["EXPLORE WHAT'S", 'ALREADY BUILT.'],
    href: SITE00_ROUTES.sites,
    enabled: true,
  },
  {
    id: 'system',
    index: '03',
    title: 'SYSTEM',
    descriptionLines: ['HOW SITE 00', 'WORKS.'],
    href: SITE00_ROUTES.system,
    enabled: true,
  },
  {
    id: 'about',
    index: '04',
    title: 'ABOUT',
    descriptionLines: ['WHO WE ARE', '& WHY WE BUILD.'],
    href: SITE00_ROUTES.about,
    enabled: true,
  },
  {
    id: 'journal',
    index: '05',
    title: 'JOURNAL',
    descriptionLines: ['INSIGHTS &', 'UPDATES.'],
    href: SITE00_ROUTES.journal,
    enabled: true,
  },
];

export type Site00MobileNavId = 'origin' | 'locations' | 'build';

export const SITE00_MOBILE_NAV: {
  id: Site00MobileNavId;
  topLabel: string;
  bottomLabel: string;
  href: string;
  icon?: 'locations-target';
}[] = [
  { id: 'origin', topLabel: '00', bottomLabel: 'ORIGIN', href: SITE00_ROUTES.originAlias },
  { id: 'locations', topLabel: '', bottomLabel: 'LOCATIONS', href: SITE00_ROUTES.locations, icon: 'locations-target' },
  { id: 'build', topLabel: 'START', bottomLabel: 'BUILD', href: SITE00_ROUTES.bldr },
];

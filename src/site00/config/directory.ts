/**
 * ENTER 00 / 00 Directory — editable content layer.
 * Environment is locked; this data drives the directory panel only.
 */

import { SITE00_CTRL_ROOM_PATH, site00SignInHrefWithReturnTo } from './mobile-directory-nav';
import { SITE00_ROUTES } from './routes';

export type EnterMenuIconId =
  | 'bldr-studio'
  | 'projects'
  | 'account'
  | 'idnty'
  | 'ctrl-room'
  | 'my-sites';

export type YourSpaceRow = {
  id: string;
  title: string;
  description: string;
  href: string;
  enterIcon: EnterMenuIconId;
  /** When true, signed-out users see lock + sign-in treatment */
  requiresAuth?: boolean;
  enabled: boolean;
};

export const YOUR_SPACE_SIGNED_IN_ROWS: YourSpaceRow[] = [
  {
    id: 'bldr-studio',
    title: 'BLDR STUDIO',
    description: 'CREATE & DEPLOY.',
    href: SITE00_ROUTES.bldr,
    enabled: true,
    enterIcon: 'bldr-studio',
  },
  {
    id: 'projects',
    title: 'PROJECTS',
    description: 'YOUR ACTIVE BUILDS.',
    href: SITE00_ROUTES.projects,
    enabled: true,
    enterIcon: 'projects',
  },
  {
    id: 'my-sites',
    title: 'MY SITES',
    description: "WHAT WE'VE BUILT.",
    href: SITE00_ROUTES.controlSites,
    enabled: true,
    enterIcon: 'my-sites',
  },
  {
    id: 'account',
    title: 'ACCOUNT',
    description: 'PROFILE, ACCESS & PREFERENCES.',
    href: SITE00_ROUTES.controlSettings,
    enabled: true,
    enterIcon: 'account',
  },
];

export const YOUR_SPACE_SIGNED_OUT_ROWS: YourSpaceRow[] = [
  {
    id: 'idnty',
    title: 'IDNTY',
    description: 'CREATE OR ACCESS YOUR SITE 00 IDENTITY.',
    href: SITE00_ROUTES.idnty,
    enabled: true,
    enterIcon: 'idnty',
  },
  {
    id: 'ctrl-room',
    title: 'CTRL ROOM',
    description: 'SIGN IN TO ENTER.',
    href: SITE00_CTRL_ROOM_PATH,
    enabled: true,
    requiresAuth: true,
    enterIcon: 'ctrl-room',
  },
  {
    id: 'projects',
    title: 'PROJECTS',
    description: 'SIGN IN TO VIEW YOUR BUILDS.',
    href: SITE00_ROUTES.projects,
    enabled: true,
    requiresAuth: true,
    enterIcon: 'projects',
  },
  {
    id: 'my-sites',
    title: 'MY SITES',
    description: 'SIGN IN TO VIEW YOUR DIGITAL PROPERTIES.',
    href: SITE00_ROUTES.controlSites,
    enabled: true,
    requiresAuth: true,
    enterIcon: 'my-sites',
  },
];

export function resolveYourSpaceRowHref(
  row: YourSpaceRow,
  isSignedIn: boolean,
  pathname: string,
): string {
  if (row.requiresAuth && !isSignedIn) {
    return site00SignInHrefWithReturnTo({ pathname: row.href, search: '' });
  }
  void pathname;
  return row.href;
}

export const SITE00_ENTER_COPY = {
  locationLabel: 'LOCATION / ENTER 00',
  welcomeNumber: '00',
  welcomeTitle: 'WELCOME TO 00',
  welcomeSubtitle: 'WHERE WOULD YOU LIKE TO GO?',
  welcomeBody: "TAKE A MOMENT. YOU'RE IN THE RIGHT PLACE.",
  statusStrip: "YOU'VE ENTERED SITE 00. ♦ CHOOSE YOUR DESTINATION. ♦ WE'LL HANDLE THE REST.",
  yourSpaceHeading: 'YOUR SPACE',
  fastTravelHeading: 'FAST TRAVEL',
} as const;

import { BRAND_CONTACT_EMAIL, BRAND_CONTACT_INTRO_HOURS } from './brandContactCopy';

/** Lobby display-case phone popover — business contact (aligned with brand contact). */
export const LOBBY_PHONE_POPOVER_TITLE = 'CONTACT';

export type LobbyPhonePopoverLine = {
  text: string;
  /** Red Futura PT Medium (email, holidays note). */
  emphasis?: 'brand-red-medium';
};

export type LobbyPhonePopoverSection = {
  heading: string;
  lines: readonly LobbyPhonePopoverLine[];
};

export const LOBBY_PHONE_POPOVER_SECTIONS: readonly LobbyPhonePopoverSection[] = [
  {
    heading: 'email',
    lines: [{ text: BRAND_CONTACT_EMAIL, emphasis: 'brand-red-medium' }],
  },
  {
    heading: 'hours',
    lines: [
      { text: BRAND_CONTACT_INTRO_HOURS },
      { text: 'WEEKDAYS ONLY' },
      { text: 'MAJOR US HOLIDAYS EXCLUDED', emphasis: 'brand-red-medium' },
    ],
  },
  {
    heading: 'questions',
    lines: [{ text: 'PLEASE ALLOW UP TO 72 HOURS FOR A RESPONSE' }],
  },
];

/** Lobby cash register popover — logo grid from `LOBBY_PAYMENT_ICONS`. */
export const LOBBY_REGISTER_POPOVER_TITLE = 'PAYMENT METHODS';

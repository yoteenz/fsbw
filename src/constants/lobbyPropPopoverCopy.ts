import { BRAND_CONTACT_EMAIL, BRAND_CONTACT_INTRO_HOURS } from './brandContactCopy';

/** Lobby display-case phone popover — business contact (aligned with brand contact). */
export const LOBBY_PHONE_POPOVER_TITLE = 'CONTACT US';

export type LobbyPhonePopoverLinePart = {
  text: string;
  /** Gray Futura PT Demi. */
  emphasis?: 'futura-demi-gray';
};

/** Single-style line, or mixed spans (e.g. gray Demi “72 HOURS” mid-sentence). */
export type LobbyPhonePopoverLine =
  | { text: string; emphasis?: 'futura-demi-gray' }
  | { parts: readonly LobbyPhonePopoverLinePart[] };

export type LobbyPhonePopoverSection = {
  heading: string;
  lines: readonly LobbyPhonePopoverLine[];
};

export const LOBBY_PHONE_POPOVER_SECTIONS: readonly LobbyPhonePopoverSection[] = [
  {
    heading: 'email',
    lines: [{ text: BRAND_CONTACT_EMAIL, emphasis: 'futura-demi-gray' }],
  },
  {
    heading: 'hours',
    lines: [
      { text: BRAND_CONTACT_INTRO_HOURS },
      { text: 'WEEKDAYS ONLY' },
      { text: 'MAJOR US HOLIDAYS EXCLUDED', emphasis: 'futura-demi-gray' },
    ],
  },
  {
    heading: 'questions',
    lines: [
      {
        parts: [
          { text: 'PLEASE ALLOW ' },
          { text: '72 HOURS', emphasis: 'futura-demi-gray' },
          { text: ' FOR A RESPONSE' },
        ],
      },
    ],
  },
];

/** Lobby cash register popover — logo grid from `LOBBY_PAYMENT_ICONS`. */
export const LOBBY_REGISTER_POPOVER_TITLE = 'PAYMENT METHODS';

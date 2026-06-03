import { BRAND_CONTACT_EMAIL, BRAND_CONTACT_INTRO_HOURS } from './brandContactCopy';

/** Lobby display-case phone popover — business contact (aligned with brand contact). */
export const LOBBY_PHONE_POPOVER_TITLE = 'CONTACT US';

export type LobbyPhonePopoverLinePart = {
  text: string;
  /** Gray Futura PT Medium. */
  emphasis?: 'futura-medium-gray';
};

/** Single-style line, or mixed spans (e.g. gray Medium “72 HOURS” mid-sentence). */
export type LobbyPhonePopoverLine =
  | { text: string; emphasis?: 'futura-medium-gray' }
  | { parts: readonly LobbyPhonePopoverLinePart[] };

export type LobbyPhonePopoverSection = {
  heading: string;
  lines: readonly LobbyPhonePopoverLine[];
};

export const LOBBY_PHONE_POPOVER_SECTIONS: readonly LobbyPhonePopoverSection[] = [
  {
    heading: 'email',
    lines: [{ text: BRAND_CONTACT_EMAIL }],
  },
  {
    heading: 'hours',
    lines: [
      { text: BRAND_CONTACT_INTRO_HOURS },
      { text: 'WEEKDAYS ONLY' },
      { text: 'MAJOR US HOLIDAYS EXCLUDED' },
    ],
  },
  {
    heading: 'questions',
    lines: [
      {
        parts: [
          { text: 'PLEASE ALLOW ' },
          { text: '72 HOURS', emphasis: 'futura-medium-gray' },
          { text: ' FOR A RESPONSE' },
        ],
      },
    ],
  },
];

/** Lobby cash register popover — logo grid from `LOBBY_PAYMENT_ICONS`. */
export const LOBBY_REGISTER_POPOVER_TITLE = 'PAYMENT METHODS';

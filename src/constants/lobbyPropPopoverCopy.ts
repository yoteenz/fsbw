import { BRAND_CONTACT_EMAIL, BRAND_CONTACT_INTRO_HOURS } from './brandContactCopy';

/** Lobby display-case phone popover — business contact (aligned with brand contact). */
export const LOBBY_PHONE_POPOVER_TITLE = 'CONTACT';

export const LOBBY_PHONE_POPOVER_SECTIONS: ReadonlyArray<{
  heading: string;
  lines: readonly string[];
}> = [
  {
    heading: 'EMAIL',
    lines: [BRAND_CONTACT_EMAIL],
  },
  {
    heading: 'HOURS',
    lines: [BRAND_CONTACT_INTRO_HOURS, 'WEEKDAYS ONLY', 'MAJOR US HOLIDAYS EXCLUDED'],
  },
  {
    heading: 'INQUIRIES',
    lines: ['ALLOW 72 HOURS FOR A RESPONSE', 'VISIT BRAND > CONTACT FOR THE FORM'],
  },
];

/** Lobby cash register popover — matches checkout payment options. */
export const LOBBY_REGISTER_POPOVER_TITLE = 'PAYMENT METHODS';

export const LOBBY_REGISTER_POPOVER_SECTIONS: ReadonlyArray<{
  heading: string;
  lines: readonly string[];
}> = [
  {
    heading: 'CARDS',
    lines: ['VISA', 'MASTERCARD', 'AMERICAN EXPRESS', 'DISCOVER'],
  },
  {
    heading: 'EXPRESS CHECKOUT',
    lines: ['APPLE PAY', 'SHOP PAY', 'PAYPAL', 'GOOGLE PAY'],
  },
  {
    heading: 'PAY OVER TIME',
    lines: ['AFFIRM', 'AFTERPAY', 'KLARNA'],
  },
];

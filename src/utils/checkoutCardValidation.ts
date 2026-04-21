import { isAyoteenzAdminAccount } from './adminAuth';

/** Stripe-style test PAN; only the founder-privileged session + matching checkout email may use it here. */
export const FOUNDER_CHECKOUT_DUMMY_PAN = '4242424242424242';

function normalizePan(raw: string): string {
  return raw.replace(/\D/g, '');
}

function luhnValid(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (Number.isNaN(n)) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** Founder may use dummy PAN only when signed in as founder and checkout email matches that session. */
export function canUseFounderDummyCheckout(args: {
  signedInUser: { email?: string } | null;
  checkoutEmail: string;
}): boolean {
  const orderEmail = (args.checkoutEmail || '').trim().toLowerCase();
  const session = args.signedInUser;
  if (!session?.email || !isAyoteenzAdminAccount(session)) return false;
  return (session.email || '').trim().toLowerCase() === orderEmail;
}

export type CheckoutCardValidationResult =
  | { ok: true; usedFounderDummyPan: boolean }
  | { ok: false; message: string };

/**
 * Validates card fields at product checkout. Founder + matching email may use FOUNDER_CHECKOUT_DUMMY_PAN
 * without Luhn; everyone else needs a Luhn-valid PAN and basic exp/CVV shape.
 */
export function validateCheckoutCardInput(args: {
  signedInUser: { email?: string } | null;
  checkoutEmail: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  /** When set, a 4-digit entry matching this (masked card on file) is treated as placeholder — exp/CVV still required. */
  savedCardLast4?: string | null;
}): CheckoutCardValidationResult {
  const digits = normalizePan(args.cardNumber);
  const last4 = (args.savedCardLast4 || '').replace(/\D/g, '');
  if (last4.length === 4 && digits === last4) {
    const exp = args.expirationDate.trim();
    if (!/^\s*(0[1-9]|1[0-2])\s*\/\s*(\d{2}|\d{4})\s*$/.test(exp)) {
      return { ok: false, message: 'ENTER EXPIRATION AS MM/YY OR MM/YYYY.' };
    }
    const cvvDigits = normalizePan(args.cvv);
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      return { ok: false, message: 'CVV MUST BE 3 OR 4 DIGITS.' };
    }
    return { ok: true, usedFounderDummyPan: false };
  }
  const founderDummyOk =
    canUseFounderDummyCheckout({
      signedInUser: args.signedInUser,
      checkoutEmail: args.checkoutEmail,
    }) && digits === FOUNDER_CHECKOUT_DUMMY_PAN;

  if (founderDummyOk) {
    return { ok: true, usedFounderDummyPan: true };
  }

  if (digits === FOUNDER_CHECKOUT_DUMMY_PAN) {
    return {
      ok: false,
      message:
        'THIS TEST CARD IS RESERVED FOR THE FOUNDER ADMIN ACCOUNT. SIGN IN AS THAT ACCOUNT AND USE THE SAME EMAIL AT CHECKOUT, OR USE A VALID CARD NUMBER.',
    };
  }

  if (digits.length < 13 || digits.length > 19) {
    return { ok: false, message: 'INVALID CARD NUMBER.' };
  }

  if (!luhnValid(digits)) {
    return { ok: false, message: 'INVALID CARD NUMBER.' };
  }

  const exp = args.expirationDate.trim();
  if (!/^\s*(0[1-9]|1[0-2])\s*\/\s*(\d{2}|\d{4})\s*$/.test(exp)) {
    return { ok: false, message: 'ENTER EXPIRATION AS MM/YY OR MM/YYYY.' };
  }

  const cvvDigits = normalizePan(args.cvv);
  if (cvvDigits.length < 3 || cvvDigits.length > 4) {
    return { ok: false, message: 'CVV MUST BE 3 OR 4 DIGITS.' };
  }

  return { ok: true, usedFounderDummyPan: false };
}

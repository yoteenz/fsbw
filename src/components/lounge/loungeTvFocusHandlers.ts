import type { FocusEvent } from 'react';

export function isLoungeTvSilentFocus(el: EventTarget | null): boolean {
  return el instanceof HTMLElement && el.hasAttribute('data-lounge-tv-focus-silent');
}

/** Lounge TV intentionally omits visible focus rings — spatial nav restores via focus memory only. */
export function loungeTvFocusGlowIn(_e: FocusEvent<HTMLElement>): void {}

export function loungeTvFocusGlowOut(_e: FocusEvent<HTMLElement>): void {}

export function loungeTvFocusBorderIn(_e: FocusEvent<HTMLElement>, _activeColor?: string): void {}

export function loungeTvFocusBorderOut(_e: FocusEvent<HTMLElement>, _idleColor?: string): void {}

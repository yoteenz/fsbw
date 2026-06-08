/** Shared open state for the nav cart dropdown (single source of truth). */

export const CART_DROPDOWN_OPEN_CHANGED_EVENT = 'cartDropdownOpenChanged';

let cartDropdownOpen = false;

export function isCartDropdownOpen(): boolean {
  return cartDropdownOpen;
}

export function setCartDropdownOpenState(open: boolean): void {
  if (cartDropdownOpen === open) return;
  cartDropdownOpen = open;
  window.dispatchEvent(
    new CustomEvent(CART_DROPDOWN_OPEN_CHANGED_EVENT, { detail: open })
  );
}

export function subscribeCartDropdownOpenState(
  listener: (open: boolean) => void
): () => void {
  listener(cartDropdownOpen);
  const onEvent = (event: Event) => {
    listener(Boolean((event as CustomEvent<boolean>).detail));
  };
  window.addEventListener(CART_DROPDOWN_OPEN_CHANGED_EVENT, onEvent);
  return () => window.removeEventListener(CART_DROPDOWN_OPEN_CHANGED_EVENT, onEvent);
}

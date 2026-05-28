import type { CSSProperties, ReactNode } from 'react';
import { CartLineProductTextStack, CartLineTextLayer } from '../cart/CartLineProductTextStack';

/** Wishlist list / card text column — same fixed layers as cart & bag. */
export function WishlistLineProductTextStack({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <CartLineProductTextStack className="wishlist-line-product-text-stack" style={style}>
      {children}
    </CartLineProductTextStack>
  );
}

export { CartLineTextLayer };

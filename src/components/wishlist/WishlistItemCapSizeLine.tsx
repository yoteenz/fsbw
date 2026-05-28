import { CartLineTextLayer } from '../cart/CartLineProductTextStack';
import { cartLineCapSizeTextStyle } from '../../utils/cartLineProductLayers';

type WishlistItemCapSizeLineProps = {
  item: { capSize?: string };
};

/** Gray CAP SIZE row — fixed cap layer (cart / bag / wishlist parity). */
export function WishlistItemCapSizeLine({ item }: WishlistItemCapSizeLineProps) {
  if (!item.capSize) return null;
  return (
    <CartLineTextLayer slot="cap">
      <p className="font-semibold" style={cartLineCapSizeTextStyle()}>
        CAP SIZE: {item.capSize}
      </p>
    </CartLineTextLayer>
  );
}

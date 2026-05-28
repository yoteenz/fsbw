import { cartLineCapSizeParagraphStyle, type CartLineSpacingItem } from '../../utils/cartCapSizeLineMargin';

type WishlistItemCapSizeLineProps = {
  item: CartLineSpacingItem & { capSize?: string };
};

/** Gray CAP SIZE row — same spacing rules as shopping bag / cart dropdown. */
export function WishlistItemCapSizeLine({ item }: WishlistItemCapSizeLineProps) {
  if (!item.capSize) return null;
  return (
    <p className="font-semibold" style={cartLineCapSizeParagraphStyle(item)}>
      CAP SIZE: {item.capSize}
    </p>
  );
}

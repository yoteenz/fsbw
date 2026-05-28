import {
  cartLineCapSizeParagraphStyle,
  type CartLineSpacingItem,
  withNormalizedCartLineName,
} from '../../utils/cartCapSizeLineMargin';

type WishlistItemCapSizeLineProps = {
  item: CartLineSpacingItem & { capSize?: string };
  /** Uppercase line title when `item.name` / `productName` is missing or stale. */
  displayName?: string;
};

/** Gray CAP SIZE row — same spacing rules as shopping bag / cart dropdown. */
export function WishlistItemCapSizeLine({ item, displayName }: WishlistItemCapSizeLineProps) {
  if (!item.capSize) return null;
  return (
    <p className="font-semibold" style={cartLineCapSizeParagraphStyle(withNormalizedCartLineName(item, displayName))}>
      CAP SIZE: {item.capSize}
    </p>
  );
}

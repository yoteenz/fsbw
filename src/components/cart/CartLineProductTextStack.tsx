import type { CSSProperties, ReactNode } from 'react';
import {
  cartLineLayerHasContent,
  cartLineLayerStyle,
  cartLineProductStackStyle,
  cartLineSubtitleLayerStyle,
  type CartLineLayerSlot,
} from '../../utils/cartLineProductLayers';

export function CartLineTextLayer({
  slot,
  children,
  className,
  style,
  productName,
}: {
  slot: CartLineLayerSlot;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** When `slot` is `subtitle`, trims top spacing for NOIR RAW only. */
  productName?: string;
}) {
  if (!cartLineLayerHasContent(children)) return null;
  const layerStyle =
    slot === 'subtitle' ? cartLineSubtitleLayerStyle(productName) : cartLineLayerStyle(slot);
  return (
    <div className={className ?? `cart-line-text-layer cart-line-text-layer--${slot}`} style={{ ...layerStyle, ...style }}>
      {children}
    </div>
  );
}

export function CartLineProductTextStack({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={className ?? 'cart-line-product-text-stack'} style={cartLineProductStackStyle(style)}>
      {children}
    </div>
  );
}

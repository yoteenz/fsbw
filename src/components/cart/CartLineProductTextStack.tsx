import type { CSSProperties, ReactNode } from 'react';
import {
  cartLineLayerHasContent,
  cartLineLayerStyle,
  cartLineProductStackStyle,
  type CartLineLayerSlot,
} from '../../utils/cartLineProductLayers';

export function CartLineTextLayer({
  slot,
  children,
  className,
  style,
}: {
  slot: CartLineLayerSlot;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  if (!cartLineLayerHasContent(children)) return null;
  return (
    <div className={className ?? `cart-line-text-layer cart-line-text-layer--${slot}`} style={{ ...cartLineLayerStyle(slot), ...style }}>
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

import type { CSSProperties, ReactNode } from 'react';

/** Symmetric vertical padding inside each text layer (top + bottom). */
export const CART_LINE_LAYER_PAD_Y_PX = 2;

/** Fixed layer heights tuned to NOIR (22px name, 9px subtitle) so all units align. */
export const CART_LINE_NAME_LAYER_MIN_HEIGHT_PX = 28;
export const CART_LINE_SUBTITLE_LAYER_MIN_HEIGHT_PX = 15;
export const CART_LINE_CAP_LAYER_MIN_HEIGHT_PX = 15;
export const CART_LINE_PRICE_LAYER_MIN_HEIGHT_PX = 18;
export const CART_LINE_META_LAYER_MIN_HEIGHT_PX = 14;

export type CartLineLayerSlot = 'name' | 'subtitle' | 'details' | 'cap' | 'price' | 'meta';

function layerBox(minHeightPx: number): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
    paddingTop: CART_LINE_LAYER_PAD_Y_PX,
    paddingBottom: CART_LINE_LAYER_PAD_Y_PX,
    minHeight: `${minHeightPx}px`,
    flexShrink: 0,
  };
}

export function cartLineProductStackStyle(extra?: CSSProperties): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    margin: 0,
    padding: 0,
    gap: 0,
    ...extra,
  };
}

export function cartLineLayerStyle(slot: CartLineLayerSlot): CSSProperties {
  switch (slot) {
    case 'name':
      return layerBox(CART_LINE_NAME_LAYER_MIN_HEIGHT_PX);
    case 'subtitle':
      return layerBox(CART_LINE_SUBTITLE_LAYER_MIN_HEIGHT_PX);
    case 'cap':
      return layerBox(CART_LINE_CAP_LAYER_MIN_HEIGHT_PX);
    case 'price':
      return layerBox(CART_LINE_PRICE_LAYER_MIN_HEIGHT_PX);
    case 'meta':
      return layerBox(CART_LINE_META_LAYER_MIN_HEIGHT_PX);
    case 'details':
      return {
        ...layerBox(CART_LINE_META_LAYER_MIN_HEIGHT_PX),
        minHeight: undefined,
        justifyContent: 'flex-start',
      };
    default:
      return layerBox(CART_LINE_META_LAYER_MIN_HEIGHT_PX);
  }
}

export function cartLineLayerInnerStyle(): CSSProperties {
  return {
    margin: 0,
    padding: 0,
    lineHeight: 1.1,
  };
}

export function cartLineProductNameFontSize(productName: string): string {
  return productName === 'NOIR' ? '22px' : '21px';
}

export function cartLineCapSizeTextStyle(): CSSProperties {
  return {
    ...cartLineLayerInnerStyle(),
    fontFamily: '"Futura PT Medium"',
    color: '#808080',
    textTransform: 'uppercase',
    fontSize: '10px',
  };
}

export function cartLineRedSubtitleTextStyle(): CSSProperties {
  return {
    ...cartLineLayerInnerStyle(),
    fontFamily: '"Futura PT Book"',
    color: '#EB1C24',
    textTransform: 'uppercase',
    fontSize: '9px',
    fontWeight: 700,
  };
}

export function cartLineProductNameTextStyle(productName: string): CSSProperties {
  return {
    ...cartLineLayerInnerStyle(),
    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
    color: '#000000',
    textTransform: 'uppercase',
    fontSize: cartLineProductNameFontSize(productName),
  };
}

/** Renders a fixed-height row; omit when empty. */
export function cartLineLayerHasContent(children: ReactNode): boolean {
  return children !== null && children !== undefined && children !== false;
}

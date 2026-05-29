import type { CSSProperties, ReactNode } from 'react';
import { isLineItemOutOfStock, isWigUnitSoldOut } from '../../utils/productInventoryAvailability';

const OUT_OF_STOCK_LABEL_STYLE: CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '9px',
  fontWeight: 500,
  color: '#EB1C24',
  textTransform: 'uppercase',
  margin: 0,
  lineHeight: 1.1,
};

type PriceHtml = { __html: string };

/** Cart / bag / wishlist line price — strikethrough + red OUT OF STOCK when depleted. */
export function WigLineStockPrice({
  item,
  productName,
  priceHtml,
  priceStyle,
  priceClassName,
  layout = 'stack',
  outOfStockLabel = 'OUT OF STOCK',
}: {
  item?: { name?: string; productName?: string; type?: string; stockStatus?: string };
  productName?: string;
  priceHtml: PriceHtml;
  priceStyle?: CSSProperties;
  priceClassName?: string;
  layout?: 'stack' | 'inline';
  outOfStockLabel?: string | null;
}) {
  const name = productName ?? item?.name ?? item?.productName;
  const out =
    item != null
      ? isLineItemOutOfStock(item) || (name ? isWigUnitSoldOut(name) : false)
      : name
        ? isWigUnitSoldOut(name)
        : false;

  if (!out) {
    return <span className={priceClassName} style={priceStyle} dangerouslySetInnerHTML={priceHtml} />;
  }

  const struckPrice = (
    <span
      className={priceClassName}
      style={{
        ...priceStyle,
        color: '#808080',
        textDecoration: 'line-through',
      }}
      dangerouslySetInnerHTML={priceHtml}
    />
  );

  const label =
    outOfStockLabel != null ? <span style={OUT_OF_STOCK_LABEL_STYLE}>{outOfStockLabel}</span> : null;

  if (layout === 'inline') {
    return (
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
        {struckPrice}
        {label}
      </span>
    );
  }

  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
      {struckPrice}
      {label}
    </span>
  );
}

/** PDP / shop grid price block. */
export function WigProductPriceDisplay({
  productName,
  priceHtml,
  priceStyle,
  labelStyle,
  /**
   * PDP main price: `normal` (no strike, no label).
   * Shop browse grids: `strikethrough-only` (gray strike, no label).
   * Default `strikethrough`: strike + red OUT OF STOCK (legacy / non-browse).
   */
  soldOutPriceTreatment = 'strikethrough',
}: {
  productName: string;
  priceHtml: PriceHtml;
  priceStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  soldOutPriceTreatment?: 'strikethrough' | 'strikethrough-only' | 'normal';
}) {
  const soldOut = isWigUnitSoldOut(productName);
  if (!soldOut) {
    return <p style={priceStyle} dangerouslySetInnerHTML={priceHtml} />;
  }
  if (soldOutPriceTreatment === 'normal') {
    return <p style={priceStyle} dangerouslySetInnerHTML={priceHtml} />;
  }
  if (soldOutPriceTreatment === 'strikethrough-only') {
    return (
      <p
        style={{
          ...priceStyle,
          color: '#808080',
          textDecoration: 'line-through',
          margin: priceStyle?.margin ?? 0,
        }}
        dangerouslySetInnerHTML={priceHtml}
      />
    );
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <p
        style={{
          ...priceStyle,
          color: '#808080',
          textDecoration: 'line-through',
          margin: 0,
        }}
        dangerouslySetInnerHTML={priceHtml}
      />
      <p style={{ ...OUT_OF_STOCK_LABEL_STYLE, fontSize: '10px', marginTop: '4px', ...labelStyle }}>OUT OF STOCK</p>
    </div>
  );
}

/**
 * Cross-sell strip price (SIMILAR PRODUCTS / RECENTLY VIEWED on product pages). When the
 * referenced product is sold out, the price is shown gray + strikethrough with **no** red
 * "SOLD OUT" / "OUT OF STOCK" label. Pass `productName` for a wig unit, or an explicit
 * `soldOut` boolean (e.g. BCF products gated by packaging).
 */
export function WigStripPrice({
  productName,
  soldOut: soldOutProp,
  style,
  priceHtml,
  children,
}: {
  productName?: string;
  soldOut?: boolean;
  style?: CSSProperties;
  priceHtml?: PriceHtml;
  children?: ReactNode;
}) {
  const soldOut = soldOutProp ?? (productName ? isWigUnitSoldOut(productName) : false);
  const finalStyle: CSSProperties | undefined = soldOut
    ? { ...style, color: '#808080', textDecoration: 'line-through' }
    : style;
  if (priceHtml) return <p style={finalStyle} dangerouslySetInnerHTML={priceHtml} />;
  return <p style={finalStyle}>{children}</p>;
}

export function WigOutOfStockActionLabel({
  children,
  style,
}: {
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span style={{ color: '#EB1C24', textTransform: 'uppercase', ...style }}>
      {children ?? 'OUT OF STOCK'}
    </span>
  );
}

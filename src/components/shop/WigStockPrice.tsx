import type { CSSProperties, ReactNode } from 'react';
import { isLineItemOutOfStock, isWigUnitSoldOut } from '../../utils/productInventoryAvailability';

const OUT_OF_STOCK_LABEL_STYLE: CSSProperties = {
  fontFamily: '"Futura PT Demi", Futura, sans-serif',
  fontSize: '9px',
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
  layout = 'stack',
  outOfStockLabel = 'OUT OF STOCK',
}: {
  item?: { name?: string; productName?: string; type?: string; stockStatus?: string };
  productName?: string;
  priceHtml: PriceHtml;
  priceStyle?: CSSProperties;
  layout?: 'stack' | 'inline';
  outOfStockLabel?: string;
}) {
  const name = productName ?? item?.name ?? item?.productName;
  const out =
    item != null
      ? isLineItemOutOfStock(item) || (name ? isWigUnitSoldOut(name) : false)
      : name
        ? isWigUnitSoldOut(name)
        : false;

  if (!out) {
    return <span style={priceStyle} dangerouslySetInnerHTML={priceHtml} />;
  }

  const struckPrice = (
    <span
      style={{
        ...priceStyle,
        color: '#808080',
        textDecoration: 'line-through',
      }}
      dangerouslySetInnerHTML={priceHtml}
    />
  );

  const label = <span style={OUT_OF_STOCK_LABEL_STYLE}>{outOfStockLabel}</span>;

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
  /** PDP: show price normally when sold out; grid keeps strikethrough + label. */
  soldOutPriceTreatment = 'strikethrough',
}: {
  productName: string;
  priceHtml: PriceHtml;
  priceStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  soldOutPriceTreatment?: 'strikethrough' | 'normal';
}) {
  const soldOut = isWigUnitSoldOut(productName);
  if (!soldOut) {
    return <p style={priceStyle} dangerouslySetInnerHTML={priceHtml} />;
  }
  if (soldOutPriceTreatment === 'normal') {
    return <p style={priceStyle} dangerouslySetInnerHTML={priceHtml} />;
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

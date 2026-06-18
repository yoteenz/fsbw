import type { MouseEvent, ReactNode } from 'react';
import {
  shopProductGridCapSizeRowStyle,
  shopProductGridNameStyle,
  shopProductGridPriceStyle,
  shopProductGridRedLineStyle,
  shopProductGridTextColStyle,
} from '../../utils/shopProductGridCopyStyles';
import { WigProductPriceDisplay } from './WigStockPrice';

type PriceHtml = { __html: string };

export type ShopSearchResultProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  length?: string;
  hairOrigin?: string;
  route?: string;
  inCart?: boolean;
  selectedSize?: string;
  kind?: 'unit' | 'gift-card';
};

type ShopSearchResultsGridProps = {
  products: ShopSearchResultProduct[];
  formatPrice: (price: number) => PriceHtml;
  onProductClick: (product: ShopSearchResultProduct) => void;
  onAddToCart: (product: ShopSearchResultProduct, e?: MouseEvent<HTMLDivElement>) => void;
  onSizeSelect: (productId: string, size: string) => void;
  emptyMessage?: ReactNode;
};

/**
 * Search results layout — matches `/units/straight` staggered marble product cards.
 */
export function ShopSearchResultsGrid({
  products,
  formatPrice,
  onProductClick,
  onAddToCart,
  onSizeSelect,
  emptyMessage = 'NO PRODUCTS MATCH YOUR SEARCH.',
}: ShopSearchResultsGridProps) {
  if (products.length === 0) {
    return (
      <p
        style={{
          fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
          fontSize: '10px',
          fontWeight: 500,
          color: '#EB1C24',
          textAlign: 'center',
          textTransform: 'uppercase',
          margin: '28px 0 12px',
        }}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '28px',
        paddingTop: '12px',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {products.map((product, index) => {
        const isStaggered = index % 2 === 1;
        const bagOnLeft = index % 2 === 0;
        const isGiftCard = product.kind === 'gift-card' || product.id.startsWith('gift-card-');

        return (
          <div
            key={product.id}
            style={{
              position: 'relative',
              width: 'calc(50% - 15px)',
              minWidth: '160px',
              maxWidth: '300px',
            }}
          >
            <div
              className="relative border border-black"
              style={{
                borderWidth: '1.3px',
                padding: '10px 6px 14px 6px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                backgroundImage: `url('/assets/marble bg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                transform: isStaggered ? 'translateY(20px)' : 'translateY(0px)',
                transition: 'transform 0.3s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  ...(bagOnLeft ? { left: '12px' } : { right: '12px' }),
                  cursor: 'pointer',
                  zIndex: 10,
                  width: '20px',
                  height: '23px',
                  display: isGiftCard ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={(e) => onAddToCart(product, e)}
              >
                {product.inCart ? (
                  <img
                    src="/assets/card-added.svg"
                    alt="In cart"
                    width={20}
                    height={23}
                    style={{ width: '20px !important', height: '23px !important' }}
                  />
                ) : (
                  <img
                    src="/assets/card-add.svg"
                    alt="Add to cart"
                    width={20}
                    height={23}
                    style={{ width: '20px !important', height: '23px !important' }}
                  />
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  marginTop: '2px',
                  marginBottom: '0',
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  onClick={() => onProductClick(product)}
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    height: 'auto',
                    margin: '0 0 10px 0',
                    display: 'block',
                    cursor: product.route ? 'pointer' : 'default',
                  }}
                />
              </div>

              <div style={isGiftCard ? { width: '100%', textAlign: 'center', boxSizing: 'border-box' } : shopProductGridTextColStyle}>
                <p style={shopProductGridNameStyle()}>{product.name}</p>
                {isGiftCard ? (
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: '#EB1C24',
                      textTransform: 'uppercase',
                      margin: '2px 0 5px 0',
                      fontWeight: '500',
                      lineHeight: '0.84',
                      minHeight: '12px',
                    }}
                  >
                    DIGITAL ONLY
                  </p>
                ) : (
                  <p style={shopProductGridRedLineStyle()}>
                    {product.length} RAW {product.hairOrigin}
                  </p>
                )}
                <WigProductPriceDisplay
                  productName={product.name}
                  soldOutPriceTreatment="strikethrough-only"
                  priceHtml={formatPrice(product.price)}
                  priceStyle={shopProductGridPriceStyle()}
                  labelStyle={{ transform: 'translateY(1px)' }}
                />
                {!isGiftCard && (
                <div style={shopProductGridCapSizeRowStyle}>
                  {['XS', 'S', 'M', 'L'].map((size) => (
                    <span
                      key={size}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSizeSelect(product.id, size);
                      }}
                      style={{
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                        fontSize: '12px',
                        color: product.selectedSize === size ? '#EB1C24' : 'black',
                        cursor: 'pointer',
                      }}
                    >
                      {size}
                    </span>
                  ))}
                </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

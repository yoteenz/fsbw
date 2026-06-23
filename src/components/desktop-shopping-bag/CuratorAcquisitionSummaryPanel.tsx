import { formatCuratedCollectionPrice } from '../../hooks/useDesktopShoppingBagCart';

type Props = {
  orderAmount: number;
  taxesProcessing: number;
  shippingHandling: number;
  rushProcessing: number;
  protectionFee: number;
  tipAmount: number;
  totalDiscount: number;
  subtotal: number;
  checkoutSkipsShipping: boolean;
  premiumShippingDiscount: { discount: number; finalCost: number; originalCost: number };
};

export function CuratorAcquisitionSummaryPanel({
  orderAmount,
  taxesProcessing,
  shippingHandling,
  rushProcessing,
  protectionFee,
  tipAmount,
  totalDiscount,
  subtotal,
  checkoutSkipsShipping,
  premiumShippingDiscount,
}: Props) {
  return (
    <section className="curator-acquisition-summary" data-checkout-acquisition-summary>
      <h2 className="curator-acquisition-summary__title">Acquisition Summary</h2>
      <dl className="curator-acquisition-summary__rows">
        <div className="curator-acquisition-summary__row">
          <dt>Item Subtotal</dt>
          <dd>{formatCuratedCollectionPrice(orderAmount)}</dd>
        </div>
        {!checkoutSkipsShipping ? (
          <>
            <div className="curator-acquisition-summary__row">
              <dt>Shipping</dt>
              <dd>
                {premiumShippingDiscount.discount > 0 && premiumShippingDiscount.finalCost === 0
                  ? 'Free'
                  : formatCuratedCollectionPrice(
                      premiumShippingDiscount.discount > 0
                        ? premiumShippingDiscount.finalCost
                        : shippingHandling,
                    )}
              </dd>
            </div>
            <div className="curator-acquisition-summary__row">
              <dt>Taxes</dt>
              <dd>{formatCuratedCollectionPrice(taxesProcessing)}</dd>
            </div>
          </>
        ) : null}
        {rushProcessing > 0 ? (
          <div className="curator-acquisition-summary__row">
            <dt>Rush Processing</dt>
            <dd>{formatCuratedCollectionPrice(rushProcessing)}</dd>
          </div>
        ) : null}
        {protectionFee > 0 ? (
          <div className="curator-acquisition-summary__row">
            <dt>Package Protection</dt>
            <dd>{formatCuratedCollectionPrice(protectionFee)}</dd>
          </div>
        ) : null}
        {tipAmount > 0 ? (
          <div className="curator-acquisition-summary__row">
            <dt>Tip</dt>
            <dd>{formatCuratedCollectionPrice(tipAmount)}</dd>
          </div>
        ) : null}
        {totalDiscount > 0 ? (
          <div className="curator-acquisition-summary__row curator-acquisition-summary__row--discount">
            <dt>Discounts &amp; Rewards</dt>
            <dd>-{formatCuratedCollectionPrice(totalDiscount)}</dd>
          </div>
        ) : null}
        <div className="curator-acquisition-summary__row curator-acquisition-summary__row--total">
          <dt>Final Acquisition Total</dt>
          <dd>{formatCuratedCollectionPrice(subtotal)}</dd>
        </div>
      </dl>
    </section>
  );
}

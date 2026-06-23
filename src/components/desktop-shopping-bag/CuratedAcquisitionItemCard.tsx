import {
  formatCuratedCollectionPrice,
  resolveCartLineDisplayPriceUsd,
} from '../../hooks/useDesktopShoppingBagCart';
import {
  orderStripRedSubtitle,
  orderStripThumbnailSrc,
  orderStripTitleLine,
} from '../../utils/checkoutOrderStripDisplay';
import { resolveCartLineEditAction } from '../../utils/cartEditFromBag';
import { BcfThumbImage } from '../shop/BcfThumbImage';
import { bcfCartLineTextureAndCategory } from '../../utils/bcfProductOptions';
import { isGiftCardCartLine } from '../../utils/giftCardCheckout';
import { isSlayTicketPackCartLine } from '../../utils/slayTicketCheckout';
import { isBookingCartLine } from '../../utils/bookingCheckout';

type Props = {
  item: Record<string, unknown>;
  removing?: boolean;
  onEdit: (item: Record<string, unknown>) => void;
  onRemove: (itemId: string) => void;
  onOpenPdp: (item: Record<string, unknown>) => void;
  onQuantityChange: (itemId: string, delta: number) => void;
};

export function CuratedAcquisitionItemCard({
  item,
  removing = false,
  onEdit,
  onRemove,
  onOpenPdp,
  onQuantityChange,
}: Props) {
  const itemId = String(item.id || '');
  const title = orderStripTitleLine(item);
  const length = (item.length as string) || '24"';
  const specs = orderStripRedSubtitle(item, length);
  const thumbSrc = orderStripThumbnailSrc(item, false);
  const price = formatCuratedCollectionPrice(resolveCartLineDisplayPriceUsd(item));
  const qty = Number(item.quantity) || 1;
  const editAction = resolveCartLineEditAction(item);
  const isBcf = item.type === 'shop-texture-category';
  const bcfMeta = isBcf ? bcfCartLineTextureAndCategory(item) : null;
  const showQtyControls =
    !isGiftCardCartLine(item) &&
    !isSlayTicketPackCartLine(item) &&
    !isBookingCartLine(item) &&
    !item.bcfBundleDeal &&
    item.consultOfferQtyLocked !== true;

  return (
    <article
      className={['curated-acquisition-item', removing ? 'curated-acquisition-item--removing' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="curated-acquisition-item__image-btn"
        onClick={() => onOpenPdp(item)}
      >
        <div className="curated-acquisition-item__plinth" aria-hidden>
          {bcfMeta ? (
            <BcfThumbImage
              texture={bcfMeta.texture}
              category={bcfMeta.category}
              src={thumbSrc}
              alt=""
              boxPx={72}
            />
          ) : (
            <img src={thumbSrc} alt="" draggable={false} />
          )}
        </div>
      </button>

      <div className="curated-acquisition-item__body">
        <p className="curated-acquisition-item__name">{title}</p>
        <p className="curated-acquisition-item__specs">{specs}</p>
        <p className="curated-acquisition-item__price">{price}</p>

        <div className="curated-acquisition-item__actions">
          {showQtyControls ? (
            <div className="curated-acquisition-item__qty">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => onQuantityChange(itemId, -1)}
              >
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => onQuantityChange(itemId, 1)}
              >
                +
              </button>
            </div>
          ) : qty > 1 ? (
            <span className="curated-acquisition-item__qty-label">QTY {qty}</span>
          ) : null}

          {editAction ? (
            <button type="button" className="curated-acquisition-item__edit" onClick={() => onEdit(item)}>
              Edit
            </button>
          ) : null}

          <button
            type="button"
            className="curated-acquisition-item__remove"
            onClick={() => onRemove(itemId)}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

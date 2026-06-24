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

type Props = {
  item: Record<string, unknown>;
  removing?: boolean;
  onEdit: (item: Record<string, unknown>) => void;
  onRemove: (itemId: string) => void;
  onOpenPdp: (item: Record<string, unknown>) => void;
};

export function CuratedCartItemCard({
  item,
  removing = false,
  onEdit,
  onRemove,
  onOpenPdp,
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
  const showQty = qty > 1 && !isGiftCardCartLine(item) && !isSlayTicketPackCartLine(item);

  return (
    <article
      className={[
        'curated-item',
        'acrylic-glass-surface',
        removing ? 'curated-item--removing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="acrylic-glass-surface__rose-base" aria-hidden />
      <button
        type="button"
        className="curated-item__remove"
        aria-label={`Remove ${title}`}
        onClick={() => onRemove(itemId)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </button>

      <button type="button" className="curated-item__image-btn" onClick={() => onOpenPdp(item)}>
        <div className="curated-item__plinth" aria-hidden>
          {bcfMeta ? (
            <BcfThumbImage
              texture={bcfMeta.texture}
              category={bcfMeta.category}
              src={thumbSrc}
              alt=""
              boxPx={120}
            />
          ) : (
            <img src={thumbSrc} alt="" draggable={false} />
          )}
        </div>
      </button>

      <p className="curated-item__name">{title}</p>
      <p className="curated-item__specs">
        {specs}
        {showQty ? ` · QTY ${qty}` : ''}
      </p>
      <p className="curated-item__price">{price}</p>

      {editAction ? (
        <button type="button" className="curated-item__edit" onClick={() => onEdit(item)}>
          Edit
        </button>
      ) : null}
    </article>
  );
}

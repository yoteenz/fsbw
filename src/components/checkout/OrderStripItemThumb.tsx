import { BcfThumbImage } from '../shop/BcfThumbImage';
import { bcfCartLineTextureAndCategory } from '../../utils/bcfProductOptions';
import type { OrderStripThumbMetrics } from '../../utils/checkoutOrderStripDisplay';

type OrderStripItemThumbProps = {
  item: any;
  itemImage: string;
  displayTitle: string;
  thumbM: OrderStripThumbMetrics;
};

export function OrderStripItemThumb({
  item,
  itemImage,
  displayTitle,
  thumbM,
}: OrderStripItemThumbProps) {
  if (thumbM.kind === 'bcf') {
    const bcfMeta = bcfCartLineTextureAndCategory(item);
    if (bcfMeta) {
      return (
        <BcfThumbImage
          texture={bcfMeta.texture}
          category={bcfMeta.category}
          src={itemImage}
          alt={displayTitle}
          boxPx={thumbM.imgPx}
          nudgeX={thumbM.imgWrapperTransform ? 0 : 4}
        />
      );
    }
  }

  return (
    <img
      src={itemImage}
      alt={displayTitle}
      className="object-contain rounded"
      style={{
        width: `${thumbM.imgPx}px`,
        height: `${thumbM.imgPx}px`,
        objectFit: 'contain',
      }}
      draggable={false}
    />
  );
}

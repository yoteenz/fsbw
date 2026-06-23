import type { RefObject } from 'react';
import {
  DESKTOP_SHOPPING_BAG_BACKGROUND_URL,
  DESKTOP_SHOPPING_BAG_IMAGE,
  DESKTOP_SHOPPING_BAG_TABLET_RECT,
} from '../../constants/desktopShoppingBag';
import { DesktopRoomCoverRectAnchor } from '../desktop-lobby/DesktopRoomCoverAnchor';
import { CuratedCollectionTablet } from './CuratedCollectionTablet';
import './DesktopShoppingBag.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  cartItems: Record<string, unknown>[];
  itemCount: number;
  subtotal: number;
  removingIds: Set<string>;
  onEdit: (item: Record<string, unknown>) => void;
  onRemove: (itemId: string) => void;
  onOpenPdp: (item: Record<string, unknown>) => void;
  onAcquire: () => void;
  onEnterShowroom: () => void;
};

export function DesktopShoppingBagScene({
  measureRef,
  cartItems,
  itemCount,
  subtotal,
  removingIds,
  onEdit,
  onRemove,
  onOpenPdp,
  onAcquire,
  onEnterShowroom,
}: Props) {
  return (
    <div className="desktop-shopping-bag-scene" aria-label="Curator's tablet shopping bag">
      <img
        src={DESKTOP_SHOPPING_BAG_BACKGROUND_URL}
        alt=""
        className="desktop-shopping-bag-scene__bg"
        draggable={false}
        width={DESKTOP_SHOPPING_BAG_IMAGE.width}
        height={DESKTOP_SHOPPING_BAG_IMAGE.height}
      />
      <div className="desktop-shopping-bag-scene__layer">
        <DesktopRoomCoverRectAnchor
          measureRef={measureRef}
          imageRect={DESKTOP_SHOPPING_BAG_TABLET_RECT}
          image={DESKTOP_SHOPPING_BAG_IMAGE}
          zIndex={6}
        >
          <CuratedCollectionTablet
            cartItems={cartItems}
            itemCount={itemCount}
            subtotal={subtotal}
            removingIds={removingIds}
            onEdit={onEdit}
            onRemove={onRemove}
            onOpenPdp={onOpenPdp}
            onAcquire={onAcquire}
            onEnterShowroom={onEnterShowroom}
          />
        </DesktopRoomCoverRectAnchor>
      </div>
    </div>
  );
}

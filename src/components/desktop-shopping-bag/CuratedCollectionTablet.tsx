import { AcquisitionSummaryBar } from './AcquisitionSummaryBar';
import { CuratedCartGallery } from './CuratedCartGallery';
import { EmptyCollectionState } from './EmptyCollectionState';
import './DesktopShoppingBag.css';

type Props = {
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

export function CuratedCollectionTablet({
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
  const isEmpty = cartItems.length === 0;

  return (
    <div className="acrylic-glass-surface__content" aria-label="Curated collection tablet">
      <div className="acrylic-glass-surface__rose-base" aria-hidden />
      <div className="curated-tablet__shimmer" aria-hidden />

      {isEmpty ? (
        <EmptyCollectionState onAcquire={onEnterShowroom} />
      ) : (
        <>
          <header className="curated-tablet__header">
            <div className="curated-tablet__crystal" aria-hidden>
              <img src="/assets/member-status.svg" alt="" draggable={false} />
            </div>
            <h1 className="curated-tablet__title curated-tablet__title--foil">Your Curated Collection</h1>
            <p className="curated-tablet__subtitle">
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'} Selected
            </p>
          </header>

          <div className="curated-tablet__gallery-wrap">
            <CuratedCartGallery
              items={cartItems}
              removingIds={removingIds}
              onEdit={onEdit}
              onRemove={onRemove}
              onOpenPdp={onOpenPdp}
            />
          </div>

          <AcquisitionSummaryBar
            itemCount={itemCount}
            subtotal={subtotal}
            onAcquire={onAcquire}
          />
        </>
      )}
    </div>
  );
}

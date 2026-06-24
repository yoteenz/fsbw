import { formatCuratedCollectionPrice } from '../../hooks/useDesktopShoppingBagCart';

type Props = {
  itemCount: number;
  subtotal: number;
  onAcquire: () => void;
};

export function AcquisitionSummaryBar({ itemCount, subtotal, onAcquire }: Props) {
  return (
    <footer className="curated-acquire acrylic-glass-surface">
      <div className="acrylic-glass-surface__rose-base" aria-hidden />
      <div className="curated-acquire__left">
        <span className="curated-acquire__bag" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </span>
        <span className="curated-acquire__count">
          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div className="curated-acquire__subtotal">
        <span className="curated-acquire__subtotal-label">Subtotal</span>
        <span className="curated-acquire__subtotal-value">{formatCuratedCollectionPrice(subtotal)}</span>
      </div>

      <button type="button" className="curated-acquire__cta" onClick={onAcquire}>
        Acquire
      </button>
    </footer>
  );
}

import type { ReactNode } from 'react';
import { formatCuratedCollectionPrice } from '../../hooks/useDesktopShoppingBagCart';

type Props = {
  children: ReactNode;
  finalTotal: number;
  onComplete: () => void;
};

export function AcquisitionTabletChrome({ children, finalTotal, onComplete }: Props) {
  return (
    <div className="acrylic-glass-surface__content" aria-label="Acquisition review tablet">
      <div className="acrylic-glass-surface__rose-base" aria-hidden />
      <div className="curated-tablet__shimmer curated-tablet__shimmer--acquisition" aria-hidden />

      <header className="curated-tablet__header curated-tablet__header--acquisition">
        <div className="curated-tablet__crystal" aria-hidden>
          <img src="/assets/member-status.svg" alt="" draggable={false} />
        </div>
        <h1 className="curated-tablet__title curated-tablet__title--foil">Review &amp; Acquire</h1>
        <p className="curated-tablet__subtitle">Finalize Your Selections</p>
      </header>

      <div className="curated-acquisition__body">{children}</div>

      <footer className="curated-acquisition-complete acrylic-glass-surface">
        <div className="acrylic-glass-surface__rose-base" aria-hidden />
        <div className="curated-acquisition-complete__left">
          <span className="curated-acquisition-complete__lock" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="11" width="14" height="10" rx="1" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <span className="curated-acquisition-complete__secure">Secure Acquisition</span>
        </div>

        <div className="curated-acquisition-complete__total">
          <span className="curated-acquisition-complete__total-label">Final Total</span>
          <span className="curated-acquisition-complete__total-value">
            {formatCuratedCollectionPrice(finalTotal)}
          </span>
        </div>

        <button type="button" className="curated-acquisition-complete__cta" onClick={onComplete}>
          Complete Acquisition
        </button>
      </footer>
    </div>
  );
}

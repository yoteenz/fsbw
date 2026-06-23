import './DesktopShoppingBag.css';

type Props = {
  onAcquire: () => void;
};

export function EmptyCollectionState({ onAcquire }: Props) {
  return (
    <div className="curated-tablet__empty">
      <div className="curated-tablet__crystal" aria-hidden>
        <img src="/assets/member-status.svg" alt="" draggable={false} />
      </div>
      <h1 className="curated-tablet__title curated-tablet__title--foil">Your Collection Awaits</h1>
      <p className="curated-tablet__subtitle">
        Explore the mansion and begin curating your next acquisition.
      </p>
      <button type="button" className="curated-tablet__enter-btn" onClick={onAcquire}>
        Enter Showroom
      </button>
    </div>
  );
}

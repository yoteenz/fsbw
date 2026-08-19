type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ShipperFreightError({ message, onRetry }: Props) {
  return (
    <div className="aio-shipper-request__error" role="alert">
      <h2>We couldn&apos;t load your freight data.</h2>
      <p>{message ?? 'Try again.'}</p>
      {onRetry && (
        <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

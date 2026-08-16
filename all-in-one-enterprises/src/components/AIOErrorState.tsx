import { Link } from 'react-router-dom';

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
  backHref?: string;
}

export function AIOErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  backHref,
}: Props) {
  return (
    <div className="aio-error-state" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="aio-error-state__actions">
        {onRetry && (
          <button type="button" className="aio-btn aio-btn--gold" onClick={onRetry}>
            Try again
          </button>
        )}
        {backHref && (
          <Link to={backHref} className="aio-btn aio-btn--outline">
            Go back
          </Link>
        )}
      </div>
    </div>
  );
}

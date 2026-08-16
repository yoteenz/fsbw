import { Link, useSearchParams } from 'react-router-dom';
import { journeyBackHref } from '../../journeys/journeyContext';

type Props = {
  label?: string;
};

export function JourneyBackNav({ label = 'Back to Startup Journey' }: Props) {
  const [params] = useSearchParams();
  const href = journeyBackHref(params.get('from'));

  return (
    <nav className="aio-journey-back" aria-label="Journey navigation">
      <Link to={href} className="aio-journey-back__link">
        ← {label}
      </Link>
    </nav>
  );
}

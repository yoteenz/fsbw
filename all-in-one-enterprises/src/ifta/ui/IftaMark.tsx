import { Link } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';

type Props = {
  to?: string;
  label?: string;
};

/** Tight nav — simple AIO mark only (logo rule). */
export function IftaMark({ to = aioPaths.home, label = 'All In One home' }: Props) {
  return (
    <Link to={to} className="ifta-mark" aria-label={label}>
      AIO
    </Link>
  );
}

import { Link } from 'react-router-dom';
import type { FastTravelAction } from '../../config/fast-travel-actions';

type EnterFastTravelGridProps = {
  actions: FastTravelAction[];
};

export function EnterFastTravelGrid({ actions }: EnterFastTravelGridProps) {
  if (actions.length === 0) return null;

  return (
    <div className="site00-enter-fast-travel" aria-label="Fast Travel">
      <nav className="site00-enter-fast-travel__grid">
        {actions.map((action) => (
          <Link key={action.id} to={action.href} className="site00-enter-fast-travel__tile">
            <span className="site00-enter-fast-travel__tile-label">{action.label}</span>
            <span className="site00-enter-fast-travel__tile-desc">{action.description}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

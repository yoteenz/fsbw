import { Link } from 'react-router-dom';
import type { CategorySummary } from '../road-ready/roadReadyTypes';
import { RoadReadyStatusBadge } from './RoadReadyStatusBadge';
import { aioPaths } from '../utils/paths';

type Props = {
  category: CategorySummary;
};

export function RoadReadyCategoryCard({ category }: Props) {
  const topItems = category.items.slice(0, 3);

  return (
    <article className="aio-rr-category-card">
      <header className="aio-rr-category-card__header">
        <h3>{category.label}</h3>
        <span className="aio-rr-category-card__pct">{category.setupProgress}%</span>
      </header>
      <div className="aio-rr-category-card__meta">
        <span>{category.verifiedCount} verified</span>
        {category.attentionCount > 0 && (
          <span className="aio-rr-category-card__attention">{category.attentionCount} need attention</span>
        )}
      </div>
      <ul className="aio-rr-category-card__items">
        {topItems.map((item) => (
          <li key={item.id}>
            <span>{item.title}</span>
            <RoadReadyStatusBadge
              kind="verification"
              value={item.verificationStatus === 'verified' ? 'verified' : item.verificationStatus}
            />
          </li>
        ))}
      </ul>
      {category.nextAction && (
        <p className="aio-rr-category-card__next">Next: {category.nextAction}</p>
      )}
      <Link to={`${aioPaths.roadReady}?category=${category.category}`} className="aio-rr-category-card__cta">
        Review {category.label} →
      </Link>
    </article>
  );
}

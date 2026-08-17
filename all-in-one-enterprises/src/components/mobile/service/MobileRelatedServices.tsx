import { Link } from 'react-router-dom';
import type { MobileRelatedServiceView } from '../../../hooks/useMobileServicePage';

type Props = {
  related: MobileRelatedServiceView[];
};

export function MobileRelatedServices({ related }: Props) {
  if (!related.length) return null;

  return (
    <section className="aio-msvc-related" aria-labelledby="aio-msvc-related-heading">
      <h2 id="aio-msvc-related-heading" className="aio-msvc-section-label">
        Related Services
      </h2>
      <ul className="aio-msvc-related__list">
        {related.map((item) => (
          <li key={item.slug}>
            <Link to={item.href} className="aio-msvc-related__row">
              <span className="aio-msvc-related__title">{item.title}</span>
              {item.badge ? <span className="aio-msvc-related__badge">{item.badge}</span> : null}
              <span className="aio-msvc-related__chevron" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

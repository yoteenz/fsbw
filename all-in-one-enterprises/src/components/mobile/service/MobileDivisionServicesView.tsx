import { Link } from 'react-router-dom';
import { useCallback } from 'react';
import { getServicesByDivision, type AioService, type ServiceDivision } from '../../../data/services';
import { useServicePlan } from '../../AIOServicePlanBar';
import { aioPaths } from '../../../utils/paths';
import { mobileServiceCategoryLabel } from '../../../services/mobileServicePageConfig';

type Props = {
  division: ServiceDivision;
  headline: string;
  description: string;
};

export function MobileDivisionServicesView({ division, headline, description }: Props) {
  const services = getServicesByDivision(division);
  const { add } = useServicePlan();
  const category = mobileServiceCategoryLabel[division] ?? 'Services';

  const handleAdd = useCallback(
    (service: AioService) => {
      add({
        slug: service.slug,
        title: service.title,
        division: service.division,
        addedAt: new Date().toISOString(),
      });
    },
    [add],
  );

  return (
    <article className="aio-msvc-page">
      <header className="aio-msvc-hero aio-msvc-hero--compact">
        <p className="aio-msvc-hero__eyebrow">Services / {category}</p>
        <h1 className="aio-msvc-hero__title">{headline}</h1>
        <p className="aio-msvc-hero__desc">{description}</p>
      </header>
      <ul className="aio-msvc-division-list">
        {services.map((service) => (
          <li key={service.id}>
            <Link to={aioPaths.serviceSlug(service.slug)} className="aio-msvc-division-list__row">
              <span>
                <strong>{service.title}</strong>
                <small>{service.shortDescription}</small>
              </span>
              <span className="aio-msvc-division-list__chevron" aria-hidden="true">
                →
              </span>
            </Link>
            <button type="button" className="aio-msvc-division-list__add" onClick={() => handleAdd(service)}>
              Add to My Plan
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}

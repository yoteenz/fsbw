import { Link } from 'react-router-dom';
import type { AioIconKey } from '../../config/aioIconRegistry';
import { AIOIcon } from '../AIOIcon';

export type ServiceRowItem = {
  slug: string;
  title: string;
  description: string;
  href: string;
  icon?: AioIconKey;
  cta?: string;
};

type Props = {
  services: ServiceRowItem[];
  className?: string;
};

export function AioServiceRowList({ services, className = '' }: Props) {
  return (
    <ul className={`aio-ps-service-rows${className ? ` ${className}` : ''}`}>
      {services.map((service) => (
        <li key={service.slug}>
          <Link to={service.href} className="aio-ps-service-row">
            {service.icon ? (
              <span className="aio-ps-service-row__icon" aria-hidden="true">
                <AIOIcon icon={service.icon} size={28} alt="" />
              </span>
            ) : (
              <span className="aio-ps-service-row__icon aio-ps-service-row__icon--placeholder" aria-hidden="true" />
            )}
            <span className="aio-ps-service-row__copy">
              <strong className="aio-ps-service-row__title">{service.title}</strong>
              <span className="aio-ps-service-row__desc">{service.description}</span>
            </span>
            <span className="aio-ps-service-row__chevron" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

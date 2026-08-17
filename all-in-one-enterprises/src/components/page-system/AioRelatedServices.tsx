import { Link } from 'react-router-dom';

export type RelatedServiceItem = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

type Props = {
  services: RelatedServiceItem[];
  className?: string;
};

export function AioRelatedServices({ services, className = '' }: Props) {
  if (services.length === 0) return null;

  return (
    <div className={`aio-ps-related${className ? ` ${className}` : ''}`}>
      <ul className="aio-ps-related__list">
        {services.map((service) => (
          <li key={service.slug}>
            <Link to={service.href} className="aio-ps-related__card">
              <strong>{service.title}</strong>
              <span>{service.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Link } from 'react-router-dom';
import type { AioServiceDivision } from '../types';
import { aioServicePath } from '../utils/paths';

function ServiceIcon({ type }: { type: AioServiceDivision['icon'] }) {
  const icons: Record<AioServiceDivision['icon'], React.ReactNode> = {
    permitting: (
      <svg className="aio-service-strip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    formation: (
      <svg className="aio-service-strip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h18M6 21V7l6-3 6 3v14M10 21v-4h4v4" />
      </svg>
    ),
    insurance: (
      <svg className="aio-service-strip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l7 4v5c0 4.5-3.5 8.5-7 9-3.5-.5-7-4.5-7-9V7l7-4z" />
      </svg>
    ),
    dispatching: (
      <svg className="aio-service-strip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 11h2l1-3h12l1 3h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
    brokerage: (
      <svg className="aio-service-strip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  };
  return icons[type];
}

type Props = {
  services: AioServiceDivision[];
};

export function AIOServiceStrip({ services }: Props) {
  return (
    <section className="aio-service-strip" aria-label="Service divisions">
      <div className="aio-service-strip__grid">
        {services.map((service) => (
          <Link key={service.id} to={aioServicePath(service.slug)} className="aio-service-strip__item">
            <ServiceIcon type={service.icon} />
            <span className="aio-service-strip__label">{service.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

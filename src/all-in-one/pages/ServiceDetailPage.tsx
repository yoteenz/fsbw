import { Link } from 'react-router-dom';
import { servicePageMeta } from '../data/mockServices';
import { aioPaths } from '../utils/paths';
import { AIOButton } from '../components/AIOButton';

type Props = {
  slug: string;
};

export function ServiceDetailPage({ slug }: Props) {
  const meta = servicePageMeta[slug] ?? {
    title: 'Service',
    headline: 'Coming soon',
    description: 'This service page shell is ready for future content.',
  };

  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">
            <Link to={aioPaths.services} style={{ color: 'inherit' }}>
              Services
            </Link>{' '}
            / {meta.title}
          </p>
          <h1 className="aio-page-hero__title">{meta.headline}</h1>
          <p className="aio-page-hero__desc">{meta.description}</p>
        </div>
      </div>
      <div className="aio-page-content">
        <div className="aio-container">
          <p style={{ maxWidth: '40rem', lineHeight: 1.65, color: 'var(--aio-gray-800)' }}>
            This page shell is part of Sprint 01 — the structure, navigation, and design system are in place for future
            service content, intake flows, and customer resources.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={aioPaths.contact}>
              <AIOButton variant="gold">Contact Us</AIOButton>
            </Link>
            <Link to={aioPaths.roadmap}>
              <AIOButton variant="outline-dark">View Roadmap</AIOButton>
            </Link>
          </div>
          <p className="aio-prototype-note">Service availability and requirements may vary. No legal or regulatory guarantees are implied.</p>
        </div>
      </div>
    </>
  );
}

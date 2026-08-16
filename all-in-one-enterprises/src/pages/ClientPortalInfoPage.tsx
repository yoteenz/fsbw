import { Link } from 'react-router-dom';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIOPortalPreview } from '../components/AIOPortalPreview';
import { AIOButton } from '../components/AIOButton';
import { usePageMeta } from '../hooks/usePageMeta';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';

export function ClientPortalInfoPage() {
  usePageMeta({
    title: `Client Portal — ${aioAppConfig.company.legalName}`,
    description:
      'Manage filings, documents, renewals, loads, invoices, and service requests from your personalized All In One client command center.',
  });

  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Client Portal</p>
          <h1 className="aio-page-hero__title">Your business. One command center.</h1>
          <p className="aio-page-hero__desc">
            Track filings, documents, renewals, loads, invoices, and service requests from a single personalized portal
            — not just a marketing website.
          </p>
          <Link to={aioAppConfig.routes.clientLogin}>
            <AIOButton variant="gold">Client Login</AIOButton>
          </Link>
        </div>
      </div>
      <div className="aio-page-content">
        <div className="aio-container aio-container--wide">
          <section style={{ marginBottom: '3rem' }}>
            <AIOSectionHeader
              title="What you can manage"
              subtitle="Road Ready™, service requests, documents, dispatch, factoring, insurance, and billing — organized for carriers and shippers."
            />
          </section>
          <AIOPortalPreview />
          <p className="aio-portal-info-note">
            Portal modules reflect your active services and account permissions. Some features require enrollment or staff
            coordination.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Link to={aioAppConfig.routes.clientLogin}>
              <AIOButton variant="gold">Sign In to Portal</AIOButton>
            </Link>
            <Link to={aioPaths.contact}>
              <AIOButton variant="outline">Request Access</AIOButton>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

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
      <div className="aio-page-hero aio-page-hero--elevated">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Client Portal</p>
          <h1 className="aio-page-hero__title">Your business. One command center.</h1>
          <p className="aio-page-hero__desc">
            Track filings, documents, renewals, loads, invoices, and service requests from a single personalized portal
            — not just a marketing website.
          </p>
          <div className="aio-page-hero__actions aio-cta-row">
            <AIOButton
              to={aioPaths.login}
              variant="gold"
              className="aio-btn--block aio-cta-row__link"
            >
              Log In
            </AIOButton>
            <AIOButton
              to={aioPaths.signUp}
              variant="outline-gold"
              className="aio-btn--block aio-cta-row__link"
              showArrow
            >
              Sign Up
            </AIOButton>
          </div>
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
          <div className="aio-cta-row">
            <AIOButton
              to={aioPaths.login}
              variant="gold"
              className="aio-cta-row__link"
              showArrow
            >
              Log In
            </AIOButton>
            <AIOButton
              to={aioPaths.signUp}
              variant="outline-gold"
              className="aio-cta-row__link"
              showArrow
            >
              Sign Up
            </AIOButton>
            <AIOButton
              to={aioPaths.contact}
              variant="outline-gold"
              className="aio-cta-row__link"
              showArrow
            >
              Request Access
            </AIOButton>
          </div>
        </div>
      </div>
    </>
  );
}

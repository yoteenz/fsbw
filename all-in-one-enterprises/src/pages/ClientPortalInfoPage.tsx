import { AIOPortalPreview } from '../components/AIOPortalPreview';
import { AIOButton } from '../components/AIOButton';
import { usePageMeta } from '../hooks/usePageMeta';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';
import {
  AioPageShell,
  AioCinematicHero,
  AioSectionHeading,
  AioFeatureGrid,
  type FeatureItem,
} from '../components/page-system';
import { VAULT_TAXONOMY } from '../vault/vaultTaxonomy';

const VAULT_FEATURES: FeatureItem[] = VAULT_TAXONOMY.slice(0, 6).map((entry) => ({
  label: entry.label,
  icon: 'documentVault' as const,
}));

export function ClientPortalInfoPage() {
  usePageMeta({
    title: `Client Portal — ${aioAppConfig.company.legalName}`,
    description:
      'Manage filings, documents, renewals, loads, invoices, and service requests from your personalized All In One client command center.',
  });

  return (
    <AioPageShell>
      <AioCinematicHero
        eyebrow="Client Portal"
        title={
          <>
            Your business.
            <br />
            One command center.
          </>
        }
        description="Track filings, documents, renewals, loads, invoices, and service requests from a single personalized portal — not just a marketing website."
        breadcrumbs={[{ label: 'Client Portal' }]}
        actions={
          <>
            <AIOButton to={aioPaths.login} variant="gold">
              Log In
            </AIOButton>
            <AIOButton to={aioPaths.signUp} variant="outline-gold" showArrow>
              Sign Up
            </AIOButton>
          </>
        }
        compact
      />

      <div className="aio-ps-body">
        <div className="aio-container aio-container--wide">
          <AioSectionHeading
            title="What you can manage"
            subtitle="Road Ready™, service requests, documents, dispatch, factoring, insurance, and billing — organized for carriers and shippers."
            light
          />
          <AIOPortalPreview />

          <section className="aio-ps-block" style={{ marginTop: '2.5rem' }}>
            <AioSectionHeading
              eyebrow="Digital Records Vault"
              title="Your documents. Organized. Secure."
              subtitle="Everything you need in one secure place — formation, authority, permits, insurance, tax, and historical records."
              light
            />
            <AioFeatureGrid items={VAULT_FEATURES} />
            <div style={{ marginTop: '1.25rem' }}>
              <AIOButton to={aioPaths.login} variant="gold" showArrow>
                View My Documents
              </AIOButton>
            </div>
          </section>

          <p className="aio-ps-disclaimer">
            Portal modules reflect your active services and account permissions. Some features require enrollment or staff
            coordination.
          </p>
          <div className="aio-ps-hero-actions-row" style={{ marginTop: '1.5rem' }}>
            <AIOButton to={aioPaths.login} variant="gold" showArrow>
              Log In
            </AIOButton>
            <AIOButton to={aioPaths.contact} variant="outline-gold" showArrow>
              Request Access
            </AIOButton>
          </div>
        </div>
      </div>
    </AioPageShell>
  );
}

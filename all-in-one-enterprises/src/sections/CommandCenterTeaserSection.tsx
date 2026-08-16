import { Link } from 'react-router-dom';
import { AIOCommandCenterTeaser } from '../components/AIOCommandCenterTeaser';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIOButton } from '../components/AIOButton';
import { aioPaths } from '../utils/paths';

export function CommandCenterTeaserSection() {
  return (
    <section className="aio-section aio-section--light aio-section--spacious" aria-labelledby="aio-command-heading">
      <div className="aio-container aio-command-section__grid">
        <div>
          <AIOSectionHeader
            eyebrow="Your business. One command center."
            title="Manage everything in one place."
            subtitle="Track filings, documents, renewals, loads, invoices, and more from your personalized client portal."
          />
          <div className="aio-command-section__cta">
            <Link to={aioPaths.clientPortalInfo}>
              <AIOButton variant="outline">Explore the Client Portal →</AIOButton>
            </Link>
          </div>
        </div>
        <div id="aio-command-heading">
          <AIOCommandCenterTeaser />
        </div>
      </div>
    </section>
  );
}

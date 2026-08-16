import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIOPortalPreview } from '../components/AIOPortalPreview';

export function PlatformPreviewSection() {
  return (
    <section className="aio-section aio-section--dark" aria-labelledby="aio-platform-heading">
      <div className="aio-container aio-container--wide">
        <div style={{ marginBottom: '2.5rem' }}>
          <AIOSectionHeader
            light
            eyebrow="Future Platform"
            title="More than a marketing site"
            subtitle="Preview panels for the customer command center, dispatch, brokerage, and shipper experiences — nonfunctional prototypes for Sprint 01."
          />
        </div>
        <div id="aio-platform-heading">
          <AIOPortalPreview />
        </div>
      </div>
    </section>
  );
}

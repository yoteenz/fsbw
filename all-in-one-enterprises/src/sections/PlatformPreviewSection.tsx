import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIOPortalPreview } from '../components/AIOPortalPreview';

export function PlatformPreviewSection() {
  return (
    <section className="aio-section aio-section--dark" aria-labelledby="aio-platform-heading">
      <div className="aio-container aio-container--wide">
        <div style={{ marginBottom: '2.5rem' }}>
          <AIOSectionHeader
            light
            eyebrow="Client Portal"
            title="Manage your transportation business"
            subtitle="Preview of portal modules available to enrolled clients — dashboard, dispatch, brokerage, and shipper experiences."
          />
        </div>
        <div id="aio-platform-heading">
          <AIOPortalPreview />
        </div>
      </div>
    </section>
  );
}

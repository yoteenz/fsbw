import { aioAppConfig } from '../config/appConfig';
import { AIOSectionHeader } from '../components/AIOSectionHeader';

const trustItems = [
  {
    title: 'Transportation-Focused Support',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 13h2l2-5h11l2 5h3M5 16h.01M19 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Full-Service Solutions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Responsive Service',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
  {
    title: 'Business-to-Road Support',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h18M6 21V7l6-3 6 3v14" />
      </svg>
    ),
  },
];

export function TrustSection() {
  return (
    <section className="aio-section aio-section--light" aria-labelledby="aio-trust-heading">
      <div className="aio-container">
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <AIOSectionHeader align="center" title="Built for the business side of trucking" />
        </div>

        <div className="aio-trust-grid" id="aio-trust-heading">
          {trustItems.map((item) => (
            <div key={item.title} className="aio-trust-item">
              <div className="aio-trust-item__icon">{item.icon}</div>
              <p className="aio-trust-item__title">{item.title}</p>
            </div>
          ))}
        </div>

        {aioAppConfig.featureFlags.showSampleTestimonial ? (
          <div className="aio-sample-quote" style={{ marginTop: '3rem' }}>
            <span className="aio-sample-quote__badge">Sample · Debug Only</span>
            <blockquote>
              &ldquo;All In One helped me understand what I actually needed before I ever turned a wheel. Having one
              partner for formation, compliance, and insurance made the startup process feel manageable.&rdquo;
            </blockquote>
            <cite>— Sample Owner-Operator (Internal prototype content)</cite>
          </div>
        ) : null}
      </div>
    </section>
  );
}

import { aioAppConfig } from '../config/appConfig';
import { AIOButton } from '../components/AIOButton';

export function ContactPage() {
  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Contact</p>
          <h1 className="aio-page-hero__title">Let&apos;s talk about your business</h1>
          <p className="aio-page-hero__desc">
            Reach out to discuss permitting, formation, insurance assistance, dispatch, or brokerage needs. Contact
            details below are placeholders for the debug environment.
          </p>
        </div>
      </div>
      <div className="aio-page-content">
        <div className="aio-container">
          <div className="aio-two-col">
            <div>
              <h2 className="aio-display-md" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                Get in touch
              </h2>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Phone:</strong>{' '}
                <a href={aioAppConfig.contact.phoneHref} style={{ color: 'var(--aio-gold-dark)' }}>
                  {aioAppConfig.contact.phone}
                </a>
              </p>
              <p style={{ marginBottom: '1.5rem' }}>
                <strong>Email:</strong>{' '}
                <a href={aioAppConfig.contact.emailHref} style={{ color: 'var(--aio-gold-dark)' }}>
                  {aioAppConfig.contact.email}
                </a>
              </p>
              <AIOButton variant="gold" href={aioAppConfig.contact.phoneHref}>
                Call Now
              </AIOButton>
            </div>
            <div className="aio-card">
              <h3 className="aio-intent-card__title">Request a callback</h3>
              <p className="aio-intent-card__desc">Form prototype — nonfunctional in Sprint 01.</p>
              <div className="aio-form-preview">
                <div className="aio-form-preview__field">
                  <label className="aio-form-preview__label">Name</label>
                  <div className="aio-form-preview__input" style={{ background: 'var(--aio-gray-100)', color: 'var(--aio-gray-600)' }}>
                    Your name
                  </div>
                </div>
                <div className="aio-form-preview__field">
                  <label className="aio-form-preview__label">Email</label>
                  <div className="aio-form-preview__input" style={{ background: 'var(--aio-gray-100)', color: 'var(--aio-gray-600)' }}>
                    you@example.com
                  </div>
                </div>
                <div className="aio-form-preview__field">
                  <label className="aio-form-preview__label">How can we help?</label>
                  <div className="aio-form-preview__input" style={{ background: 'var(--aio-gray-100)', color: 'var(--aio-gray-600)', minHeight: '80px' }}>
                    Tell us about your business…
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <AIOButton variant="gold" size="sm">
                  Submit (Prototype)
                </AIOButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { aioAppConfig } from '../config/appConfig';
import { AIOButton } from '../components/AIOButton';
import { createLeadFromForm } from '../demo/crmActions';
import { aioPaths } from '../utils/paths';
import { servicesMegaMenu } from '../data/publicNavigation';
import {
  AioPageShell,
  AioCinematicHero,
  AioSectionHeading,
} from '../components/page-system';
import { AioDesktopContextShell } from '../components/context-rail';
import { buildContactRail } from '../context-rail/configs';

const CONTACT_INTENTS = [
  ...servicesMegaMenu.slice(0, 7).map((cat) => ({ id: cat.id, label: cat.title })),
  { id: 'existing-client', label: 'Existing Client Support' },
  { id: 'general', label: 'Other / General Inquiry' },
];

export function ContactPage() {
  const { t } = useTranslation('contextRail');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [message, setMessage] = useState('');
  const [preferred, setPreferred] = useState<'phone' | 'email' | 'text'>('phone');
  const [intent, setIntent] = useState(CONTACT_INTENTS[0]?.id ?? 'general');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const intentLabel = CONTACT_INTENTS.find((i) => i.id === intent)?.label ?? intent;
    createLeadFromForm({
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      businessName: businessName.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
      message: `[${intentLabel}] ${message.trim()}`,
      sourceSlug: 'website',
      preferredContactMethod: preferred,
    });
    setSubmitted(true);
  };

  return (
    <AioPageShell>
      <AioDesktopContextShell config={buildContactRail(t, CONTACT_INTENTS)}>
      <AioCinematicHero
        eyebrow="Talk to AIO"
        title={
          <>
            How can we
            <br />
            help you?
          </>
        }
        description="Tell us what you're trying to accomplish — we'll route your inquiry to the right team."
        breadcrumbs={[{ label: 'Contact' }]}
        compact
      />

      <div className="aio-ps-body">
        <div className="aio-container">
          {submitted ? (
            <div className="aio-ps-action-panel">
              <h2 className="aio-ps-action-panel__title">Thank you</h2>
              <p className="aio-ps-contact-meta">Your inquiry was received. All In One will follow up soon.</p>
              <Link to={aioPaths.home} className="aio-ps-text-action">
                ← Back to home
              </Link>
            </div>
          ) : (
            <>
              <AioSectionHeading eyebrow="Intent" title="What can we help with?" light />
              <div className="aio-ps-intent-grid" role="group" aria-label="Contact topic">
                {CONTACT_INTENTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`aio-ps-intent-btn${intent === item.id ? ' aio-ps-intent-btn--active' : ''}`}
                    onClick={() => setIntent(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="aio-ps-contact-panel">
                <div className="aio-ps-contact-meta">
                  <h2 className="aio-ps-heading__title" style={{ marginBottom: '0.75rem' }}>
                    Preferred contact
                  </h2>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Phone:</strong>{' '}
                    <a href={aioAppConfig.contact.phoneHref}>{aioAppConfig.contact.phone}</a>
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>Email:</strong>{' '}
                    <a href={aioAppConfig.contact.emailHref}>{aioAppConfig.contact.email}</a>
                  </p>
                  <AIOButton variant="gold" href={aioAppConfig.contact.phoneHref}>
                    Call Now
                  </AIOButton>
                  <p style={{ marginTop: '1rem' }}>
                    <Link to={aioPaths.requestCallback} className="aio-ps-text-action">
                      Prefer a callback? →
                    </Link>
                  </p>
                  <p style={{ marginTop: '1rem' }}>
                    <Link to={aioPaths.login} className="aio-ps-text-action">
                      Existing client? Log in to your portal →
                    </Link>
                  </p>
                </div>

                <form id="acr-contact-form" className="aio-ps-contact-form aio-form-preview" onSubmit={onSubmit}>
                  <h3 className="aio-intent-card__title">Send a message</h3>
                  <div className="aio-form-preview__field">
                    <label className="aio-form-preview__label" htmlFor="c-first">
                      First Name
                    </label>
                    <input
                      id="c-first"
                      className="aio-form-preview__input"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="aio-form-preview__field">
                    <label className="aio-form-preview__label" htmlFor="c-last">
                      Last Name
                    </label>
                    <input
                      id="c-last"
                      className="aio-form-preview__input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="aio-form-preview__field">
                    <label className="aio-form-preview__label" htmlFor="c-email">
                      Email
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      className="aio-form-preview__input"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="aio-form-preview__field">
                    <label className="aio-form-preview__label" htmlFor="c-phone">
                      Phone
                    </label>
                    <input
                      id="c-phone"
                      type="tel"
                      className="aio-form-preview__input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="aio-form-preview__field">
                    <label className="aio-form-preview__label" htmlFor="c-biz">
                      Business Name (optional)
                    </label>
                    <input
                      id="c-biz"
                      className="aio-form-preview__input"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="aio-form-preview__field">
                    <label className="aio-form-preview__label" htmlFor="c-help">
                      How Can We Help?
                    </label>
                    <textarea
                      id="c-help"
                      className="aio-form-preview__input"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <fieldset className="aio-form-preview__field">
                    <legend className="aio-form-preview__label">Preferred Contact Method</legend>
                    <label>
                      <input type="radio" name="pref" checked={preferred === 'phone'} onChange={() => setPreferred('phone')} /> Phone
                    </label>{' '}
                    <label>
                      <input type="radio" name="pref" checked={preferred === 'email'} onChange={() => setPreferred('email')} /> Email
                    </label>{' '}
                    <label>
                      <input type="radio" name="pref" checked={preferred === 'text'} onChange={() => setPreferred('text')} /> Text
                    </label>
                  </fieldset>
                  <AIOButton variant="gold" type="submit">
                    Submit Inquiry
                  </AIOButton>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
      </AioDesktopContextShell>
    </AioPageShell>
  );
}

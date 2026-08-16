import { useState } from 'react';
import { Link } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';
import { AIOButton } from '../components/AIOButton';
import { createLeadFromForm } from '../demo/crmActions';
import { aioPaths } from '../utils/paths';

export function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [message, setMessage] = useState('');
  const [preferred, setPreferred] = useState<'phone' | 'email' | 'text'>('phone');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLeadFromForm({
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      businessName: businessName.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
      message: message.trim(),
      sourceSlug: 'website',
      preferredContactMethod: preferred,
    });
    setSubmitted(true);
  };

  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Contact</p>
          <h1 className="aio-page-hero__title">Let&apos;s talk about your business</h1>
          <p className="aio-page-hero__desc">
            Reach out about permitting, formation, insurance assistance, dispatch, or brokerage. Submissions create a CRM lead in demo mode — no customer account yet.
          </p>
        </div>
      </div>
      <div className="aio-page-content">
        <div className="aio-container">
          {submitted ? (
            <div className="aio-portal-panel">
              <h2>Thank you</h2>
              <p>Your inquiry was received. All In One will follow up soon.</p>
              <Link to={aioPaths.home}>← Home</Link>
            </div>
          ) : (
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
                <p style={{ marginBottom: '1rem' }}>
                  <strong>Email:</strong>{' '}
                  <a href={aioAppConfig.contact.emailHref} style={{ color: 'var(--aio-gold-dark)' }}>
                    {aioAppConfig.contact.email}
                  </a>
                </p>
                <AIOButton variant="gold" href={aioAppConfig.contact.phoneHref}>
                  Call Now
                </AIOButton>
                <p style={{ marginTop: '1rem' }}>
                  <Link to={aioPaths.requestCallback}>Prefer a callback? →</Link>
                </p>
              </div>
              <form className="aio-card aio-form-preview" onSubmit={onSubmit}>
                <h3 className="aio-intent-card__title">Contact Us</h3>
                <div className="aio-form-preview__field">
                  <label className="aio-form-preview__label" htmlFor="c-first">First Name</label>
                  <input id="c-first" className="aio-form-preview__input" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="aio-form-preview__field">
                  <label className="aio-form-preview__label" htmlFor="c-last">Last Name</label>
                  <input id="c-last" className="aio-form-preview__input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="aio-form-preview__field">
                  <label className="aio-form-preview__label" htmlFor="c-email">Email</label>
                  <input id="c-email" type="email" className="aio-form-preview__input" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="aio-form-preview__field">
                  <label className="aio-form-preview__label" htmlFor="c-phone">Phone</label>
                  <input id="c-phone" type="tel" className="aio-form-preview__input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="aio-form-preview__field">
                  <label className="aio-form-preview__label" htmlFor="c-biz">Business Name (optional)</label>
                  <input id="c-biz" className="aio-form-preview__input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="aio-form-preview__field">
                  <label className="aio-form-preview__label" htmlFor="c-help">How Can We Help?</label>
                  <textarea id="c-help" className="aio-form-preview__input" rows={3} required value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <div className="aio-form-preview__field">
                  <label className="aio-form-preview__label" htmlFor="c-pref">Preferred Contact</label>
                  <select id="c-pref" className="aio-form-preview__input" value={preferred} onChange={(e) => setPreferred(e.target.value as typeof preferred)}>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="text">Text</option>
                  </select>
                </div>
                <AIOButton variant="gold" type="submit">Submit</AIOButton>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

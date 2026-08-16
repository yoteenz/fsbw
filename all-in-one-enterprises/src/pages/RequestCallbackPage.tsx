import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createLeadFromForm } from '../demo/crmActions';
import { AIOButton } from '../components/AIOButton';
import { aioPaths } from '../utils/paths';

export function RequestCallbackPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = name.trim().split(/\s+/);
    createLeadFromForm({
      firstName: parts[0],
      lastName: parts.slice(1).join(' ') || undefined,
      phone: phone.trim(),
      message: [bestTime && `Best time: ${bestTime}`, reason].filter(Boolean).join('\n'),
      sourceSlug: 'callback',
      preferredContactMethod: 'phone',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="aio-page-content">
        <div className="aio-container">
          <h1>Callback Request Received</h1>
          <p>Thank you. All In One will follow up as soon as possible during business hours.</p>
          <Link to={aioPaths.home}>← Home</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Request a Callback</p>
          <h1 className="aio-page-hero__title">We&apos;ll call you back</h1>
          <p className="aio-page-hero__desc">Short form — we do not promise an exact callback time in demo mode.</p>
        </div>
      </div>
      <div className="aio-page-content">
        <div className="aio-container" style={{ maxWidth: '32rem' }}>
          <form className="aio-card aio-form-preview" onSubmit={onSubmit}>
            <div className="aio-form-preview__field">
              <label className="aio-form-preview__label" htmlFor="cb-name">Name</label>
              <input id="cb-name" className="aio-form-preview__input" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="aio-form-preview__field">
              <label className="aio-form-preview__label" htmlFor="cb-phone">Phone</label>
              <input id="cb-phone" type="tel" className="aio-form-preview__input" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="aio-form-preview__field">
              <label className="aio-form-preview__label" htmlFor="cb-time">Best Time (optional)</label>
              <input id="cb-time" className="aio-form-preview__input" placeholder="e.g. mornings" value={bestTime} onChange={(e) => setBestTime(e.target.value)} />
            </div>
            <div className="aio-form-preview__field">
              <label className="aio-form-preview__label" htmlFor="cb-reason">Reason</label>
              <textarea id="cb-reason" className="aio-form-preview__input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <AIOButton variant="gold" type="submit">Request Callback</AIOButton>
          </form>
        </div>
      </div>
    </>
  );
}

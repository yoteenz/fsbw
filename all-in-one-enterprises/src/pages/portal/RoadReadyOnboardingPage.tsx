import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  completeRoadReadyOnboarding,
  saveRoadReadyProfile,
  setOnboardingStep,
  skipRoadReadyOnboarding,
  addPowerUnit,
  addDriver,
} from '../../demo/roadReadyActions';
import { createEmptyProfile } from '../../road-ready/roadReadyRules';
import { ONBOARDING_STEPS, ROAD_READY_PRODUCT_NAME } from '../../road-ready/roadReadyConfig';
import { useRoadReady } from '../../road-ready/useRoadReady';
import { GlossaryTooltip } from '../../components/GlossaryTooltip';
import { aioPaths } from '../../utils/paths';
import type { YesNoProgress } from '../../road-ready/roadReadyTypes';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const YES_NO: { value: YesNoProgress; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'not_sure', label: 'Not Sure' },
];

function Field({
  label,
  children,
  optional,
}: {
  label: string | React.ReactNode;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="aio-rr-field">
      <span className="aio-rr-field__label">
        {label}
        {optional && <span className="aio-rr-field__optional">Optional</span>}
      </span>
      {children}
    </label>
  );
}

export function RoadReadyOnboardingPage() {
  const navigate = useNavigate();
  const { organizationId, profile, onboardingProgress, isShipper } = useRoadReady();
  const [showWelcome, setShowWelcome] = useState(true);
  const [step, setStep] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [localProfile, setLocalProfile] = useState(profile ?? createEmptyProfile(organizationId));

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
      if (profile.onboardingComplete) {
        navigate(aioPaths.roadReady, { replace: true });
        return;
      }
      setStep(Math.max(0, profile.onboardingStep - 1));
      setShowWelcome(profile.onboardingStep <= 0);
    }
  }, [profile, navigate]);

  const persist = useCallback(
    (patch: Parameters<typeof saveRoadReadyProfile>[1], nextStep?: number) => {
      setSaveState('saving');
      try {
        saveRoadReadyProfile(organizationId, patch);
        if (nextStep != null) setOnboardingStep(organizationId, nextStep + 1);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      } catch {
        setSaveState('error');
      }
    },
    [organizationId],
  );

  if (isShipper) {
    return (
      <div className="aio-road-ready aio-rr-onboarding">
        <h1>Shipper Account</h1>
        <p>Road Ready is designed for carrier and owner-operator accounts. Your shipper dashboard is available on the main portal.</p>
        <Link to={aioPaths.portal} className="aio-btn aio-btn--gold">Go to Dashboard</Link>
      </div>
    );
  }

  const resume = profile && profile.onboardingStep > 0;

  if (showWelcome) {
    return (
      <div className="aio-road-ready aio-rr-onboarding aio-rr-welcome">
        <div className="aio-rr-welcome__inner">
          <p className="aio-label">{resume ? 'Welcome Back' : `Let's Get Your Business ${ROAD_READY_PRODUCT_NAME}`}</p>
          <h1>{resume ? `You're ${onboardingProgress}% through your ${ROAD_READY_PRODUCT_NAME} setup.` : `Let's get your business ${ROAD_READY_PRODUCT_NAME}.`}</h1>
          <p>
            Tell us where your business stands today. We'll organize what you already have, identify areas that may need review,
            and build your personalized All In One roadmap.
          </p>
          <p className="aio-prototype-note">
            {ROAD_READY_PRODUCT_NAME} is a business organization tool — not legal advice or a government compliance determination.
          </p>
          <div className="aio-rr-welcome__actions">
            <button type="button" className="aio-btn aio-btn--gold" onClick={() => { setShowWelcome(false); if (resume) setStep(Math.max(0, (profile?.onboardingStep ?? 1) - 1)); }}>
              {resume ? 'Continue Where I Left Off' : 'Start My Road Ready Profile'}
            </button>
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => { skipRoadReadyOnboarding(organizationId); navigate(aioPaths.portal); }}>
              I'll Do This Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = ONBOARDING_STEPS[step];
  const total = ONBOARDING_STEPS.length;

  const goNext = () => {
    const next = Math.min(step + 1, total - 1);
    setStep(next);
    setOnboardingStep(organizationId, next + 1);
  };

  const goBack = () => setStep(Math.max(0, step - 1));

  const finish = () => {
    completeRoadReadyOnboarding(organizationId);
    navigate(aioPaths.roadReady);
  };

  return (
    <div className="aio-road-ready aio-rr-onboarding">
      <header className="aio-rr-onboarding__header">
        <p className="aio-label">Step {step + 1} of {total}</p>
        <h1>{current.label}</h1>
        <nav className="aio-rr-step-nav" aria-label="Onboarding progress">
          {ONBOARDING_STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`aio-rr-step-nav__item ${i < step ? 'aio-rr-step-nav__item--done' : ''} ${i === step ? 'aio-rr-step-nav__item--current' : ''}`}
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <span className="aio-rr-save-indicator" aria-live="polite">
          {saveState === 'saving' && 'Saving…'}
          {saveState === 'saved' && 'Saved'}
          {saveState === 'error' && "We couldn't save this change. Retry."}
        </span>
      </header>

      <div className="aio-rr-onboarding__body">
        {step === 0 && (
          <section>
            <Field label="Legal Business Name"><input className="aio-intake-input" value={localProfile.business.legalName} onChange={(e) => setLocalProfile({ ...localProfile, business: { ...localProfile.business, legalName: e.target.value } })} onBlur={() => persist({ business: localProfile.business })} /></Field>
            <Field label="DBA / Trade Name" optional><input className="aio-intake-input" value={localProfile.business.dba ?? ''} onChange={(e) => setLocalProfile({ ...localProfile, business: { ...localProfile.business, dba: e.target.value } })} onBlur={() => persist({ business: localProfile.business })} /></Field>
            <Field label="Business Structure"><select className="aio-intake-input" value={localProfile.business.structure ?? ''} onChange={(e) => { const business = { ...localProfile.business, structure: e.target.value }; setLocalProfile({ ...localProfile, business }); persist({ business }); }}><option value="">Select…</option><option>LLC</option><option>Corporation</option><option>Sole Proprietorship</option><option>Partnership</option></select></Field>
            <Field label="Formation State"><input className="aio-intake-input" value={localProfile.business.formationState ?? ''} onChange={(e) => setLocalProfile({ ...localProfile, business: { ...localProfile.business, formationState: e.target.value } })} onBlur={() => persist({ business: localProfile.business })} /></Field>
            <Field label="Primary Operating State"><input className="aio-intake-input" value={localProfile.business.primaryOperatingState ?? ''} onChange={(e) => setLocalProfile({ ...localProfile, business: { ...localProfile.business, primaryOperatingState: e.target.value } })} onBlur={() => persist({ business: localProfile.business })} /></Field>
            <Field label="Do you have an EIN?"><div className="aio-rr-radio-group">{YES_NO.map((o) => (<label key={o.value}><input type="radio" name="ein" checked={localProfile.business.einStatus === o.value} onChange={() => { const business = { ...localProfile.business, einStatus: o.value }; setLocalProfile({ ...localProfile, business }); persist({ business }); }} /> {o.label}</label>))}</div></Field>
            <Field label="Business Phone"><input className="aio-intake-input" type="tel" value={localProfile.business.phone ?? ''} onChange={(e) => setLocalProfile({ ...localProfile, business: { ...localProfile.business, phone: e.target.value } })} onBlur={() => persist({ business: localProfile.business })} /></Field>
            <Field label="Business Email"><input className="aio-intake-input" type="email" value={localProfile.business.email ?? ''} onChange={(e) => setLocalProfile({ ...localProfile, business: { ...localProfile.business, email: e.target.value } })} onBlur={() => persist({ business: localProfile.business })} /></Field>
          </section>
        )}

        {step === 1 && (
          <section>
            <Field label="Operation Type"><select className="aio-intake-input" value={localProfile.operating.operationType ?? ''} onChange={(e) => { const operating = { ...localProfile.operating, operationType: e.target.value as typeof localProfile.operating.operationType }; setLocalProfile({ ...localProfile, operating }); persist({ operating }); }}><option value="">Select…</option><option value="owner_operator">Owner Operator</option><option value="motor_carrier">Motor Carrier</option><option value="fleet">Fleet</option><option value="other">Other</option></select></Field>
            <Field label="Operating Scope"><div className="aio-rr-radio-group">{(['intrastate', 'interstate', 'both', 'not_sure'] as const).map((v) => (<label key={v}><input type="radio" name="scope" checked={localProfile.operating.scope === v} onChange={() => { const operating = { ...localProfile.operating, scope: v }; setLocalProfile({ ...localProfile, operating }); persist({ operating }); }} /> {v.replace('_', ' ')}</label>))}</div></Field>
            <Field label="Currently Operating?"><div className="aio-rr-radio-group">{(['yes', 'no', 'preparing', 'inactive'] as const).map((v) => (<label key={v}><input type="radio" name="operating" checked={localProfile.operating.currentlyOperating === v} onChange={() => { const operating = { ...localProfile.operating, currentlyOperating: v }; setLocalProfile({ ...localProfile, operating }); persist({ operating }); }} /> {v.replace('_', ' ')}</label>))}</div></Field>
            <Field label="Approximate Fleet Size"><input className="aio-intake-input" type="number" min={0} value={localProfile.operating.fleetSize ?? ''} onChange={(e) => setLocalProfile({ ...localProfile, operating: { ...localProfile.operating, fleetSize: Number(e.target.value) } })} onBlur={() => persist({ operating: localProfile.operating })} /></Field>
          </section>
        )}

        {step === 2 && (
          <section>
            <Field label={<GlossaryTooltip term="USDOT">USDOT Number</GlossaryTooltip>}><div className="aio-rr-radio-group">{YES_NO.map((o) => (<label key={o.value}><input type="radio" checked={localProfile.authority.usdot === o.value} onChange={() => { const authority = { ...localProfile.authority, usdot: o.value }; setLocalProfile({ ...localProfile, authority }); persist({ authority }); }} /> {o.label}</label>))}</div></Field>
            {localProfile.authority.usdot === 'yes' && <Field label="USDOT Number (optional)" optional><input className="aio-intake-input" value={localProfile.authority.usdotNumber ?? ''} onChange={(e) => setLocalProfile({ ...localProfile, authority: { ...localProfile.authority, usdotNumber: e.target.value } })} onBlur={() => persist({ authority: localProfile.authority })} /><p className="aio-prototype-note">Unverified until confirmed by All In One.</p></Field>}
            <Field label={<GlossaryTooltip term="MC">Operating Authority / MC</GlossaryTooltip>}><div className="aio-rr-radio-group">{YES_NO.map((o) => (<label key={o.value}><input type="radio" checked={localProfile.authority.mc === o.value} onChange={() => { const authority = { ...localProfile.authority, mc: o.value }; setLocalProfile({ ...localProfile, authority }); persist({ authority }); }} /> {o.label}</label>))}</div></Field>
            <Field label={<GlossaryTooltip term="BOC-3">BOC-3</GlossaryTooltip>}><div className="aio-rr-radio-group">{YES_NO.map((o) => (<label key={o.value}><input type="radio" checked={localProfile.authority.boc3 === o.value} onChange={() => { const authority = { ...localProfile.authority, boc3: o.value }; setLocalProfile({ ...localProfile, authority }); persist({ authority }); }} /> {o.label}</label>))}</div></Field>
          </section>
        )}

        {step === 3 && (
          <section>
            <p>Add your power units, trailers, and drivers. You can add more later from Fleet.</p>
            <FleetQuickAdd orgId={organizationId} />
          </section>
        )}

        {step === 4 && (
          <section>
            {(['vehicleRegistration', 'irp', 'commercialTags', 'trailerRegistration'] as const).map((key) => (
              <Field key={key} label={key === 'irp' ? <GlossaryTooltip term="IRP">IRP / Apportioned Registration</GlossaryTooltip> : key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}>
                <div className="aio-rr-radio-group">{YES_NO.map((o) => (<label key={o.value}><input type="radio" checked={localProfile.registration[key] === o.value} onChange={() => { const registration = { ...localProfile.registration, [key]: o.value }; setLocalProfile({ ...localProfile, registration }); persist({ registration }); }} /> {o.label}</label>))}</div>
              </Field>
            ))}
          </section>
        )}

        {step === 5 && (
          <section>
            <Field label={<GlossaryTooltip term="IFTA">IFTA Account</GlossaryTooltip>}><div className="aio-rr-radio-group">{YES_NO.map((o) => (<label key={o.value}><input type="radio" checked={localProfile.taxFuel.ifta === o.value} onChange={() => { const taxFuel = { ...localProfile.taxFuel, ifta: o.value }; setLocalProfile({ ...localProfile, taxFuel }); persist({ taxFuel }); }} /> {o.label}</label>))}</div></Field>
            <Field label={<GlossaryTooltip term="Road Tax">Highway / Road Tax</GlossaryTooltip>}><div className="aio-rr-radio-group">{YES_NO.map((o) => (<label key={o.value}><input type="radio" checked={localProfile.taxFuel.highwayTax === o.value} onChange={() => { const taxFuel = { ...localProfile.taxFuel, highwayTax: o.value }; setLocalProfile({ ...localProfile, taxFuel }); persist({ taxFuel }); }} /> {o.label}</label>))}</div></Field>
          </section>
        )}

        {step === 6 && (
          <section>
            <Field label="Do you currently have commercial trucking insurance?"><div className="aio-rr-radio-group">{YES_NO.map((o) => (<label key={o.value}><input type="radio" checked={localProfile.insurance.hasInsurance === o.value} onChange={() => { const insurance = { ...localProfile.insurance, hasInsurance: o.value }; setLocalProfile({ ...localProfile, insurance }); persist({ insurance }); }} /> {o.label}</label>))}</div></Field>
            {localProfile.insurance.hasInsurance === 'yes' && (
              <>
                <Field label="Carrier Name" optional><input className="aio-intake-input" value={localProfile.insurance.carrierName ?? ''} onChange={(e) => setLocalProfile({ ...localProfile, insurance: { ...localProfile.insurance, carrierName: e.target.value } })} onBlur={() => persist({ insurance: localProfile.insurance })} /></Field>
                <Field label="Policy Expiration Date" optional><input className="aio-intake-input" type="date" value={localProfile.insurance.expirationDate ?? ''} onChange={(e) => { const insurance = { ...localProfile.insurance, expirationDate: e.target.value }; setLocalProfile({ ...localProfile, insurance }); persist({ insurance }); }} /></Field>
              </>
            )}
            <p className="aio-prototype-note">Coverage is not verified until reviewed by All In One.</p>
          </section>
        )}

        {step === 7 && (
          <section>
            <Field label={<GlossaryTooltip term="Trip Permit">Trip Permits</GlossaryTooltip>}><div className="aio-rr-radio-group">{YES_NO.map((o) => (<label key={o.value}><input type="radio" checked={localProfile.permits.tripPermits === o.value} onChange={() => { const permits = { ...localProfile.permits, tripPermits: o.value }; setLocalProfile({ ...localProfile, permits }); persist({ permits }); }} /> {o.label}</label>))}</div></Field>
            <Field label="State-Specific Permits"><div className="aio-rr-radio-group">{YES_NO.map((o) => (<label key={o.value}><input type="radio" checked={localProfile.permits.statePermits === o.value} onChange={() => { const permits = { ...localProfile.permits, statePermits: o.value }; setLocalProfile({ ...localProfile, permits }); persist({ permits }); }} /> {o.label}</label>))}</div></Field>
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => { const permits = { ...localProfile.permits, notSure: true, statePermits: 'not_sure' as YesNoProgress }; setLocalProfile({ ...localProfile, permits }); persist({ permits }); }}>Not Sure What I Need</button>
          </section>
        )}

        {step === 8 && (
          <section>
            <h2>Document Checklist</h2>
            <p>Upload documents when secure storage is available. For now, mark what you have ready.</p>
            <ul className="aio-rr-doc-checklist">
              {['Business Formation Document', 'Vehicle Registration', 'IRP Cab Card', 'IFTA Credential', 'Insurance Certificate', 'Authority Documentation'].map((doc) => (
                <li key={doc}><span>{doc}</span><span className="aio-badge aio-badge--optional">Metadata only</span></li>
              ))}
            </ul>
          </section>
        )}

        {step === 9 && (
          <section className="aio-rr-review">
            <h2>Review Your {ROAD_READY_PRODUCT_NAME} Profile</h2>
            <dl className="aio-rr-review__grid">
              <div><dt>Business</dt><dd>{localProfile.business.legalName || '—'}</dd><button type="button" className="aio-rr-link" onClick={() => setStep(0)}>Edit</button></div>
              <div><dt>Operations</dt><dd>{localProfile.operating.operationType?.replace('_', ' ') ?? '—'}</dd><button type="button" className="aio-rr-link" onClick={() => setStep(1)}>Edit</button></div>
              <div><dt>Authority</dt><dd>USDOT: {localProfile.authority.usdot ?? '—'}</dd><button type="button" className="aio-rr-link" onClick={() => setStep(2)}>Edit</button></div>
              <div><dt>Insurance</dt><dd>{localProfile.insurance.hasInsurance ?? '—'}</dd><button type="button" className="aio-rr-link" onClick={() => setStep(6)}>Edit</button></div>
            </dl>
            <p className="aio-prototype-note">Based on the information available to All In One — not a legal compliance determination.</p>
          </section>
        )}
      </div>

      <footer className="aio-rr-onboarding__footer aio-rr-sticky-footer">
        {step > 0 && <button type="button" className="aio-btn aio-btn--outline" onClick={goBack}>Back</button>}
        {step < total - 1 ? (
          <button type="button" className="aio-btn aio-btn--gold" onClick={goNext}>Continue</button>
        ) : (
          <button type="button" className="aio-btn aio-btn--gold" onClick={finish}>Build My Road Ready Profile</button>
        )}
      </footer>
    </div>
  );
}

function FleetQuickAdd({ orgId }: { orgId: string }) {
  const [nickname, setNickname] = useState('');
  const [driverName, setDriverName] = useState('');

  return (
    <div className="aio-rr-fleet-quick">
      <Field label="Add Power Unit">
        <div className="aio-rr-inline-form">
          <input className="aio-intake-input" placeholder="Unit nickname / number" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => { if (nickname.trim()) { addPowerUnit(orgId, { nickname: nickname.trim(), status: 'active', readiness: 'incomplete' }); setNickname(''); } }}>Add</button>
        </div>
      </Field>
      <Field label="Add Driver" optional>
        <div className="aio-rr-inline-form">
          <input className="aio-intake-input" placeholder="Driver name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => { if (driverName.trim()) { addDriver(orgId, { name: driverName.trim(), status: 'active' }); setDriverName(''); } }}>Add</button>
        </div>
      </Field>
      <Link to={aioPaths.portalFleet} className="aio-rr-link">Manage full fleet →</Link>
    </div>
  );
}

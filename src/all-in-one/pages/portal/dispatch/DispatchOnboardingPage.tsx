import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemoStore } from '../../../demo/useDemoStore';
import { getEnrollment, getOrganizationId, saveDispatchOnboarding } from '../../../demo/dispatchActions';
import { useRoadReady } from '../../../road-ready/useRoadReady';
import { DISPATCH_AGREEMENT_PLACEHOLDER } from '../../../dispatch/dispatchConfig';
import type { DispatchOperatingPreferences } from '../../../dispatch/dispatchTypes';
import { aioPaths } from '../../../utils/paths';

export function DispatchOnboardingPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const enrollment = getEnrollment(orgId, store);
  const { profile } = useRoadReady();
  const navigate = useNavigate();
  const units = store.powerUnits.filter((u) => u.organizationId === orgId);

  const [prefs, setPrefs] = useState<DispatchOperatingPreferences>(enrollment?.preferences ?? {});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDispatchOnboarding(orgId, prefs);
    navigate(aioPaths.portalDispatch);
  };

  return (
    <div className="aio-dispatch aio-dispatch-onboarding">
      <Link to={aioPaths.portalDispatch} className="aio-rr-link">← Dispatch</Link>
      <header className="aio-dispatch-hero">
        <h1>Dispatch Operating Profile</h1>
        <p>Confirm known information and add preferences. Preferences are targets — not guarantees.</p>
      </header>

      <section className="aio-dispatch-card">
        <h2>Known From Road Ready &amp; Fleet</h2>
        <dl className="aio-dispatch-confirm">
          <div><dt>Business</dt><dd>{profile?.business?.legalName ?? store.clients.find((c) => c.id === orgId)?.companyName}</dd></div>
          <div><dt>USDOT / MC</dt><dd>{profile?.authority?.usdotNumber ?? '—'} / {profile?.authority?.mcNumber ?? '—'}</dd></div>
          <div><dt>Trucks</dt><dd>{units.map((u) => u.nickname).join(', ') || '—'}</dd></div>
        </dl>
      </section>

      <form onSubmit={onSubmit} className="aio-dispatch-form">
        <label>
          Preferred Freight Types
          <input
            value={(prefs.preferredFreightTypes ?? []).join(', ')}
            onChange={(e) => setPrefs({ ...prefs, preferredFreightTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="Dry Van, General Freight"
          />
        </label>
        <label>
          Preferred States
          <input
            value={(prefs.preferredStates ?? []).join(', ')}
            onChange={(e) => setPrefs({ ...prefs, preferredStates: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="TX, GA, FL"
          />
        </label>
        <label>
          Avoided States
          <input
            value={(prefs.avoidedStates ?? []).join(', ')}
            onChange={(e) => setPrefs({ ...prefs, avoidedStates: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          />
        </label>
        <label>
          Home City
          <input value={prefs.homeCity ?? ''} onChange={(e) => setPrefs({ ...prefs, homeCity: e.target.value })} />
        </label>
        <label>
          Home State
          <input value={prefs.homeState ?? ''} onChange={(e) => setPrefs({ ...prefs, homeState: e.target.value })} maxLength={2} />
        </label>
        <label>
          Trailer Type
          <input value={prefs.trailerType ?? ''} onChange={(e) => setPrefs({ ...prefs, trailerType: e.target.value })} />
        </label>
        <label>
          Team / Solo
          <select value={prefs.teamOrSolo ?? 'solo'} onChange={(e) => setPrefs({ ...prefs, teamOrSolo: e.target.value as 'team' | 'solo' | 'either' })}>
            <option value="solo">Solo</option>
            <option value="team">Team</option>
            <option value="either">Either</option>
          </select>
        </label>
        <label>
          Min Preferred RPM (target)
          <input
            type="number"
            step="0.01"
            value={prefs.minPreferredRpmMinor != null ? prefs.minPreferredRpmMinor / 100 : ''}
            onChange={(e) => setPrefs({ ...prefs, minPreferredRpmMinor: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined })}
            placeholder="2.50"
          />
        </label>
        <label>
          Special Restrictions / Notes
          <textarea value={prefs.notes ?? ''} onChange={(e) => setPrefs({ ...prefs, notes: e.target.value })} rows={3} />
        </label>
        <p className="aio-prototype-note">{DISPATCH_AGREEMENT_PLACEHOLDER}</p>
        <button type="submit" className="aio-btn aio-btn--gold">Save &amp; Continue</button>
      </form>
    </div>
  );
}

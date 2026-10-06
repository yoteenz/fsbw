import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isSupabaseMode } from '../../config/dataMode';
import { loadDemoStore, updateDemoStore } from '../../demo/demoStore';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import {
  supabaseConfirmActivation,
  supabaseRecordReviewSection,
  supabaseRecordWhatChanged,
} from '../../client-migration/repositories/supabaseClientActivationRepository';
import {
  confirmAndActivateClient,
  recordReviewSectionResponse,
  recordWhatChanged,
} from '../../client-migration/services/clientActivationService';
import type { ReviewSectionCode, WhatChangedShortcut } from '../../client-migration/types';
import { canAccessClientOffice } from '../../client-migration/lifecycle';
import { aioPaths } from '../../utils/paths';

const SECTIONS: { code: ReviewSectionCode; label: string }[] = [
  { code: 'COMPANY', label: 'Company' },
  { code: 'PEOPLE', label: 'People' },
  { code: 'VEHICLES', label: 'Vehicles' },
  { code: 'ACTIVE_SERVICES', label: 'Active services' },
];

const SHORTCUTS: { code: WhatChangedShortcut; label: string }[] = [
  { code: 'NOTHING_CHANGED', label: 'Nothing changed' },
  { code: 'BOUGHT_A_TRUCK', label: 'Bought a truck' },
  { code: 'SOLD_A_TRUCK', label: 'Sold a truck' },
  { code: 'CONTACT_INFO_CHANGED', label: 'Contact info changed' },
  { code: 'SOMETHING_ELSE', label: 'Something else' },
];

export function ClientOfficeReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAIOAuth();
  const organizationId =
    (location.state as { organizationId?: string } | null)?.organizationId ??
    loadDemoStore().portalClientId ??
    'client-a';

  const client = useMemo(
    () => loadDemoStore().clients.find((c) => c.id === organizationId),
    [organizationId],
  );

  const [message, setMessage] = useState<string | null>(null);

  function patchStore(mutator: (s: ReturnType<typeof loadDemoStore>) => ReturnType<typeof loadDemoStore>) {
    updateDemoStore((s) => mutator(s));
  }

  async function markSection(code: ReviewSectionCode, response: 'LOOKS_RIGHT' | 'NEEDS_UPDATE' | 'NOT_SURE') {
    if (isSupabaseMode()) {
      const { error } = await supabaseRecordReviewSection(organizationId, code, response);
      if (error) setMessage(error);
      return;
    }
    patchStore((s) => recordReviewSectionResponse(s, organizationId, code, response));
  }

  async function onShortcut(code: WhatChangedShortcut) {
    if (isSupabaseMode()) {
      const { error } = await supabaseRecordWhatChanged(organizationId, code);
      if (error) setMessage(error);
      return;
    }
    patchStore((s) => recordWhatChanged(s, organizationId, code));
  }

  async function onConfirm() {
    if (isSupabaseMode()) {
      const userId = session?.user.id;
      if (!userId) {
        setMessage('Sign in to confirm activation');
        return;
      }
      const { error } = await supabaseConfirmActivation({ organizationId, userId });
      if (error) {
        setMessage(error);
        return;
      }
      navigate(aioPaths.portal, { replace: true });
      return;
    }
    const store = loadDemoStore();
    const { store: next, error } = confirmAndActivateClient(store, organizationId);
    if (error) {
      setMessage(error);
      return;
    }
    updateDemoStore(() => next);
    const updated = next.clients.find((c) => c.id === organizationId);
    if (updated && canAccessClientOffice(updated.clientLifecycle ?? 'KNOWN_UNMIGRATED')) {
      navigate(aioPaths.portal, { replace: true });
    }
  }

  if (!client) {
    return (
      <div className="aio-page" style={{ padding: '2rem 1rem' }}>
        <p className="aio-body">Client record not found.</p>
        <Link to={aioPaths.home}>Home</Link>
      </div>
    );
  }

  return (
    <div className="aio-page" style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <h1 className="aio-display-md">Here&apos;s what AIO already knows</h1>
      <p className="aio-body" style={{ margin: '0.5rem 0 1.5rem' }}>
        {client.companyName}
        {client.customerNumber ? ` · ${client.customerNumber}` : ''}
      </p>
      <ul className="aio-body" style={{ marginBottom: '1.5rem' }}>
        <li>Business profile: {client.profileCompletenessPct ?? 0}% known</li>
        <li>Document vault: {client.archiveMigrationStatus ?? 'not_started'}</li>
        <li>Client review: {client.clientReviewState ?? 'REQUIRED'}</li>
      </ul>

      {SECTIONS.map((section) => (
        <section key={section.code} style={{ marginBottom: '1rem', borderTop: '1px solid #ddd', paddingTop: '0.75rem' }}>
          <h2 className="aio-heading-sm">{section.label}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="aio-btn aio-btn--ghost" onClick={() => markSection(section.code, 'LOOKS_RIGHT')}>
              Looks right
            </button>
            <button type="button" className="aio-btn aio-btn--ghost" onClick={() => markSection(section.code, 'NEEDS_UPDATE')}>
              Needs an update
            </button>
            <button type="button" className="aio-btn aio-btn--ghost" onClick={() => markSection(section.code, 'NOT_SURE')}>
              I&apos;m not sure
            </button>
          </div>
        </section>
      ))}

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="aio-heading-sm">What changed?</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
          {SHORTCUTS.map((s) => (
            <button key={s.code} type="button" className="aio-btn aio-btn--ghost" onClick={() => onShortcut(s.code)}>
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {message ? <p className="aio-body" style={{ color: '#c00' }}>{message}</p> : null}

      <button type="button" className="aio-btn aio-btn--gold" onClick={onConfirm}>
        Confirm &amp; enter my office
      </button>
    </div>
  );
}

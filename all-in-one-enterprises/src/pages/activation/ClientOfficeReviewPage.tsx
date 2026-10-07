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
import { MigrationAuthorityShell } from '../../client-migration/visual/MigrationAuthorityShell';
import { aioPaths } from '../../utils/paths';

const SECTIONS: { code: ReviewSectionCode; label: string; step: Step }[] = [
  { code: 'COMPANY', label: 'Company', step: 'company' },
  { code: 'PEOPLE', label: 'People', step: 'people' },
  { code: 'VEHICLES', label: 'Vehicles', step: 'vehicles' },
  { code: 'ACTIVE_SERVICES', label: 'Active services', step: 'services' },
  { code: 'DOCUMENTS', label: 'Documents we have', step: 'documents' },
];

const SHORTCUTS: { code: WhatChangedShortcut; label: string }[] = [
  { code: 'BOUGHT_A_TRUCK', label: 'Bought a truck' },
  { code: 'SOLD_A_TRUCK', label: 'Sold a truck' },
  { code: 'ADDED_A_DRIVER', label: 'Added a driver' },
  { code: 'REMOVED_A_DRIVER', label: 'Removed a driver' },
  { code: 'ADDRESS_CHANGED', label: 'Address changed' },
  { code: 'INSURANCE_CHANGED', label: 'Insurance changed' },
  { code: 'OWNERSHIP_CHANGED', label: 'Ownership changed' },
  { code: 'CONTACT_INFO_CHANGED', label: 'Contact changed' },
  { code: 'NOTHING_CHANGED', label: 'Nothing changed' },
  { code: 'SOMETHING_ELSE', label: 'Something else' },
];

type Step = 'welcome' | 'company' | 'people' | 'vehicles' | 'services' | 'documents' | 'changed' | 'confirm' | 'done';

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
  const [step, setStep] = useState<Step>('welcome');
  const [active, setActive] = useState(false);

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
      setActive(true);
      setStep('done');
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
      setActive(true);
      setStep('done');
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

  const section = SECTIONS.find((item) => item.step === step);
  const nextStep: Record<Step, Step | null> = {
    welcome: 'company',
    company: 'people',
    people: 'vehicles',
    vehicles: 'services',
    services: 'documents',
    documents: 'changed',
    changed: 'confirm',
    confirm: null,
    done: null,
  };

  const titles: Record<Step, string> = {
    welcome: "HERE'S WHAT AIO ALREADY KNOWS",
    company: 'COMPANY REVIEW',
    people: 'PEOPLE REVIEW',
    vehicles: 'VEHICLES REVIEW',
    services: 'ACTIVE SERVICES',
    documents: 'DOCUMENTS WE HAVE',
    changed: 'WHAT CHANGED?',
    confirm: 'CONFIRM YOUR INFORMATION',
    done: 'WELCOME TO YOUR OFFICE',
  };

  return (
    <MigrationAuthorityShell
      plate="existing"
      dock="none"
      kicker="CLIENT ACTIVATION"
      title={titles[step]}
      subtitle={
        step === 'done'
          ? 'Your information is confirmed and your client office is ready.'
          : `${client.companyName} is reviewing what AIO already has. This is not a blank account.`
      }
      cta={step === 'confirm' ? 'CONFIRM & ACTIVATE' : step === 'done' ? 'ENTER YOUR OFFICE' : 'CONTINUE'}
      onCta={() => {
        if (step === 'confirm') {
          void onConfirm();
          return;
        }
        if (step === 'done') {
          navigate(aioPaths.portal, { replace: true });
          return;
        }
        const next = nextStep[step];
        if (next) setStep(next);
      }}
      ctaDisabled={step === 'done' && !active && !canAccessClientOffice(client.clientLifecycle ?? 'KNOWN_UNMIGRATED')}
    >
      <article className="mig-card">
        <h2>{client.companyName}</h2>
        <p className="mig-sub">
          {client.contactName}
          {client.customerNumber ? ` · ${client.customerNumber}` : ''}
          {' · '}
          {step === 'done' ? 'ACTIVE' : 'NOT ACTIVE YET'}
        </p>
        {step === 'welcome' ? (
          <p className="mig-sub">
            Profile {client.profileCompletenessPct ?? 0}% known. Vault {client.archiveMigrationStatus ?? 'not started'}.
            Client review {client.clientReviewState ?? 'REQUIRED'}.
          </p>
        ) : null}
        {section ? (
          <div className="mig-actions">
            <button type="button" className="mig-chip mig-chip--gold" onClick={() => markSection(section.code, 'LOOKS_RIGHT')}>LOOKS RIGHT</button>
            <button type="button" className="mig-chip" onClick={() => markSection(section.code, 'NEEDS_UPDATE')}>NEEDS AN UPDATE</button>
            <button type="button" className="mig-chip" onClick={() => markSection(section.code, 'NOT_SURE')}>I&apos;M NOT SURE</button>
          </div>
        ) : null}
        {step === 'changed' ? (
          <div className="mig-actions">
            {SHORTCUTS.map((item) => (
              <button key={item.code} type="button" className="mig-chip" onClick={() => onShortcut(item.code)}>
                {item.label.toUpperCase()}
              </button>
            ))}
          </div>
        ) : null}
        {step === 'confirm' ? (
          <p className="mig-sub">Confirming writes your review and is the step that can make this client ACTIVE.</p>
        ) : null}
        {step === 'done' ? (
          <p className="mig-sub">ACTIVE WITH AIO. Your information is confirmed.</p>
        ) : null}
      </article>
      {step === 'done' ? (
        <article className="mig-card">
          <h2>YOUR OFFICE IS READY</h2>
          {(
            [
              ['My Business', aioPaths.portalBusiness],
              ['Operations', aioPaths.portalOperations],
              ['Finances', aioPaths.portalMoney],
              ['Vault', aioPaths.portalVault],
              ['Inbox', aioPaths.portalInbox],
            ] as const
          ).map(([label, href]) => (
            <div className="mig-row" key={href}>
              <Link to={href}>{label}</Link>
            </div>
          ))}
        </article>
      ) : null}
      {client.services.length && step === 'services' ? (
        <article className="mig-card">
          <h2>SERVICES ON RECORD</h2>
          {client.services.map((service) => (
            <div className="mig-row" key={service}><span>{service}</span></div>
          ))}
        </article>
      ) : null}
      {message ? <p className="mig-error">{message}</p> : null}
    </MigrationAuthorityShell>
  );
}

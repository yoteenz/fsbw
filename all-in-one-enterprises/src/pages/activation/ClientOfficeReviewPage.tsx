import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isSupabaseMode } from '../../config/dataMode';
import { loadDemoStore, updateDemoStore } from '../../demo/demoStore';
import { useDemoStore } from '../../demo/useDemoStore';
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
import type { ReviewSectionCode, ReviewSectionResponse, WhatChangedShortcut } from '../../client-migration/types';
import { canAccessClientOffice } from '../../client-migration/lifecycle';
import {
  AioMigrationCTA,
  AioMigrationHero,
  MigrationShell,
} from '../../client-migration/visual/AioMigrationKit';
import { ActivationCompanyScreen, ActivationCompleteScreen } from '../../client-migration/visual/ActivationScreens';
import {
  ActivationChangedScreen,
  ActivationConfirmScreen,
  ActivationDocumentsScreen,
  ActivationPeopleScreen,
  ActivationServicesScreen,
  ActivationVehiclesScreen,
  ActivationWelcomeScreen,
  peopleOf,
  type ItemResponses,
} from '../../client-migration/visual/ActivationReviewScreens';
import { SECTION_CODE, documentsOf, trailersOf, unitsOf, type SectionKey } from '../../client-migration/visual/migrationData';
import { MIGRATION_HERO, heroStyle } from '../../client-migration/visual/migrationHero';
import { clientIdentifiers, clientViewer } from '../../client-migration/visual/migrationViewer';
import '../../client-migration/visual/migration-authority.css';
import { aioPaths } from '../../utils/paths';

/** Sections the activation service requires an answer for (clientActivationService REQUIRED_SECTIONS). */
const REQUIRED_REVIEW: Array<{ code: ReviewSectionCode; label: string }> = [
  { code: 'COMPANY', label: 'Company' },
  { code: 'PEOPLE', label: 'People' },
  { code: 'VEHICLES', label: 'Vehicles' },
  { code: 'ACTIVE_SERVICES', label: 'Active services' },
];

type Step = 'welcome' | 'company' | 'people' | 'vehicles' | 'services' | 'documents' | 'changed' | 'confirm' | 'done';

const STEPS: Step[] = ['welcome', 'company', 'people', 'vehicles', 'services', 'documents', 'changed', 'confirm', 'done'];

function stepFromHash(hash: string): Step {
  const id = hash.replace('#', '') as Step;
  return STEPS.includes(id) ? id : 'welcome';
}

export function ClientOfficeReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAIOAuth();
  const store = useDemoStore();
  const organizationId =
    (location.state as { organizationId?: string } | null)?.organizationId ??
    store.portalClientId ??
    'client-a';

  const client = store.clients.find((c) => c.id === organizationId);

  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(() => stepFromHash(window.location.hash));
  const [active, setActive] = useState(false);
  const [items, setItems] = useState<ItemResponses>({});

  useEffect(() => {
    const sync = () => setStep(stepFromHash(window.location.hash));
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  function go(next: Step) {
    setStep(next);
    window.history.replaceState(null, '', `#${next}`);
  }

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
      go('done');
      return;
    }
    const store = loadDemoStore();
    const { store: next, error } = confirmAndActivateClient(store, organizationId);
    if (error) {
      // Name what is still open instead of the bare condition error.
      const answered = new Set((store.clientReviewSections ?? []).filter((r) => r.organizationId === organizationId && r.response).map((r) => r.sectionCode));
      const missing = REQUIRED_REVIEW.filter((item) => !answered.has(item.code)).map((item) => item.label);
      setMessage(missing.length ? `Review these sections before activating: ${missing.join(', ')}.` : error);
      return;
    }
    updateDemoStore(() => next);
    const updated = next.clients.find((c) => c.id === organizationId);
    if (updated && canAccessClientOffice(updated.clientLifecycle ?? 'KNOWN_UNMIGRATED')) {
      setActive(true);
      go('done');
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

  /** PREBUILT ≠ ACTIVE: the arrival screen exists only for a client whose lifecycle is ACTIVE. */
  const isActive = active || canAccessClientOffice(client.clientLifecycle ?? 'KNOWN_UNMIGRATED');
  const view: Step = step === 'done' && !isActive ? 'confirm' : step;
  const profile = (store.roadReadyProfiles ?? []).find((p) => p.organizationId === organizationId);
  const contact = (store.organizationMembers ?? []).find(
    (m) => m.organizationId === organizationId && (m.email === client.contactEmail || m.name === client.contactName),
  );
  const companyResponse = (store.clientReviewSections ?? []).find(
    (r) => r.organizationId === organizationId && r.sectionCode === 'COMPANY',
  )?.response;

  const titles: Record<Step, string[]> = {
    welcome: ["HERE'S WHAT", 'AIO ALREADY KNOWS'],
    company: ['COMPANY', 'REVIEW'],
    people: ['PEOPLE', 'REVIEW'],
    vehicles: ['VEHICLES', 'REVIEW'],
    services: ['ACTIVE', 'SERVICES'],
    documents: ['DOCUMENTS', 'WE HAVE'],
    changed: ['WHAT', 'CHANGED?'],
    confirm: ['CONFIRM YOUR', 'INFORMATION'],
    done: ['WELCOME TO', 'YOUR OFFICE'],
  };

  function onCta() {
    if (view === 'confirm') {
      void onConfirm();
      return;
    }
    const next = nextStep[view];
    if (next) go(next);
  }

  if (view === 'done') {
    return (
      <MigrationShell family="active" actor="client" screen="complete" viewer={clientViewer(client)} tools={false}>
          <AioMigrationHero
            kicker="CLIENT ACTIVATION"
            title={titles.done}
            accent="ACTIVE WITH AIO"
            subtitle={
              <>
                <span className="amg-line">Your information is confirmed and</span>
                <span className="amg-line">your client office is ready.</span>
              </>
            }
          />
          <ActivationCompleteScreen onEnter={() => navigate(aioPaths.portal, { replace: true })} />
          {message ? <p className="amg-msg">{message}</p> : null}
      </MigrationShell>
    );
  }

  const ids = clientIdentifiers(store, client);
  const spec = MIGRATION_HERO[view];
  const itemKeys: Record<SectionKey, string[]> = {
    COMPANY: [],
    PEOPLE: peopleOf(store, client).map((p) => `PEOPLE:${p.key}`),
    VEHICLES: [...unitsOf(store, client.id), ...trailersOf(store, client.id)].map((v) => `VEHICLES:${v.id}`),
    SERVICES: client.services.map((service) => `SERVICES:${service}`),
    DOCUMENTS: documentsOf(store, client.id).filter((d) => d.visibility === 'customer').map((d) => `DOCUMENTS:${d.id}`),
  };
  const sectionResponse = (code: ReviewSectionCode) =>
    (store.clientReviewSections ?? []).find((r) => r.organizationId === organizationId && r.sectionCode === code)?.response;
  const reported = new Set((store.clientReportedChanges ?? []).filter((c) => c.organizationId === organizationId).map((c) => c.shortcut));

  /** One item's answer; the section response recorded for activation is the roll-up of its items. */
  function onItem(key: string, response: ReviewSectionResponse) {
    const next = { ...items, [key]: response };
    setItems(next);
    const section = key.split(':')[0] as SectionKey;
    const values = itemKeys[section].map((k) => next[k]);
    const rollup: ReviewSectionResponse | null = values.includes('NEEDS_UPDATE')
      ? 'NEEDS_UPDATE'
      : values.includes('NOT_SURE')
        ? 'NOT_SURE'
        : values.every((v) => v === 'LOOKS_RIGHT')
          ? 'LOOKS_RIGHT'
          : null;
    if (rollup) void markSection(SECTION_CODE[section], rollup);
  }

  const cta = (label = 'CONTINUE') => (
    <>
      {message ? <p className="amg-msg">{message}</p> : null}
      <AioMigrationCTA label={label} onClick={onCta} />
    </>
  );
  const sectionStep: Record<SectionKey, Step> = { COMPANY: 'company', PEOPLE: 'people', VEHICLES: 'vehicles', SERVICES: 'services', DOCUMENTS: 'documents' };

  return (
    <MigrationShell family="existing" actor="client" screen={view} viewer={clientViewer(client)}>
        {view === 'company' ? (
          <AioMigrationHero
            kicker="CLIENT ACTIVATION"
            title={titles.company}
            subtitle={
              <>
                <span className="amg-line">Review your current client information</span>
                <span className="amg-line">below. Confirm that everything looks</span>
                <span className="amg-line">right before we activate your account.</span>
              </>
            }
          />
        ) : spec ? (
          <AioMigrationHero
            kicker={spec.kicker}
            title={spec.title}
            subtitle={spec.sub.map((line) => (
              <span key={line} className="amg-line">
                {line}
              </span>
            ))}
            style={heroStyle(spec.m)}
          />
        ) : null}
        {view === 'company' ? (
          <>
            <ActivationCompanyScreen
              client={client}
              business={profile?.business}
              identifiers={ids}
              contact={contact}
              active={isActive}
              response={companyResponse}
              onRespond={(response) => void markSection('COMPANY', response)}
              onContinue={() => go('people')}
            />
            {message ? <p className="amg-msg">{message}</p> : null}
          </>
        ) : null}
        {view === 'welcome' ? <ActivationWelcomeScreen client={client} ids={ids} onEdit={() => go('company')} onKnown={() => go('company')} onConfirm={() => go('confirm')} cta={cta()} /> : null}
        {view === 'people' ? <ActivationPeopleScreen store={store} client={client} ids={ids} responses={items} onRespond={onItem} onAddPerson={() => go('changed')} cta={cta()} /> : null}
        {view === 'vehicles' ? (
          <ActivationVehiclesScreen store={store} client={client} responses={items} onRespond={onItem} section={sectionResponse('VEHICLES')} onSection={(r) => void markSection('VEHICLES', r)} cta={cta()} />
        ) : null}
        {view === 'services' ? (
          <ActivationServicesScreen client={client} ids={ids} responses={items} onRespond={onItem} section={sectionResponse('ACTIVE_SERVICES')} onSection={(r) => void markSection('ACTIVE_SERVICES', r)} cta={cta()} />
        ) : null}
        {view === 'documents' ? <ActivationDocumentsScreen store={store} client={client} responses={items} onRespond={onItem} cta={cta()} /> : null}
        {view === 'changed' ? <ActivationChangedScreen client={client} selected={reported} onShortcut={(code) => (reported.has(code) ? undefined : void onShortcut(code))} cta={cta()} /> : null}
        {view === 'confirm' ? <ActivationConfirmScreen store={store} client={client} ids={ids} onOpen={(section) => go(sectionStep[section])} cta={cta('CONFIRM AND ACTIVATE')} /> : null}
    </MigrationShell>
  );
}

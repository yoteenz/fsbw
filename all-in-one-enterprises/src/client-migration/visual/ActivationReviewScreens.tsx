/**
 * Client activation review (AIO-MIG-ACTIVATION-*-001): WELCOME, PEOPLE, VEHICLES, SERVICES, DOCUMENTS, WHAT CHANGED,
 * CONFIRM. Client actor: no staff dock, no internal records (only customer-visible vault documents).
 * Per-item answers roll up into the section response the activation service records (see ClientOfficeReviewPage).
 */
import { useState, type ReactNode } from 'react';
import type { Client, DemoStore } from '../../demo/demoTypes';
import type { ReviewSectionResponse, WhatChangedShortcut } from '../types';
import { AioWhatNext, Ico, type IcoName } from './AioMigrationKit';
import { AioCard, AioCardHead, AioChip, AioChoiceBar, AioClient, AioDisc, AioFlow, AioRow, AioRows, type Tone } from './AioMigrationModules';
import { MigrationSelectSteps } from './MigrationExistingScreens';
import { SECTION_ICON, documentsOf, driversOf, formatDay, isActive, lifecycleLabel, membersOf, plural, trailersOf, unitsOf, type SectionKey } from './migrationData';
import { initialsOf } from './migrationViewer';

export type ItemResponses = Record<string, ReviewSectionResponse>;

export const CHOICES: Array<{ value: ReviewSectionResponse; label: ReactNode; icon: IcoName; tone: Tone }> = [
  { value: 'LOOKS_RIGHT', label: 'LOOKS RIGHT', icon: 'check', tone: 'green' },
  {
    value: 'NEEDS_UPDATE',
    label: (
      <>
        NEEDS
        <br />
        AN UPDATE
      </>
    ),
    icon: 'edit',
    tone: 'amber',
  },
  { value: 'NOT_SURE', label: 'I’M NOT SURE', icon: 'help-mark', tone: 'gray' },
];

const RESPONSE_PILL: Record<ReviewSectionResponse, { tone: Tone; icon: IcoName; label: string }> = {
  LOOKS_RIGHT: { tone: 'green', icon: 'success', label: 'LOOKS RIGHT' },
  NEEDS_UPDATE: { tone: 'amber', icon: 'time-log', label: 'NEEDS AN UPDATE' },
  NOT_SURE: { tone: 'gray', icon: 'help', label: 'I’M NOT SURE' },
};

function NotActive({ client, icon = 'error-log' }: { client: Client; icon?: IcoName }) {
  return isActive(client) ? (
    <AioChip tone="green" icon="success">
      ACTIVE
    </AioChip>
  ) : (
    <AioChip tone="red" icon={icon}>
      NOT ACTIVE YET
    </AioChip>
  );
}

/* ───────── HERE'S WHAT AIO ALREADY KNOWS ───────── */
const WELCOME_STEPS = [
  { label: 'REVIEW INFO', sub: 'See What We Have' },
  { label: 'CONFIRM', sub: 'Verify Details' },
  { label: 'VALIDATE', sub: 'Check Accuracy' },
  { label: 'COMPLETE', sub: 'Submit' },
  { label: 'ACTIVATE', sub: 'All Set' },
];

export function ActivationWelcomeScreen({ client, ids, onEdit, onKnown, onConfirm, cta }: { client: Client; ids: string[]; onEdit: () => void; onKnown: () => void; onConfirm: () => void; cta: ReactNode }) {
  return (
    <AioFlow top={413} gap={16} className="amg-welcome">
      <MigrationSelectSteps current={0} steps={WELCOME_STEPS} />
      <AioCard className="amg-welcome__info">
        <AioCardHead
          title="CLIENT INFORMATION"
          right={
            <button type="button" className="amg-link amg-link--edit" onClick={onEdit}>
              <Ico name="edit" />
              Edit
            </button>
          }
        />
        <AioClient name={client.companyName} ids={ids} right={<NotActive client={client} />} />
        <hr className="amg-rule" />
        <div className="amg-welcome__life">
          <AioDisc tone="tint" icon="people" className="amg-welcome__disc" />
          <div>
            <small>CLIENT LIFECYCLE</small>
            <b>{lifecycleLabel(client.clientLifecycle)}</b>
            <p>We’ve imported your existing records. Please review and confirm they are accurate before activating this client.</p>
          </div>
        </div>
      </AioCard>
      <button type="button" className="amg-card amg-welcome__go" onClick={onKnown}>
        <AioDisc tone="tint" icon="summary" className="amg-welcome__disc" />
        <span>
          <b>INFORMATION ALREADY IN AIO</b>
          <span>We have your company details, account records, and prior submissions from your existing client file. Review the information below to confirm it’s correct.</span>
        </span>
        <Ico name="chevron" className="amg-row__chev" />
      </button>
      <button type="button" className="amg-card amg-welcome__go" onClick={onConfirm}>
        <AioDisc tone="tint" icon="queued" className="amg-welcome__disc amg-welcome__disc--check" />
        <span>
          <b>REVIEW AND CONFIRM</b>
          <span>You’re not starting from a blank form. Simply review your current information, confirm what’s accurate, and we’ll handle the rest.</span>
        </span>
        <Ico name="chevron" className="amg-row__chev" />
      </button>
      {cta}
    </AioFlow>
  );
}

/* ───────── PEOPLE REVIEW ───────── */
const ROLE: Record<string, string> = { owner: 'Owner', admin: 'Administrator', operations: 'Operations', driver: 'Driver', accounting: 'Accounting', viewer: 'Viewer' };

export function peopleOf(store: DemoStore, client: Client) {
  const members = membersOf(store, client.id).map((m) => ({
    key: `m:${m.id}`,
    name: m.name,
    role: ROLE[m.role] ?? m.role,
    email: m.email,
    phone: m.name === client.contactName ? client.contactPhone : undefined,
  }));
  const names = new Set(members.map((m) => m.name.toLowerCase()));
  const drivers = driversOf(store, client.id)
    .filter((d) => !names.has(d.name.toLowerCase()))
    .map((d) => ({ key: `d:${d.id}`, name: d.name, role: 'Driver', email: d.email, phone: d.phone }));
  const people = [...members, ...drivers];
  if (!people.length && client.contactName) {
    people.push({ key: 'contact', name: client.contactName, role: 'Primary contact', email: client.contactEmail, phone: client.contactPhone });
  }
  return people;
}

export function ActivationPeopleScreen({
  store,
  client,
  ids,
  responses,
  onRespond,
  onAddPerson,
  cta,
}: {
  store: DemoStore;
  client: Client;
  ids: string[];
  responses: ItemResponses;
  onRespond: (key: string, response: ReviewSectionResponse) => void;
  onAddPerson: () => void;
  cta: ReactNode;
}) {
  const people = peopleOf(store, client);
  return (
    <AioFlow top={413} gap={15} className="amg-people">
      <AioCard className="amg-people__client">
        <AioClient label="CLIENT" name={client.companyName} ids={ids} right={<NotActive client={client} icon="time-log" />} />
      </AioCard>
      <AioCard className="amg-people__card">
        <AioCardHead title="OWNERS & CONTACTS" sub="We found the following people in your existing records." />
        <ul className="amg-plist">
          {people.map((person) => (
            <li key={person.key} className="amg-person">
              <span className="amg-person__av" aria-hidden="true">
                {initialsOf(person.name)}
              </span>
              <span className="amg-person__id">
                <b>{person.name}</b>
                <span>{person.role}</span>
                {person.phone ? (
                  <span className="amg-person__line">
                    <Ico name="phone" />
                    {person.phone}
                  </span>
                ) : null}
                {person.email ? (
                  <span className="amg-person__line">
                    <Ico name="letter" />
                    {person.email}
                  </span>
                ) : null}
              </span>
              <AioChoiceBar label={`${person.name} looks right?`} className="amg-person__choices" options={CHOICES} value={responses[`PEOPLE:${person.key}`]} onChange={(r) => onRespond(`PEOPLE:${person.key}`, r)} />
            </li>
          ))}
        </ul>
        <button type="button" className="amg-addrow" onClick={onAddPerson}>
          <AioDisc tone="gray" icon="add" className="amg-addrow__disc" />
          <span>
            <b>DON’T SEE SOMEONE?</b>
            <span>Add a new owner or contact manually.</span>
          </span>
          <Ico name="chevron" className="amg-row__chev" />
        </button>
      </AioCard>
      <AioWhatNext>After you confirm the people information, we’ll keep it on file and move to the next step to complete your client activation.</AioWhatNext>
      {cta}
    </AioFlow>
  );
}

/* ───────── item rows with a response pill (vehicles, services) ───────── */
function ReviewableRows({
  section,
  items,
  responses,
  onRespond,
  tile,
}: {
  section: SectionKey;
  items: Array<{ key: string; title: string; sub: ReactNode; idle?: { tone: Tone; icon: IcoName; label: string } }>;
  responses: ItemResponses;
  onRespond: (key: string, response: ReviewSectionResponse) => void;
  tile: 'tile' | 'disc';
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <AioRows className={`amg-irows amg-irows--${section.toLowerCase()}`}>
      {items.map((item) => {
        const key = `${section}:${item.key}`;
        const r = responses[key];
        const pill = r ? RESPONSE_PILL[r] : item.idle ?? { tone: 'gray' as Tone, icon: 'help' as IcoName, label: 'NOT REVIEWED' };
        return (
          <AioRow
            key={key}
            lead={
              <span className={`amg-row__icon is-${tile}`} aria-hidden="true">
                <Ico name={SECTION_ICON[section]} />
              </span>
            }
            title={item.title}
            sub={item.sub}
            right={
              <AioChip tone={pill.tone} icon={pill.icon} className="amg-irows__pill">
                {pill.label}
              </AioChip>
            }
            selected={open === key}
            onClick={() => setOpen(open === key ? null : key)}
          >
            {open === key ? (
              <span className="amg-irows__choices">
                <AioChoiceBar
                  label={`${item.title} looks right?`}
                  options={CHOICES}
                  value={r}
                  onChange={(next) => {
                    onRespond(key, next);
                    setOpen(null);
                  }}
                />
              </span>
            ) : null}
          </AioRow>
        );
      })}
    </AioRows>
  );
}

/* ───────── VEHICLES REVIEW ───────── */
const VEHICLE_STEPS = [
  { label: 'REVIEW VEHICLES', sub: 'Check Details' },
  { label: 'VERIFY INFO', sub: 'Confirm Updates' },
  { label: 'RESOLVE ITEMS', sub: 'Address Changes' },
  { label: 'FINAL REVIEW', sub: 'Check Accuracy' },
  { label: 'ACTIVATE', sub: 'Complete' },
];

/** A section with nothing on file still needs an answer ("is that right?") so activation can complete. */
function EmptySection({ text, value, onChange }: { text: string; value?: ReviewSectionResponse; onChange: (response: ReviewSectionResponse) => void }) {
  return (
    <div className="amg-empty amg-empty--ask">
      <p>{text}</p>
      <AioChoiceBar label="Is that right?" className="amg-empty__choices" options={CHOICES} value={value} onChange={onChange} />
    </div>
  );
}

export function ActivationVehiclesScreen({
  store,
  client,
  responses,
  onRespond,
  section,
  onSection,
  cta,
}: {
  store: DemoStore;
  client: Client;
  responses: ItemResponses;
  onRespond: (key: string, response: ReviewSectionResponse) => void;
  section?: ReviewSectionResponse;
  onSection: (response: ReviewSectionResponse) => void;
  cta: ReactNode;
}) {
  const units = unitsOf(store, client.id).map((u) => ({
    key: u.id,
    title: u.nickname,
    sub: [[u.year, u.make, u.model].filter(Boolean).join(' '), u.vin ? `VIN ${u.vin}` : ''].filter(Boolean).map((line) => <span key={line}>{line}</span>),
    idle: u.status === 'inactive' || u.status === 'sold' ? { tone: 'red' as Tone, icon: 'error-log' as IcoName, label: u.status === 'sold' ? 'SOLD' : 'NOT ACTIVE' } : undefined,
  }));
  const trailers = trailersOf(store, client.id).map((t) => ({
    key: t.id,
    title: `Trailer ${t.number}`,
    sub: [[t.year, t.make, t.type].filter(Boolean).join(' ')].filter(Boolean).map((line) => <span key={line}>{line}</span>),
  }));
  const vehicles = [...units, ...trailers];
  return (
    <AioFlow top={413} gap={16} className="amg-vehicles">
      <MigrationSelectSteps current={0} steps={VEHICLE_STEPS} />
      <AioCard className="amg-vehicles__card">
        <AioCardHead title="VEHICLES ON FILE" sub="These vehicles are currently associated with this client." right={<span>{plural(vehicles.length, 'Vehicle')}</span>} />
        {vehicles.length ? (
          <ReviewableRows section="VEHICLES" items={vehicles} responses={responses} onRespond={onRespond} tile="tile" />
        ) : (
          <EmptySection text="No vehicles are on file for this client. Is that right?" value={section} onChange={onSection} />
        )}
        <AioWhatNext>Once you confirm your vehicles, we’ll update any changes, resolve open items, and activate them as part of your client record.</AioWhatNext>
      </AioCard>
      {cta}
    </AioFlow>
  );
}

/* ───────── ACTIVE SERVICES ───────── */
export function ActivationServicesScreen({
  client,
  ids,
  responses,
  onRespond,
  section,
  onSection,
  cta,
}: {
  client: Client;
  ids: string[];
  responses: ItemResponses;
  onRespond: (key: string, response: ReviewSectionResponse) => void;
  section?: ReviewSectionResponse;
  onSection: (response: ReviewSectionResponse) => void;
  cta: ReactNode;
}) {
  const services = client.services.map((service) => ({ key: service, title: service, sub: 'Active on your AIO record' }));
  return (
    <AioFlow top={432} gap={18} className="amg-services">
      <AioCard className="amg-services__client">
        <AioClient name={client.companyName} ids={ids} right={<NotActive client={client} />} />
      </AioCard>
      <AioCard className="amg-services__card">
        <AioCardHead title="CLIENT SERVICES" sub="Check the status of each service and confirm if any updates are needed." />
        {services.length ? (
          <ReviewableRows section="SERVICES" items={services} responses={responses} onRespond={onRespond} tile="disc" />
        ) : (
          <EmptySection text="No services are on your AIO record yet. Is that right?" value={section} onChange={onSection} />
        )}
      </AioCard>
      <AioWhatNext>After you confirm the services, we’ll help you activate your client and keep everything organized in one place.</AioWhatNext>
      {cta}
    </AioFlow>
  );
}

/* ───────── DOCUMENTS WE HAVE ───────── */
function docStatus(doc: ReturnType<typeof documentsOf>[number]): { tone: Tone; icon: IcoName; label: string } {
  if (doc.status === 'rejected') return { tone: 'red', icon: 'failure', label: 'REJECTED' };
  if (doc.status === 'expired') return { tone: 'red', icon: 'failure', label: 'EXPIRED' };
  if (doc.status === 'archived' || doc.supersededByDocumentId || !doc.isCurrent) return { tone: 'gray', icon: 'time-log', label: 'HISTORICAL' };
  if (doc.verificationStatus === 'verified' || doc.status === 'verified') return { tone: 'green', icon: 'success', label: 'CURRENT' };
  return { tone: 'amber', icon: 'warning', label: 'UNVERIFIED' };
}

const DOC_CHOICES: Array<{ value: ReviewSectionResponse; label: ReactNode; icon: IcoName; tone: Tone }> = [
  { value: 'LOOKS_RIGHT', label: 'LOOKS RIGHT', icon: 'thumbs-up', tone: 'amber' },
  { value: 'NEEDS_UPDATE', label: 'NEEDS AN UPDATE', icon: 'edit', tone: 'gray' },
  { value: 'NOT_SURE', label: 'I’M NOT SURE', icon: 'help-mark', tone: 'gray' },
];

export function ActivationDocumentsScreen({ store, client, responses, onRespond, cta }: { store: DemoStore; client: Client; responses: ItemResponses; onRespond: (key: string, response: ReviewSectionResponse) => void; cta: ReactNode }) {
  // Client actor: customer-visible vault records only (internal staff scans never reach the client).
  const docs = documentsOf(store, client.id)
    .filter((d) => d.visibility === 'customer')
    .sort((a, b) => (b.uploadedAt ?? b.createdAt).localeCompare(a.uploadedAt ?? a.createdAt));
  return (
    <AioFlow top={402} gap={14} className="amg-docs">
      <AioCard className="amg-docs__card">
        <AioCardHead title="CLIENT DOCUMENTS" sub="Review the documents we’ve already stored for this client." />
        {docs.length === 0 ? <p className="amg-empty">No documents are stored for this client yet.</p> : null}
        <ul className="amg-dlist2">
          {docs.map((doc) => {
            const s = docStatus(doc);
            const key = `DOCUMENTS:${doc.id}`;
            return (
              <li key={doc.id} className="amg-doc">
                <span className="amg-doc__tile" aria-hidden="true">
                  <Ico name={doc.category === 'insurance' ? 'shield-check' : doc.documentType.toLowerCase().includes('registration') ? 'id-card' : 'summary'} />
                </span>
                <span className="amg-doc__text">
                  <b>{doc.title}</b>
                  {doc.documentType && doc.documentType !== doc.title ? <span>{doc.documentType}</span> : null}
                  <span>Added {formatDay(doc.uploadedAt ?? doc.createdAt)}</span>
                </span>
                <AioChip tone={s.tone} icon={s.icon} className="amg-doc__state">
                  {s.label}
                </AioChip>
                <AioChoiceBar label={`${doc.title} looks right?`} className="amg-doc__choices" options={DOC_CHOICES} value={responses[key]} onChange={(r) => onRespond(key, r)} />
                <Ico name="chevron" className="amg-doc__chev" />
              </li>
            );
          })}
        </ul>
      </AioCard>
      <AioWhatNext>Once you confirm these documents, we’ll organize everything and activate the client in the new system.</AioWhatNext>
      {cta}
    </AioFlow>
  );
}

/* ───────── WHAT CHANGED? ───────── */
const SHORTCUTS: Array<{ code: WhatChangedShortcut; label: string; icon: IcoName }> = [
  { code: 'BOUGHT_A_TRUCK', label: 'BOUGHT A TRUCK', icon: 'truck' },
  { code: 'SOLD_A_TRUCK', label: 'SOLD A TRUCK', icon: 'truck' },
  { code: 'ADDED_A_DRIVER', label: 'ADDED A DRIVER', icon: 'person-plus' },
  { code: 'REMOVED_A_DRIVER', label: 'REMOVED A DRIVER', icon: 'person-minus' },
  { code: 'ADDRESS_CHANGED', label: 'ADDRESS CHANGED', icon: 'home' },
  { code: 'INSURANCE_CHANGED', label: 'INSURANCE CHANGED', icon: 'security' },
  { code: 'OWNERSHIP_CHANGED', label: 'OWNERSHIP CHANGED', icon: 'people' },
  { code: 'CONTACT_INFO_CHANGED', label: 'CONTACT CHANGED', icon: 'phone' },
  { code: 'NOTHING_CHANGED', label: 'NOTHING CHANGED', icon: 'queued' },
  { code: 'SOMETHING_ELSE', label: 'SOMETHING ELSE', icon: 'more' },
];

export function ActivationChangedScreen({ client, selected, onShortcut, cta }: { client: Client; selected: Set<WhatChangedShortcut>; onShortcut: (code: WhatChangedShortcut) => void; cta: ReactNode }) {
  return (
    <AioFlow top={424} gap={28} className="amg-changed">
      <AioCard className="amg-changed__card">
        <AioCardHead title="SELECT WHAT CHANGED" sub="Choose all that apply to this client." right={isActive(client) ? <AioChip tone="green" icon="success">ACTIVE</AioChip> : <span className="amg-dotpill">NOT ACTIVE YET</span>} />
        <div className="amg-shortcuts">
          {SHORTCUTS.map((s) => (
            <button key={s.code} type="button" className={`amg-shortcut${selected.has(s.code) ? ' is-on' : ''}`} aria-pressed={selected.has(s.code)} onClick={() => onShortcut(s.code)}>
              <AioDisc tone="soft" icon={selected.has(s.code) ? 'check' : s.icon} className={`amg-shortcut__disc amg-shortcut__disc--${s.code.toLowerCase()}`} />
              <b>{s.label}</b>
              <Ico name="chevron" className="amg-row__chev" />
            </button>
          ))}
        </div>
      </AioCard>
      <AioWhatNext>We’ll update your client records based on your changes and confirm everything before saving.</AioWhatNext>
      {cta}
    </AioFlow>
  );
}

/* ───────── CONFIRM YOUR INFORMATION ───────── */
export function ActivationConfirmScreen({
  store,
  client,
  ids,
  onOpen,
  cta,
}: {
  store: DemoStore;
  client: Client;
  ids: string[];
  onOpen: (section: SectionKey) => void;
  cta: ReactNode;
}) {
  const counts: Record<SectionKey, number> = {
    COMPANY: 1,
    PEOPLE: peopleOf(store, client).length,
    VEHICLES: unitsOf(store, client.id).length + trailersOf(store, client.id).length,
    SERVICES: client.services.length,
    DOCUMENTS: documentsOf(store, client.id).filter((d) => d.visibility === 'customer').length,
  };
  const rows: Array<{ key: SectionKey; title: string; sub: string }> = [
    { key: 'COMPANY', title: 'COMPANY', sub: 'Legal name, addresses, and business details' },
    { key: 'PEOPLE', title: 'PEOPLE', sub: 'Owners, officers, and contacts' },
    { key: 'VEHICLES', title: 'VEHICLES', sub: 'Trucks and trailers' },
    { key: 'SERVICES', title: 'SERVICES', sub: 'Active services and filings' },
    { key: 'DOCUMENTS', title: 'DOCUMENTS', sub: 'Permits, insurance, and other files' },
  ];
  return (
    <AioFlow top={413} gap={20} className="amg-confirm">
      <AioCard className="amg-confirm__card">
        <AioClient name={client.companyName} ids={ids} right={isActive(client) ? <AioChip tone="green" icon="success">ACTIVE</AioChip> : <span className="amg-dotpill amg-dotpill--red">NOT ACTIVE YET</span>} />
        <AioRows className="amg-confirm__rows">
          {rows.map((row) => (
            <AioRow
              key={row.key}
              lead={
                <span className="amg-row__icon is-disc" aria-hidden="true">
                  <Ico name={SECTION_ICON[row.key]} />
                </span>
              }
              title={row.title}
              sub={row.sub}
              right={<span>{plural(counts[row.key], 'record')}</span>}
              onClick={() => onOpen(row.key)}
            />
          ))}
        </AioRows>
        <AioWhatNext>Once you confirm, we’ll activate your account, preserve your existing records, and make everything available in the new system right away.</AioWhatNext>
      </AioCard>
      {cta}
    </AioFlow>
  );
}

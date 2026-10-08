/**
 * New client branch (AIO-MIG-NEW-*-001): NEW CLIENT FILE, FILES RECEIVED, EXTRACTION AND CLASSIFICATION,
 * BUSINESS IDENTITY REVIEW, PEOPLE VEHICLES SERVICES DOCUMENTS, FOUNDER REVIEW, APPROVAL SUMMARY, PREBUILT,
 * SEND INVITE, CLIENT CONFIRMATION REQUIRED. Staff actor, root family environment.
 */
import type { ReactNode, RefObject } from 'react';
import type { Client, DemoStore } from '../../demo/demoTypes';
import type { ArchiveMigrationBatch, ArchiveMigrationBatchFile } from '../../vault/archiveMigrationTypes';
import type { ExtractedFactRecord, MigrationReviewAction } from '../types';
import { Ico, type IcoName } from './AioMigrationKit';
import { AioCallout, AioCard, AioCardHead, AioDisc, AioDiscHead, AioDrop, AioField, AioFlow, AioNote, AioRow, AioRows, AioStrip, type Tone } from './AioMigrationModules';
import { UploadedFiles, type LocalPick, type ReviewTarget, INVITE_TTL_DAYS } from './MigrationIntakeScreens';
import {
  SECTION_ICON,
  acceptedTypeLabels,
  documentsOf,
  fileTone,
  formatDay,
  isActive,
  lifecycleEvent,
  plural,
  staffName,
  unitsOf,
  type SectionKey,
} from './migrationData';
import { formatBytes } from './migrationViewer';

export type NewIdentity = { companyName: string; usdot: string; mc: string; ein: string; contactName: string };

/* ───────── NEW CLIENT FILE ───────── */
export function NewClientFileScreen({
  draft,
  onDraft,
  local,
  inputRef,
  onFiles,
  onRemoveLocal,
  cta,
}: {
  draft: NewIdentity;
  onDraft: (next: NewIdentity) => void;
  local: LocalPick[];
  inputRef: RefObject<HTMLInputElement | null>;
  onFiles: (files: File[]) => void;
  onRemoveLocal: (name: string) => void;
  cta: ReactNode;
}) {
  return (
    <AioFlow top={470} gap={18} className="amg-newfile">
      <AioCard className="amg-newfile__id">
        <AioDiscHead icon="company" title="BUSINESS IDENTITY" sub="Tell us about the business you’re adding." />
        <div className="amg-fields">
          <AioField label="COMPANY NAME" value={draft.companyName} onChange={(v) => onDraft({ ...draft, companyName: v })} placeholder="Enter company name" />
          <AioField label="USDOT NUMBER" value={draft.usdot} onChange={(v) => onDraft({ ...draft, usdot: v })} placeholder="Enter USDOT number" inputMode="numeric" />
          <AioField label="MC NUMBER" value={draft.mc} onChange={(v) => onDraft({ ...draft, mc: v })} placeholder="Enter MC number" />
          <AioField label="PRIMARY CONTACT" value={draft.contactName} onChange={(v) => onDraft({ ...draft, contactName: v })} placeholder="Enter contact name" />
        </div>
      </AioCard>
      <AioCard className="amg-newfile__intake">
        <AioDiscHead icon="summary" title="CLIENT FILE INTAKE" sub="Upload the client file to get started." />
        <AioDrop
          icon="deploy"
          title={
            <>
              <b>Choose a file</b> or drag and drop
            </>
          }
          hint={acceptedTypeLabels().join(', ')}
          button="CHOOSE FILE"
          onFiles={onFiles}
          inputRef={inputRef}
        />
        {local.length ? <UploadedFiles stored={[]} local={local} onRemoveLocal={onRemoveLocal} /> : null}
      </AioCard>
      <AioNote title="PREBUILT · NOT ACTIVE">Approval later prepares the office. The client is not active until confirmation.</AioNote>
      {cta}
    </AioFlow>
  );
}

/* ───────── FILES RECEIVED (new client) ───────── */
function TypeGlyph({ type }: { type: string }) {
  const t = fileTone(`x.${type.toLowerCase()}`);
  return (
    <span className={`amg-tglyph amg-tglyph--${t.tone}`} aria-hidden="true">
      <Ico name={t.icon} />
    </span>
  );
}

function CountBadge({ tone, n, label }: { tone: 'green' | 'red'; n: number; label: string }) {
  return (
    <span className={`amg-count amg-count--${tone}`}>
      <b>{n}</b>
      <span>{label}</span>
    </span>
  );
}

export function NewReceivedScreen({ stored, local, cta }: { stored: ArchiveMigrationBatchFile[]; local: LocalPick[]; cta: ReactNode }) {
  const accepted = [
    ...stored.map((f) => ({ key: f.id, name: f.fileName, size: f.fileSizeBytes })),
    ...local.filter((f) => f.status === 'accepted').map((f) => ({ key: `l-${f.name}`, name: f.name, size: f.size })),
  ];
  const rejected = local.filter((f) => f.status === 'unsupported');
  return (
    <AioFlow top={442} gap={16} className="amg-nrec">
      <AioCard className="amg-nrec__sum">
        <AioDiscHead icon="summary" title="FILE SUMMARY" sub="Total files received for this client." />
        <div className="amg-nrec__tiles">
          <div className="amg-nrec__total">
            <Ico name="summary" />
            <b>{accepted.length + rejected.length}</b>
            <span>TOTAL FILES</span>
          </div>
          <div className="amg-nrec__types">
            <small>FILE TYPES</small>
            <ul>
              {acceptedTypeLabels().map((type) => (
                <li key={type}>
                  <TypeGlyph type={type} />
                  <span>{type}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AioCard>
      <AioCard className="amg-nrec__ok">
        <AioDiscHead icon="success-log" tone="dark" title="ACCEPTED FILES" sub="These files are ready for processing." right={<CountBadge tone="green" n={accepted.length} label="ACCEPTED" />} className="amg-dhead--ok" />
        <div className="amg-ftable">
          <div className="amg-ftable__r amg-ftable__r--head">
            <span>FILE NAME</span>
            <span>TYPE</span>
            <span>SIZE</span>
          </div>
          {accepted.length === 0 ? (
            <div className="amg-ftable__r">
              <span>No accepted files yet.</span>
            </div>
          ) : null}
          {accepted.map((f) => {
            const t = fileTone(f.name);
            return (
              <div className="amg-ftable__r" key={f.key}>
                <span className="amg-ftable__name">
                  <Ico name={t.icon} className={`amg-ftype--${t.tone}`} />
                  <span title={f.name}>{f.name}</span>
                </span>
                <span>{t.ext}</span>
                <span>{formatBytes(f.size)}</span>
              </div>
            );
          })}
        </div>
      </AioCard>
      {rejected.length ? (
        <AioCard className="amg-nrec__bad">
          <AioDiscHead icon="warning" tone="dark" title="UNSUPPORTED FILES" sub="These files were not accepted and will not be processed." right={<CountBadge tone="red" n={rejected.length} label="UNSUPPORTED" />} className="amg-dhead--warn" />
          <div className="amg-ftable" style={{ ['--ft-cols' as string]: 'minmax(0, 1.9fr) minmax(0, 0.95fr) minmax(0, 1.25fr)' }}>
            <div className="amg-ftable__r amg-ftable__r--head">
              <span>FILE NAME</span>
              <span>TYPE</span>
              <span>REASON</span>
            </div>
            {rejected.map((f) => {
              const t = fileTone(f.name);
              return (
                <div className="amg-ftable__r" key={f.name}>
                  <span className="amg-ftable__name">
                    <Ico name="text" className="amg-ftype--other" />
                    <span title={f.name}>{f.name}</span>
                  </span>
                  <span>{t.ext}</span>
                  <span title={f.reason}>{f.reason ?? 'Unsupported file type'}</span>
                </div>
              );
            })}
          </div>
        </AioCard>
      ) : null}
      <AioNote title="FILES RECEIVED · NOT ACTIVE" className="amg-note--compact">
        Receiving files does not make the client active. Extraction and review are required.
      </AioNote>
      {cta}
    </AioFlow>
  );
}

/* ───────── EXTRACTION AND CLASSIFICATION (vertical stages) ───────── */
const NEW_STAGES: Array<{ label: string; icon: IcoName; done: string; todo: string }> = [
  { label: 'UPLOAD', icon: 'summary', done: 'Your client file has been uploaded.', todo: 'Waiting for the client file.' },
  { label: 'EXTRACT', icon: 'settings', done: 'Key information was extracted from your file.', todo: 'We’re extracting key information from your file.' },
  { label: 'CLASSIFY', icon: 'database', done: 'The information was classified into categories.', todo: 'We’ll classify the information into the right categories.' },
  { label: 'VALIDATE', icon: 'tests', done: 'The extracted details were checked.', todo: 'We’ll verify the extracted details for accuracy.' },
  { label: 'PREPARE FOR REVIEW', icon: 'people', done: 'Your file is ready for final review.', todo: 'We’ll prepare your file for final review by our team.' },
];

export function newExtractStages(files: ArchiveMigrationBatchFile[], batch: ArchiveMigrationBatch | undefined, facts: ExtractedFactRecord[]): boolean[] {
  const uploaded = files.length > 0;
  const extracted = uploaded && files.every((f) => f.processingState === 'ready' || f.processingState === 'grouped');
  const classified = extracted && (batch?.state === 'ready_for_review' || batch?.state === 'reviewing' || batch?.state === 'completed');
  const validated = classified && !facts.some((f) => f.confidence === 'CONFLICT' && !f.reviewAction);
  return [uploaded, extracted, classified, validated, validated];
}

export function NewExtractScreen({ done, cta }: { done: boolean[]; cta: ReactNode | null }) {
  const current = done.findIndex((d) => !d);
  return (
    <AioFlow top={468} gap={0} className="amg-nx">
      <div className="amg-sheet">
        <ol className="amg-vstages">
          {NEW_STAGES.map((stage, i) => {
            const state = done[i] ? 'done' : i === current ? 'current' : 'todo';
            return (
              <li key={stage.label} className={`amg-vstage is-${state}`}>
                <span className="amg-vstage__disc" aria-hidden="true">
                  <Ico name={stage.icon} />
                </span>
                <span className="amg-vstage__text">
                  <b>{stage.label}</b>
                  <span>{state === 'done' ? stage.done : stage.todo}</span>
                </span>
                <span className="amg-vstage__state" aria-label={state === 'done' ? 'Complete' : state === 'current' ? 'In progress' : 'Pending'}>
                  {state === 'done' ? <Ico name="check" /> : state === 'current' ? <span className="amg-vstage__spin" /> : <Ico name="time-log" />}
                </span>
              </li>
            );
          })}
        </ol>
        <AioStrip tone="amber" title="Your progress is saved." className="amg-nx__saved">
          If you leave this page, you can come back anytime and we’ll pick up where you left off.
        </AioStrip>
        {cta}
      </div>
    </AioFlow>
  );
}

/* ───────── BUSINESS IDENTITY REVIEW ───────── */
export function NewIdentityScreen({ identity, onIdentity, cta }: { identity: NewIdentity; onIdentity: (next: NewIdentity) => void; cta: ReactNode }) {
  return (
    <AioFlow top={482} gap={20} className="amg-nid">
      <AioCard className="amg-nid__card">
        <AioDiscHead icon="company" title="BUSINESS DETAILS" sub="Confirm the information below to continue." />
        <div className="amg-fields">
          <AioField label="COMPANY NAME" value={identity.companyName} onChange={(v) => onIdentity({ ...identity, companyName: v })} placeholder="Enter company name" />
          <AioField label="USDOT NUMBER" value={identity.usdot} onChange={(v) => onIdentity({ ...identity, usdot: v })} placeholder="Enter USDOT number" inputMode="numeric" />
          <AioField label="MC NUMBER" value={identity.mc} onChange={(v) => onIdentity({ ...identity, mc: v })} placeholder="Enter MC number" />
          <AioField label="EIN" value={identity.ein} onChange={(v) => onIdentity({ ...identity, ein: v })} placeholder="Enter EIN number" />
          <AioField wide label="PRIMARY CONTACT" value={identity.contactName} onChange={(v) => onIdentity({ ...identity, contactName: v })} placeholder="Enter contact name" />
        </div>
      </AioCard>
      <AioNote icon="summary" title="CLIENT FILE SETUP">This is a new client file. Once you confirm the details, we’ll prepare it for onboarding.</AioNote>
      <AioNote title="PREBUILT PATH, NOT ACTIVE">Approval later prepares the office. The client is not active until confirmation.</AioNote>
      {cta}
    </AioFlow>
  );
}

/* ───────── PEOPLE · VEHICLES · SERVICES · DOCUMENTS ───────── */
type Applied = Partial<Record<ReviewTarget, MigrationReviewAction | 'IGNORE'>>;

function RecordTile({
  section,
  title,
  sub,
  label,
  value,
  lines,
  applied,
  onAction,
}: {
  section: SectionKey;
  title: string;
  sub: string;
  label: string;
  value?: ReactNode;
  lines: string[];
  applied: Applied;
  onAction: (target: ReviewTarget, action: MigrationReviewAction | 'IGNORE') => void;
}) {
  const state = applied[section];
  return (
    <AioCard className="amg-rtile">
      <AioDiscHead icon={SECTION_ICON[section]} title={title} sub={sub} right={<Ico name="chevron" className="amg-rtile__chev" />} />
      <div className="amg-rtile__body">
        <small>{label}</small>
        {value != null ? <b>{value}</b> : null}
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      <div className="amg-rtile__acts">
        <button type="button" className={`amg-rbtn amg-rbtn--ok${state === 'CONFIRM' ? ' is-on' : ''}`} aria-pressed={state === 'CONFIRM'} onClick={() => onAction(section, 'CONFIRM')}>
          <AioDisc tone="green" icon="check" />
          CONFIRM
        </button>
        <button
          type="button"
          className={`amg-rbtn amg-rbtn--warn${state === 'NEEDS_CLIENT_CONFIRMATION' ? ' is-on' : ''}`}
          aria-pressed={state === 'NEEDS_CLIENT_CONFIRMATION'}
          onClick={() => onAction(section, 'NEEDS_CLIENT_CONFIRMATION')}
        >
          <AioDisc tone="gold" icon="alert-mark" />
          NEEDS REVIEW
        </button>
      </div>
    </AioCard>
  );
}

export function NewRecordsScreen({
  store,
  client,
  storedFiles,
  applied,
  onAction,
  cta,
}: {
  store: DemoStore;
  client: Client;
  storedFiles: ArchiveMigrationBatchFile[];
  applied: Applied;
  onAction: (target: ReviewTarget, action: MigrationReviewAction | 'IGNORE') => void;
  cta: ReactNode;
}) {
  const units = unitsOf(store, client.id);
  const types = [...new Set(storedFiles.map((f) => fileTone(f.fileName).ext))];
  return (
    <AioFlow top={504} gap={16} className="amg-nrecs">
      <div className="amg-grid amg-nrecs__grid">
        <RecordTile
          section="PEOPLE"
          title="PEOPLE"
          sub="Primary contact for this client."
          label="PRIMARY CONTACT"
          value={client.contactName}
          lines={[client.contactEmail?.endsWith('@example.com') && client.contactEmail.startsWith('pending') ? 'No email on file yet' : client.contactEmail, client.contactPhone ?? ''].filter(Boolean)}
          applied={applied}
          onAction={onAction}
        />
        <RecordTile
          section="VEHICLES"
          title="VEHICLES"
          sub="Power units for this client."
          label="POWER UNITS"
          value={units.length}
          lines={[units.length ? `${plural(units.length, 'active power unit')} to be added to this file.` : 'No power units on this file yet.']}
          applied={applied}
          onAction={onAction}
        />
        <RecordTile
          section="SERVICES"
          title="SERVICES"
          sub="Services the new file requested."
          label="REQUESTED SERVICES"
          lines={client.services.length ? client.services : ['No services requested yet.']}
          applied={applied}
          onAction={onAction}
        />
        <RecordTile
          section="DOCUMENTS"
          title="DOCUMENTS"
          sub="Uploaded files for this client."
          label="UPLOADED FILES"
          value={storedFiles.length}
          lines={[storedFiles.length ? `${plural(storedFiles.length, 'file')} uploaded` : 'No files uploaded yet', types.length ? `(${types.join(', ')})` : ''].filter(Boolean)}
          applied={applied}
          onAction={onAction}
        />
      </div>
      <AioNote title="PREBUILT · NOT ACTIVE">Approval later prepares the office. The client is not active until confirmation.</AioNote>
      {cta}
    </AioFlow>
  );
}

/* ───────── FOUNDER REVIEW (new client) ───────── */
const NEW_REVIEW_ROWS: Array<{ key: SectionKey; title: string; sub: string }> = [
  { key: 'COMPANY', title: 'COMPANY', sub: 'Business identity and registration details.' },
  { key: 'PEOPLE', title: 'PEOPLE', sub: 'Owners, contacts, and key personnel.' },
  { key: 'VEHICLES', title: 'VEHICLES', sub: 'Trucks, trailers, and equipment.' },
  { key: 'SERVICES', title: 'SERVICES', sub: 'Operations and services the business provides.' },
  { key: 'DOCUMENTS', title: 'DOCUMENTS', sub: 'Uploaded files and supporting records.' },
];

export function NewReviewScreen({ applied, onAction, cta }: { applied: Applied; onAction: (target: ReviewTarget, action: MigrationReviewAction | 'IGNORE') => void; cta: ReactNode }) {
  return (
    <AioFlow top={467} gap={16} className="amg-nrv">
      <div className="amg-sheet amg-sheet--rows">
        {NEW_REVIEW_ROWS.map((row) => (
          <div key={row.key} className="amg-nrv__row">
            <AioDisc tone="dark" icon={SECTION_ICON[row.key]} className="amg-nrv__disc" />
            <span className="amg-nrv__text">
              <b>{row.title}</b>
              <span>{row.sub}</span>
            </span>
            <span className="amg-nrv__acts">
              {(['CONFIRM', 'EDIT', 'NEEDS_CLIENT_CONFIRMATION'] as const).map((action) => (
                <button
                  key={action}
                  type="button"
                  className={`amg-nrv__btn amg-nrv__btn--${action === 'CONFIRM' ? 'gold' : action === 'EDIT' ? 'white' : 'cream'}${applied[row.key] === action ? ' is-on' : ''}`}
                  aria-pressed={applied[row.key] === action}
                  onClick={() => onAction(row.key, action)}
                >
                  {action === 'NEEDS_CLIENT_CONFIRMATION' ? (
                    <>
                      NEEDS CLIENT
                      <br />
                      CONFIRMATION
                    </>
                  ) : (
                    action
                  )}
                </button>
              ))}
            </span>
          </div>
        ))}
      </div>
      <AioNote title="NOTHING IS WRITTEN TO THE PROFILE UNTIL APPROVAL">Approval creates a prebuilt client profile. The client will not be active until confirmation.</AioNote>
      {cta}
    </AioFlow>
  );
}

/* ───────── APPROVAL SUMMARY (new client) ───────── */
function ReadyPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`amg-ready amg-ready--${tone}`}>
      <AioDisc tone={tone === 'green' ? 'green' : tone === 'red' ? 'red' : 'gold'} icon={tone === 'green' ? 'check' : tone === 'red' ? 'x' : 'alert-mark'} />
      <b>{children}</b>
    </span>
  );
}

export function NewApprovalScreen({
  client,
  hasIds,
  storedFiles,
  facts,
  cta,
}: {
  client: Client;
  hasIds: boolean;
  storedFiles: number;
  facts: ExtractedFactRecord[];
  cta: ReactNode;
}) {
  const unreviewed = facts.filter((f) => !f.reviewAction).length;
  const conflicts = facts.filter((f) => f.confidence === 'CONFLICT' && !f.reviewAction).length;
  const rows: Array<{ icon: IcoName; title: string; sub: string; pill: ReactNode }> = [
    {
      icon: 'company',
      title: 'BUSINESS PROFILE',
      sub: 'Company details, USDOT, MC number, and contact information.',
      pill: client.companyName && hasIds ? <ReadyPill tone="green">READY TO APPROVE</ReadyPill> : <ReadyPill tone="amber">{client.companyName ? 'ADD USDOT OR MC' : 'NAME MISSING'}</ReadyPill>,
    },
    {
      icon: 'summary',
      title: 'VAULT DOCUMENTS',
      sub: 'Required documents uploaded and verified.',
      pill: storedFiles ? <ReadyPill tone="green">READY TO APPROVE</ReadyPill> : <ReadyPill tone="amber">NO FILES STORED</ReadyPill>,
    },
    {
      icon: 'people',
      title: 'CLIENT REVIEW',
      sub: 'All information reviewed and confirmed.',
      pill: conflicts ? (
        <ReadyPill tone="red">{plural(conflicts, 'CONFLICT')}</ReadyPill>
      ) : facts.length && !unreviewed ? (
        <ReadyPill tone="green">READY TO APPROVE</ReadyPill>
      ) : (
        <ReadyPill tone="amber">{facts.length ? `${unreviewed} TO REVIEW` : 'NOTHING EXTRACTED'}</ReadyPill>
      ),
    },
  ];
  return (
    <AioFlow top={468} gap={0} className="amg-nap">
      <div className="amg-sheet amg-sheet--rows">
        {rows.map((row) => (
          <div key={row.title} className="amg-nap__row">
            <AioDisc tone="dark" icon={row.icon} className="amg-nap__disc" />
            <span className="amg-nap__text">
              <b>{row.title}</b>
              <span>{row.sub}</span>
            </span>
            {row.pill}
          </div>
        ))}
        <div className="amg-nap__note">
          <AioNote title="APPROVAL CREATES PREBUILT" className="amg-note--flat">
            Approval creates the PREBUILT and does not activate the client. The client will remain inactive until confirmation.
          </AioNote>
          {cta}
        </div>
      </div>
    </AioFlow>
  );
}

/* ───────── PREBUILT · NOT ACTIVE YET (new client) ───────── */
export function NewPrebuiltScreen({ store, client, cta }: { store: DemoStore; client: Client; cta: ReactNode }) {
  const event = lifecycleEvent(store, client.id, 'PREBUILT');
  const docs = documentsOf(store, client.id);
  const last = docs.map((d) => d.uploadedAt ?? d.createdAt).sort().pop();
  const answered = new Set((store.clientReviewSections ?? []).filter((r) => r.organizationId === client.id).map((r) => r.sectionCode));
  const toReview = ['Company', 'People', 'Vehicles', 'Active Services', 'Documents'].filter((_, i) => !answered.has((['COMPANY', 'PEOPLE', 'VEHICLES', 'ACTIVE_SERVICES', 'DOCUMENTS'] as const)[i]));
  return (
    <AioFlow top={469} gap={18} className="amg-npb">
      <AioCard className="amg-npb__card">
        <AioDiscHead icon="id-card" title="CLIENT INFORMATION" sub="Key details for this prebuilt client." />
        <div className="amg-kv" style={{ ['--kv-n' as string]: 1 }}>
          <div>
            <small>CLIENT ID</small>
            <b className="is-big">{client.customerNumber || client.id.toUpperCase()}</b>
          </div>
        </div>
      </AioCard>
      <AioCard className="amg-npb__card">
        <AioDiscHead icon="company" title={client.activationConditions?.officeProvisioningSucceeded ? 'OFFICE PREPARED' : 'OFFICE BEING PREPARED'} sub="The office has completed setup for this client." />
        <div className="amg-kv">
          <div>
            <small>PREPARED ON</small>
            <b>{formatDay(event?.createdAt) || 'Not recorded'}</b>
          </div>
          <div>
            <small>PREPARED BY</small>
            <b>{staffName(store, event?.actorId) || 'AIO Operations'}</b>
          </div>
        </div>
      </AioCard>
      <AioCard className="amg-npb__card">
        <AioDiscHead icon="summary" title={docs.length ? 'VAULT DOCUMENTS STORED' : 'NO VAULT DOCUMENTS YET'} sub={docs.length ? 'Client documents have been uploaded to the vault.' : 'No documents are stored for this client yet.'} />
        <div className="amg-kv">
          <div>
            <small>DOCUMENTS</small>
            <b>{docs.length}</b>
          </div>
          <div>
            <small>LAST UPLOADED</small>
            <b>{formatDay(last) || '—'}</b>
          </div>
        </div>
      </AioCard>
      <AioCard className="amg-npb__card">
        <AioDiscHead icon="tests" title="CLIENT MUST REVIEW" sub="Items the client still needs to review and accept." />
        <div className="amg-kv">
          <div>
            <small>ITEMS TO REVIEW</small>
            <b>{toReview.length}</b>
          </div>
          <div>
            <small>INCLUDES</small>
            <span className="amg-kv__list">{toReview.join(', ') || 'Nothing left to review'}</span>
          </div>
        </div>
      </AioCard>
      {cta}
    </AioFlow>
  );
}

/* ───────── SEND INVITE (new client) ───────── */
export function NewInviteScreen({
  email,
  onEmail,
  sentUrl,
  expiresAt,
  cta,
}: {
  email: string;
  onEmail: (value: string) => void;
  sentUrl: string | null;
  expiresAt: Date;
  cta: ReactNode;
}) {
  const expiry = expiresAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  return (
    <AioFlow top={468} gap={18} className="amg-ninv">
      <AioCard className="amg-ninv__card">
        <AioDiscHead icon="letter" title="DESTINATION EMAIL" sub="Send the client invitation to the primary contact email." />
        <label className="amg-inline-field">
          <input type="email" value={email} onChange={(event) => onEmail(event.target.value)} placeholder="name@company.com" aria-label="Destination email" />
        </label>
      </AioCard>
      <AioCard className="amg-ninv__card">
        <AioDiscHead icon="link" title="SECURE INVITATION LINK" sub="We’ll generate a secure link unique to this client." />
        <div className="amg-inline-field amg-inline-field--link">
          <span className={sentUrl ? '' : 'is-placeholder'}>{sentUrl ?? 'Generated when you send the invite'}</span>
          <button type="button" aria-label="Copy link" disabled={!sentUrl} onClick={() => sentUrl && void navigator.clipboard?.writeText(sentUrl)}>
            <Ico name="copy" />
          </button>
        </div>
      </AioCard>
      <AioCard className="amg-ninv__card">
        <AioDiscHead icon="shield-check" title="NO PASSWORD REQUIRED" sub="The client can access the setup using the secure link. No password is needed." />
      </AioCard>
      <AioCard className="amg-ninv__card">
        <AioDiscHead icon="time-log" title="LINK EXPIRATION" sub={`This invitation link will expire in ${INVITE_TTL_DAYS} days.`} />
        <div className="amg-inline-field amg-inline-field--ro">
          <span>{sentUrl ? expiry : `${expiry} (if sent now)`}</span>
        </div>
      </AioCard>
      {cta}
    </AioFlow>
  );
}

/* ───────── CLIENT CONFIRMATION REQUIRED (new client) ───────── */
const REVIEW_LIST: Array<{ icon: IcoName; title: string; sub: string }> = [
  { icon: 'company', title: 'COMPANY', sub: 'Business details and legal information' },
  { icon: 'people', title: 'PEOPLE', sub: 'Contacts, drivers, and key personnel' },
  { icon: 'truck', title: 'VEHICLES', sub: 'Trucks and trailers' },
  { icon: 'settings', title: 'ACTIVE SERVICES', sub: 'Services selected for this client' },
  { icon: 'summary', title: 'DOCUMENTS WE HAVE', sub: 'Files and records on hand' },
  { icon: 'history', title: 'WHAT CHANGED', sub: 'Summary of changes from previous setup' },
];

export function NewConfirmScreen({ client, cta }: { client: Client; cta: ReactNode }) {
  const active = isActive(client);
  return (
    <AioFlow top={468} gap={18} className="amg-ncf">
      <AioCard className="amg-ncf__card">
        <AioDiscHead icon="profile" title="CLIENT STATUS" sub={active ? 'This client confirmed their information and is active.' : 'This client is not active yet. Please review the information below and confirm to continue.'} />
        <AioCallout tone={active ? 'green' : 'amber'} icon={active ? 'success' : 'alert-mark'} title={active ? 'ACTIVE' : 'NOT ACTIVE YET'} className="amg-ncf__callout">
          {active ? 'The client completed their review.' : 'Review the details below before continuing.'}
        </AioCallout>
        <AioCardHead title="REVIEW LIST" sub="Check each section to confirm the client information." className="amg-ncf__head" />
        <AioRows className="amg-ncf__rows">
          {REVIEW_LIST.map((row) => (
            <AioRow
              key={row.title}
              lead={<AioDisc tone="dark" icon={row.icon} className="amg-ncf__disc" />}
              title={row.title}
              sub={row.sub}
            />
          ))}
        </AioRows>
      </AioCard>
      {cta}
    </AioFlow>
  );
}


/**
 * Existing client branch after FILES RECEIVED / EXTRACTING: UPLOAD, MATCH, FOUNDER REVIEW, ITEMS NEEDING REVIEW,
 * APPROVAL SUMMARY, PREBUILT, SEND ACTIVATION INVITE, INVITE SENT (AIO-MIG-EXISTING-*-001). Staff actor.
 */
import type { ReactNode, RefObject } from 'react';
import { Link } from 'react-router-dom';
import type { Client, DemoStore } from '../../demo/demoTypes';
import type { ArchiveMigrationBatch, ArchiveMigrationBatchFile } from '../../vault/archiveMigrationTypes';
import { aioPaths } from '../../utils/paths';
import type { ExtractedFactRecord, MigrationReviewAction } from '../types';
import { AioMonogram, AioWhatNext, Ico, type IcoName } from './AioMigrationKit';
import {
  AioCard,
  AioCardHead,
  AioChip,
  AioClient,
  AioConfidence,
  AioDisc,
  AioDiscHead,
  AioDrop,
  AioFlow,
  AioRow,
  AioRows,
  AioStat,
  AioStrip,
  AioCallout,
  type Tone,
} from './AioMigrationModules';
import { MigrationSelectSteps } from './MigrationExistingScreens';
import {
  SECTION_ICON,
  acceptedTypeLabels,
  documentTypes,
  documentsOf,
  factIcon,
  factSection,
  fieldLabel,
  fileTone,
  isActive,
  lifecycleLabel,
  peopleSummary,
  plural,
  profileOf,
  unitsOf,
  vehicleSummary,
  weakestConfidence,
  type SectionKey,
} from './migrationData';
import { formatBytes } from './migrationViewer';

export type LocalPick = { name: string; size: number; status: 'accepted' | 'unsupported'; reason?: string };

/* ───────── UPLOAD CLIENT FILE ───────── */
export function MigrationUploadScreen({
  client,
  ids,
  stored,
  local,
  inputRef,
  onFiles,
  onRemoveLocal,
  cta,
}: {
  client: Client;
  ids: string[];
  stored: ArchiveMigrationBatchFile[];
  local: LocalPick[];
  inputRef: RefObject<HTMLInputElement | null>;
  onFiles: (files: File[]) => void;
  onRemoveLocal: (name: string) => void;
  cta: ReactNode;
}) {
  return (
    <AioFlow top={403} gap={15} className="amg-upload">
      <AioCard className="amg-upload__client">
        <AioClient label="SELECTED CLIENT" name={client.companyName} ids={ids} right={<AioChip tone="amber" icon="queued">{lifecycleLabel(client.clientLifecycle)}</AioChip>} />
      </AioCard>
      <AioCard className="amg-upload__drop">
        <AioCardHead title="UPLOAD CLIENT FILE(S)" sub="Select a folder or multiple files to upload the complete client record set." />
        <AioDrop
          className="amg-drop--outline"
          icon="folder-up"
          title="DRAG & DROP A FOLDER OR FILES HERE"
          divider
          button="BROWSE FILES"
          buttonIcon="folder"
          types={`Supported types: ${acceptedTypeLabels().join(', ')}`}
          onFiles={onFiles}
          inputRef={inputRef}
        />
      </AioCard>
      <AioCard className="amg-upload__list">
        <AioCardHead title={`UPLOADED FILES (${stored.length + local.length})`} />
        <UploadedFiles stored={stored} local={local} onRemoveLocal={onRemoveLocal} />
      </AioCard>
      <AioWhatNext>Once your files finish uploading, we’ll organize the data and help you review and confirm everything before importing.</AioWhatNext>
      {cta}
    </AioFlow>
  );
}

/** Stored batch files (uploaded) and files picked in this session (ready to upload / unsupported). */
export function UploadedFiles({ stored, local, onRemoveLocal, empty = 'No files chosen yet. Drop the client folder above or browse for files.' }: { stored: ArchiveMigrationBatchFile[]; local: LocalPick[]; onRemoveLocal: (name: string) => void; empty?: string }) {
  const rows = [
    ...stored.map((f) => ({ key: f.id, name: f.fileName, size: f.fileSizeBytes, state: 'stored' as const, reason: undefined as string | undefined })),
    ...local.map((f) => ({ key: `local-${f.name}`, name: f.name, size: f.size, state: f.status === 'unsupported' ? ('unsupported' as const) : ('ready' as const), reason: f.reason })),
  ];
  if (!rows.length) return <p className="amg-empty amg-empty--tight">{empty}</p>;
  return (
    <ul className="amg-uplist">
      {rows.map((row) => {
        const t = fileTone(row.name);
        return (
          <li key={row.key} className={`amg-upfile is-${row.state}`}>
            <span className={`amg-upfile__type amg-upfile__type--${t.tone}`} aria-hidden="true">
              {t.tone === 'pdf' ? 'PDF' : <Ico name={t.icon} />}
            </span>
            <span className="amg-upfile__text">
              <b title={row.name}>{row.name}</b>
              <span>{formatBytes(row.size)}</span>
            </span>
            {row.state === 'stored' ? (
              <>
                <span className="amg-upfile__bar" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: '100%' }} />
                </span>
                <span className="amg-upfile__pct">100%</span>
              </>
            ) : (
              <span className={`amg-upfile__state${row.state === 'unsupported' ? ' is-bad' : ''}`}>{row.state === 'unsupported' ? `UNSUPPORTED · ${row.reason ?? 'file type'}` : 'READY TO UPLOAD'}</span>
            )}
            <button
              type="button"
              className="amg-upfile__x"
              aria-label={`Remove ${row.name}`}
              disabled={row.state === 'stored'}
              title={row.state === 'stored' ? 'Stored files stay on the migration record' : undefined}
              onClick={() => onRemoveLocal(row.name)}
            >
              <Ico name="x" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ───────── MATCH AND CONFLICT REVIEW ───────── */
export type MatchChoice = 'existing' | 'new' | 'review';

export function MigrationMatchScreen({
  store,
  client,
  conflicts,
  batch,
  choice,
  onChoice,
  onReviewConflicts,
  cta,
}: {
  store: DemoStore;
  client: Client;
  conflicts: ExtractedFactRecord[];
  batch?: ArchiveMigrationBatch;
  choice: MatchChoice | null;
  onChoice: (choice: MatchChoice) => void;
  onReviewConflicts: () => void;
  cta: ReactNode;
}) {
  const profile = profileOf(store, client.id);
  const usdot = profile?.authority?.usdotNumber?.trim();
  const mc = profile?.authority?.mcNumber?.replace(/^MC[-\s]?/i, '').trim();
  const ein = profile?.business?.ein?.trim();
  const vin = unitsOf(store, client.id).find((u) => u.vin)?.vin;
  const strongIds: Array<[string, string]> = [
    ['USDOT', usdot ?? ''],
    ['MC', mc ?? ''],
    ['EIN', ein ?? ''],
    ['VIN', vin ? vin.slice(0, 8) : ''],
  ].filter(([, v]) => v) as Array<[string, string]>;
  const strong = Boolean(usdot || mc || ein);
  const phone = profile?.business?.phone || client.contactPhone;
  const address = profile?.business?.address || profile?.business?.mailingAddress;
  const options: Array<{ key: MatchChoice; title: string; sub: string; icon: IcoName }> = [
    { key: 'existing', title: 'MATCH TO EXISTING', sub: 'Use this match and bring over the client’s records.', icon: 'check' },
    { key: 'new', title: 'CREATE NEW', sub: 'Create a new client record instead.', icon: 'add' },
    { key: 'review', title: 'NEEDS REVIEW', sub: 'Flag for manual review before importing.', icon: 'help-mark' },
  ];
  return (
    <AioFlow top={413} gap={16} className="amg-match">
      <AioCard className="amg-match__client">
        <header className="amg-match__head">
          <b className="amg-match__label">MATCHED CLIENT</b>
          <AioChip tone={strong ? 'green' : 'amber'} icon={strong ? 'pass' : 'warning'}>
            {strong ? 'STRONG MATCH' : 'NAME MATCH ONLY'}
          </AioChip>
          {batch ? (
            <Link className="amg-link amg-match__orig" to={aioPaths.officeArchiveMigrationBatch(batch.id)}>
              VIEW ORIGINAL <Ico name="arrow" />
            </Link>
          ) : null}
        </header>
        <div className="amg-match__who">
          <AioMonogram name={client.companyName} className="amg-match__mono" />
          <div className="amg-match__name">
            <b>{client.companyName}</b>
            <span>{strong ? 'Likely the same company from your existing records.' : 'Matched by company name. Confirm before importing.'}</span>
          </div>
        </div>
        {strongIds.length ? (
          <dl className="amg-idgrid" style={{ ['--n' as string]: strongIds.length }}>
            {strongIds.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div className="amg-match__sec">
          <div>
            <AioDisc tone="soft" icon="phone" />
            <span>
              <small>PHONE (SECONDARY)</small>
              <b>{phone || 'Not on file'}</b>
            </span>
          </div>
          <div>
            <AioDisc tone="soft" icon="pin" />
            <span>
              <small>ADDRESS (SECONDARY)</small>
              <b>{address || 'Not on file'}</b>
            </span>
          </div>
        </div>
      </AioCard>
      <AioCard className="amg-match__conflicts">
        <AioCardHead
          title="CONFLICTS FOUND"
          right={
            <AioChip tone={conflicts.length ? 'red' : 'green'} icon={conflicts.length ? 'error-log' : 'success'}>
              {conflicts.length ? plural(conflicts.length, 'CONFLICT') : 'NO CONFLICTS'}
            </AioChip>
          }
        />
        {conflicts.length === 0 ? <p className="amg-empty amg-empty--tight">No conflicting values between this file and the AIO record.</p> : null}
        {conflicts.slice(0, 3).map((fact) => (
          <button key={fact.id} type="button" className="amg-conflict" onClick={onReviewConflicts}>
            <AioDisc tone="red" icon={factIcon(fact)} className="amg-conflict__disc" />
            <span className="amg-conflict__text">
              <b>{fieldLabel(fact.fieldKey)} DIFFERS</b>
              <span>AIO record: {fact.existingValue || 'empty'}</span>
              <span>Existing record: {fact.proposedValue || 'empty'}</span>
            </span>
            <span className="amg-conflict__go">
              REVIEW <Ico name="chevron" />
            </span>
          </button>
        ))}
      </AioCard>
      <AioCard className="amg-match__proceed">
        <AioCardHead title="CHOOSE HOW TO PROCEED" />
        <AioRows className="amg-match__options">
          {options.map((option) => (
            <AioRow
              key={option.key}
              lead={<AioDisc tone="dark" icon={option.icon} className={`amg-match__disc${option.key === 'existing' ? ' is-check' : ''}`} />}
              title={option.title}
              sub={option.sub}
              right={option.key === 'existing' && strong ? <AioChip tone="gold">RECOMMENDED</AioChip> : undefined}
              selected={choice === option.key}
              onClick={() => onChoice(option.key)}
            />
          ))}
        </AioRows>
        {cta}
      </AioCard>
    </AioFlow>
  );
}

/* ───────── FOUNDER REVIEW ───────── */
const REVIEW_SECTIONS: Array<{ key: SectionKey | 'CONFLICTS'; title: string; actions: [MigrationReviewAction | 'IGNORE', MigrationReviewAction | 'IGNORE', MigrationReviewAction | 'IGNORE', MigrationReviewAction | 'IGNORE'] | [MigrationReviewAction | 'IGNORE', MigrationReviewAction | 'IGNORE'] }> = [
  { key: 'COMPANY', title: 'COMPANY', actions: ['CONFIRM', 'EDIT', 'IGNORE', 'MARK_STALE'] },
  { key: 'PEOPLE', title: 'PEOPLE', actions: ['CONFIRM', 'EDIT', 'NEEDS_CLIENT_CONFIRMATION', 'REJECT'] },
  { key: 'VEHICLES', title: 'VEHICLES', actions: ['CONFIRM', 'EDIT', 'RECLASSIFY', 'MARK_STALE'] },
  { key: 'SERVICES', title: 'SERVICES', actions: ['CONFIRM', 'EDIT', 'RECLASSIFY', 'IGNORE'] },
  { key: 'DOCUMENTS', title: 'DOCUMENTS', actions: ['CONFIRM', 'EDIT', 'NEEDS_CLIENT_CONFIRMATION', 'MARK_STALE'] },
  { key: 'CONFLICTS', title: 'CONFLICTS', actions: ['IGNORE', 'REJECT'] },
];

const ACTION_LABEL: Record<string, ReactNode> = {
  CONFIRM: 'CONFIRM',
  EDIT: 'EDIT',
  IGNORE: 'IGNORE',
  MARK_STALE: 'MARK STALE',
  REJECT: 'REJECT',
  RECLASSIFY: 'RECLASSIFY',
  NEEDS_CLIENT_CONFIRMATION: (
    <>
      NEEDS CLIENT
      <br />
      CONFIRMATION
    </>
  ),
};

export type ReviewTarget = SectionKey | 'CONFLICTS';

export function MigrationReviewScreen({
  store,
  client,
  ids,
  facts,
  applied,
  onAction,
  cta,
}: {
  store: DemoStore;
  client: Client;
  ids: string[];
  facts: ExtractedFactRecord[];
  /** last action applied per section in this session (shown as the pressed button) */
  applied: Partial<Record<ReviewTarget, MigrationReviewAction | 'IGNORE'>>;
  onAction: (target: ReviewTarget, action: MigrationReviewAction | 'IGNORE') => void;
  cta: ReactNode;
}) {
  const profile = profileOf(store, client.id);
  const conflicts = facts.filter((f) => f.confidence === 'CONFLICT');
  const sub: Record<ReviewTarget, string[]> = {
    COMPANY: [profile?.business?.legalName || client.companyName, ids.join('  |  ')].filter(Boolean),
    PEOPLE: [peopleSummary(store, client.id).join('  |  ') || 'No people on file'],
    VEHICLES: [vehicleSummary(store, client.id).join('  |  ')],
    SERVICES: [client.services.length ? client.services.join('  |  ') : 'No services on file'],
    DOCUMENTS: [documentTypes(store, client.id).slice(0, 4).join('  |  ') || 'No documents on file'],
    CONFLICTS: [conflicts.length ? `${plural(conflicts.length, 'potential conflict')} found` : 'No potential conflicts found'],
  };
  const level = (target: ReviewTarget) => weakestConfidence(target === 'CONFLICTS' ? conflicts : facts.filter((f) => factSection(f) === target && f.confidence !== 'CONFLICT'));
  const overall = weakestConfidence(facts);
  const overallTone: Tone = overall === 'HIGH' || overall === 'MEDIUM' ? 'green' : overall === 'LOW' ? 'amber' : overall === 'CONFLICT' ? 'red' : 'gray';
  return (
    <AioFlow top={413} gap={14} className="amg-review">
      <MigrationSelectSteps current={1} />
      <AioCard className="amg-review__card">
        <AioClient
          name={client.companyName}
          ids={ids}
          right={
            <span className={`amg-overall amg-overall--${overallTone}`}>
              <AioDisc tone={overallTone === 'gray' ? 'soft' : overallTone} icon={overall ? (overall === 'CONFLICT' ? 'warning' : 'check') : 'info-mark'} />
              <span>
                <b>{overall ? `${overall} CONFIDENCE` : 'NOTHING EXTRACTED'}</b>
                <small>{overall ? 'Overall Match' : 'No facts on this file yet'}</small>
              </span>
            </span>
          }
        />
        <AioRows className="amg-review__rows">
          {REVIEW_SECTIONS.map((section) => (
            <AioRow
              key={section.key}
              icon={section.key === 'CONFLICTS' ? 'alert-mark' : SECTION_ICON[section.key]}
              title={section.title}
              sub={sub[section.key].map((line) => (
                <span key={line}>{line}</span>
              ))}
              right={
                <>
                  <AioConfidence level={level(section.key)} />
                  <span className={`amg-acts amg-acts--${section.actions.length}`}>
                    {section.actions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        className={`amg-act${action === 'CONFIRM' ? ' is-primary' : ''}${applied[section.key] === action ? ' is-on' : ''}`}
                        aria-pressed={applied[section.key] === action}
                        onClick={() => onAction(section.key, action)}
                      >
                        {ACTION_LABEL[action]}
                      </button>
                    ))}
                  </span>
                </>
              }
            />
          ))}
        </AioRows>
      </AioCard>
      <AioWhatNext>Once you approve, we’ll write the confirmed information to the client profile in the new system.</AioWhatNext>
      {cta}
    </AioFlow>
  );
}

/* ───────── ITEMS NEEDING REVIEW (conflicts) ───────── */
export type ConflictDecision = 'KEEP' | 'USE' | 'CLIENT';

export function MigrationConflictsScreen({
  store,
  client,
  ids,
  conflicts,
  decisions,
  onDecide,
  onChangeClient,
  cta,
}: {
  store: DemoStore;
  client: Client;
  ids: string[];
  conflicts: ExtractedFactRecord[];
  decisions: Record<string, ConflictDecision>;
  onDecide: (factId: string, decision: ConflictDecision) => void;
  onChangeClient: () => void;
  cta: ReactNode;
}) {
  const options: Array<{ key: ConflictDecision; label: ReactNode }> = [
    { key: 'KEEP', label: 'KEEP AIO' },
    { key: 'USE', label: 'USE EXTRACTED' },
    {
      key: 'CLIENT',
      label: (
        <>
          NEEDS CLIENT
          <br />
          CONFIRMATION
        </>
      ),
    },
  ];
  return (
    <AioFlow top={413} gap={14} className="amg-conflicts">
      <MigrationSelectSteps current={1} />
      <AioCard className="amg-conflicts__client">
        <AioClient
          name={client.companyName}
          ids={ids}
          right={
            <button type="button" className="amg-btn-soft" onClick={onChangeClient}>
              CHANGE CLIENT <Ico name="chevron" />
            </button>
          }
        />
      </AioCard>
      <AioCard className="amg-conflicts__card">
        <AioCardHead
          title={conflicts.length ? `${plural(conflicts.length, 'ITEM')} NEEDING REVIEW` : 'NO ITEMS NEEDING REVIEW'}
          sub={conflicts.length ? 'Review the differences below and select how to proceed for each item.' : 'The extracted data matches the current AIO record.'}
        />
        {conflicts.map((fact) => {
          const doc = store.documents.find((d) => d.id === fact.documentId);
          const label = fieldLabel(fact.fieldKey);
          return (
            <article key={fact.id} className="amg-cfitem">
              <AioDisc tone="tint" icon={factIcon(fact)} className="amg-cfitem__disc" />
              <div className="amg-cfitem__what">
                <b>{label}</b>
                <p>The {label.toLowerCase()} from the extracted document is different from your current AIO value.</p>
              </div>
              <aside className="amg-cfitem__src">
                <small>SOURCE DOCUMENT</small>
                <b>
                  <Ico name="summary" />
                  <span>{doc?.fileName || doc?.title || fact.sourceReference?.split('/').pop()?.split('#')[0] || 'Extracted file'}</span>
                </b>
                <span>
                  <Ico name="link" />
                  From {doc?.documentType || 'the client file'}
                </span>
              </aside>
              <div className="amg-cfitem__vals">
                <div className="amg-vbox">
                  <small>OLD AIO VALUE</small>
                  <b>{fact.existingValue || 'Empty'}</b>
                </div>
                <div className="amg-vbox amg-vbox--x">
                  <small>EXTRACTED VALUE</small>
                  <b>{fact.proposedValue || 'Empty'}</b>
                </div>
              </div>
              <div className="amg-radios amg-cfitem__radios" role="radiogroup" aria-label={`${label} decision`}>
                {options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={decisions[fact.id] === option.key}
                    className={`amg-radio${decisions[fact.id] === option.key ? ' is-on' : ''}`}
                    onClick={() => onDecide(fact.id, option.key)}
                  >
                    <span className="amg-radio__dot" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </AioCard>
      <AioWhatNext>Once you save your decisions, we’ll apply them to your migration, organize the data, and move to the next step for final validation.</AioWhatNext>
      {cta}
    </AioFlow>
  );
}

/* ───────── APPROVAL SUMMARY ───────── */
const CLIENT_SECTIONS: Array<{ code: string; item: string }> = [
  { code: 'COMPANY', item: 'Confirm company contact information' },
  { code: 'PEOPLE', item: 'Confirm owners and contacts' },
  { code: 'VEHICLES', item: 'Confirm vehicles on file' },
  { code: 'ACTIVE_SERVICES', item: 'Confirm active services' },
  { code: 'DOCUMENTS', item: 'Review and approve uploaded documents' },
];

function StatusMark({ tone, label }: { tone: 'ready' | 'remaining' | 'blocked' | 'missing'; label: ReactNode }) {
  const icon: IcoName = tone === 'ready' ? 'check' : tone === 'blocked' ? 'x' : 'remove';
  return (
    <span className={`amg-smark amg-smark--${tone}`}>
      <span className="amg-smark__disc" aria-hidden="true">
        <Ico name={icon} />
      </span>
      <b>{label}</b>
    </span>
  );
}

export function MigrationApprovalScreen({
  store,
  client,
  ids,
  conflicts,
  storedFiles,
  cta,
}: {
  store: DemoStore;
  client: Client;
  ids: string[];
  conflicts: number;
  storedFiles: number;
  cta: ReactNode;
}) {
  const profile = profileOf(store, client.id);
  const docs = documentsOf(store, client.id).length + storedFiles;
  const answered = new Set((store.clientReviewSections ?? []).filter((r) => r.organizationId === client.id).map((r) => r.sectionCode));
  const remaining = client.clientReviewState === 'COMPLETE' ? [] : CLIENT_SECTIONS.filter((s) => !answered.has(s.code as never));
  return (
    <AioFlow top={413} gap={16} className="amg-approval">
      <AioCard className="amg-approval__card">
        <AioClient label="CLIENT" name={client.companyName} ids={ids} />
        <AioRows className="amg-approval__rows">
          <AioRow
            lead={<AioDisc tone="tint" icon="summary" className="amg-approval__disc" />}
            title="BUSINESS PROFILE"
            sub="Company information, contacts, and settings"
            right={conflicts ? <StatusMark tone="blocked" label={plural(conflicts, 'CONFLICT')} /> : profile ? <StatusMark tone="ready" label="READY" /> : <StatusMark tone="missing" label="INCOMPLETE" />}
          />
          <AioRow
            lead={<AioDisc tone="tint" icon="folder" className="amg-approval__disc" />}
            title="VAULT DOCUMENTS"
            sub={docs ? `${plural(docs, 'document')} stored for this client` : 'No documents stored yet'}
            right={docs ? <StatusMark tone="ready" label="READY" /> : <StatusMark tone="missing" label="NONE STORED" />}
          />
          <AioRow
            lead={<AioDisc tone="tint" icon="people" className="amg-approval__disc" />}
            title="CLIENT REVIEW"
            sub="Items for the client to confirm"
            right={
              remaining.length ? (
                <StatusMark
                  tone="remaining"
                  label={
                    <>
                      ITEMS
                      <br />
                      REMAINING
                    </>
                  }
                />
              ) : (
                <StatusMark tone="ready" label="READY" />
              )
            }
          />
        </AioRows>
        {remaining.length ? (
          <div className="amg-remain">
            <b className="amg-remain__t">ITEMS REMAINING</b>
            <p className="amg-remain__s">The client needs to review and confirm the following:</p>
            <ol className="amg-remain__list">
              {remaining.map((item, i) => (
                <li key={item.code}>
                  <span className="amg-remain__n">{i + 1}</span>
                  <span>{item.item}</span>
                  <Ico name="chevron" />
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </AioCard>
      <AioWhatNext>
        Once you approve, we’ll create a prebuilt office for this client with all confirmed data and documents. <strong>This does not make the client active.</strong> You can activate them later.
      </AioWhatNext>
      {cta}
    </AioFlow>
  );
}

/* ───────── PREBUILT · NOT ACTIVE YET ───────── */
export function MigrationPrebuiltScreen({ store, client, ids, cta }: { store: DemoStore; client: Client; ids: string[]; cta: ReactNode }) {
  const docs = documentsOf(store, client.id).length;
  const provisioned = Boolean(client.activationConditions?.officeProvisioningSucceeded);
  const active = isActive(client);
  return (
    <AioFlow top={425} gap={16} className="amg-prebuilt">
      <AioCard className="amg-prebuilt__card">
        <AioClient
          name={client.companyName}
          ids={ids}
          right={
            <>
              <span className="amg-badge">{active ? 'ACTIVE' : lifecycleLabel(client.clientLifecycle) === 'PREBUILT' ? 'PREBUILT' : lifecycleLabel(client.clientLifecycle)}</span>
              <small className="amg-badge__s">{active ? 'CLIENT CONFIRMED' : 'NOT ACTIVE YET'}</small>
            </>
          }
        />
        <div className="amg-stats" style={{ ['--n' as string]: 3 }}>
          <AioStat className="is-lv" icon="profile" label="AIO CLIENT ID" value={client.customerNumber || client.id.toUpperCase()} sub={client.customerNumber ? 'Assigned' : 'Record ID'} />
          <AioStat className="is-lv" icon="company" label="OFFICE PROVISION STATUS" value={provisioned ? 'PROVISIONED' : 'PREPARING'} sub={provisioned ? 'Workspace Ready' : 'Setup in progress'} />
          <AioStat className="is-lv" icon="summary" label="DOCUMENT VAULT STATE" value={docs ? 'FILES STORED' : 'NO FILES'} sub={docs ? `${plural(docs, 'Document')} Secured` : 'Nothing stored yet'} />
        </div>
      </AioCard>
      <AioCard className="amg-prebuilt__review">
        <AioDiscHead tone="gold" icon="tests" title="ITEMS REQUIRING CLIENT REVIEW" sub="Please review the items below before sending the activation invite." />
        <AioRows>
          <li>
            <Link className="amg-row is-action" to={aioPaths.officeClient(client.id)}>
              <span className="amg-row__icon" aria-hidden="true">
                <Ico name="summary" />
              </span>
              <span className="amg-row__text">
                <b className="amg-row__t">Business Information</b>
                <span className="amg-row__s">Verify legal name, address, and contact details.</span>
              </span>
              <Ico name="chevron" className="amg-row__chev" />
            </Link>
          </li>
          <li>
            <Link className="amg-row is-action" to={aioPaths.officeClient(client.id)}>
              <span className="amg-row__icon" aria-hidden="true">
                <Ico name="people" />
              </span>
              <span className="amg-row__text">
                <b className="amg-row__t">Authorized Users</b>
                <span className="amg-row__s">Confirm account users and their access levels.</span>
              </span>
              <Ico name="chevron" className="amg-row__chev" />
            </Link>
          </li>
        </AioRows>
      </AioCard>
      <AioWhatNext>Once you send the activation invite, your client will get access to their AIO portal. They can review their information, and you’ll be notified once they activate their account.</AioWhatNext>
      {cta}
    </AioFlow>
  );
}

/* ───────── SEND ACTIVATION INVITE ───────── */
export const INVITE_TTL_DAYS = 3;

export function MigrationInviteScreen({ client, ids, cta, sentUrl }: { client: Client; ids: string[]; cta: ReactNode; sentUrl?: string | null }) {
  const rows: Array<{ icon: IcoName; label: string; value: ReactNode }> = [
    { icon: 'letter', label: 'DESTINATION EMAIL', value: client.contactEmail },
    { icon: 'phone', label: 'PHONE NUMBER', value: client.contactPhone || 'No phone on record' },
    { icon: 'link', label: 'ACTIVATION METHOD', value: sentUrl ? 'Secure link sent' : 'Secure link (no password required)' },
    { icon: 'calendar', label: 'LINK EXPIRATION', value: `${INVITE_TTL_DAYS} days` },
    { icon: 'shield-check', label: 'SECURITY NOTE', value: <b className="amg-dlist__strong">No password is sent.</b> },
  ];
  return (
    <AioFlow top={450} gap={12} className="amg-invite">
      <AioCard className="amg-invite__client">
        <AioCardHead title="CLIENT INFORMATION" />
        <div className="amg-boxed">
          <AioClient name={client.companyName} ids={ids} right={<AioChip tone="gray" icon="time-log">{isActive(client) ? 'ACTIVE' : 'NOT ACTIVE YET'}</AioChip>} />
        </div>
      </AioCard>
      <AioCard className="amg-invite__details">
        <AioCardHead title="INVITE DETAILS" />
        <ul className="amg-dlist">
          {rows.map((row) => (
            <li key={row.label}>
              <AioDisc tone="tint" icon={row.icon} className="amg-dlist__disc" />
              <span>
                <small>{row.label}</small>
                <b>{row.value}</b>
              </span>
            </li>
          ))}
        </ul>
      </AioCard>
      <AioWhatNext>
        We’ll send a secure activation link to your client. They’ll use the link to create their account and get started. The link will expire in {INVITE_TTL_DAYS} days, and no password is sent.
      </AioWhatNext>
      {cta}
    </AioFlow>
  );
}

/* ───────── INVITE SENT ───────── */
const CLIENT_REVIEW_ROWS: Array<{ icon: IcoName; title: string; sub: string }> = [
  { icon: 'company', title: 'COMPANY', sub: 'Business details, address, and contact information' },
  { icon: 'people', title: 'PEOPLE', sub: 'Owners, officers, and authorized users' },
  { icon: 'truck', title: 'VEHICLES', sub: 'Trucks, trailers, and unit information' },
  { icon: 'settings', title: 'ACTIVE SERVICES', sub: 'Services and registrations' },
  { icon: 'summary', title: 'DOCUMENTS WE HAVE', sub: 'Permits, registrations, and other files' },
  { icon: 'history', title: 'WHAT CHANGED', sub: 'Review any updates or differences' },
];

export function MigrationInvitedScreen({ client, ids, cta }: { client: Client; ids: string[]; cta: ReactNode }) {
  const active = isActive(client);
  return (
    <AioFlow top={390} gap={8} className="amg-invited">
      <AioCard className="amg-invited__card">
        <AioClient name={client.companyName} ids={ids} />
        <AioCallout tone={active ? 'green' : 'amber'} icon={active ? 'success' : 'history'} kicker={active ? 'CLIENT CONFIRMED' : 'CLIENT CONFIRMATION REQUIRED'} title={active ? 'ACTIVE' : 'NOT ACTIVE YET'}>
          {active ? 'The client confirmed their information.' : 'The client is not active until they confirm.'}
        </AioCallout>
      </AioCard>
      <AioCard className="amg-invited__list">
        <AioCardHead title="WHAT YOUR CLIENT NEEDS TO REVIEW" sub="They’ll confirm and update the following information:" />
        <AioRows>
          {CLIENT_REVIEW_ROWS.map((row) => (
            <AioRow key={row.title} icon={row.icon} title={row.title} sub={row.sub} />
          ))}
        </AioRows>
        <AioStrip tone="gray" icon="info-mark" title="The client is not active until they confirm." className="amg-invited__strip">
          We’ll notify you once they’ve completed their review.
        </AioStrip>
      </AioCard>
      {cta}
    </AioFlow>
  );
}

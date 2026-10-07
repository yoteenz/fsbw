import { useMemo, useRef, useState, type RefObject } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { sendClientActivationInvite } from '../../demo/clientMigrationOfficeActions';
import { loadDemoStore, updateDemoStore } from '../../demo/demoStore';
import { useDemoStore } from '../../demo/useDemoStore';
import type { Client } from '../../demo/demoTypes';
import { getBatchFiles } from '../../demo/archiveMigrationActions';
import { aioPaths } from '../../utils/paths';
import { validateUploadFile } from '../../vault/vaultStorage';
import { applyReviewActionToFact } from '../services/migrationCommitService';
import { approveMigrationBatchForOffice } from '../services/approveMigrationOfficeService';
import { createMigrationBatchForOffice, uploadFilesToMigrationBatch } from '../services/migrationIntakeService';
import { transitionClientLifecycle } from '../services/lifecycleEvents';
import type { ClientLifecycleState, MigrationReviewAction } from '../types';
import { MigrationAuthorityShell } from './MigrationAuthorityShell';

type LocalFile = {
  name: string;
  size: number;
  status: 'accepted' | 'unsupported';
  reason?: string;
  file?: File;
};

const REVIEW_ACTIONS: Array<MigrationReviewAction | 'IGNORE'> = [
  'CONFIRM',
  'EDIT',
  'IGNORE',
  'MARK_STALE',
  'NEEDS_CLIENT_CONFIRMATION',
  'RECLASSIFY',
  'REJECT',
];

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function lifecycleLabel(state: ClientLifecycleState | undefined): string {
  return (state ?? 'KNOWN_UNMIGRATED').replaceAll('_', ' ');
}

function isActiveLifecycle(state: ClientLifecycleState | undefined): boolean {
  return state === 'ACTIVE';
}

export function MigrationStudioPage() {
  const { screen = 'root' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const store = useDemoStore();
  const { session } = useAIOAuth();
  const staffId = session?.user.id ?? store.officeStaffId ?? 'staff-2';
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [batchName, setBatchName] = useState('Q1 2025 Clients');
  const [matchChoice, setMatchChoice] = useState<'existing' | 'new' | 'review' | null>(null);
  const [draft, setDraft] = useState({ companyName: '', contactName: '', email: '', phone: '' });

  const clientId = params.get('client') ?? '';
  const client = store.clients.find((item) => item.id === clientId);
  const batches = (store.archiveMigrationBatches ?? []).filter((batch) => !clientId || batch.clientId === clientId);
  const batch = batches[0];
  const files = batch ? getBatchFiles(batch.id, store) : [];
  const facts = (store.clientExtractedFacts ?? []).filter((fact) => !batch || fact.batchId === batch.id);
  const conflicts = facts.filter((fact) => fact.confidence === 'CONFLICT' && !fact.reviewAction);
  const documents = store.documents.filter((doc) => doc.organizationId === clientId);

  const filteredClients = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return store.clients.filter((item) => {
      if (!needle) return true;
      return [item.companyName, item.contactName, item.contactEmail, item.customerNumber, item.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [query, store.clients]);

  function go(next: string, nextClient = clientId) {
    const search = nextClient ? `?client=${encodeURIComponent(nextClient)}` : '';
    navigate(`${aioPaths.officeMigration(next === 'root' ? undefined : next)}${search}`);
    setMessage(null);
  }

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    const next: LocalFile[] = [];
    for (const file of Array.from(list)) {
      const reason = validateUploadFile(file);
      next.push({
        name: file.name,
        size: file.size,
        status: reason ? 'unsupported' : 'accepted',
        reason: reason ?? undefined,
        file: reason ? undefined : file,
      });
    }
    setLocalFiles((current) => [...current, ...next]);
  }

  async function ensureBatch(organizationId: string): Promise<string> {
    const existing = loadDemoStore().archiveMigrationBatches?.find((item) => item.clientId === organizationId);
    if (existing) return existing.id;
    const created = await createMigrationBatchForOffice({ organizationId, staffUserId: staffId });
    if (created.error || !created.batchId) throw new Error(created.error ?? 'Could not open a migration batch');
    updateDemoStore((current) => {
      const row = current.archiveMigrationBatches?.find((item) => item.id === created.batchId);
      if (row && batchName.trim()) row.notes = batchName.trim();
      const record = current.clients.find((item) => item.id === organizationId);
      if (record && !isActiveLifecycle(record.clientLifecycle)) {
        const nextState: ClientLifecycleState = screen.startsWith('new') ? 'INTAKE_IN_PROGRESS' : 'MIGRATION_IN_PROGRESS';
        if (record.clientLifecycle !== 'PREBUILT' && record.clientLifecycle !== 'INVITED' && record.clientLifecycle !== 'CLIENT_CONFIRMATION_REQUIRED') {
          return transitionClientLifecycle(current, organizationId, nextState, 'MIGRATION_BATCH_CREATED', 'STAFF', staffId);
        }
      }
      return current;
    });
    return created.batchId;
  }

  async function storeAcceptedFiles(organizationId: string) {
    const accepted = localFiles.flatMap((item) => (item.file ? [item.file] : []));
    if (!accepted.length) throw new Error('Add at least one PDF, JPG, PNG, or WEBP file');
    const batchId = await ensureBatch(organizationId);
    const result = await uploadFilesToMigrationBatch(batchId, accepted, organizationId);
    if (result.errors.length && result.added === 0) throw new Error(result.errors[0]);
    if (result.errors.length) setMessage(result.errors.join(' '));
    setLocalFiles((current) => current.filter((item) => item.status !== 'accepted'));
  }

  function createDraftClient(): string {
    const companyName = draft.companyName.trim();
    if (!companyName) throw new Error('Company name is required');
    const id = `mig-${crypto.randomUUID()}`;
    const record: Client = {
      id,
      companyName,
      contactName: draft.contactName.trim() || 'Primary contact',
      contactEmail: draft.email.trim() || 'pending@example.com',
      contactPhone: draft.phone.trim() || undefined,
      clientType: 'carrier',
      primaryState: '',
      accountStatus: 'pending',
      clientLifecycle: 'INTAKE_IN_PROGRESS',
      clientReviewState: 'NOT_STARTED',
      roadmapProgress: 0,
      customerSince: new Date().toISOString().slice(0, 10),
      services: [],
      activeRequestCount: 0,
      documentsNeededCount: 0,
      lastActivityAt: new Date().toISOString(),
      activationConditions: { canonicalIdentityExists: false },
    };
    updateDemoStore((current) => {
      current.clients.unshift(record);
      return transitionClientLifecycle(current, id, 'INTAKE_IN_PROGRESS', 'NEW_CLIENT_INTAKE', 'STAFF', staffId);
    });
    return id;
  }

  async function onContinue() {
    setBusy(true);
    setMessage(null);
    try {
      if (screen === 'root') {
        go('existing');
        return;
      }
      if (screen === 'existing') {
        if (!client) throw new Error('Select a client');
        if (isActiveLifecycle(client.clientLifecycle)) throw new Error('This client is already ACTIVE. Choose a client that still needs migration.');
        go('upload');
        return;
      }
      if (screen === 'upload' || screen === 'new') {
        const organizationId = screen === 'new' ? (clientId || createDraftClient()) : clientId;
        if (!organizationId) throw new Error('Select a client');
        if (screen === 'upload') await storeAcceptedFiles(organizationId);
        go(screen === 'new' ? 'new-received' : 'received', organizationId);
        return;
      }
      if (screen === 'new-received' || screen === 'received') {
        if (clientId) await storeAcceptedFiles(clientId);
        go(screen === 'new-received' ? 'new-extract' : 'extract');
        return;
      }
      if (screen === 'extract' || screen === 'new-extract') {
        go(screen === 'new-extract' ? 'new-identity' : 'match');
        return;
      }
      if (screen === 'new-identity') go('new-records');
      else if (screen === 'new-records') go('new-review');
      else if (screen === 'new-review') go('new-approval');
      else if (screen === 'match') {
        if (matchChoice === 'review' || !matchChoice) throw new Error('Resolve the match before review');
        go('review');
      } else if (screen === 'review') go('conflicts');
      else if (screen === 'conflicts') go('approval');
      else if (screen === 'approval' || screen === 'new-approval') await approveCurrent(screen === 'new-approval' ? 'new-prebuilt' : 'prebuilt');
      else if (screen === 'prebuilt' || screen === 'new-prebuilt') go(screen === 'new-prebuilt' ? 'new-invite' : 'invite');
      else if (screen === 'invite' || screen === 'new-invite') await sendInvite(screen === 'new-invite' ? 'new-confirm' : 'invited');
      else if (screen === 'invited') go('invite');
      else if (screen === 'new-confirm' || screen === 'batch-complete') go('root');
      else if (screen === 'batch') go('batch-received');
      else if (screen === 'batch-received') {
        if (localFiles.some((item) => item.file)) {
          if (!clientId) throw new Error('Open one client before storing batch files');
          await storeAcceptedFiles(clientId);
        }
        go('batch-processing');
      }
      else if (screen === 'batch-processing') go('batch-summary');
      else if (screen === 'batch-summary') go('batch-conflicts');
      else if (screen === 'batch-conflicts') go('batch-queue');
      else if (screen === 'batch-queue') go('batch-client');
      else if (screen === 'batch-client') go('batch-approval');
      else if (screen === 'batch-approval') go('batch-run');
      else if (screen === 'batch-run') go('batch-complete');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not continue');
    } finally {
      setBusy(false);
    }
  }

  async function approveCurrent(next: string) {
    if (!client) throw new Error('Client record missing');
    if (isActiveLifecycle(client.clientLifecycle)) throw new Error('Approval cannot run on a client who is already ACTIVE');
    const batchId = await ensureBatch(client.id);
    const resolved = screen.startsWith('new') || matchChoice === 'existing' || matchChoice === 'new';
    const result = await approveMigrationBatchForOffice({ batchId, staffId, matchResolved: resolved });
    if (!result.ok) throw new Error(result.error ?? 'Approval failed');
    const updated = loadDemoStore().clients.find((item) => item.id === client.id);
    if (updated?.clientLifecycle === 'ACTIVE') throw new Error('Approval incorrectly marked the client ACTIVE');
    if (updated?.clientLifecycle !== 'PREBUILT') throw new Error('Approval did not reach PREBUILT. Resolve conflicts, then approve again.');
    go(next);
  }

  async function sendInvite(next: string) {
    if (!client) throw new Error('Client record missing');
    const sent = await sendClientActivationInvite(client.id, client.contactEmail, staffId);
    if (sent.error && !sent.activationUrl) throw new Error(sent.error);
    if (sent.error) setMessage(sent.error);
    const updated = loadDemoStore().clients.find((item) => item.id === client.id);
    if (isActiveLifecycle(updated?.clientLifecycle)) throw new Error('Invite incorrectly marked the client ACTIVE');
    go(next);
  }

  function onReview(action: MigrationReviewAction | 'IGNORE') {
    if (action === 'IGNORE') {
      setMessage('Ignored for this review. The profile was not changed.');
      return;
    }
    const fact = facts.find((item) => !item.reviewAction) ?? facts[0];
    if (!fact) {
      setMessage('No extracted fact is on this file yet. Nothing was written to the profile.');
      return;
    }
    updateDemoStore((current) => applyReviewActionToFact(current, fact.id, action, staffId));
  }

  const plate = screen.startsWith('new') || screen.startsWith('batch') || screen === 'root' ? 'root' : 'existing';
  const copy = screenCopy(screen, client);
  const active = isActiveLifecycle(client?.clientLifecycle);
  const batchClients = store.clients.filter((item) =>
    (store.archiveMigrationBatches ?? []).some((row) => row.clientId === item.id && (!batchName || row.notes === batchName || !row.notes)),
  );
  const queue = batchClients.length ? batchClients : client ? [client] : [];

  return (
    <MigrationAuthorityShell
      plate={plate}
      kicker={copy.kicker}
      title={copy.title}
      subtitle={copy.subtitle}
      cta={copy.cta}
      onCta={() => void onContinue()}
      ctaDisabled={busy}
    >
      {screen === 'root' ? <RootChoices onOpen={go} /> : null}
      {screen === 'existing' ? (
        <article className="mig-card">
          <h2>FIND YOUR EXISTING CLIENT</h2>
          <p className="mig-sub">Search the AIO client account you want to migrate.</p>
          <input className="mig-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by client name, email, or account ID" />
          <div className="mig-list">
            {filteredClients.map((item) => (
              <button key={item.id} type="button" className={item.id === clientId ? 'mig-person is-on' : 'mig-person'} onClick={() => go('existing', item.id)}>
                <b>{item.companyName}</b>
                <span>{item.contactName} · {lifecycleLabel(item.clientLifecycle)}</span>
              </button>
            ))}
          </div>
        </article>
      ) : null}
      {screen === 'upload' || screen === 'new' ? (
        <>
          {client ? <Identity client={client} /> : null}
          {screen === 'new' ? (
            <article className="mig-card">
              <h2>BUSINESS IDENTITY</h2>
              <label className="mig-label">COMPANY NAME</label>
              <input className="mig-field" value={draft.companyName} onChange={(event) => setDraft({ ...draft, companyName: event.target.value })} placeholder="Enter company name" />
              <label className="mig-label">PRIMARY CONTACT</label>
              <input className="mig-field" value={draft.contactName} onChange={(event) => setDraft({ ...draft, contactName: event.target.value })} placeholder="Enter contact name" />
              <label className="mig-label">EMAIL</label>
              <input className="mig-field" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="Enter email" />
              <label className="mig-label">PHONE</label>
              <input className="mig-field" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="Enter phone" />
            </article>
          ) : null}
          <UploadCard inputRef={inputRef} files={localFiles} onPick={onPickFiles} onRemove={(name) => setLocalFiles((current) => current.filter((item) => item.name !== name))} />
        </>
      ) : null}
      {(screen === 'received' || screen === 'new-received' || screen === 'batch-received') && (
        <Received files={files} localFiles={localFiles} batch={batch} batchName={batchName} client={client} />
      )}
      {(screen === 'extract' || screen === 'new-extract' || screen === 'batch-processing' || screen === 'batch-run') && (
        <Stages files={files} batchState={batch?.state} />
      )}
      {screen === 'match' && client ? (
        <article className="mig-card">
          <h2>MATCH AND CONFLICT REVIEW</h2>
          <Identity client={client} plain />
          <p className="mig-sub">Strong identifiers on the record are used first. Company, phone, and email are secondary.</p>
          <div className="mig-actions">
            <button type="button" className={matchChoice === 'existing' ? 'mig-chip mig-chip--gold' : 'mig-chip'} onClick={() => setMatchChoice('existing')}>MATCH TO EXISTING</button>
            <button type="button" className={matchChoice === 'new' ? 'mig-chip mig-chip--gold' : 'mig-chip'} onClick={() => setMatchChoice('new')}>CREATE NEW</button>
            <button type="button" className={matchChoice === 'review' ? 'mig-chip mig-chip--gold' : 'mig-chip'} onClick={() => setMatchChoice('review')}>NEEDS REVIEW</button>
          </div>
        </article>
      ) : null}
      {(screen === 'review' || screen === 'new-review' || screen === 'new-records' || screen === 'new-identity') && client ? (
        <ReviewCards client={client} documents={documents.length} onReview={onReview} />
      ) : null}
      {screen === 'conflicts' || screen === 'batch-conflicts' ? (
        <article className="mig-card">
          <h2>CONFLICTS</h2>
          {conflicts.length === 0 ? <p className="mig-sub">No conflicting facts are on this record. Existing canonical values stay as they are.</p> : conflicts.map((fact) => (
            <div key={fact.id} className="mig-row">
              <span>{fact.fieldKey}<br />{fact.existingValue || 'Current empty'} → {fact.proposedValue || 'Extracted empty'}</span>
              <span className="mig-pill">{fact.sourceReference ?? fact.confidence}</span>
            </div>
          ))}
        </article>
      ) : null}
      {(screen === 'approval' || screen === 'new-approval' || screen === 'batch-approval') && (
        <Approval client={client} documents={documents.length} conflicts={conflicts.length} queue={queue} />
      )}
      {(screen === 'prebuilt' || screen === 'new-prebuilt') && client ? <Prebuilt client={client} documents={documents.length} /> : null}
      {(screen === 'invite' || screen === 'new-invite') && client ? <Invite client={client} /> : null}
      {(screen === 'invited' || screen === 'new-confirm') && client ? <Invited client={client} active={active} /> : null}
      {screen === 'batch' ? (
        <article className="mig-card">
          <h2>BATCH</h2>
          <label className="mig-label">BATCH NAME</label>
          <input className="mig-field" value={batchName} onChange={(event) => setBatchName(event.target.value)} />
          <p className="mig-sub">Batch ID {batch?.id ?? 'Assigned when the first client file is stored'}.</p>
          <UploadCard inputRef={inputRef} files={localFiles} onPick={onPickFiles} onRemove={(name) => setLocalFiles((current) => current.filter((item) => item.name !== name))} />
        </article>
      ) : null}
      {screen === 'batch-summary' ? <Buckets queue={queue} /> : null}
      {screen === 'batch-queue' ? (
        <article className="mig-card">
          <h2>PER-CLIENT REVIEW QUEUE</h2>
          {queue.length === 0 ? <p className="mig-sub">No clients are in this batch yet.</p> : queue.map((item) => (
            <button key={item.id} type="button" className="mig-person" onClick={() => go('batch-client', item.id)}>
              <b>{item.companyName}</b>
              <span>{lifecycleLabel(item.clientLifecycle)}</span>
            </button>
          ))}
        </article>
      ) : null}
      {screen === 'batch-client' && client ? (
        <article className="mig-card">
          <h2>ONE CLIENT</h2>
          <Identity client={client} plain />
          <p className="mig-sub">This review does not approve any other client in the batch.</p>
        </article>
      ) : null}
      {screen === 'batch-complete' ? <BatchComplete queue={queue} /> : null}
      {message ? <p className="mig-error">{message}</p> : null}
      <input ref={inputRef} className="mig-file" type="file" multiple onChange={(event) => onPickFiles(event.target.files)} />
    </MigrationAuthorityShell>
  );
}

function screenCopy(screen: string, client: Client | undefined): { kicker: string; title: string; subtitle: string; cta: string } {
  const name = client?.companyName ?? 'This client';
  const map: Record<string, { kicker: string; title: string; subtitle: string; cta: string }> = {
    root: { kicker: 'CLIENT MIGRATION INTAKE', title: 'BRING YOUR DATA TO AIO', subtitle: 'Start a migration path. Uploading records does not make a client active.', cta: 'START MIGRATION' },
    existing: { kicker: 'CLIENT MIGRATION INTAKE', title: 'EXISTING CLIENT FILE', subtitle: 'Bring current AIO client records forward. The client stays inactive until confirmation.', cta: 'CONTINUE' },
    upload: { kicker: 'CLIENT MIGRATION INTAKE', title: 'UPLOAD CLIENT FILE', subtitle: `${name} · ${lifecycleLabel(client?.clientLifecycle)}. The whole file can include a folder of documents.`, cta: 'CONTINUE' },
    received: { kicker: 'CLIENT MIGRATION INTAKE', title: 'FILES RECEIVED', subtitle: 'Confirm this intake before extraction. Files received are not an active client.', cta: 'BEGIN EXTRACTION' },
    extract: { kicker: 'CLIENT MIGRATION INTAKE', title: 'EXTRACTING AND CLASSIFYING', subtitle: 'You can leave and return. Extraction is not complete until every stage says so.', cta: 'CONTINUE' },
    match: { kicker: 'CLIENT MIGRATION INTAKE', title: 'MATCH AND CONFLICT REVIEW', subtitle: 'Choose where these records belong. Nothing is overwritten yet.', cta: 'CONTINUE' },
    review: { kicker: 'CLIENT MIGRATION INTAKE', title: 'FOUNDER REVIEW', subtitle: 'Nothing is written to the profile until you approve.', cta: 'CONTINUE TO APPROVAL' },
    conflicts: { kicker: 'CLIENT MIGRATION INTAKE', title: 'ITEMS NEEDING REVIEW', subtitle: 'Current AIO values stay in place until you decide.', cta: 'CONTINUE' },
    approval: { kicker: 'CLIENT MIGRATION INTAKE', title: 'APPROVAL SUMMARY', subtitle: 'Approval prepares PREBUILT. It does not activate the client.', cta: 'APPROVE MIGRATION' },
    prebuilt: { kicker: 'CLIENT MIGRATION INTAKE', title: 'PREBUILT', subtitle: 'NOT ACTIVE YET. The office is prepared for confirmation.', cta: 'SEND ACTIVATION INVITE' },
    invite: { kicker: 'CLIENT ACTIVATION', title: 'SEND ACTIVATION INVITE', subtitle: 'A secure link is sent. No password is created.', cta: 'SEND INVITE' },
    invited: { kicker: 'CLIENT MIGRATION INTAKE', title: 'INVITE SENT', subtitle: 'CLIENT CONFIRMATION REQUIRED. The client is not active yet.', cta: 'VIEW INVITE DETAILS' },
    new: { kicker: 'CLIENT MIGRATION INTAKE', title: 'NEW CLIENT FILE', subtitle: 'Start a file for a business that is not an AIO client yet. This does not activate them.', cta: 'CONTINUE' },
    'new-received': { kicker: 'CLIENT MIGRATION INTAKE', title: 'FILES RECEIVED', subtitle: 'New client file. Receiving files does not make the client active.', cta: 'BEGIN EXTRACTION' },
    'new-extract': { kicker: 'CLIENT MIGRATION INTAKE', title: 'EXTRACTION AND CLASSIFICATION', subtitle: 'Progress is saved if you leave. This is not finished.', cta: 'CONTINUE' },
    'new-identity': { kicker: 'CLIENT MIGRATION INTAKE', title: 'BUSINESS IDENTITY REVIEW', subtitle: 'Confirm the new file. PREBUILT path, not active.', cta: 'CONTINUE' },
    'new-records': { kicker: 'CLIENT MIGRATION INTAKE', title: 'PEOPLE VEHICLES SERVICES DOCUMENTS', subtitle: 'Review only what is on this new file.', cta: 'CONTINUE' },
    'new-review': { kicker: 'CLIENT MIGRATION INTAKE', title: 'FOUNDER REVIEW', subtitle: 'Approval later creates PREBUILT, not an active client.', cta: 'CONTINUE TO APPROVAL' },
    'new-approval': { kicker: 'CLIENT MIGRATION INTAKE', title: 'APPROVAL SUMMARY', subtitle: 'Approve only this new file.', cta: 'APPROVE MIGRATION' },
    'new-prebuilt': { kicker: 'CLIENT MIGRATION INTAKE', title: 'PREBUILT', subtitle: 'NOT ACTIVE YET.', cta: 'SEND ACTIVATION INVITE' },
    'new-invite': { kicker: 'CLIENT ACTIVATION', title: 'SEND INVITE', subtitle: 'Secure link only. No password is sent.', cta: 'SEND INVITE' },
    'new-confirm': { kicker: 'CLIENT MIGRATION INTAKE', title: 'CLIENT CONFIRMATION REQUIRED', subtitle: 'NOT ACTIVE YET.', cta: 'CONTINUE' },
    batch: { kicker: 'CLIENT MIGRATION INTAKE', title: 'BULK BATCH MIGRATION', subtitle: 'Each client stays separately reviewable. The batch does not activate anyone.', cta: 'START BATCH' },
    'batch-received': { kicker: 'CLIENT MIGRATION INTAKE', title: 'BATCH FILES RECEIVED', subtitle: 'Receiving files does not activate any client.', cta: 'CONTINUE' },
    'batch-processing': { kicker: 'CLIENT MIGRATION INTAKE', title: 'PROCESSING AND CLIENT DETECTION', subtitle: 'Detection is in progress. You can leave and return.', cta: 'CONTINUE' },
    'batch-summary': { kicker: 'CLIENT MIGRATION INTAKE', title: 'DETECTION SUMMARY', subtitle: 'Matched, needs review, and unmatched stay in separate buckets.', cta: 'CONTINUE' },
    'batch-conflicts': { kicker: 'CLIENT MIGRATION INTAKE', title: 'DUPLICATES AND CONFLICTS', subtitle: 'Conflicts stay on the client they belong to.', cta: 'CONTINUE' },
    'batch-queue': { kicker: 'CLIENT MIGRATION INTAKE', title: 'PER-CLIENT REVIEW QUEUE', subtitle: 'Open one client at a time.', cta: 'CONTINUE' },
    'batch-client': { kicker: 'CLIENT MIGRATION INTAKE', title: 'CLIENT REVIEW DETAIL', subtitle: name, cta: 'CONTINUE' },
    'batch-approval': { kicker: 'CLIENT MIGRATION INTAKE', title: 'APPROVAL SUMMARY', subtitle: 'Ready, blocked, needs review, and unmatched are counted separately.', cta: 'CONTINUE' },
    'batch-run': { kicker: 'CLIENT MIGRATION INTAKE', title: 'PROCESSING APPROVED CLIENTS', subtitle: 'Only approved clients move to PREBUILT. None become active here.', cta: 'CONTINUE' },
    'batch-complete': { kicker: 'CLIENT MIGRATION INTAKE', title: 'BATCH COMPLETE', subtitle: 'No client becomes active because the batch finished.', cta: 'BACK TO INTAKE' },
  };
  return map[screen] ?? map.root;
}

function RootChoices({ onOpen }: { onOpen: (screen: string) => void }) {
  return (
    <>
      <div className="mig-paths">
        <button type="button" onClick={() => onOpen('existing')}><b>EXISTING CLIENT FILE</b><span>Import current records for a known client.</span></button>
        <button type="button" onClick={() => onOpen('new')}><b>NEW CLIENT FILE</b><span>Start a file for a business that is not a client yet.</span></button>
        <button type="button" onClick={() => onOpen('batch')}><b>BULK BATCH MIGRATION</b><span>Intake many files. Each client stays separate.</span></button>
      </div>
      <article className="mig-card">
        <h2>MIGRATION STATUS</h2>
        <ol className="mig-steps">
          {['UPLOAD', 'EXTRACT', 'CLASSIFY', 'VALIDATE', 'REVIEW', 'COMPLETE'].map((step, index) => <li key={step}><b>{index + 1}</b>{step}</li>)}
        </ol>
      </article>
      <article className="mig-note">Your files stay on this client’s migration. Starting a path does not activate a client.</article>
    </>
  );
}

function Identity({ client, plain }: { client: Client; plain?: boolean }) {
  return (
    <article className={plain ? '' : 'mig-card'}>
      {!plain ? <h2>CLIENT</h2> : null}
      <div className="mig-row"><b>{client.companyName}</b><span className="mig-pill mig-pill--alert">{isActiveLifecycle(client.clientLifecycle) ? 'ACTIVE' : 'NOT ACTIVE YET'}</span></div>
      <p className="mig-sub">{client.contactName}{client.contactEmail ? ` · ${client.contactEmail}` : ''}{client.customerNumber ? ` · ${client.customerNumber}` : ''} · {lifecycleLabel(client.clientLifecycle)}</p>
    </article>
  );
}

function UploadCard({ inputRef, files, onPick, onRemove }: { inputRef: RefObject<HTMLInputElement | null>; files: LocalFile[]; onPick: (list: FileList | null) => void; onRemove: (name: string) => void }) {
  return (
    <article className="mig-card">
      <h2>CLIENT FILE</h2>
      <div className="mig-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onPick(event.dataTransfer.files); }}>
        <p>Choose a file or drag and drop</p>
        <p className="mig-sub">PDF, JPG, PNG, WEBP</p>
        <button type="button" className="mig-chip mig-chip--gold" onClick={() => inputRef.current?.click()}>CHOOSE FILE</button>
      </div>
      {files.map((file) => (
        <div className="mig-row" key={file.name}>
          <span>{file.name}<br />{formatBytes(file.size)} · {file.reason ?? file.status}</span>
          <button type="button" className="mig-chip" onClick={() => onRemove(file.name)}>REMOVE</button>
        </div>
      ))}
    </article>
  );
}

function Received({ files, localFiles, batch, batchName, client }: { files: ReturnType<typeof getBatchFiles>; localFiles: LocalFile[]; batch?: { id: string; notes?: string; fileCount: number }; batchName: string; client?: Client }) {
  const accepted = files.length;
  const rejected = localFiles.filter((file) => file.status === 'unsupported');
  return (
    <>
      {client ? <Identity client={client} /> : null}
      <article className="mig-card">
        <h2>FILE SUMMARY</h2>
        <div className="mig-stat"><b>{accepted + localFiles.length}</b><span>files in this intake</span></div>
        <p className="mig-sub">{batch ? `Batch ${batch.notes || batchName} · ${batch.id}` : 'Batch opens when accepted files are stored.'}</p>
        {files.map((file) => <div className="mig-row" key={file.id}><span>{file.fileName}</span><span className="mig-pill">{file.processingState}</span></div>)}
        {rejected.map((file) => <div className="mig-row" key={file.name}><span>{file.name}</span><span className="mig-pill">{file.reason}</span></div>)}
      </article>
      <article className="mig-note">Receiving files does not make the client active.</article>
    </>
  );
}

function Stages({ files, batchState }: { files: ReturnType<typeof getBatchFiles>; batchState?: string }) {
  const uploaded = files.length > 0;
  const ready = files.every((file) => file.processingState === 'ready' || file.processingState === 'grouped') && uploaded;
  const stages = [
    ['UPLOAD', uploaded],
    ['EXTRACT', ready],
    ['CLASSIFY', batchState === 'ready_for_review' || batchState === 'reviewing' || batchState === 'completed'],
    ['MATCH', false],
    ['VALIDATE', false],
    ['PREPARE FOR REVIEW', batchState === 'ready_for_review'],
  ] as const;
  return (
    <article className="mig-card">
      <h2>PROGRESS</h2>
      {stages.map(([label, done]) => <div className="mig-row" key={label}><span>{label}</span><span className="mig-pill">{done ? 'DONE' : 'PENDING'}</span></div>)}
      <p className="mig-sub">Leave and come back. This screen does not claim the file is finished.</p>
    </article>
  );
}

function ReviewCards({ client, documents, onReview }: { client: Client; documents: number; onReview: (action: MigrationReviewAction | 'IGNORE') => void }) {
  const sections = [
    ['COMPANY', client.companyName],
    ['PEOPLE', client.contactName],
    ['VEHICLES', 'No vehicles stored on this record'],
    ['SERVICES', client.services.length ? client.services.join(', ') : 'No services stored on this record'],
    ['DOCUMENTS', `${documents} vault document${documents === 1 ? '' : 's'}`],
  ];
  return (
    <article className="mig-card">
      <h2>REVIEW</h2>
      {sections.map(([label, value]) => <div className="mig-row" key={label}><span><b>{label}</b><br />{value}</span></div>)}
      <div className="mig-actions">
        {REVIEW_ACTIONS.map((action) => <button key={action} type="button" className="mig-chip" onClick={() => onReview(action)}>{action.replaceAll('_', ' ')}</button>)}
      </div>
    </article>
  );
}

function Approval({ client, documents, conflicts, queue }: { client?: Client; documents: number; conflicts: number; queue: Client[] }) {
  const ready = Boolean(client) && conflicts === 0 && !isActiveLifecycle(client?.clientLifecycle);
  return (
    <article className="mig-card">
      <h2>{ready ? 'READY TO APPROVE' : 'ITEMS REMAINING'}</h2>
      <div className="mig-row"><span>BUSINESS PROFILE</span><span>{client?.companyName ?? 'Missing'}</span></div>
      <div className="mig-row"><span>VAULT / DOCUMENTS</span><span>{documents}</span></div>
      <div className="mig-row"><span>CLIENT REVIEW</span><span>{client?.clientReviewState ?? 'REQUIRED'}</span></div>
      <div className="mig-row"><span>CONFLICTS</span><span>{conflicts}</span></div>
      {queue.length > 1 ? <p className="mig-sub">{queue.filter((item) => item.clientLifecycle === 'PREBUILT').length} prebuilt · {queue.filter((item) => item.clientLifecycle === 'MIGRATION_REVIEW_REQUIRED').length} need review · {queue.filter((item) => !item.clientLifecycle || item.clientLifecycle === 'KNOWN_UNMIGRATED').length} unmatched</p> : null}
    </article>
  );
}

function Prebuilt({ client, documents }: { client: Client; documents: number }) {
  return (
    <article className="mig-card">
      <h2>PREBUILT · NOT ACTIVE YET</h2>
      <Identity client={client} plain />
      <div className="mig-row"><span>AIO CLIENT ID</span><b>{client.customerNumber ?? client.id}</b></div>
      <div className="mig-row"><span>OFFICE</span><span>{client.activationConditions?.officeProvisioningSucceeded ? 'Provisioned' : 'Prepared with approval'}</span></div>
      <div className="mig-row"><span>VAULT</span><span>{documents} document{documents === 1 ? '' : 's'}</span></div>
      <div className="mig-row"><span>CLIENT REVIEW</span><span>{client.clientReviewState ?? 'REQUIRED'}</span></div>
    </article>
  );
}

function Invite({ client }: { client: Client }) {
  return (
    <article className="mig-card">
      <h2>INVITE DETAILS</h2>
      <div className="mig-row"><span>DESTINATION EMAIL</span><b>{client.contactEmail}</b></div>
      <div className="mig-row"><span>PHONE</span><span>{client.contactPhone || 'No phone on record'}</span></div>
      <div className="mig-row"><span>ACTIVATION METHOD</span><span>Secure link. No password.</span></div>
      <div className="mig-row"><span>LINK EXPIRATION</span><span>72 hours</span></div>
    </article>
  );
}

function Invited({ client, active }: { client: Client; active: boolean }) {
  return (
    <article className="mig-card">
      <h2>{active ? 'ACTIVE' : 'NOT ACTIVE YET'}</h2>
      <p className="mig-sub">{client.companyName} · {lifecycleLabel(client.clientLifecycle)}</p>
      {['COMPANY', 'PEOPLE', 'VEHICLES', 'ACTIVE SERVICES', 'DOCUMENTS WE HAVE', 'WHAT CHANGED?'].map((item) => <div className="mig-row" key={item}><span>{item}</span></div>)}
    </article>
  );
}

function Buckets({ queue }: { queue: Client[] }) {
  const matched = queue.filter((item) => item.customerNumber || item.clientLifecycle === 'PREBUILT' || item.clientLifecycle === 'MIGRATION_IN_PROGRESS');
  const review = queue.filter((item) => item.clientLifecycle === 'MIGRATION_REVIEW_REQUIRED');
  const unmatched = queue.filter((item) => !matched.includes(item) && !review.includes(item));
  return (
    <article className="mig-card">
      <h2>DETECTION</h2>
      <div className="mig-row"><span>MATCHED</span><b>{matched.length}</b></div>
      <div className="mig-row"><span>NEEDS REVIEW</span><b>{review.length}</b></div>
      <div className="mig-row"><span>UNMATCHED</span><b>{unmatched.length}</b></div>
    </article>
  );
}

function BatchComplete({ queue }: { queue: Client[] }) {
  return (
    <article className="mig-card">
      <h2>PER-CLIENT OUTCOME</h2>
      {queue.length === 0 ? <p className="mig-sub">No clients were in this batch.</p> : queue.map((item) => (
        <div className="mig-row" key={item.id}>
          <span>{item.companyName}</span>
          <span className="mig-pill">{item.clientLifecycle === 'ACTIVE' ? 'ACTIVE' : item.clientLifecycle === 'PREBUILT' ? 'PREBUILT' : item.clientLifecycle === 'MIGRATION_REVIEW_REQUIRED' ? 'REVIEW REQUIRED' : 'UNMATCHED'}</span>
        </div>
      ))}
      <p className="mig-sub">PREBUILT is not active.</p>
    </article>
  );
}

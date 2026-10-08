import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { sendClientActivationInvite } from '../../demo/clientMigrationOfficeActions';
import { loadDemoStore, updateDemoStore } from '../../demo/demoStore';
import { useDemoStore } from '../../demo/useDemoStore';
import type { Client } from '../../demo/demoTypes';
import { getBatchFiles } from '../../demo/archiveMigrationActions';
import { createEmptyProfile } from '../../road-ready/roadReadyRules';
import { aioPaths } from '../../utils/paths';
import { validateUploadFile } from '../../vault/vaultStorage';
import { applyReviewActionToFact } from '../services/migrationCommitService';
import { approveMigrationBatchForOffice } from '../services/approveMigrationOfficeService';
import { createMigrationBatchForOffice, uploadFilesToMigrationBatch } from '../services/migrationIntakeService';
import { transitionClientLifecycle } from '../services/lifecycleEvents';
import type { ClientLifecycleState, MigrationReviewAction } from '../types';
import { AioMigrationCTA, AioMigrationHero, Ico, MigrationShell, type MigrationFamily } from './AioMigrationKit';
import { AioCard, AioFlow } from './AioMigrationModules';
import { MigrationExistingScreen, MigrationExtractScreen, MigrationReceivedScreen } from './MigrationExistingScreens';
import {
  INVITE_TTL_DAYS,
  MigrationApprovalScreen,
  MigrationConflictsScreen,
  MigrationInviteScreen,
  MigrationInvitedScreen,
  MigrationMatchScreen,
  MigrationPrebuiltScreen,
  MigrationReviewScreen,
  MigrationUploadScreen,
  type ConflictDecision,
  type LocalPick,
  type MatchChoice,
  type ReviewTarget,
} from './MigrationIntakeScreens';
import {
  NewApprovalScreen,
  NewClientFileScreen,
  NewConfirmScreen,
  NewExtractScreen,
  NewIdentityScreen,
  NewInviteScreen,
  NewPrebuiltScreen,
  NewReceivedScreen,
  NewRecordsScreen,
  NewReviewScreen,
  newExtractStages,
  type NewIdentity,
} from './MigrationNewScreens';
import {
  BatchApprovalScreen,
  BatchClientScreen,
  BatchCompleteScreen,
  BatchConflictsScreen,
  BatchIntakeScreen,
  BatchProcessingScreen,
  BatchQueueScreen,
  BatchReceivedScreen,
  BatchRunScreen,
  BatchSummaryScreen,
  batchStages,
  type DupDecision,
} from './MigrationBatchScreens';
import { MigrationRootScreen } from './MigrationRootScreen';
import { MIGRATION_HERO, heroStyle } from './migrationHero';
import { batchBucket, factSection, profileOf } from './migrationData';
import { clientIdentifiers, staffViewer } from './migrationViewer';

type LocalFile = LocalPick & { file?: File };

const EMPTY_IDENTITY: NewIdentity = { companyName: '', usdot: '', mc: '', ein: '', contactName: '' };

function isActiveLifecycle(state: ClientLifecycleState | undefined): boolean {
  return state === 'ACTIVE';
}

/** Screens that need an open client file (?client=). */
const NEEDS_CLIENT = new Set([
  'upload',
  'received',
  'extract',
  'match',
  'review',
  'conflicts',
  'approval',
  'prebuilt',
  'invite',
  'invited',
  'new-received',
  'new-extract',
  'new-identity',
  'new-records',
  'new-review',
  'new-approval',
  'new-prebuilt',
  'new-invite',
  'new-confirm',
  'batch-client',
]);

const CONFLICT_ACTION: Record<ConflictDecision, MigrationReviewAction> = {
  KEEP: 'REJECT',
  USE: 'CONFIRM',
  CLIENT: 'NEEDS_CLIENT_CONFIRMATION',
};

const DUP_ACTION: Partial<Record<DupDecision, MigrationReviewAction>> = {
  MERGE: 'MATCH_TO_EXISTING',
  SEPARATE: 'CREATE_NEW_CLIENT',
};

export function MigrationStudioPage() {
  const { screen = 'root' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const store = useDemoStore();
  const { session } = useAIOAuth();
  const staffId = session?.user.id ?? store.officeStaffId ?? 'staff-2';
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(() => params.get('q') ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [batchName, setBatchName] = useState('');
  const [matchChoice, setMatchChoice] = useState<MatchChoice | null>(null);
  const [draft, setDraft] = useState<NewIdentity>(EMPTY_IDENTITY);
  const [identity, setIdentity] = useState<NewIdentity>(EMPTY_IDENTITY);
  const [applied, setApplied] = useState<Partial<Record<ReviewTarget, MigrationReviewAction | 'IGNORE'>>>({});
  const [decisions, setDecisions] = useState<Record<string, ConflictDecision>>({});
  const [dupDecisions, setDupDecisions] = useState<Record<string, DupDecision>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const clientId = params.get('client') ?? '';
  const client = store.clients.find((item) => item.id === clientId);
  const batches = (store.archiveMigrationBatches ?? []).filter((batch) => !clientId || batch.clientId === clientId);
  const batch = batches[0];
  const files = batch ? getBatchFiles(batch.id, store) : [];
  const facts = (store.clientExtractedFacts ?? []).filter((fact) => (batch ? fact.batchId === batch.id : fact.organizationId === clientId));
  const conflicts = facts.filter((fact) => fact.confidence === 'CONFLICT' && !fact.reviewAction);

  const filteredClients = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return store.clients.filter((item) => {
      if (!needle) return true;
      return [item.companyName, item.contactName, item.contactEmail, item.customerNumber, item.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [query, store.clients]);

  // Batch queue: clients with a migration batch in this intake (named batch when one is given).
  const batchClients = store.clients.filter((item) =>
    (store.archiveMigrationBatches ?? []).some((row) => row.clientId === item.id && (!batchName || row.notes === batchName || !row.notes)),
  );
  const queue = batchClients.length ? batchClients : client ? [client] : [];
  const queueIds = new Set(queue.map((c) => c.id));
  const queueFiles = (store.archiveMigrationBatchFiles ?? []).filter((f) => queueIds.has(f.organizationId));
  const queueConflicts = (store.clientExtractedFacts ?? []).filter((f) => queueIds.has(f.organizationId) && f.confidence === 'CONFLICT' && !f.reviewAction);
  const blocked = new Set(queueConflicts.map((f) => f.organizationId));
  const queueBatch = (store.archiveMigrationBatches ?? []).find((b) => queueIds.has(b.clientId) && (!batchName || b.notes === batchName));

  // Business identity review starts from the record (new client file → client + Road Ready profile).
  useEffect(() => {
    if (screen !== 'new-identity' || !client) return;
    const profile = profileOf(loadDemoStore(), client.id);
    setIdentity({
      companyName: profile?.business?.legalName || client.companyName,
      usdot: profile?.authority?.usdotNumber ?? '',
      mc: profile?.authority?.mcNumber ?? '',
      ein: profile?.business?.ein ?? '',
      contactName: client.contactName === 'Primary contact' ? '' : client.contactName,
    });
  }, [screen, client?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Header search (desktop) lands on the existing-client finder with ?q=.
  const searchParam = params.get('q');
  useEffect(() => {
    if (searchParam !== null) setQuery(searchParam);
  }, [searchParam]);

  useEffect(() => {
    if (screen !== 'new-invite' && screen !== 'invite') return;
    setSentUrl(null);
    const email = client?.contactEmail ?? '';
    setInviteEmail(email === 'pending@example.com' ? '' : email);
  }, [screen, client?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function go(next: string, nextClient = clientId) {
    const search = nextClient ? `?client=${encodeURIComponent(nextClient)}` : '';
    navigate(`${aioPaths.officeMigration(next === 'root' ? undefined : next)}${search}`);
    setMessage(null);
  }

  function onPickFiles(list: FileList | File[] | null) {
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
    setLocalFiles((current) => [...current.filter((item) => !next.some((n) => n.name === item.name)), ...next]);
  }

  const removeLocal = (name: string) => setLocalFiles((current) => current.filter((item) => item.name !== name));

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

  /** New client file: client record + Road Ready profile holding USDOT / MC. Not active. */
  function createDraftClient(): string {
    const companyName = draft.companyName.trim();
    if (!companyName) throw new Error('Company name is required');
    const id = `mig-${crypto.randomUUID()}`;
    const record: Client = {
      id,
      companyName,
      contactName: draft.contactName.trim() || 'Primary contact',
      contactEmail: 'pending@example.com',
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
      const profile = createEmptyProfile(id, companyName);
      if (draft.usdot.trim()) profile.authority = { ...profile.authority, usdot: 'yes', usdotNumber: draft.usdot.trim() };
      if (draft.mc.trim()) profile.authority = { ...profile.authority, mc: 'yes', mcNumber: draft.mc.trim() };
      current.roadReadyProfiles = [...(current.roadReadyProfiles ?? []), profile];
      return transitionClientLifecycle(current, id, 'INTAKE_IN_PROGRESS', 'NEW_CLIENT_INTAKE', 'STAFF', staffId);
    });
    return id;
  }

  function saveIdentity(organizationId: string) {
    const name = identity.companyName.trim();
    if (!name) throw new Error('Company name is required');
    updateDemoStore((current) => {
      const record = current.clients.find((item) => item.id === organizationId);
      if (record) {
        record.companyName = name;
        if (identity.contactName.trim()) record.contactName = identity.contactName.trim();
      }
      let profile = (current.roadReadyProfiles ?? []).find((p) => p.organizationId === organizationId);
      if (!profile) {
        profile = createEmptyProfile(organizationId, name);
        current.roadReadyProfiles = [...(current.roadReadyProfiles ?? []), profile];
      }
      profile.business = { ...profile.business, legalName: name, ...(identity.ein.trim() ? { ein: identity.ein.trim(), einStatus: 'yes' as const } : {}) };
      profile.authority = {
        ...profile.authority,
        ...(identity.usdot.trim() ? { usdot: 'yes' as const, usdotNumber: identity.usdot.trim() } : {}),
        ...(identity.mc.trim() ? { mc: 'yes' as const, mcNumber: identity.mc.trim() } : {}),
      };
      profile.updatedAt = new Date().toISOString();
      return current;
    });
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
        const organizationId = screen === 'new' ? clientId || createDraftClient() : clientId;
        if (!organizationId) throw new Error('Select a client');
        if (screen === 'upload') await storeAcceptedFiles(organizationId);
        go(screen === 'new' ? 'new-received' : 'received', organizationId);
        return;
      }
      if (screen === 'new-received' || screen === 'received') {
        // Store newly chosen files; files already on the batch are enough to begin extraction.
        if (clientId && localFiles.some((item) => item.file)) await storeAcceptedFiles(clientId);
        else if (!files.length) throw new Error('Add at least one PDF, JPG, PNG, or WEBP file');
        go(screen === 'new-received' ? 'new-extract' : 'extract');
        return;
      }
      if (screen === 'extract' && !extractionReady(files, batch?.state)) {
        go('root', '');
        return;
      }
      if (screen === 'extract' || screen === 'new-extract') {
        go(screen === 'new-extract' ? 'new-identity' : 'match');
        return;
      }
      if (screen === 'new-identity') {
        if (!clientId) throw new Error('Open the new client file first');
        saveIdentity(clientId);
        go('new-records');
      } else if (screen === 'new-records') go('new-review');
      else if (screen === 'new-review') go('new-approval');
      else if (screen === 'match') {
        if (matchChoice === 'review' || !matchChoice) throw new Error('Resolve the match before review');
        go('review');
      } else if (screen === 'review') go('conflicts');
      else if (screen === 'conflicts') {
        saveConflictDecisions();
        go('approval');
      } else if (screen === 'approval' || screen === 'new-approval') await approveCurrent(screen === 'new-approval' ? 'new-prebuilt' : 'prebuilt');
      else if (screen === 'prebuilt' || screen === 'new-prebuilt') go(screen === 'new-prebuilt' ? 'new-invite' : 'invite');
      else if (screen === 'invite' || screen === 'new-invite') await sendInvite(screen === 'new-invite' ? 'new-confirm' : 'invited');
      else if (screen === 'invited') go('invite');
      else if (screen === 'new-confirm' || screen === 'batch-complete') go('root', '');
      else if (screen === 'batch') go('batch-received');
      else if (screen === 'batch-received') {
        if (localFiles.some((item) => item.file)) {
          if (!clientId) throw new Error('Open one client before storing batch files');
          await storeAcceptedFiles(clientId);
        }
        go('batch-processing');
      } else if (screen === 'batch-processing') go('batch-summary');
      else if (screen === 'batch-summary') go('batch-conflicts');
      else if (screen === 'batch-conflicts') {
        saveDupDecisions();
        go('batch-queue');
      } else if (screen === 'batch-queue') go('batch-client', queue[0]?.id ?? clientId);
      else if (screen === 'batch-client') go('batch-approval');
      else if (screen === 'batch-approval') go('batch-run');
      else if (screen === 'batch-run') await runApprovedClients();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not continue');
    } finally {
      setBusy(false);
    }
  }

  function saveConflictDecisions() {
    const chosen = Object.entries(decisions).filter(([id]) => conflicts.some((f) => f.id === id));
    if (!chosen.length) return;
    updateDemoStore((current) => {
      let next = current;
      for (const [id, decision] of chosen) next = applyReviewActionToFact(next, id, CONFLICT_ACTION[decision], staffId);
      return next;
    });
    setDecisions({});
  }

  function saveDupDecisions() {
    const chosen = Object.entries(dupDecisions).flatMap(([id, d]) => (DUP_ACTION[d] && queueConflicts.some((f) => f.id === id) ? [[id, DUP_ACTION[d]!] as const] : []));
    if (!chosen.length) return;
    updateDemoStore((current) => {
      let next = current;
      for (const [id, action] of chosen) next = applyReviewActionToFact(next, id, action, staffId);
      return next;
    });
    setDupDecisions({});
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
    const email = (screen === 'new-invite' ? inviteEmail : client.contactEmail).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email === 'pending@example.com') throw new Error('Enter the client’s email address');
    if (email !== client.contactEmail) {
      updateDemoStore((current) => {
        const record = current.clients.find((item) => item.id === client.id);
        if (record) record.contactEmail = email;
        return current;
      });
    }
    const sent = await sendClientActivationInvite(client.id, email, staffId);
    if (sent.error && !sent.activationUrl) throw new Error(sent.error);
    const updated = loadDemoStore().clients.find((item) => item.id === client.id);
    if (isActiveLifecycle(updated?.clientLifecycle)) throw new Error('Invite incorrectly marked the client ACTIVE');
    if (sent.error) {
      // Invite exists but email delivery failed: stay here with the link so staff can copy it.
      setSentUrl(sent.activationUrl);
      setMessage(sent.error);
      return;
    }
    go(next);
  }

  /** PROCESS APPROVED CLIENTS: matched clients without open conflicts move to PREBUILT, one by one. None become ACTIVE. */
  async function runApprovedClients() {
    const approved = queue.filter((c) => batchBucket(c) === 'READY' && !blocked.has(c.id) && c.clientLifecycle !== 'PREBUILT' && !isActiveLifecycle(c.clientLifecycle));
    const failed: string[] = [];
    for (const c of approved) {
      const row = (loadDemoStore().archiveMigrationBatches ?? []).find((b) => b.clientId === c.id);
      if (!row) {
        failed.push(`${c.companyName}: no files`);
        continue;
      }
      const result = await approveMigrationBatchForOffice({ batchId: row.id, staffId, matchResolved: true });
      if (!result.ok) failed.push(`${c.companyName}: ${result.error ?? 'approval failed'}`);
    }
    go('batch-complete');
    if (failed.length) setMessage(`${approved.length - failed.length} of ${approved.length} moved to PREBUILT. ${failed.join(' · ')}`);
  }

  function onSectionAction(target: ReviewTarget, action: MigrationReviewAction | 'IGNORE') {
    setApplied((current) => ({ ...current, [target]: action }));
    if (action === 'IGNORE') {
      setMessage('Ignored for this review. The profile was not changed.');
      return;
    }
    const scope = facts.filter((f) => (target === 'CONFLICTS' ? f.confidence === 'CONFLICT' : factSection(f) === target && f.confidence !== 'CONFLICT'));
    if (!scope.length) {
      setMessage(`No extracted ${target.toLowerCase()} facts are on this file. Nothing was written to the profile.`);
      return;
    }
    setMessage(null);
    updateDemoStore((current) => {
      let next = current;
      for (const fact of scope) next = applyReviewActionToFact(next, fact.id, action, staffId);
      return next;
    });
  }

  const representative = REPRESENTATIVE.has(screen);
  const family: MigrationFamily = screen === 'root' || screen.startsWith('new') || screen.startsWith('batch') ? 'root' : 'existing';
  const spec = MIGRATION_HERO[screen];
  const authority = AUTHORITY_HERO[screen];
  const viewer = staffViewer(store, session?.user.id);
  const ids = clientIdentifiers(store, client);
  const missingClient = NEEDS_CLIENT.has(screen) && !client;
  const ctaLabel = screen === 'extract' ? (extractionReady(files, batch?.state) ? 'CONTINUE' : 'VIEW IN BACKGROUND') : CTA[screen] ?? 'CONTINUE';
  const cta = (label = ctaLabel, lead?: ReactNode): ReactNode => (
    <>
      {message ? <p className="amg-msg">{message}</p> : null}
      <AioMigrationCTA label={label} onClick={() => void onContinue()} disabled={busy} lead={lead} />
    </>
  );
  const newDone = newExtractStages(files, batch, facts);
  const queueDone = batchStages(queueFiles, queueConflicts.length);

  return (
    <MigrationShell family={family} actor="staff" screen={screen} viewer={viewer}>
        {authority ? (
          <AioMigrationHero kicker={authority.kicker} title={authority.title} subtitle={authority.sub.map((line) => <span key={line} className="amg-line">{line}</span>)} />
        ) : spec ? (
          <AioMigrationHero
            kicker={spec.kicker}
            title={spec.title}
            accent={spec.accent}
            accentBox={spec.accentBox}
            goldLines={spec.gold}
            thinLines={spec.thin}
            subtitle={spec.sub.length ? spec.sub.map((line) => <span key={line} className="amg-line">{line}</span>) : undefined}
            style={heroStyle(spec.m)}
          />
        ) : null}

        {screen === 'root' ? <MigrationRootScreen onOpen={go} /> : null}
        {screen === 'existing' ? (
          <MigrationExistingScreen
            clients={filteredClients}
            selectedId={clientId}
            query={query}
            onQuery={setQuery}
            identifiers={(item) => clientIdentifiers(store, item)}
            onSelect={(id) => go('existing', id)}
            onAddManually={() => go('new', '')}
          />
        ) : null}
        {screen === 'extract' && client ? (
          <MigrationExtractScreen client={client} identifiers={ids} files={files} batch={batch} onActivity={batch ? () => navigate(aioPaths.officeArchiveMigrationBatch(batch.id)) : undefined} />
        ) : null}
        {screen === 'received' && client ? (
          <MigrationReceivedScreen client={client} identifiers={ids} stored={files} local={localFiles} onAdd={() => inputRef.current?.click()} onRemoveLocal={removeLocal} />
        ) : null}
        {representative ? (
          <>
            {missingClient ? <p className="amg-msg">Open an existing client file first.</p> : null}
            {message ? <p className="amg-msg">{message}</p> : null}
            <AioMigrationCTA label={ctaLabel} onClick={() => void onContinue()} disabled={busy} />
          </>
        ) : null}

        {!representative && missingClient ? (
          <AioFlow top={spec?.top ?? 470} gap={16}>
            <AioCard className="amg-missing">
              <p>Open a client file first. This screen works on one client at a time.</p>
            </AioCard>
            <AioMigrationCTA label="OPEN EXISTING CLIENT FILE" onClick={() => go('existing', '')} />
          </AioFlow>
        ) : null}

        {!missingClient && client && screen === 'upload' ? (
          <MigrationUploadScreen client={client} ids={ids} stored={files} local={localFiles} inputRef={inputRef} onFiles={onPickFiles} onRemoveLocal={removeLocal} cta={cta()} />
        ) : null}
        {!missingClient && client && screen === 'match' ? (
          <MigrationMatchScreen store={store} client={client} conflicts={conflicts} batch={batch} choice={matchChoice} onChoice={setMatchChoice} onReviewConflicts={() => go('conflicts')} cta={cta()} />
        ) : null}
        {!missingClient && client && screen === 'review' ? <MigrationReviewScreen store={store} client={client} ids={ids} facts={facts} applied={applied} onAction={onSectionAction} cta={cta()} /> : null}
        {!missingClient && client && screen === 'conflicts' ? (
          <MigrationConflictsScreen
            store={store}
            client={client}
            ids={ids}
            conflicts={conflicts}
            decisions={decisions}
            onDecide={(id, d) => setDecisions((current) => ({ ...current, [id]: d }))}
            onChangeClient={() => go('existing', '')}
            cta={cta(conflicts.length ? 'SAVE DECISIONS' : 'CONTINUE')}
          />
        ) : null}
        {!missingClient && client && screen === 'approval' ? <MigrationApprovalScreen store={store} client={client} ids={ids} conflicts={conflicts.length} storedFiles={files.length} cta={cta()} /> : null}
        {!missingClient && client && screen === 'prebuilt' ? <MigrationPrebuiltScreen store={store} client={client} ids={ids} cta={cta(undefined, <Ico name="send" className="amg-cta__lead" />)} /> : null}
        {!missingClient && client && screen === 'invite' ? <MigrationInviteScreen client={client} ids={ids} sentUrl={sentUrl} cta={cta()} /> : null}
        {!missingClient && client && screen === 'invited' ? <MigrationInvitedScreen client={client} ids={ids} cta={cta()} /> : null}

        {screen === 'new' ? (
          <NewClientFileScreen draft={draft} onDraft={setDraft} local={localFiles} inputRef={inputRef} onFiles={onPickFiles} onRemoveLocal={removeLocal} cta={cta()} />
        ) : null}
        {!missingClient && screen === 'new-received' ? <NewReceivedScreen stored={files} local={localFiles} cta={cta()} /> : null}
        {!missingClient && screen === 'new-extract' ? <NewExtractScreen done={newDone} cta={newDone.every(Boolean) ? cta() : message ? <p className="amg-msg">{message}</p> : null} /> : null}
        {!missingClient && screen === 'new-identity' ? <NewIdentityScreen identity={identity} onIdentity={setIdentity} cta={cta()} /> : null}
        {!missingClient && client && screen === 'new-records' ? <NewRecordsScreen store={store} client={client} storedFiles={files} applied={applied} onAction={onSectionAction} cta={cta()} /> : null}
        {!missingClient && screen === 'new-review' ? <NewReviewScreen applied={applied} onAction={onSectionAction} cta={cta()} /> : null}
        {!missingClient && client && screen === 'new-approval' ? (
          <NewApprovalScreen client={client} hasIds={ids.some((id) => id.startsWith('USDOT') || id.startsWith('MC'))} storedFiles={files.length} facts={facts} cta={cta()} />
        ) : null}
        {!missingClient && client && screen === 'new-prebuilt' ? <NewPrebuiltScreen store={store} client={client} cta={cta()} /> : null}
        {!missingClient && screen === 'new-invite' ? (
          <NewInviteScreen email={inviteEmail} onEmail={setInviteEmail} sentUrl={sentUrl} expiresAt={new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000)} cta={cta()} />
        ) : null}
        {!missingClient && client && screen === 'new-confirm' ? <NewConfirmScreen client={client} cta={cta()} /> : null}

        {screen === 'batch' ? (
          <BatchIntakeScreen batchName={batchName} onBatchName={setBatchName} batchId={queueBatch?.id} local={localFiles} inputRef={inputRef} onFiles={onPickFiles} onRemoveLocal={removeLocal} cta={cta()} />
        ) : null}
        {screen === 'batch-received' ? <BatchReceivedScreen batchName={batchName || queueBatch?.notes || ''} batchId={queueBatch?.id} fileCount={queueFiles.length + localFiles.length} clientCount={queue.length} cta={cta()} /> : null}
        {screen === 'batch-processing' ? (
          <BatchProcessingScreen batchName={batchName || queueBatch?.notes || ''} batchId={queueBatch?.id} done={queueDone} cta={queueDone.every(Boolean) ? cta() : message ? <p className="amg-msg">{message}</p> : null} />
        ) : null}
        {screen === 'batch-summary' ? <BatchSummaryScreen queue={queue} finished={queueDone.every(Boolean)} cta={cta()} /> : null}
        {screen === 'batch-conflicts' ? (
          <BatchConflictsScreen store={store} conflicts={queueConflicts} decisions={dupDecisions} onDecide={(id, d) => setDupDecisions((current) => ({ ...current, [id]: d }))} cta={cta()} />
        ) : null}
        {screen === 'batch-queue' ? <BatchQueueScreen store={store} queue={queue} onOpen={(id) => go('batch-client', id)} cta={cta()} /> : null}
        {!missingClient && client && screen === 'batch-client' ? <BatchClientScreen store={store} client={client} cta={cta()} /> : null}
        {screen === 'batch-approval' ? <BatchApprovalScreen queue={queue} blocked={blocked} onOpenQueue={() => go('batch-queue')} cta={cta()} /> : null}
        {screen === 'batch-run' ? (
          <BatchRunScreen approved={queue.filter((c) => batchBucket(c) === 'READY' && !blocked.has(c.id) && !isActiveLifecycle(c.clientLifecycle)).length} cta={cta()} />
        ) : null}
        {screen === 'batch-complete' ? <BatchCompleteScreen queue={queue} failedFiles={queueFiles.filter((f) => f.processingState === 'failed').length} cta={cta()} /> : null}

        <input ref={inputRef} className="amg-file-input" type="file" multiple onChange={(event) => { onPickFiles(event.target.files); event.target.value = ''; }} />
    </MigrationShell>
  );
}

/** The six representatives (RECOVERY1) keep their pixel-locked renderers; every other screen uses the module flow. */
const REPRESENTATIVE = new Set(['root', 'existing', 'extract', 'received']);

/** CTA labels as drawn on each authority. */
const CTA: Record<string, string> = {
  root: 'START MIGRATION',
  received: 'BEGIN EXTRACTION',
  review: 'CONTINUE TO APPROVAL',
  approval: 'APPROVE MIGRATION',
  prebuilt: 'SEND ACTIVATION INVITE',
  invite: 'SEND INVITE',
  invited: 'VIEW INVITE DETAILS',
  'new-received': 'BEGIN EXTRACTION',
  'new-review': 'CONTINUE TO APPROVAL',
  'new-approval': 'APPROVE MIGRATION',
  'new-prebuilt': 'SEND ACTIVATION INVITE',
  'new-invite': 'SEND INVITE',
  batch: 'START BATCH',
  'batch-run': 'PROCESS APPROVED CLIENTS',
  'batch-complete': 'BACK TO INTAKE',
};

/** Authority copy for the representative screens (line breaks as drawn). */
const AUTHORITY_HERO: Record<string, { kicker: string; title: string[]; sub: string[] }> = {
  root: {
    kicker: 'CLIENT MIGRATION INTAKE',
    title: ['BRING YOUR', 'DATA TO AIO'],
    sub: ['Let’s get your existing records into AIO', 'so you can manage everything in one', 'secure place.'],
  },
  existing: {
    kicker: 'CLIENT MIGRATION INTAKE',
    title: ['EXISTING', 'CLIENT FILE'],
    sub: ['Bring your current AIO client records', 'into the new system. We’ll preserve', 'your data and keep everything organized.'],
  },
  extract: {
    kicker: 'CLIENT MIGRATION INTAKE',
    title: ['EXTRACTING', 'AND CLASSIFYING'],
    sub: ['We’re extracting your client records', 'and automatically classifying the data', 'for a smooth migration.'],
  },
  received: {
    kicker: 'CLIENT MIGRATION INTAKE',
    title: ['FILES RECEIVED'],
    sub: ['We’ve received your client files.', 'Review them below and make sure', 'everything looks good before', 'we begin extraction.'],
  },
};

function extractionReady(files: ReturnType<typeof getBatchFiles>, batchState?: string): boolean {
  return files.length > 0 && files.every((file) => file.processingState === 'ready' || file.processingState === 'grouped') && (batchState === 'ready_for_review' || batchState === 'reviewing' || batchState === 'completed');
}

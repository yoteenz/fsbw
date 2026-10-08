/**
 * Bulk batch branch (AIO-MIG-BULK-001, AIO-MIG-BATCH-*-001). Staff actor, root family environment.
 * Counts come from the clients that have migration batches in this intake (the batch queue); nothing is activated here.
 */
import type { ReactNode, RefObject } from 'react';
import { Link } from 'react-router-dom';
import type { Client, DemoStore } from '../../demo/demoTypes';
import type { ArchiveMigrationBatchFile } from '../../vault/archiveMigrationTypes';
import { aioPaths } from '../../utils/paths';
import type { ExtractedFactRecord } from '../types';
import { Ico, type IcoName } from './AioMigrationKit';
import { AioAside, AioCallout, AioCard, AioCardHead, AioChip, AioDisc, AioDiscHead, AioDrop, AioField, AioFlow, AioRow, AioRows, AioStat, AioStrip } from './AioMigrationModules';
import { UploadedFiles, type LocalPick } from './MigrationIntakeScreens';
import { acceptedTypeLabels, batchBucket, batchFilesFor, fieldLabel, fileTone, formatDay, isActive, plural, type BatchBucket } from './migrationData';
import { clientIdentifiers } from './migrationViewer';

const NOT_ACTIVATED = 'Each client remains separately reviewable and is not activated by the batch.';

function TypeRow() {
  return (
    <div className="amg-typerow">
      <span>Supported file types:</span>
      {acceptedTypeLabels().map((type) => {
        const t = fileTone(`x.${type.toLowerCase()}`);
        return (
          <span key={type} className="amg-typerow__t">
            <span className={`amg-tglyph amg-tglyph--${t.tone}`} aria-hidden="true">
              <Ico name={t.icon} />
            </span>
            {type}
          </span>
        );
      })}
    </div>
  );
}

/* ───────── BULK BATCH MIGRATION ───────── */
export function BatchIntakeScreen({
  batchName,
  onBatchName,
  batchId,
  local,
  inputRef,
  onFiles,
  onRemoveLocal,
  cta,
}: {
  batchName: string;
  onBatchName: (value: string) => void;
  batchId?: string;
  local: LocalPick[];
  inputRef: RefObject<HTMLInputElement | null>;
  onFiles: (files: File[]) => void;
  onRemoveLocal: (name: string) => void;
  cta: ReactNode;
}) {
  return (
    <AioFlow top={466} gap={16} className="amg-bulk">
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={1} title="BATCH" sub="Give your batch a name and we’ll generate an ID." />
        <div className="amg-fields" style={{ ['--fc' as string]: 1 }}>
          <AioField label="BATCH NAME" value={batchName} onChange={onBatchName} placeholder="e.g. Q1 2025 Clients" />
          <AioField label="BATCH ID" value={batchId ?? ''} readOnly placeholder="Assigned when the first file is stored" />
        </div>
      </AioCard>
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={2} title="FOLDER OR MULTI-FILE UPLOAD" sub="Select a folder or multiple files to add to this batch." />
        <AioDrop icon="deploy" title="Drag and drop files or a folder here" button="Choose Files" onFiles={onFiles} inputRef={inputRef} className="amg-drop--compact" />
        <TypeRow />
        {local.length ? <UploadedFiles stored={[]} local={local} onRemoveLocal={onRemoveLocal} /> : null}
      </AioCard>
      {/* founder note (2026-10-08): on a wide desktop, CLIENT DETECTION stands in the right column above START BATCH */}
      <AioAside>
        <AioCard className="amg-bulk__card amg-bulk__detect">
          <AioDiscHead num={3} title="CLIENT DETECTION" sub="We’ll scan your files and match them to existing clients." />
          <div className="amg-stats amg-detect" style={{ ['--n' as string]: 3 }}>
            <AioStat icon="check" tone="green" value="MATCHED" label="" sub="Will be linked to existing clients." />
            <AioStat icon="alert-mark" tone="gold" value="NEEDS REVIEW" label="" sub="Requires manual review." />
            <AioStat icon="x" tone="red" value="UNMATCHED" label="" sub="New clients will be identified." />
          </div>
          <AioStrip>{NOT_ACTIVATED}</AioStrip>
        </AioCard>
      </AioAside>
      {cta}
    </AioFlow>
  );
}

/* ───────── BATCH FILES RECEIVED ───────── */
export function BatchReceivedScreen({ batchName, batchId, fileCount, clientCount, cta }: { batchName: string; batchId?: string; fileCount: number; clientCount: number; cta: ReactNode }) {
  return (
    <AioFlow top={480} gap={16} className="amg-brx">
      <AioCard className="amg-brx__id">
        <AioDisc tone="gold" icon="summary" className="amg-brx__disc" />
        <div className="amg-brx__lv">
          <div className="amg-lv">
            <small>BATCH NAME</small>
            <b className="amg-brx__name">{batchName || 'Unnamed batch'}</b>
          </div>
          <hr className="amg-rule" />
          <div className="amg-lv">
            <small>BATCH ID</small>
            <b className="amg-brx__bid">{batchId ?? 'Assigned when the first file is stored'}</b>
          </div>
        </div>
      </AioCard>
      <div className="amg-grid amg-brx__counts">
        <AioStat className="is-lv amg-brx__stat" icon="summary" label="FILE COUNT" value={fileCount} sub={fileCount === 1 ? 'file received' : 'files received'} />
        <AioStat className="is-lv amg-brx__stat" icon="people" label="DETECTED CLIENT COUNT" value={clientCount} sub={clientCount === 1 ? 'client identified' : 'clients identified'} />
      </div>
      <AioStrip title="Note: Receiving files does not activate any client." className="amg-strip--big">
        Each client remains separately reviewable and must be activated individually.
      </AioStrip>
      {cta}
    </AioFlow>
  );
}

/* ───────── PROCESSING AND CLIENT DETECTION ───────── */
const H_STAGES: Array<{ label: string; icon: IcoName; text: string }> = [
  { label: 'EXTRACT', icon: 'summary', text: 'Reading files and extracting data…' },
  { label: 'CLASSIFY', icon: 'tag', text: 'Identifying file types and categorizing data.' },
  { label: 'MATCH', icon: 'people', text: 'Comparing to existing clients.' },
  { label: 'VALIDATE', icon: 'shield-check', text: 'Reviewing results for accuracy.' },
];

/**
 * Processing stages finish when every file is processed. Duplicates and conflicts are a result of detection (counted on
 * DETECTION SUMMARY, decided on DUPLICATES AND CONFLICTS after it), so they do not hold VALIDATE open.
 */
export function batchStages(files: ArchiveMigrationBatchFile[]): boolean[] {
  const any = files.length > 0;
  const extracted = any && files.every((f) => f.processingState === 'ready' || f.processingState === 'grouped' || f.processingState === 'failed');
  return [extracted, extracted, extracted, extracted];
}

export function BatchProcessingScreen({ batchName, batchId, done, cta }: { batchName: string; batchId?: string; done: boolean[]; cta: ReactNode | null }) {
  const current = done.findIndex((d) => !d);
  const finished = current === -1;
  return (
    <AioFlow top={467} gap={16} className="amg-bproc">
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={1} title="BATCH INFORMATION" sub="Your batch is being processed. Details below." />
        <div className="amg-fields" style={{ ['--fc' as string]: 1 }}>
          <AioField label="BATCH NAME" value={batchName} readOnly placeholder="Unnamed batch" />
          <AioField label="BATCH ID" value={batchId ?? ''} readOnly placeholder="Assigned when the first file is stored" />
        </div>
      </AioCard>
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={2} title="PROCESSING STAGES" sub="We’ll update each stage as your files are processed." />
        <ol className="amg-hstages">
          {H_STAGES.map((stage, i) => {
            const state = done[i] ? 'done' : i === current ? 'current' : 'todo';
            return (
              <li key={stage.label} className={`amg-hstage is-${state}`}>
                <span className="amg-hstage__disc" aria-hidden="true">
                  <Ico name={state === 'done' ? 'check' : stage.icon} />
                </span>
                <b>{stage.label}</b>
                <span className="amg-hstage__state">{state === 'done' ? 'Complete' : state === 'current' ? 'In progress' : 'Pending'}</span>
                <span className="amg-hstage__text">{stage.text}</span>
              </li>
            );
          })}
        </ol>
      </AioCard>
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={3} title="YOU CAN LEAVE AND RETURN" sub="This process may take a few minutes. You can safely leave this screen and come back later — your batch will continue processing in the background." />
        <AioStrip tone="blue" title={finished ? 'Client detection is finished.' : 'Client detection is not finished.'} className="amg-strip--big amg-strip--disc">
          {finished ? 'Processing is complete and ready for review.' : 'We’ll notify you when processing is complete and ready for review.'}
        </AioStrip>
      </AioCard>
      {cta}
    </AioFlow>
  );
}

/* ───────── DETECTION SUMMARY ───────── */
export function bucketCounts(queue: Client[]): Record<BatchBucket, number> {
  const counts: Record<BatchBucket, number> = { READY: 0, NEEDS_REVIEW: 0, UNMATCHED: 0 };
  for (const client of queue) counts[batchBucket(client)] += 1;
  return counts;
}

export function BatchSummaryScreen({ queue, finished, cta }: { queue: Client[]; finished: boolean; cta: ReactNode }) {
  const counts = bucketCounts(queue);
  return (
    <AioFlow top={483} gap={0} className="amg-bsum">
      <AioCard className="amg-bsum__card">
        <AioDiscHead num={1} title={finished ? 'SCAN COMPLETE' : 'SCAN IN PROGRESS'} sub={finished ? 'We’ve analyzed your files and organized the results below.' : 'Results so far. Detection is still running.'} />
        <div className="amg-stats amg-bsum__tiles" style={{ ['--n' as string]: 3 }}>
          <AioStat className="is-center is-tinted" tone="green" icon="check" value={counts.READY} label="MATCHED" sub="Will be linked to existing clients." />
          <AioStat className="is-center is-tinted" tone="gold" icon="alert-mark" value={counts.NEEDS_REVIEW} label="NEEDS REVIEW" sub="Requires manual review." />
          <AioStat className="is-center is-tinted" tone="red" icon="x" value={counts.UNMATCHED} label="UNMATCHED" sub="New clients will be identified." />
        </div>
        <AioStrip className="amg-strip--big">{NOT_ACTIVATED}</AioStrip>
        {cta}
      </AioCard>
    </AioFlow>
  );
}

/* ───────── DUPLICATES AND CONFLICTS ───────── */
export type DupDecision = 'MERGE' | 'SEPARATE' | 'LATER';

export function BatchConflictsScreen({
  store,
  conflicts,
  decisions,
  onDecide,
  cta,
}: {
  store: DemoStore;
  conflicts: ExtractedFactRecord[];
  decisions: Record<string, DupDecision>;
  onDecide: (factId: string, decision: DupDecision) => void;
  cta: ReactNode;
}) {
  const options: Array<{ key: DupDecision; label: string; icon: IcoName }> = [
    { key: 'MERGE', label: 'Merge', icon: 'success' },
    { key: 'SEPARATE', label: 'Keep Separate', icon: 'queued' },
    { key: 'LATER', label: 'Review Later', icon: 'fail' },
  ];
  return (
    <AioFlow top={467} gap={16} className="amg-bcf">
      <AioCard className="amg-bcf__card">
        <AioDiscHead num={1} title="CONFLICTING CLIENTS" sub={conflicts.length ? 'We found potential duplicates or conflicting information in your batch.' : 'No potential duplicates or conflicting information in this batch.'} />
        {conflicts.map((fact) => {
          const client = store.clients.find((c) => c.id === fact.organizationId);
          const doc = store.documents.find((d) => d.id === fact.documentId);
          const ids = clientIdentifiers(store, client);
          return (
            <article key={fact.id} className="amg-dup">
              <AioDisc tone="red" icon="copy" className="amg-dup__disc" />
              <div className="amg-dup__what">
                <b>Client Match Found</b>
                <p>These files may refer to the same client but have different information.</p>
              </div>
              <aside className="amg-dup__who">
                <AioChip tone="red">POTENTIAL DUPLICATE</AioChip>
                <b>{client?.companyName ?? 'Unknown client'}</b>
                <span>{doc?.fileName || doc?.title || fact.sourceReference?.split('/').pop()?.split('#')[0] || 'Extracted file'}</span>
              </aside>
              <div className="amg-dup__col amg-dup__col--old">
                <small>EXISTING VALUE</small>
                <div className="amg-dup__val">
                  <b>{fact.existingValue || 'Empty'}</b>
                  <span>{fieldLabel(fact.fieldKey)}</span>
                  {ids[0] ? <span>{ids[0]}</span> : null}
                </div>
              </div>
              <div className="amg-dup__col amg-dup__col--new">
                <small>EXTRACTED VALUE</small>
                <div className="amg-dup__val amg-dup__val--x">
                  <b>{fact.proposedValue || 'Empty'}</b>
                  <span>{fieldLabel(fact.fieldKey)}</span>
                  {ids[0] ? <span>{ids[0]}</span> : null}
                </div>
              </div>
              <div className="amg-dup__col amg-dup__col--dec">
                <small>YOUR DECISION</small>
                <div className="amg-dup__opts" role="radiogroup" aria-label="Decision">
                  {options.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      role="radio"
                      aria-checked={decisions[fact.id] === option.key}
                      className={`amg-radio amg-radio--icon amg-radio--${option.key.toLowerCase()}${decisions[fact.id] === option.key ? ' is-on' : ''}`}
                      onClick={() => onDecide(fact.id, option.key)}
                    >
                      <Ico name={option.icon} />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
        <AioStrip>{NOT_ACTIVATED}</AioStrip>
      </AioCard>
      {cta}
    </AioFlow>
  );
}

/* ───────── PER-CLIENT REVIEW QUEUE ───────── */
const BUCKET: Record<BatchBucket, { tone: 'green' | 'amber' | 'red'; label: string; icon: IcoName }> = {
  READY: { tone: 'green', label: 'READY', icon: 'check' },
  NEEDS_REVIEW: { tone: 'amber', label: 'NEEDS REVIEW', icon: 'alert-mark' },
  UNMATCHED: { tone: 'red', label: 'UNMATCHED', icon: 'x' },
};

function BucketPill({ bucket }: { bucket: BatchBucket }) {
  const b = BUCKET[bucket];
  return (
    <span className={`amg-bpill amg-bpill--${b.tone}`}>
      <AioDisc tone={b.tone === 'amber' ? 'gold' : b.tone} icon={b.icon} />
      <b>{b.label}</b>
    </span>
  );
}

export function BatchQueueScreen({ store, queue, onOpen, cta }: { store: DemoStore; queue: Client[]; onOpen: (clientId: string) => void; cta: ReactNode }) {
  return (
    <AioFlow top={467} gap={18} className="amg-bq">
      <AioCard className="amg-bq__card">
        <AioCardHead title="CLIENTS IN THIS BATCH" sub={NOT_ACTIVATED} right={<span className="amg-bq__n">{plural(queue.length, 'CLIENT')}</span>} />
        {queue.length === 0 ? <p className="amg-empty">No clients are in this batch yet.</p> : null}
        <AioRows className="amg-bq__rows">
          {queue.map((client) => {
            const files = batchFilesFor(store, client.id);
            const last = files.map((f) => f.createdAt).sort().pop() ?? client.lastActivityAt;
            const bucket = batchBucket(client);
            return (
              <AioRow
                key={client.id}
                lead={<AioDisc tone={BUCKET[bucket].tone === 'amber' ? 'tint' : BUCKET[bucket].tone} icon="truck" className={`amg-bq__disc amg-bq__disc--${BUCKET[bucket].tone}`} />}
                title={client.companyName}
                sub={`${plural(files.length, 'file')}  •  ${formatDay(last)}`}
                right={<BucketPill bucket={bucket} />}
                onClick={() => onOpen(client.id)}
              />
            );
          })}
        </AioRows>
        {/* TABLE_MODE TABLE: the phone draws stacked rows (above); tablet and desktop read the same queue as a table */}
        {queue.length ? (
          <table className="amg-qtable">
            <thead>
              <tr>
                <th scope="col">CLIENT</th>
                <th scope="col">FILES</th>
                <th scope="col">LAST ACTIVITY</th>
                <th scope="col">STATUS</th>
                <th scope="col">
                  <span className="amg-sr">OPEN</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {queue.map((client) => {
                const files = batchFilesFor(store, client.id);
                const last = files.map((f) => f.createdAt).sort().pop() ?? client.lastActivityAt;
                const bucket = batchBucket(client);
                return (
                  <tr key={client.id}>
                    <td>
                      <button type="button" className="amg-qtable__client" onClick={() => onOpen(client.id)}>
                        <AioDisc tone={BUCKET[bucket].tone === 'amber' ? 'tint' : BUCKET[bucket].tone} icon="truck" className={`amg-bq__disc amg-bq__disc--${BUCKET[bucket].tone}`} />
                        <b>{client.companyName}</b>
                      </button>
                    </td>
                    <td>{files.length}</td>
                    <td>{formatDay(last)}</td>
                    <td>
                      <BucketPill bucket={bucket} />
                    </td>
                    <td aria-hidden="true">
                      <Ico name="chevron" className="amg-qtable__chev" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </AioCard>
      {cta}
    </AioFlow>
  );
}

/* ───────── CLIENT REVIEW DETAIL ───────── */
export function BatchClientScreen({ store, client, cta }: { store: DemoStore; client: Client; cta: ReactNode }) {
  const files = batchFilesFor(store, client.id);
  const ids = clientIdentifiers(store, client);
  const bucket = batchBucket(client);
  const types = [...new Set(files.map((f) => fileTone(f.fileName).ext))];
  const active = isActive(client);
  const batchId = files[0]?.batchId;
  const match = { READY: ['Matched', 'Will be linked to existing client.'], NEEDS_REVIEW: ['Needs review', 'Requires manual review.'], UNMATCHED: ['Unmatched', 'Will be added as a new client.'] }[bucket];
  return (
    <AioFlow top={468} gap={18} className="amg-bcl">
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={1} title="CLIENT INFORMATION" sub="Review the details for this client from your batch." />
        <div className="amg-bcl__info">
          <div className="amg-bcl__who">
            <AioDisc tone="soft" icon="company" className="amg-bcl__disc" />
            <span>
              <b>{client.companyName}</b>
              {ids.map((id) => (
                <span key={id}>{id}</span>
              ))}
            </span>
          </div>
          <div className="amg-bcl__files">
            <Ico name="summary" />
            <span>
              <b>{files.length}</b>
              <span>Files in Batch</span>
            </span>
          </div>
          <div className="amg-bcl__match">
            <AioDisc tone={BUCKET[bucket].tone === 'amber' ? 'gold' : BUCKET[bucket].tone} icon={BUCKET[bucket].icon} className="amg-bcl__mdisc" />
            <span>
              <b>{match[0]}</b>
              <span>{match[1]}</span>
            </span>
          </div>
        </div>
      </AioCard>
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={2} title="CLIENT STATUS" sub={active ? 'This client is active.' : 'This client is not active yet.'} />
        <AioCallout tone={active ? 'green' : 'red'} icon={active ? 'check' : 'x'} title={active ? 'Active' : 'Not Active'} className="amg-bcl__status">
          {active ? 'This client confirmed their information.' : 'This client has not been activated. Review the files and client details before continuing.'}
        </AioCallout>
      </AioCard>
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={3} title="FILES FOR THIS CLIENT" sub="These files were identified for this client." />
        <ul className="amg-rows">
          <li>
            {batchId ? (
              <Link className="amg-row is-action" to={aioPaths.officeArchiveMigrationBatch(batchId)}>
                <span className="amg-row__icon" aria-hidden="true">
                  <Ico name="summary" />
                </span>
                <span className="amg-row__text">
                  <b className="amg-row__t">{plural(files.length, 'file')}</b>
                  <span className="amg-row__s">{types.join(', ')}</span>
                </span>
                <Ico name="chevron" className="amg-row__chev" />
              </Link>
            ) : (
              <div className="amg-row">
                <span className="amg-row__icon" aria-hidden="true">
                  <Ico name="summary" />
                </span>
                <span className="amg-row__text">
                  <b className="amg-row__t">0 files</b>
                  <span className="amg-row__s">No files are stored for this client in the batch.</span>
                </span>
              </div>
            )}
          </li>
        </ul>
        <AioStrip title="This review does not approve other clients." className="amg-strip--big">
          Each client in the batch remains separately reviewable and must be approved individually.
        </AioStrip>
      </AioCard>
      {cta}
    </AioFlow>
  );
}

/* ───────── APPROVAL SUMMARY (batch) ───────── */
export function BatchApprovalScreen({ queue, blocked, cta, onOpenQueue }: { queue: Client[]; blocked: Set<string>; cta: ReactNode; onOpenQueue: () => void }) {
  const ready = queue.filter((c) => batchBucket(c) === 'READY' && !blocked.has(c.id)).length;
  const review = queue.filter((c) => batchBucket(c) === 'NEEDS_REVIEW' && !blocked.has(c.id)).length;
  const unmatched = queue.filter((c) => batchBucket(c) === 'UNMATCHED' && !blocked.has(c.id)).length;
  return (
    <AioFlow top={466} gap={18} className="amg-bap">
      <header className="amg-bap__head">
        <h2>APPROVAL SUMMARY</h2>
        <p>Review the results of your batch. No clients are activated yet.</p>
      </header>
      <div className="amg-grid amg-bap__grid">
        <AioStat className="amg-bap__tile" tone="green" icon="check" value={ready} label="READY CLIENTS" sub="Will be linked to existing clients." onClick={onOpenQueue} />
        <AioStat className="amg-bap__tile" tone="red" icon="skipped" value={blocked.size} label="BLOCKED CLIENTS" sub="Cannot be matched. Require resolution." onClick={onOpenQueue} />
        <AioStat className="amg-bap__tile" tone="gold" icon="alert-mark" value={review} label="NEEDS REVIEW" sub="Requires manual review." onClick={onOpenQueue} />
        <AioStat className="amg-bap__tile" tone="violet" icon="people" value={unmatched} label="UNMATCHED CLIENTS" sub="Will be added as new clients." onClick={onOpenQueue} />
      </div>
      <AioStrip className="amg-strip--big">{NOT_ACTIVATED}</AioStrip>
      {cta}
    </AioFlow>
  );
}

/* ───────── PROCESSING APPROVED CLIENTS ───────── */
export function BatchRunScreen({ approved, cta }: { approved: number; cta: ReactNode }) {
  return (
    <AioFlow top={488} gap={18} className="amg-brun">
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={1} title="APPROVED CLIENTS" sub="These clients passed our review and are ready to process." />
        <div className="amg-brun__count">
          <AioDisc tone="gold" icon="summary" className="amg-brun__disc" />
          <span>
            <b>{approved}</b>
            <span>
              {approved === 1 ? 'Approved Client' : 'Approved Clients'}
              <br />
              ready for PREBUILT
            </span>
          </span>
        </div>
      </AioCard>
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={2} title="PROCESSING TO PREBUILT" sub="We’re moving the approved clients to PREBUILT." />
        <div className="amg-flowline">
          <span className="amg-flowline__step">
            <AioDisc tone="green" icon="tests" className="amg-flowline__disc" />
            <b>
              APPROVED
              <br />
              CLIENTS
            </b>
          </span>
          <Ico name="arrow" className="amg-flowline__arrow" />
          <span className="amg-flowline__step amg-flowline__step--box">
            <Ico name="settings" className="amg-flowline__gear" />
            <b>PROCESSING</b>
            <span>Preparing client data for PREBUILT.</span>
          </span>
          <Ico name="arrow" className="amg-flowline__arrow" />
          <span className="amg-flowline__step">
            <AioDisc tone="gold" icon="summary" className="amg-flowline__disc" />
            <b>PREBUILT</b>
            <span>Clients will be moved to PREBUILT.</span>
          </span>
        </div>
      </AioCard>
      <AioCard className="amg-bulk__card">
        <AioDiscHead num={3} title="IMPORTANT NOTE" sub="These clients will not be activated during this step." />
        <AioStrip title="NONE OF THESE CLIENTS BECOME ACTIVE" className="amg-strip--big amg-strip--caps">
          This process only moves approved clients to PREBUILT. Each client remains separately reviewable and must be activated later.
        </AioStrip>
      </AioCard>
      {cta}
    </AioFlow>
  );
}

/* ───────── BATCH COMPLETE ───────── */
type Outcome = 'PREBUILT' | 'REVIEW' | 'UNMATCHED' | 'ACTIVE';
const OUTCOME: Record<Outcome, { tone: 'green' | 'gold' | 'red' | 'soft'; icon: IcoName; label: string }> = {
  PREBUILT: { tone: 'green', icon: 'check', label: 'PREBUILT' },
  REVIEW: { tone: 'gold', icon: 'alert-mark', label: 'REVIEW REQUIRED' },
  UNMATCHED: { tone: 'red', icon: 'x', label: 'UNMATCHED' },
  ACTIVE: { tone: 'green', icon: 'check', label: 'ACTIVE' },
};

function outcomeOf(client: Client): Outcome {
  if (client.clientLifecycle === 'ACTIVE') return 'ACTIVE';
  if (client.clientLifecycle === 'PREBUILT' || client.clientLifecycle === 'INVITED' || client.clientLifecycle === 'CLIENT_CONFIRMATION_REQUIRED') return 'PREBUILT';
  return batchBucket(client) === 'UNMATCHED' ? 'UNMATCHED' : 'REVIEW';
}

export function BatchCompleteScreen({ queue, failedFiles, cta }: { queue: Client[]; failedFiles: number; cta: ReactNode }) {
  const counts: Record<Outcome, number> = { PREBUILT: 0, REVIEW: 0, UNMATCHED: 0, ACTIVE: 0 };
  for (const client of queue) counts[outcomeOf(client)] += 1;
  return (
    <AioFlow top={468} gap={14} className="amg-bdone">
      <AioCard className="amg-bdone__card">
        <AioDiscHead tone="green" icon="check" title="BATCH PROCESSING COMPLETE" sub="All files have been scanned and client matches identified." />
        <div className="amg-stats amg-bdone__tiles" style={{ ['--n' as string]: 4 }}>
          <AioStat className="is-center" tone="green" icon="check" value={counts.PREBUILT} label="PREBUILT" sub="Moved to PREBUILT, not active." />
          <AioStat className="is-center" tone="gold" icon="alert-mark" value={counts.REVIEW} label="REVIEW REQUIRED" sub="Requires manual review." />
          <AioStat className="is-center" tone="red" icon="x" value={counts.UNMATCHED} label="UNMATCHED" sub="New clients will be identified." />
          <AioStat className="is-center" tone="soft" icon="skipped" value={failedFiles} label="REJECTED" sub="Files could not be processed." />
        </div>
      </AioCard>
      <AioCard className="amg-bdone__card">
        <AioCardHead
          title={`CLIENT RESULTS (${queue.length} TOTAL)`}
          right={
            <Link className="amg-link amg-link--plain" to={aioPaths.officeArchiveMigration}>
              View All <Ico name="chevron" />
            </Link>
          }
        />
        {queue.length === 0 ? <p className="amg-empty">No clients were in this batch.</p> : null}
        <ul className="amg-results">
          {queue.slice(0, 5).map((client) => {
            const o = OUTCOME[outcomeOf(client)];
            return (
              <li key={client.id}>
                <Ico name="text" className="amg-results__doc" />
                <span className="amg-results__name">{client.companyName}</span>
                <AioDisc tone={o.tone} icon={o.icon} className="amg-results__disc" />
                <b className="amg-results__label">{o.label}</b>
                <Ico name="chevron" className="amg-results__chev" />
              </li>
            );
          })}
        </ul>
        <AioStrip>No client becomes active because the batch finished.</AioStrip>
      </AioCard>
      {cta}
    </AioFlow>
  );
}

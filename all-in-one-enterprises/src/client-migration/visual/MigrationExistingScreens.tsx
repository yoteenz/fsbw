import type { Client } from '../../demo/demoTypes';
import type { ArchiveMigrationBatch, ArchiveMigrationBatchFile } from '../../vault/archiveMigrationTypes';
import { AioMigrationPanel, AioMonogram, AioStatusPill, AioSteps, AioWhatNext, Ico, type StepState } from './AioMigrationKit';
import { fileKind, formatBytes, formatStarted } from './migrationViewer';

const SELECT_STEPS = [
  { label: 'SELECT CLIENT', sub: 'Choose Account' },
  { label: 'REVIEW DATA', sub: 'Check Records' },
  { label: 'MAP & CONFIRM', sub: 'Match Information' },
  { label: 'VALIDATE', sub: 'Check Accuracy' },
  { label: 'IMPORT', sub: 'Complete' },
];

export function MigrationSelectSteps({ current = 0 }: { current?: number }) {
  return (
    <AioMigrationPanel className="amg-flowcard">
      <AioSteps
        className="amg-steps--flow"
        steps={SELECT_STEPS.map((s, i) => ({ ...s, state: (i < current ? 'done' : i === current ? 'current' : 'todo') as StepState }))}
      />
    </AioMigrationPanel>
  );
}

function ClientRow({ client, ids, on, onClick }: { client: Client; ids: string[]; on: boolean; onClick: () => void }) {
  return (
    <li>
      <button type="button" className={on ? 'amg-crow is-on' : 'amg-crow'} onClick={onClick} aria-pressed={on}>
        <AioMonogram name={client.companyName} className="amg-crow__mono" />
        <span className="amg-crow__name">{client.companyName}</span>
        <span className="amg-crow__ids">{ids.join('   |   ')}</span>
        <Ico name="chevron" className="amg-crow__chev" />
      </button>
    </li>
  );
}

export function MigrationExistingScreen({
  clients,
  selectedId,
  query,
  onQuery,
  identifiers,
  onSelect,
  onAddManually,
}: {
  clients: Client[];
  selectedId: string;
  query: string;
  onQuery: (value: string) => void;
  identifiers: (client: Client) => string[];
  onSelect: (id: string) => void;
  onAddManually: () => void;
}) {
  // Clients still to migrate lead the recent list; search reaches every client record (an ACTIVE client can still receive records).
  const recent = [...clients].sort(
    (a, b) =>
      Number(a.clientLifecycle === 'ACTIVE') - Number(b.clientLifecycle === 'ACTIVE') ||
      (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? ''),
  );
  const shown = query.trim() ? recent : recent.slice(0, 4);
  return (
    <div className="amg-existing">
      <MigrationSelectSteps current={0} />
      <AioMigrationPanel className="amg-find">
        <h2 className="amg-h2 amg-find__title">FIND YOUR EXISTING CLIENT</h2>
        <p className="amg-find__sub">Search for the AIO client account you want to migrate.</p>
        <label className="amg-search">
          <Ico name="search" />
          <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search by client name, USDOT, MC number, or account ID..." aria-label="Search clients" />
        </label>
        <div className="amg-find__head">
          <b>RECENT CLIENTS</b>
          <span>
            View All <Ico name="arrow" />
          </span>
        </div>
        <ul className="amg-crows">
          {shown.length === 0 ? <li className="amg-crows__empty">No client matches “{query}”.</li> : null}
          {shown.map((client) => (
            <ClientRow key={client.id} client={client} ids={identifiers(client)} on={client.id === selectedId} onClick={() => onSelect(client.id)} />
          ))}
        </ul>
        <button type="button" className="amg-cantfind" onClick={onAddManually}>
          <span className="amg-cantfind__plus" aria-hidden="true">
            <Ico name="plus" />
          </span>
          <b>CAN’T FIND YOUR CLIENT?</b>
          <span>Try a different search term or add manually.</span>
          <Ico name="chevron" className="amg-cantfind__chev" />
        </button>
      </AioMigrationPanel>
      <AioWhatNext>
        Once you select your client, we’ll pull your existing records, organize the data, and help you review and confirm everything before importing.
      </AioWhatNext>
    </div>
  );
}

const EXTRACT_STAGES = ['UPLOAD', 'EXTRACT', 'CLASSIFY', 'MATCH', 'VALIDATE', 'PREPARE FOR REVIEW'] as const;

/** Stage truth comes from the batch: files present, files processed, batch review state. */
function extractStages(files: ArchiveMigrationBatchFile[], batch?: ArchiveMigrationBatch) {
  const uploaded = files.length > 0;
  const extracted = uploaded && files.every((f) => f.processingState === 'ready' || f.processingState === 'grouped');
  const classified = extracted && (batch?.state === 'ready_for_review' || batch?.state === 'reviewing' || batch?.state === 'completed');
  const done = [uploaded, extracted, classified, false, false, false];
  const current = done.findIndex((d) => !d);
  return EXTRACT_STAGES.map((label, i) => ({
    label,
    state: (done[i] ? 'done' : i === current ? 'current' : 'todo') as StepState,
    sub: done[i] ? 'Complete' : i === current ? 'In Progress' : 'Pending',
  }));
}

export function MigrationExtractScreen({
  client,
  identifiers,
  files,
  batch,
  onActivity,
}: {
  client: Client;
  identifiers: string[];
  files: ArchiveMigrationBatchFile[];
  batch?: ArchiveMigrationBatch;
  onActivity?: () => void;
}) {
  const stages = extractStages(files, batch);
  const doneCount = stages.filter((s) => s.state === 'done').length;
  const stepNo = Math.min(doneCount + 1, stages.length);
  const pct = Math.round((stepNo / stages.length) * 100);
  const current = stages.find((s) => s.state === 'current');
  const processing = files.some((f) => f.processingState === 'processing' || f.processingState === 'uploaded');
  const status = !files.length ? 'Waiting for files' : processing ? 'Processing…' : current ? `${current.label[0]}${current.label.slice(1).toLowerCase()} pending` : 'Complete';
  return (
    <div className="amg-extract">
      <AioMigrationPanel className="amg-xcard">
        <AioMonogram name={client.companyName} className="amg-xcard__mono" />
        <b className="amg-xcard__name">{client.companyName}</b>
        <span className="amg-xcard__ids">{identifiers.join('   |   ')}</span>
        <span className="amg-xcard__pill">
          <AioStatusPill tone="gold">MIGRATION IN PROGRESS</AioStatusPill>
        </span>
        <AioSteps className="amg-steps--x" steps={stages} />
        <div className="amg-xprog">
          <b>EXTRACTION PROGRESS</b>
          <span className="amg-xprog__count">
            {stepNo} OF {stages.length} STEPS
          </span>
          <span className="amg-xprog__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${pct}%` }} />
          </span>
          <span className="amg-xprog__pct">{pct}%</span>
        </div>
        <div className="amg-leave">
          <span className="amg-leave__icon" aria-hidden="true">
            <Ico name="info" />
          </span>
          <b>YOU CAN LEAVE THIS SCREEN.</b>
          <span>Progress is saved.</span>
        </div>
      </AioMigrationPanel>
      <AioMigrationPanel className="amg-xstep">
        <b className="amg-xstep__title">CURRENT STEP</b>
        <div className="amg-xstep__box">
          <span className="amg-xstep__icon" aria-hidden="true">
            <Ico name="doc" />
          </span>
          <b>{current ? `${current.label === 'EXTRACT' ? 'EXTRACTING' : current.label} RECORDS` : 'READY FOR REVIEW'}</b>
          <span>We’re pulling your client data and processing the documents.</span>
          {current ? <span className="amg-spin" aria-label="In progress" /> : null}
        </div>
        <dl className="amg-xstats">
          <div>
            <Ico name="file" />
            <dt>RECORDS FOUND</dt>
            <dd>
              {files.length} file{files.length === 1 ? '' : 's'}
            </dd>
          </div>
          <div>
            <Ico name="database" />
            <dt>EXTRACTION STATUS</dt>
            <dd>{status}</dd>
          </div>
          <div>
            <Ico name="clock" />
            <dt>STARTED</dt>
            <dd>{formatStarted(batch?.createdAt)}</dd>
          </div>
        </dl>
        <button type="button" className="amg-xact" onClick={onActivity} disabled={!onActivity}>
          <Ico name="doc" className="amg-xact__icon" />
          <b>RECENT ACTIVITY</b>
          <span>View a live log of extraction and classification activity.</span>
          <Ico name="chevron" className="amg-xact__chev" />
        </button>
      </AioMigrationPanel>
    </div>
  );
}

type Row = { key: string; name: string; type: string; size: string; icon: string; status: 'ACCEPTED' | 'PARTIAL' | 'UNSUPPORTED'; local?: boolean };

export function MigrationReceivedScreen({
  client,
  identifiers,
  stored,
  local,
  onAdd,
  onRemoveLocal,
}: {
  client: Client;
  identifiers: string[];
  stored: ArchiveMigrationBatchFile[];
  local: Array<{ name: string; size: number; status: 'accepted' | 'unsupported'; reason?: string }>;
  onAdd: () => void;
  onRemoveLocal: (name: string) => void;
}) {
  const rows: Row[] = [
    ...stored.map((f) => {
      const k = fileKind(f.fileName);
      return {
        key: f.id,
        name: f.fileName,
        type: k.ext,
        size: formatBytes(f.fileSizeBytes),
        icon: `/migration/row-${k.icon}.png`,
        status: (f.processingState === 'failed' ? 'PARTIAL' : 'ACCEPTED') as Row['status'],
      };
    }),
    ...local.map((f) => {
      const k = fileKind(f.name);
      return {
        key: `local-${f.name}`,
        name: f.name,
        type: k.ext,
        size: formatBytes(f.size),
        icon: `/migration/row-${k.icon}.png`,
        status: (f.status === 'unsupported' ? 'UNSUPPORTED' : 'ACCEPTED') as Row['status'],
        local: true,
      };
    }),
  ];
  return (
    <div className="amg-received">
      <AioMigrationPanel className="amg-rclient">
        <b className="amg-rclient__label">SELECTED CLIENT</b>
        <AioMonogram name={client.companyName} className="amg-rclient__mono" />
        <b className="amg-rclient__name">{client.companyName}</b>
        <span className="amg-rclient__ids">{identifiers.join('   |   ')}</span>
        <span className="amg-rclient__div" aria-hidden="true" />
        <Ico name="doc" className="amg-rclient__doc" />
        <b className="amg-rclient__n">{rows.length}</b>
        <span className="amg-rclient__lbl">
          FILES
          <br />
          RECEIVED
        </span>
      </AioMigrationPanel>
      <AioMigrationPanel className="amg-rfiles">
        <h2 className="amg-rfiles__title">RECEIVED FILES</h2>
        <button type="button" className="amg-rfiles__add" onClick={onAdd}>
          <Ico name="plus" /> ADD FILES
        </button>
        <div className="amg-table" role="table" aria-label="Received files">
          <div className="amg-tr amg-tr--head" role="row">
            <span role="columnheader">FILE NAME</span>
            <span role="columnheader">TYPE</span>
            <span role="columnheader">SIZE</span>
            <span role="columnheader">STATUS</span>
            <span role="columnheader">ACTIONS</span>
          </div>
          {rows.length === 0 ? (
            <div className="amg-tr amg-tr--empty" role="row">
              <span role="cell">No files in this intake yet. Use ADD FILES to choose the client file.</span>
            </div>
          ) : null}
          {rows.map((row) => (
            <div className="amg-tr" role="row" key={row.key}>
              <span role="cell" className="amg-td-name">
                <img src={row.icon} alt="" />
                <span className="amg-td-name__t" title={row.name}>{row.name}</span>
              </span>
              <span role="cell">{row.type}</span>
              <span role="cell">{row.size}</span>
              <span role="cell">
                <span className={`amg-state amg-state--${row.status.toLowerCase()}`}>
                  <Ico name={row.status === 'ACCEPTED' ? 'check' : row.status === 'PARTIAL' ? 'alert' : 'x'} />
                  {row.status}
                </span>
              </span>
              <span role="cell" className="amg-td-act">
                <button type="button" onClick={onAdd}>
                  <Ico name="refresh" />
                  Replace
                </button>
                <button type="button" onClick={() => (row.local ? onRemoveLocal(row.name) : undefined)} disabled={!row.local} title={row.local ? undefined : 'Stored files stay on the migration record'}>
                  <Ico name="trash" />
                  Remove
                </button>
              </span>
            </div>
          ))}
        </div>
      </AioMigrationPanel>
      <AioWhatNext>
        Once you begin extraction, we’ll process your files, read the information, and organize it into your client record. You’ll be able to review and confirm everything before it’s imported.
      </AioWhatNext>
    </div>
  );
}

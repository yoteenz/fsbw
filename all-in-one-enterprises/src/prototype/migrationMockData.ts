/**
 * AIO client migration — flow prototype MOCK DATA mode (prototype only; nothing here ships in the app).
 *
 * With mock data on, arriving on a screen fills what a person would otherwise have to supply, so CONTINUE always moves on:
 * the client is picked, a mock PDF is added, forms and passwords are typed, extraction is finished, the client match and
 * conflict decisions are chosen, the client's required review sections are answered, and the bulk batch gets its demo
 * clients. Every fill goes through the screen's own inputs or the same demo-store services the screens use, and each
 * screen reports what was filled so the navigator can list it. The app's checks are untouched: switch mock data off and
 * every gate is live again.
 */
import { applyReviewActionToFact } from '../client-migration/services/migrationCommitService';
import { recordReviewSectionResponse } from '../client-migration/services/clientActivationService';
import { DEFAULT_ACTIVATION_CONDITIONS } from '../client-migration/lifecycle';
import type { ActivationConditions, ReviewSectionCode } from '../client-migration/types';
import { loadDemoStore, updateDemoStore } from '../demo/demoStore';
import type { Client, DemoStore } from '../demo/demoTypes';

export const MOCK_FILE = 'MOCK_CLIENT_FILE.pdf';
const MOCK_PDF = '%PDF-1.4\n% AIO flow prototype mock file\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n';
const MOCK_EMAIL = 'client@mock.example';
const MOCK_PASSWORD = 'MockPassword-1';
const STAFF = 'staff-2';
/** The demo seed's new client and batch (scripts/migration/migration-screens.mjs). */
const NEW_CLIENT = { companyName: 'River Bend Logistics LLC', usdot: '4102877', mc: '1588201', contactName: 'Sam Ortiz' };
const BATCH_NAME = 'Q1 2025 Clients';
const REQUIRED_SECTIONS: ReviewSectionCode[] = ['COMPANY', 'PEOPLE', 'VEHICLES', 'ACTIVE_SERVICES'];

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** Wait for a screen's element (the screen renders after the route changes). */
async function find<T>(lookup: () => T | null | undefined, tries = 12): Promise<T | null> {
  for (let i = 0; i < tries; i++) {
    const found = lookup();
    if (found) return found;
    await wait(100);
  }
  return null;
}

/** Type into a controlled input the way a person would (React sees an input event). */
function type(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function fieldByLabel(label: string): HTMLInputElement | null {
  const field = [...document.querySelectorAll('label.amg-field')].find((el) => el.querySelector('.amg-field__l')?.textContent?.trim() === label);
  return field?.querySelector('input') ?? null;
}

async function fill(label: string, value: string, done: string[]) {
  const input = await find(() => fieldByLabel(label));
  if (input && !input.value) {
    type(input, value);
    done.push(`Typed ${label.toLowerCase()}: ${value}`);
  }
}

/** The screen's own file input, given one small PDF. */
async function addMockFile(done: string[]) {
  // the rendered app only: the page's inline script also contains this name
  if (document.getElementById('root')?.textContent?.includes(MOCK_FILE)) return;
  const input = await find(() => document.querySelector<HTMLInputElement>('input[type=file]'));
  if (!input) return;
  const files = new DataTransfer();
  files.items.add(new File([MOCK_PDF], MOCK_FILE, { type: 'application/pdf' }));
  input.files = files.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  done.push(`Added ${MOCK_FILE} (a small mock PDF) as if chosen from BROWSE FILES`);
}

const storedFiles = (store: DemoStore, org: string) => (store.archiveMigrationBatchFiles ?? []).filter((f) => f.organizationId === org);
const nameOf = (store: DemoStore, org: string) => store.clients.find((c) => c.id === org)?.companyName ?? org;

/** Extraction finished: every file processed, the batch ready for review, and at least the company name extracted. */
function finishExtraction(org: string, done: string[]) {
  updateDemoStore((s) => {
    const files = storedFiles(s, org);
    const open = files.filter((f) => f.processingState !== 'ready' && f.processingState !== 'grouped');
    const failed = open.filter((f) => f.processingState === 'failed').length;
    for (const f of open) f.processingState = 'ready';
    if (open.length) done.push(`Marked extraction finished on ${open.length} file${open.length === 1 ? '' : 's'}${failed ? ` (${failed} had failed: a failed file otherwise stops this flow)` : ''}`);
    const batch = (s.archiveMigrationBatches ?? []).find((b) => b.clientId === org);
    if (batch && !['ready_for_review', 'reviewing', 'completed', 'approved'].includes(batch.state)) {
      batch.state = 'ready_for_review';
      batch.updatedAt = new Date().toISOString();
    }
    if (batch && !(s.clientExtractedFacts ?? []).some((f) => f.batchId === batch.id)) {
      const name = nameOf(s, org);
      s.clientExtractedFacts = [
        ...(s.clientExtractedFacts ?? []),
        { id: `mock-fact-${batch.id}`, batchId: batch.id, organizationId: org, entityType: 'company', fieldKey: 'legal_name', proposedValue: name, existingValue: name, confidence: 'HIGH', sourceReference: `${MOCK_FILE}#p1`, createdAt: new Date().toISOString() },
      ];
      done.push(`Added one extracted fact: company legal name ${name}`);
    }
    return s;
  });
}

/** Open conflicts on the client's batch resolved as KEEP AIO (the existing value stays). */
function keepAioOnOpenConflicts(org: string, done: string[]) {
  const open = (loadDemoStore().clientExtractedFacts ?? []).filter((f) => f.organizationId === org && f.confidence === 'CONFLICT' && !f.reviewAction);
  if (!open.length) return;
  updateDemoStore((s) => open.reduce((next, f) => applyReviewActionToFact(next, f.id, 'REJECT', STAFF), s));
  done.push(`Kept the AIO value on ${open.length} open conflict${open.length === 1 ? '' : 's'} (approval needs every conflict decided)`);
}

/** The four demo clients of the bulk batch, added once (same records as the gallery's batch scenario). */
function ensureBatchQueue(done: string[]) {
  if ((loadDemoStore().archiveMigrationBatches ?? []).some((b) => b.notes === BATCH_NAME)) return;
  const at = new Date().toISOString();
  const files: Array<[string, string, number]> = [
    ['Authority_Letter.pdf', 'application/pdf', 250880],
    ['W9.pdf', 'application/pdf', 104448],
    ['Insurance_Card.pdf', 'application/pdf', 319488],
    ['Carrier_Photo.jpg', 'image/jpeg', 2202009],
    ['IFTA_License.pdf', 'application/pdf', 226304],
  ];
  updateDemoStore((s) => {
    const client = (id: string, companyName: string, lifecycle: Client['clientLifecycle'], extra: Partial<Client> = {}) => {
      const found = s.clients.find((c) => c.id === id);
      if (found) {
        if (found.clientLifecycle !== 'ACTIVE') found.clientLifecycle = lifecycle;
        return;
      }
      s.clients.push({
        id,
        companyName,
        contactName: 'Primary contact',
        contactEmail: 'pending@example.com',
        clientType: 'carrier',
        primaryState: '',
        accountStatus: 'pending',
        clientLifecycle: lifecycle,
        roadmapProgress: 0,
        customerSince: at.slice(0, 10),
        services: [],
        activeRequestCount: 0,
        documentsNeededCount: 0,
        lastActivityAt: at,
        ...extra,
      });
    };
    client('client-a', 'Summit Ridge Hauling LLC', 'MIGRATION_IN_PROGRESS');
    client('shipper-demo-b', 'Lakeview Distribution Co.', 'MIGRATION_REVIEW_REQUIRED');
    client('mig-demo-canyon', 'Canyon Freight Co.', 'KNOWN_UNMIGRATED');
    client('mig-demo-lakeside', 'Lakeside Carriers Inc.', 'MIGRATION_IN_PROGRESS', { customerNumber: 'AIO-20417' });
    /** files arrive still processing (BATCH PROCESSING finishes them); `failed` marks one file that could not be read */
    const batch = (org: string, list: Array<[string, string, number]>, failed = -1) => {
      const id = `mock-batch-${org}`;
      s.archiveMigrationBatches = (s.archiveMigrationBatches ?? []).filter((b) => b.clientId !== org);
      s.archiveMigrationBatchFiles = (s.archiveMigrationBatchFiles ?? []).filter((f) => f.organizationId !== org);
      s.archiveMigrationBatches.push({ id, organizationId: org, clientId: org, createdByStaffId: STAFF, state: 'processing', reviewState: 'pending', approvalState: 'pending', fileCount: list.length, documentCount: list.length, notes: BATCH_NAME, createdAt: at, updatedAt: at });
      list.forEach(([fileName, mimeType, fileSizeBytes], i) =>
        s.archiveMigrationBatchFiles!.push({ id: `${id}-f${i}`, batchId: id, organizationId: org, fileName, mimeType, fileSizeBytes, processingState: i === failed ? 'failed' : 'processing', createdAt: at }),
      );
      return id;
    };
    const a = batch('client-a', files.slice(0, 4));
    batch('shipper-demo-b', files.slice(0, 3));
    batch('mig-demo-canyon', files.slice(1, 3));
    batch('mig-demo-lakeside', files, 4);
    s.clientExtractedFacts = [
      ...(s.clientExtractedFacts ?? []).filter((f) => f.batchId !== a),
      { id: `mock-fact-${a}`, batchId: a, organizationId: 'client-a', entityType: 'company', fieldKey: 'legal_name', proposedValue: 'Summit Ridge Hauling, LLC', existingValue: 'Summit Ridge Hauling LLC', confidence: 'CONFLICT', createdAt: at },
    ];
    return s;
  });
  done.push(`Loaded the demo batch “${BATCH_NAME}”: 4 clients, 14 files (one failed), one duplicate name to decide`);
}

/** Batch processing finished (failed files stay failed: the batch already lets them through). */
function finishBatchProcessing(done: string[]) {
  let n = 0;
  updateDemoStore((s) => {
    for (const f of s.archiveMigrationBatchFiles ?? []) {
      if (f.processingState === 'ready' || f.processingState === 'grouped' || f.processingState === 'failed') continue;
      f.processingState = 'ready';
      n++;
    }
    for (const b of s.archiveMigrationBatches ?? []) if (b.state === 'processing' || b.state === 'uploading') b.state = 'ready_for_review';
    return s;
  });
  if (n) done.push(`Marked processing finished on ${n} file${n === 1 ? '' : 's'}`);
}

/** CONFIRM AND ACTIVATE: the required sections answered LOOKS RIGHT, and conditions from skipped earlier steps met. */
function readyToActivate(org: string, done: string[]) {
  const store = loadDemoStore();
  const answered = new Set((store.clientReviewSections ?? []).filter((r) => r.organizationId === org && r.response).map((r) => r.sectionCode));
  const open = REQUIRED_SECTIONS.filter((code) => !answered.has(code));
  const client = store.clients.find((c) => c.id === org);
  const conditions: ActivationConditions = { ...DEFAULT_ACTIVATION_CONDITIONS, ...(client?.activationConditions ?? {}) };
  const earlier = (['canonicalIdentityExists', 'reviewOrIntakeComplete', 'authIdentityLinked', 'invitationCompleted', 'officeProvisioningSucceeded'] as const).filter((k) => !conditions[k]);
  if (!open.length && !earlier.length) return;
  updateDemoStore((s) => {
    let next = s;
    for (const code of open) next = recordReviewSectionResponse(next, org, code, 'LOOKS_RIGHT');
    const record = next.clients.find((c) => c.id === org);
    if (record && earlier.length) record.activationConditions = { ...(record.activationConditions ?? {}), ...Object.fromEntries(earlier.map((k) => [k, true])) };
    return next;
  });
  if (open.length) done.push(`Answered LOOKS RIGHT for ${open.map((c) => c.replace('_', ' ').toLowerCase()).join(', ')} (activation needs them)`);
  if (earlier.length) done.push(`Met activation conditions from steps that were skipped: ${earlier.join(', ')}`);
}

export type MockContext = {
  screen: string;
  search: URLSearchParams;
  /** client review: the organization the page reviews (router state, else the portal client) */
  reviewOrg: string;
  select: (clientId: string) => void;
};

/** Fill what this screen needs before CONTINUE can move on. Returns what was filled, for the navigator. */
export async function prepareScreen(ctx: MockContext): Promise<string[]> {
  const done: string[] = [];
  const org = ctx.search.get('client') ?? '';
  const store = loadDemoStore();
  switch (ctx.screen) {
    case 'existing': {
      const current = store.clients.find((c) => c.id === org);
      if (current && current.clientLifecycle !== 'ACTIVE') break;
      const pick = [store.clients.find((c) => c.id === 'client-b'), ...store.clients].find((c) => c && c.clientLifecycle !== 'ACTIVE');
      if (pick) {
        ctx.select(pick.id);
        done.push(`Selected ${pick.companyName}${current ? ` (${current.companyName} is already ACTIVE)` : ''}`);
      }
      break;
    }
    case 'upload':
    case 'received':
    case 'new-received':
      if (org && !storedFiles(store, org).length) await addMockFile(done);
      break;
    case 'extract':
    case 'new-extract':
      if (org) {
        await wait(700); // let the in-progress state show for a moment
        finishExtraction(org, done);
      }
      break;
    case 'match': {
      const rows = await find(() => {
        const list = document.querySelectorAll<HTMLButtonElement>('.amg-match__options button.amg-row');
        return list.length ? list : null;
      });
      if (rows && ![...rows].some((row) => row.classList.contains('is-on'))) {
        rows[0].click();
        done.push('Chose MATCH TO EXISTING');
      }
      break;
    }
    case 'conflicts': {
      const groups = [...document.querySelectorAll('.amg-cfitem__radios')].filter((g) => !g.querySelector('[aria-checked="true"]'));
      for (const group of groups) group.querySelector<HTMLButtonElement>('button[role=radio]')?.click();
      if (groups.length) done.push(`Chose KEEP AIO on ${groups.length} conflict${groups.length === 1 ? '' : 's'}`);
      break;
    }
    case 'approval':
    case 'new-approval':
      if (org) keepAioOnOpenConflicts(org, done);
      break;
    case 'invite': {
      const client = store.clients.find((c) => c.id === org);
      if (client && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.contactEmail) || client.contactEmail === 'pending@example.com')) {
        updateDemoStore((s) => {
          const record = s.clients.find((c) => c.id === org);
          if (record) record.contactEmail = MOCK_EMAIL;
          return s;
        });
        done.push(`Set the client email to ${MOCK_EMAIL}`);
      }
      break;
    }
    case 'new-invite': {
      const input = await find(() => document.querySelector<HTMLInputElement>('input[type=email]'));
      if (input && !input.value) {
        type(input, MOCK_EMAIL);
        done.push(`Typed the destination email ${MOCK_EMAIL}`);
      }
      break;
    }
    case 'new':
      await fill('COMPANY NAME', NEW_CLIENT.companyName, done);
      await fill('USDOT NUMBER', NEW_CLIENT.usdot, done);
      await fill('MC NUMBER', NEW_CLIENT.mc, done);
      await fill('PRIMARY CONTACT', NEW_CLIENT.contactName, done);
      await addMockFile(done);
      break;
    case 'batch':
      await fill('BATCH NAME', BATCH_NAME, done);
      ensureBatchQueue(done);
      break;
    case 'batch-processing':
      await wait(700);
      finishBatchProcessing(done);
      break;
    case 'activation': {
      const input = await find(() => document.querySelector<HTMLInputElement>('input[type=password]'));
      if (input && !input.value) {
        type(input, MOCK_PASSWORD);
        done.push('Typed a mock password (press the button to continue)');
      }
      break;
    }
    case 'confirm':
      readyToActivate(ctx.reviewOrg, done);
      break;
    default:
      break;
  }
  return done;
}

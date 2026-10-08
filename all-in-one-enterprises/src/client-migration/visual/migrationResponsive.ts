/**
 * AIO CLIENT MIGRATION — responsive page declarations.
 *
 * One responsive system, many page expressions: every migration screen declares what it is (actor, page type, density)
 * and how its regions behave (hero, primary grid, process, support, form, table, overlay). The shell and
 * aio-migration-responsive.css compose MOBILE / TABLET / DESKTOP from the declaration; no screen owns a breakpoint.
 * The family blueprint (AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT/, repo root) documents the same contract;
 * screen-responsive-map.json there is exported from this table (npm run migration:blueprint).
 *
 * A new migration page inherits the system by adding one entry here — nothing else is required to get the shell,
 * navigation, hero band, grids and tokens for its actor at every viewport.
 */
export type MigrationViewport = 'MOBILE' | 'TABLET' | 'DESKTOP';

/** Semantic breakpoints. CSS media queries use these exact values (aio-migration-responsive.css). */
export const MIGRATION_BREAKPOINTS: Record<MigrationViewport, { min: number; max?: number }> = {
  MOBILE: { min: 0, max: 699 },
  TABLET: { min: 700, max: 1023 },
  DESKTOP: { min: 1024 },
};

export type MigrationPageActor = 'STAFF' | 'CLIENT';
export type MigrationPageType =
  | 'LANDING'
  | 'PATH_SELECT'
  | 'UPLOAD'
  | 'PROCESSING'
  | 'REVIEW'
  | 'TABLE_LIST'
  | 'DETAIL'
  | 'CONFIRMATION'
  | 'INVITE'
  | 'ACTIVATION'
  | 'ARRIVAL'
  | 'BATCH';
export type MigrationDensity = 'LOW' | 'MEDIUM' | 'HIGH' | 'TABLE_HEAVY';
/** FULL: cinematic band (root, arrival). COMPACT: shorter band for working screens. NONE: no band. */
export type MigrationHeroMode = 'FULL' | 'COMPACT' | 'NONE';
/**
 * PATHS_3UP: path choice cards (stack → 3-up). MAIN_SIDE: work column + side column for next / notes / action.
 * CANVAS_PANEL: review canvas + sticky context/actions panel (founder review). SINGLE: one readable column.
 * CENTERED: one focused column centred in the shell (client screens, arrival).
 */
export type MigrationPrimaryGridMode = 'PATHS_3UP' | 'MAIN_SIDE' | 'CANVAS_PANEL' | 'SINGLE' | 'CENTERED';
/** BAND: horizontal process band (data-driven stage count). STEPPER: select steps above the work. STAGES: live stage list. */
export type MigrationProcessMode = 'BAND' | 'STEPPER' | 'STAGES' | 'NONE';
/** SUPPORT_GRID: support panels in a 1 → 2 → 3 column grid. SIDE: support lives in the side column. */
export type MigrationSupportGridMode = 'SUPPORT_GRID' | 'SIDE' | 'NONE';
/** FIELDS: label/input fields, 1 column (mobile authority) → 2 columns (tablet, desktop). CHOICES: decision controls. */
export type MigrationFormMode = 'FIELDS' | 'CHOICES' | 'NONE';
/** TABLE: stacked rows on mobile, a true table (column header row) from tablet. ROWS: record rows, never a table. */
export type MigrationTableMode = 'TABLE' | 'ROWS' | 'NONE';
/** SHEET: bottom sheet (mobile) → edge sheet (tablet) → modal / inspector (desktop). */
export type MigrationOverlayMode = 'SHEET' | 'NONE';

export type MigrationPageDeclaration = {
  screen: string;
  authority: string;
  route: string;
  actor: MigrationPageActor;
  pageType: MigrationPageType;
  density: MigrationDensity;
  hero: MigrationHeroMode;
  primaryGrid: MigrationPrimaryGridMode;
  process: MigrationProcessMode;
  support: MigrationSupportGridMode;
  form: MigrationFormMode;
  table: MigrationTableMode;
  overlay: MigrationOverlayMode;
};

type Decl = Omit<MigrationPageDeclaration, 'screen'>;
const staff = (authority: string, route: string, d: Partial<Decl> & Pick<Decl, 'pageType' | 'density'>): Decl => ({
  authority,
  route,
  actor: 'STAFF',
  hero: 'COMPACT',
  primaryGrid: 'MAIN_SIDE',
  process: 'NONE',
  support: 'SIDE',
  form: 'NONE',
  table: 'NONE',
  overlay: 'NONE',
  ...d,
});
const client = (authority: string, route: string, d: Partial<Decl> & Pick<Decl, 'pageType' | 'density'>): Decl => ({
  ...staff(authority, route, d),
  actor: 'CLIENT',
  primaryGrid: 'CENTERED',
  ...d,
});

const M = '/office/migration';
const A = '/portal/activation/review';
const PAGES: Record<string, Decl> = {
  root: staff('AIO-MIG-ROOT-001', M, { pageType: 'LANDING', density: 'MEDIUM', hero: 'FULL', primaryGrid: 'PATHS_3UP', process: 'BAND', support: 'SUPPORT_GRID' }),
  existing: staff('AIO-MIG-EXISTING-SELECT-001', `${M}/existing`, { pageType: 'PATH_SELECT', density: 'MEDIUM', process: 'STEPPER', table: 'ROWS' }),
  upload: staff('AIO-MIG-EXISTING-UPLOAD-001', `${M}/upload`, { pageType: 'UPLOAD', density: 'MEDIUM', table: 'ROWS' }),
  received: staff('AIO-MIG-EXISTING-RECEIVED-001', `${M}/received`, { pageType: 'TABLE_LIST', density: 'TABLE_HEAVY', table: 'TABLE' }),
  extract: staff('AIO-MIG-EXISTING-EXTRACT-001', `${M}/extract`, { pageType: 'PROCESSING', density: 'MEDIUM', process: 'BAND', primaryGrid: 'SINGLE' }),
  match: staff('AIO-MIG-EXISTING-MATCH-001', `${M}/match`, { pageType: 'REVIEW', density: 'HIGH', form: 'CHOICES', table: 'ROWS', primaryGrid: 'SINGLE' }),
  review: staff('AIO-MIG-EXISTING-REVIEW-001', `${M}/review`, { pageType: 'REVIEW', density: 'HIGH', primaryGrid: 'CANVAS_PANEL', process: 'STEPPER', form: 'CHOICES', table: 'ROWS' }),
  conflicts: staff('AIO-MIG-EXISTING-CONFLICTS-001', `${M}/conflicts`, { pageType: 'REVIEW', density: 'HIGH', primaryGrid: 'CANVAS_PANEL', process: 'STEPPER', form: 'CHOICES', table: 'ROWS' }),
  approval: staff('AIO-MIG-EXISTING-APPROVAL-001', `${M}/approval`, { pageType: 'CONFIRMATION', density: 'MEDIUM', table: 'ROWS' }),
  prebuilt: staff('AIO-MIG-EXISTING-PREBUILT-001', `${M}/prebuilt`, { pageType: 'DETAIL', density: 'MEDIUM', table: 'ROWS' }),
  invite: staff('AIO-MIG-EXISTING-INVITE-001', `${M}/invite`, { pageType: 'INVITE', density: 'LOW' }),
  invited: staff('AIO-MIG-EXISTING-INVITED-001', `${M}/invited`, { pageType: 'CONFIRMATION', density: 'LOW', table: 'ROWS' }),
  welcome: client('AIO-MIG-ACTIVATION-WELCOME-001', `${A}#welcome`, { pageType: 'ACTIVATION', density: 'MEDIUM', process: 'STEPPER' }),
  company: client('AIO-MIG-ACTIVATION-COMPANY-001', `${A}#company`, { pageType: 'REVIEW', density: 'MEDIUM', process: 'STEPPER', form: 'CHOICES' }),
  people: client('AIO-MIG-ACTIVATION-PEOPLE-001', `${A}#people`, { pageType: 'REVIEW', density: 'HIGH', form: 'CHOICES', table: 'ROWS' }),
  vehicles: client('AIO-MIG-ACTIVATION-VEHICLES-001', `${A}#vehicles`, { pageType: 'REVIEW', density: 'HIGH', process: 'STEPPER', form: 'CHOICES', table: 'ROWS' }),
  services: client('AIO-MIG-ACTIVATION-SERVICES-001', `${A}#services`, { pageType: 'REVIEW', density: 'MEDIUM', form: 'CHOICES', table: 'ROWS' }),
  documents: client('AIO-MIG-ACTIVATION-DOCUMENTS-001', `${A}#documents`, { pageType: 'REVIEW', density: 'MEDIUM', form: 'CHOICES', table: 'ROWS' }),
  changed: client('AIO-MIG-ACTIVATION-CHANGED-001', `${A}#changed`, { pageType: 'ACTIVATION', density: 'LOW', form: 'CHOICES' }),
  confirm: client('AIO-MIG-ACTIVATION-CONFIRM-001', `${A}#confirm`, { pageType: 'CONFIRMATION', density: 'MEDIUM', table: 'ROWS' }),
  complete: client('AIO-MIG-ACTIVATION-COMPLETE-002', `${A}#done`, { pageType: 'ARRIVAL', density: 'LOW', hero: 'FULL', support: 'NONE' }),
  new: staff('AIO-MIG-NEW-FILE-001', `${M}/new`, { pageType: 'UPLOAD', density: 'MEDIUM', form: 'FIELDS', table: 'ROWS' }),
  'new-received': staff('AIO-MIG-NEW-RECEIVED-001', `${M}/new-received`, { pageType: 'TABLE_LIST', density: 'TABLE_HEAVY', table: 'TABLE' }),
  'new-extract': staff('AIO-MIG-NEW-EXTRACT-001', `${M}/new-extract`, { pageType: 'PROCESSING', density: 'MEDIUM', process: 'STAGES', primaryGrid: 'SINGLE' }),
  'new-identity': staff('AIO-MIG-NEW-IDENTITY-001', `${M}/new-identity`, { pageType: 'DETAIL', density: 'MEDIUM', form: 'FIELDS' }),
  'new-records': staff('AIO-MIG-NEW-RECORDS-001', `${M}/new-records`, { pageType: 'REVIEW', density: 'HIGH', primaryGrid: 'CANVAS_PANEL', form: 'CHOICES', table: 'ROWS' }),
  'new-review': staff('AIO-MIG-NEW-REVIEW-001', `${M}/new-review`, { pageType: 'REVIEW', density: 'HIGH', primaryGrid: 'CANVAS_PANEL', form: 'CHOICES', table: 'ROWS' }),
  'new-approval': staff('AIO-MIG-NEW-APPROVAL-001', `${M}/new-approval`, { pageType: 'CONFIRMATION', density: 'MEDIUM', table: 'ROWS', primaryGrid: 'SINGLE' }),
  'new-prebuilt': staff('AIO-MIG-NEW-PREBUILT-001', `${M}/new-prebuilt`, { pageType: 'DETAIL', density: 'MEDIUM' }),
  'new-invite': staff('AIO-MIG-NEW-INVITE-001', `${M}/new-invite`, { pageType: 'INVITE', density: 'LOW', form: 'FIELDS' }),
  'new-confirm': staff('AIO-MIG-NEW-CONFIRM-001', `${M}/new-confirm`, { pageType: 'CONFIRMATION', density: 'LOW', table: 'ROWS' }),
  batch: staff('AIO-MIG-BULK-001', `${M}/batch`, { pageType: 'BATCH', density: 'MEDIUM', form: 'FIELDS', table: 'ROWS' }),
  'batch-received': staff('AIO-MIG-BATCH-RECEIVED-001', `${M}/batch-received`, { pageType: 'BATCH', density: 'MEDIUM' }),
  'batch-processing': staff('AIO-MIG-BATCH-PROCESSING-001', `${M}/batch-processing`, { pageType: 'PROCESSING', density: 'MEDIUM', process: 'BAND', form: 'FIELDS', primaryGrid: 'SINGLE' }),
  'batch-summary': staff('AIO-MIG-BATCH-SUMMARY-001', `${M}/batch-summary`, { pageType: 'BATCH', density: 'MEDIUM', primaryGrid: 'SINGLE' }),
  'batch-conflicts': staff('AIO-MIG-BATCH-CONFLICTS-001', `${M}/batch-conflicts`, { pageType: 'TABLE_LIST', density: 'TABLE_HEAVY', form: 'CHOICES', table: 'ROWS' }),
  'batch-queue': staff('AIO-MIG-BATCH-QUEUE-001', `${M}/batch-queue`, { pageType: 'TABLE_LIST', density: 'TABLE_HEAVY', table: 'TABLE' }),
  'batch-client': staff('AIO-MIG-BATCH-CLIENT-001', `${M}/batch-client`, { pageType: 'DETAIL', density: 'HIGH', table: 'ROWS' }),
  'batch-approval': staff('AIO-MIG-BATCH-APPROVAL-001', `${M}/batch-approval`, { pageType: 'CONFIRMATION', density: 'MEDIUM' }),
  'batch-run': staff('AIO-MIG-BATCH-RUN-001', `${M}/batch-run`, { pageType: 'PROCESSING', density: 'MEDIUM', process: 'STAGES' }),
  'batch-complete': staff('AIO-MIG-BATCH-COMPLETE-001', `${M}/batch-complete`, { pageType: 'CONFIRMATION', density: 'MEDIUM', table: 'ROWS' }),
};

export const MIGRATION_PAGES: Record<string, MigrationPageDeclaration> = Object.fromEntries(
  Object.entries(PAGES).map(([screen, d]) => [screen, { screen, ...d }]),
);

/** A screen without a declaration still gets a safe default (staff working screen) — and a dev warning. */
export function migrationPage(screen: string, actor: MigrationPageActor = 'STAFF'): MigrationPageDeclaration {
  const found = MIGRATION_PAGES[screen];
  if (found) return found;
  if (import.meta.env?.DEV) console.warn(`[migration] no responsive declaration for screen "${screen}" — add it to migrationResponsive.ts`);
  return { screen, ...(actor === 'CLIENT' ? client('', '', { pageType: 'DETAIL', density: 'MEDIUM' }) : staff('', '', { pageType: 'DETAIL', density: 'MEDIUM' })) };
}

/** Data attributes the shell writes on the .amg root; the responsive CSS reads only these. */
export function migrationPageAttributes(page: MigrationPageDeclaration): Record<string, string> {
  return {
    'data-page-type': page.pageType,
    'data-density': page.density,
    'data-hero': page.hero,
    'data-grid': page.primaryGrid,
    'data-process': page.process,
    'data-support': page.support,
    'data-form': page.form,
    'data-table': page.table,
    'data-overlay': page.overlay,
  };
}

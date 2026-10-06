/**
 * IFTA experience contract — typed read access to the Workspace Experience Brain export (yoteenz/SITE00).
 *
 * The JSON beside this file is vendored byte-for-byte by scripts/experience-brain/sync-ifta-contract.mjs.
 * Pages never restate what the contract already says: state labels, per-actor meanings, CTAs, section order,
 * emphasis roles, public copy, inbox / activity summaries and receipt / mileage vocabulary are read from here.
 */
import contractFile from './AIO_IFTA_FUEL_TAX_EXPERIENCE_CONTRACT.json';
import provenanceFile from './provenance.json';

export type IftaActor = 'PUBLIC' | 'CLIENT' | 'FOUNDER_STAFF' | 'SYSTEM';

export type IftaStateId =
  | 'NOT_ENROLLED'
  | 'QUARTER_OPEN'
  | 'COLLECTING'
  | 'NEEDS_CLIENT'
  | 'OVERDUE_RISK'
  | 'AIO_REVIEW'
  | 'RECONCILING'
  | 'AWAITING_APPROVAL'
  | 'FILING'
  | 'FILED'
  | 'ARCHIVED'
  | 'FILING_REJECTED';

export type IftaStateClass = 'EMPTY' | 'ACTIVE' | 'BLOCKED' | 'REVIEW' | 'APPROVAL' | 'COMPLETE' | 'ARCHIVED' | 'ERROR';

export type IftaEmphasisRole =
  | 'NEUTRAL'
  | 'PROGRESS'
  | 'ATTENTION'
  | 'BLOCKER'
  | 'REVIEW'
  | 'DECISION'
  | 'SUCCESS'
  | 'ARCHIVED'
  | 'ERROR';

export type IftaPanelDensity = 'SPARSE' | 'BALANCED' | 'DENSE';
export type IftaArtifactVisibility = 'HIDDEN' | 'PREVIEW' | 'PROMINENT' | 'ARCHIVED';

export interface IftaExperienceState {
  id: IftaStateId;
  label: string;
  state_class: IftaStateClass;
  meaning: Partial<Record<IftaActor, string>>;
  structure_states?: string[];
}

export interface IftaVisualRelationship {
  state: IftaStateId;
  composition_emphasis: string;
  emphasis_role: IftaEmphasisRole;
  panel_density: IftaPanelDensity;
  primary_cta: Partial<Record<IftaActor, string>>;
  artifact_visibility: IftaArtifactVisibility;
  nav_emphasis: string;
  status_treatment: string;
  quiet: string[];
}

export interface IftaChannelEvent {
  id: string;
  channel: string;
  trigger: string;
  audience: string[];
  summary: string;
  resolves?: string;
}

export interface IftaPublicPerspective {
  route: string;
  discovery: string[];
  must_understand: string[];
  who_its_for: string;
  what_we_handle: string[];
  what_client_provides: string[];
  how_it_works: string[];
  outcome: string;
  timing: string;
  pricing_relationship: string;
  cta: string;
  workspace_continuity: string;
}

export interface IftaClientPerspective {
  entry_point: string;
  primary_task: string;
  sees_first: string;
  must_provide: string[];
  input_methods: string[];
  system_already_knows: string[];
  ready_signals: string[];
  needs_you: string[];
  under_review: string[];
  approves: string[];
  completion_looks_like: string;
  artifacts_received: string[];
  what_happens_next: string;
  project_room: Record<string, string>;
}

export interface IftaStaffPerspective {
  client_context: string[];
  work_queue: string;
  status_model: IftaStateId[];
  blockers: string[];
  missing_inputs: string[];
  system_flags: string[];
  human_review: string[];
  corrections: string[];
  approval: string[];
  overrides: string[];
  operational_actions: string[];
  communication: string[];
  artifact_generation: string[];
  completion: string;
  audit_history: string[];
  hub_buckets: Record<string, IftaStateId[]>;
  mirror_not_copy: string;
}

export interface IftaInformationHierarchy {
  primary_question: string;
  primary_status: string;
  primary_task: string;
  secondary_status: string;
  blocker: string;
  next_action: string;
  completion_proof: string;
}

export interface IftaViewportBehavior {
  task_model: string;
  layout: string;
  primary_object_treatment: string;
  input_treatment: string;
}

export interface IftaOutputArtifact {
  id: string;
  name: string;
  type: string;
  owner: string;
  visible_to: string[];
  vault_destination: string;
  view_behavior: string;
  status_lifecycle: string[];
}

export interface IftaMileageSourceDef {
  id: 'ELD_GPS_IMPORT' | 'ELD_REPORT_UPLOAD' | 'MANUAL_STATE_ENTRY' | 'SPREADSHEET' | 'AIO_ASSISTANCE' | 'LOAD_DERIVED_ESTIMATE';
  label: string;
  structure_source: 'eld_verified' | 'manual_verified' | 'driver_reported' | 'loaded_miles';
  quality: string;
  note: string;
}

export interface IftaExperienceContract {
  feature_id: string;
  feature_name: string;
  purpose: string;
  business_promise: string;
  user_value: string;
  states: IftaExperienceState[];
  transitions: { from: IftaStateId; to: IftaStateId; trigger: string; actor: IftaActor }[];
  required_inputs: { id: string; label: string; methods: string[]; required_for: string; quality_signal?: string }[];
  output_artifacts: IftaOutputArtifact[];
  vault_destination: string;
  inbox_events: IftaChannelEvent[];
  activity_events: IftaChannelEvent[];
  notifications: IftaChannelEvent[];
  human_tasks: IftaChannelEvent[];
  next_step: string;
  cross_feature_relationships: {
    id: string;
    from_state: string;
    to_feature: string;
    relationship: string;
    actor_effects: Partial<Record<IftaActor, string>>;
    surface_effects: Record<string, string>;
    visual_transition: string;
  }[];
  perspectives: {
    public: IftaPublicPerspective;
    client: IftaClientPerspective;
    founder_staff: IftaStaffPerspective;
    system: Record<string, string[] | string>;
  };
  primary_metaphor: string;
  secondary_metaphor: string;
  visual_archetype: string[];
  primary_visual_object: string;
  secondary_visual_objects: string[];
  composition_rules: string[];
  information_hierarchy: Record<'PUBLIC' | 'CLIENT' | 'FOUNDER_STAFF', IftaInformationHierarchy>;
  interaction_grammar: { verb: string; actor: IftaActor; meaning: string; moves_to?: IftaStateId }[];
  emotional_target: Record<IftaActor, string>;
  density_target: IftaPanelDensity;
  mobile_behavior: IftaViewportBehavior;
  tablet_behavior: IftaViewportBehavior;
  desktop_behavior: IftaViewportBehavior;
  public_cta: string;
  client_cta: string;
  staff_cta: string;
  avoid_list: string[];
  visual_relationships: IftaVisualRelationship[];
  section_overrides: Partial<Record<'CLIENT' | 'FOUNDER_STAFF', Partial<Record<IftaStateId, string[]>>>>;
  e2e_proof_contract: { journey: string; steps: { phase: string; actor: string; surface: string; action: string; expect: string[]; state_after?: IftaStateId }[] };
}

interface ContractFile {
  sprint: string;
  schema_version: string;
  contract: IftaExperienceContract;
  receipt_classes: Record<'READY' | 'NEEDS_YOU' | 'DUPLICATE' | 'POSSIBLE_MISSING' | 'UNREADABLE', string>;
  mileage_sources: IftaMileageSourceDef[];
}

const file = contractFile as unknown as ContractFile;

export const IFTA_EXPERIENCE: IftaExperienceContract = file.contract;
export const IFTA_EXPERIENCE_SCHEMA_VERSION = file.schema_version;
export const IFTA_EXPERIENCE_PROVENANCE = provenanceFile as {
  source_repo: string;
  source_path: string;
  source_commit: string;
  source_sprint: string;
  files: Record<string, { sha256: string; bytes: number }>;
};
export const IFTA_RECEIPT_CLASS_RULES = file.receipt_classes;
export const IFTA_MILEAGE_SOURCES: IftaMileageSourceDef[] = file.mileage_sources;

const STATE_BY_ID = new Map(IFTA_EXPERIENCE.states.map((s) => [s.id, s]));
const VISUAL_BY_ID = new Map(IFTA_EXPERIENCE.visual_relationships.map((v) => [v.state, v]));

export function experienceState(id: IftaStateId): IftaExperienceState {
  const state = STATE_BY_ID.get(id);
  if (!state) throw new Error(`IFTA experience contract has no state ${id}`);
  return state;
}

export function visualRelationship(id: IftaStateId): IftaVisualRelationship {
  const v = VISUAL_BY_ID.get(id);
  if (!v) throw new Error(`IFTA experience contract has no visual relationship for ${id}`);
  return v;
}

/** Variables the contract templates use. `{n}` is overloaded (quarter number in `Q{n}`, a count elsewhere). */
export interface IftaTemplateVars {
  quarter?: number;
  year?: number;
  count?: number;
  pct?: number;
  dueDate?: string;
  days?: number;
  date?: string;
  client?: string;
  baseJurisdiction?: string;
  confirmation?: string;
}

/** Fill a contract template. `Q{n+1}` / `Q{n}` resolve to the quarter first; any remaining `{n}` is a count. */
export function fillTemplate(template: string, vars: IftaTemplateVars): string {
  const next = vars.quarter ? (vars.quarter % 4) + 1 : undefined;
  let out = template;
  if (next !== undefined) out = out.replace(/Q\{n\+1\}/g, `Q${next}`);
  if (vars.quarter !== undefined) out = out.replace(/Q\{n\}/g, `Q${vars.quarter}`);
  const replacements: [RegExp, string | number | undefined][] = [
    [/\{YYYY\}/g, vars.year],
    [/\{n\}/g, vars.count],
    [/\{pct\}/g, vars.pct],
    [/\{due_date\}/g, vars.dueDate],
    [/\{d\}/g, vars.days],
    [/\{date\}/g, vars.date],
    [/\{client\}/g, vars.client],
    [/\{base_jurisdiction\}/g, vars.baseJurisdiction],
  ];
  for (const [pattern, value] of replacements) {
    if (value !== undefined) out = out.replace(pattern, String(value));
  }
  if (vars.confirmation !== undefined) out = out.replace(/confirmation #/g, `confirmation ${vars.confirmation}`);
  if (vars.count === 1) out = out.replace(/\b1 (\w+ )?(items|receipts|trucks|discrepancies)\b/, (_m, adj = '', noun: string) => `1 ${adj}${noun === 'discrepancies' ? 'discrepancy' : noun.slice(0, -1)}`).replace(/\b1 (\w+ )?(item|receipt|truck) need\b/, '1 $1$2 needs');
  return out;
}

/** The actor-specific meaning of a state, e.g. NEEDS_CLIENT → CLIENT “A few items need you before AIO can review”. */
export function stateMeaning(id: IftaStateId, actor: IftaActor, vars: IftaTemplateVars = {}): string {
  const state = experienceState(id);
  return fillTemplate(state.meaning[actor] ?? state.label, vars);
}

export function stateLabel(id: IftaStateId, vars: IftaTemplateVars = {}): string {
  return fillTemplate(experienceState(id).label, vars);
}

/** Exactly one primary action per state (composition rule 2). */
export function primaryCta(id: IftaStateId, actor: IftaActor, vars: IftaTemplateVars = {}): string {
  const cta = visualRelationship(id).primary_cta[actor];
  return cta ? fillTemplate(cta, vars) : '';
}

export function statusTreatment(id: IftaStateId, vars: IftaTemplateVars = {}): string {
  return fillTemplate(visualRelationship(id).status_treatment, vars);
}

const DEFAULT_CLIENT_SECTIONS: Record<IftaStateClass, string[]> = {
  EMPTY: ['QUARTER', 'CAPTURE_METHODS', 'VEHICLES_PREFILLED', 'DUE_DATE'],
  ACTIVE: ['QUARTER', 'NEXT_ITEM', 'RECEIPTS', 'MILEAGE', 'VEHICLES', 'SEND_TO_AIO'],
  BLOCKED: ['QUARTER', 'FLAGS', 'RECEIPTS', 'MILEAGE'],
  REVIEW: ['QUARTER', 'AIO_AT_WORK', 'PACKET_LOCKED'],
  APPROVAL: ['QUARTER', 'RETURN_SUMMARY', 'APPROVE_OR_ASK'],
  COMPLETE: ['QUARTER_SEALED', 'CONFIRMATION', 'ARTIFACTS', 'VAULT_LINK', 'NEXT_QUARTER'],
  ARCHIVED: ['QUARTER_SEALED', 'ARTIFACTS', 'VAULT_LINK', 'NEXT_QUARTER'],
  ERROR: ['QUARTER', 'CORRECTION_NOTICE', 'RETURN_SUMMARY'],
};

const DEFAULT_STAFF_SECTIONS: Record<IftaStateClass, string[]> = {
  EMPTY: ['CLIENT_CONTEXT', 'QUARTER_CASE', 'ACTIONS'],
  ACTIVE: ['CLIENT_CONTEXT', 'QUARTER_CASE', 'RECEIPT_CLASSES', 'MILEAGE_QUALITY', 'VEHICLE_READINESS', 'ACTIONS'],
  BLOCKED: ['CLIENT_CONTEXT', 'QUARTER_CASE', 'FLAGS', 'RECEIPT_CLASSES', 'MILEAGE_QUALITY', 'ACTIONS'],
  REVIEW: ['CLIENT_CONTEXT', 'QUARTER_CASE', 'RECEIPT_CLASSES', 'MILEAGE_QUALITY', 'VEHICLE_READINESS', 'FLAGS', 'ACTIONS'],
  APPROVAL: ['CLIENT_CONTEXT', 'APPROVED_SUMMARY', 'ACTIONS'],
  COMPLETE: ['CLIENT_CONTEXT', 'FILING_STATUS', 'PAYMENT_STATUS', 'ARTIFACTS', 'AUDIT_HISTORY'],
  ARCHIVED: ['CLIENT_CONTEXT', 'FILING_STATUS', 'PAYMENT_STATUS', 'ARTIFACTS', 'AUDIT_HISTORY'],
  ERROR: ['CLIENT_CONTEXT', 'FILING_STATUS', 'DISCREPANCIES', 'ACTIONS'],
};

/**
 * Section order for an actor in a state. The contract's section_overrides win; states it does not list fall back to
 * the state-class default above (the same section grammar, so REVIEW quiets inputs and COMPLETE collapses the bench).
 */
export function sectionsFor(actor: 'CLIENT' | 'FOUNDER_STAFF', id: IftaStateId): { sections: string[]; fromContract: boolean } {
  const override = IFTA_EXPERIENCE.section_overrides[actor]?.[id];
  if (override) return { sections: override, fromContract: true };
  const cls = experienceState(id).state_class;
  return { sections: (actor === 'CLIENT' ? DEFAULT_CLIENT_SECTIONS : DEFAULT_STAFF_SECTIONS)[cls], fromContract: false };
}

export function channelEvent(kind: 'inbox' | 'activity' | 'notification' | 'task', id: string): IftaChannelEvent {
  const list =
    kind === 'inbox'
      ? IFTA_EXPERIENCE.inbox_events
      : kind === 'activity'
        ? IFTA_EXPERIENCE.activity_events
        : kind === 'notification'
          ? IFTA_EXPERIENCE.notifications
          : IFTA_EXPERIENCE.human_tasks;
  const event = list.find((e) => e.id === id);
  if (!event) throw new Error(`IFTA experience contract has no ${kind} event ${id}`);
  return event;
}

export function staffHubBucketFor(id: IftaStateId): string | null {
  for (const [bucket, states] of Object.entries(IFTA_EXPERIENCE.perspectives.founder_staff.hub_buckets)) {
    if (states.includes(id)) return bucket;
  }
  return null;
}

export function mileageSourceDef(id: IftaMileageSourceDef['id']): IftaMileageSourceDef {
  const def = IFTA_MILEAGE_SOURCES.find((s) => s.id === id);
  if (!def) throw new Error(`IFTA experience contract has no mileage source ${id}`);
  return def;
}

export function crossFeatureEffect(id: string) {
  const rel = IFTA_EXPERIENCE.cross_feature_relationships.find((r) => r.id === id);
  if (!rel) throw new Error(`IFTA experience contract has no relationship ${id}`);
  return rel;
}

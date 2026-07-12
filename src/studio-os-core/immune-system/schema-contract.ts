/**
 * Machine-readable schema contract — derived from supabase/migrations/.
 */

export type SchemaColumnContract = {
  name: string;
  dataType: string;
  nullable: boolean;
  defaultExpression?: string;
};

export type SchemaIndexContract = {
  name: string;
  columns: string[];
  unique?: boolean;
  where?: string;
};

export type SchemaTableContract = {
  schema: string;
  name: string;
  qualifiedName: string;
  columns: SchemaColumnContract[];
  indexes: SchemaIndexContract[];
  rlsRequired: boolean;
  primaryKey: string[];
};

export const STUDIO_GOVERNED_GENERATION_JOBS_TABLE: SchemaTableContract = {
  schema: 'public',
  name: 'studio_governed_generation_jobs',
  qualifiedName: 'public.studio_governed_generation_jobs',
  primaryKey: ['id'],
  rlsRequired: true,
  columns: [
    { name: 'id', dataType: 'uuid', nullable: false },
    { name: 'job_id', dataType: 'text', nullable: false },
    { name: 'idempotency_key', dataType: 'text', nullable: false },
    { name: 'org_id', dataType: 'text', nullable: false },
    { name: 'company_id', dataType: 'text', nullable: true },
    { name: 'department_id', dataType: 'text', nullable: true },
    { name: 'station_id', dataType: 'text', nullable: true },
    { name: 'project_id', dataType: 'text', nullable: true },
    { name: 'concept_id', dataType: 'text', nullable: true },
    { name: 'surface', dataType: 'text', nullable: true },
    { name: 'compile_run_id', dataType: 'text', nullable: true },
    { name: 'client_request_id', dataType: 'text', nullable: true },
    { name: 'server_trace_id', dataType: 'text', nullable: false },
    { name: 'provider', dataType: 'text', nullable: false },
    { name: 'provider_model', dataType: 'text', nullable: true },
    { name: 'provider_request_id', dataType: 'text', nullable: true },
    { name: 'generation_type', dataType: 'text', nullable: false },
    { name: 'source_route', dataType: 'text', nullable: false },
    { name: 'source_system', dataType: 'text', nullable: false },
    { name: 'status', dataType: 'text', nullable: false },
    { name: 'progress_phase', dataType: 'text', nullable: false },
    { name: 'progress_pct', dataType: 'integer', nullable: false },
    { name: 'result_asset_url', dataType: 'text', nullable: true },
    { name: 'normalized_asset_url', dataType: 'text', nullable: true },
    { name: 'registry_asset_id', dataType: 'text', nullable: true },
    { name: 'storage_path', dataType: 'text', nullable: true },
    { name: 'error_category', dataType: 'text', nullable: true },
    { name: 'error_message', dataType: 'text', nullable: true },
    { name: 'retry_count', dataType: 'integer', nullable: false },
    { name: 'cancellation_state', dataType: 'text', nullable: false },
    { name: 'expires_at', dataType: 'timestamptz', nullable: true },
    { name: 'created_by', dataType: 'text', nullable: true },
    { name: 'actor_id', dataType: 'text', nullable: false },
    { name: 'governance_context', dataType: 'jsonb', nullable: false },
    { name: 'request_payload', dataType: 'jsonb', nullable: false },
    { name: 'audit_payload', dataType: 'jsonb', nullable: true },
    { name: 'provider_state', dataType: 'text', nullable: true },
    { name: 'requested_at', dataType: 'timestamptz', nullable: false },
    { name: 'accepted_at', dataType: 'timestamptz', nullable: false },
    { name: 'started_at', dataType: 'timestamptz', nullable: true },
    { name: 'completed_at', dataType: 'timestamptz', nullable: true },
    { name: 'failed_at', dataType: 'timestamptz', nullable: true },
    { name: 'created_at', dataType: 'timestamptz', nullable: false },
    { name: 'updated_at', dataType: 'timestamptz', nullable: false },
  ],
  indexes: [
    { name: 'studio_governed_generation_jobs_org_status_idx', columns: ['org_id', 'status', 'created_at'] },
    { name: 'studio_governed_generation_jobs_idempotency_idx', columns: ['idempotency_key'] },
    {
      name: 'studio_governed_generation_jobs_compile_run_idx',
      columns: ['compile_run_id'],
      where: 'compile_run_id is not null',
    },
    {
      name: 'studio_governed_generation_jobs_idempotency_active_uidx',
      columns: ['idempotency_key'],
      unique: true,
      where: "status not in ('complete', 'failed', 'cancelled', 'expired')",
    },
  ],
};

export const IMMUNE_SCHEMA_CONTRACT_TABLES: SchemaTableContract[] = [
  STUDIO_GOVERNED_GENERATION_JOBS_TABLE,
];

export function getSchemaTableContract(qualifiedName: string): SchemaTableContract | null {
  return IMMUNE_SCHEMA_CONTRACT_TABLES.find((t) => t.qualifiedName === qualifiedName) ?? null;
}

export function verifyTableContractAgainstProbe(
  contract: SchemaTableContract,
  probe: {
    tableExists: boolean;
    rlsEnabled: boolean | null;
    columns: Array<{ name: string; data_type: string; is_nullable: boolean }>;
    indexes: string[];
  }
): { ok: boolean; failures: string[] } {
  const failures: string[] = [];
  if (!probe.tableExists) failures.push(`missing table ${contract.qualifiedName}`);
  if (contract.rlsRequired && probe.rlsEnabled !== true) failures.push(`RLS not enabled on ${contract.qualifiedName}`);
  for (const col of contract.columns) {
    const live = probe.columns.find((c) => c.name === col.name);
    if (!live) failures.push(`missing column ${col.name}`);
    else if (!columnTypesCompatible(col.dataType, live.data_type)) {
      failures.push(`incompatible type for ${col.name}: expected ${col.dataType}, observed ${live.data_type}`);
    } else if (col.nullable !== live.is_nullable) {
      failures.push(`nullable mismatch for ${col.name}`);
    }
  }
  for (const idx of contract.indexes) {
    if (!probe.indexes.some((n) => n === idx.name)) failures.push(`missing index ${idx.name}`);
  }
  return { ok: failures.length === 0, failures };
}

function columnTypesCompatible(expected: string, observed: string): boolean {
  const e = expected.toLowerCase();
  const o = observed.toLowerCase();
  if (e === o) return true;
  if (e === 'timestamptz' && (o === 'timestamp with time zone' || o === 'timestamptz')) return true;
  if (e === 'jsonb' && o === 'jsonb') return true;
  if (e === 'uuid' && o === 'uuid') return true;
  if (e === 'integer' && (o === 'integer' || o === 'int4')) return true;
  if (e === 'text' && o === 'text') return true;
  return false;
}

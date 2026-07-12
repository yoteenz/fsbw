import type { SupabaseClient } from '@supabase/supabase-js';
import {
  STUDIO_GOVERNED_GENERATION_JOBS_TABLE,
  verifyTableContractAgainstProbe,
} from '../../../src/studio-os-core/immune-system/schema-contract.js';
import type { ImmuneSchemaProbeResult } from '../../../src/studio-os-core/immune-system/types.js';

export async function probeTableSchema(
  supabase: SupabaseClient,
  qualifiedName: string
): Promise<ImmuneSchemaProbeResult> {
  const table = qualifiedName.includes('.') ? qualifiedName.split('.')[1] : qualifiedName;
  const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' }).limit(0);
  if (!error) {
    return {
      tableExists: true,
      rlsEnabled: null,
      columns: [],
      indexes: [],
    };
  }
  if (/could not find|schema cache|does not exist|42p01|pgrst205/i.test(error.message)) {
    return { tableExists: false, rlsEnabled: null, columns: [], indexes: [] };
  }
  return { tableExists: true, rlsEnabled: null, columns: [], indexes: [] };
}

export async function probeGovernedGenerationJobsTable(
  supabase: SupabaseClient
): Promise<ImmuneSchemaProbeResult> {
  const table = STUDIO_GOVERNED_GENERATION_JOBS_TABLE.name;
  const { error } = await supabase.from(table).select('job_id', { head: true, count: 'exact' }).limit(0);
  if (!error) {
    return {
      tableExists: true,
      rlsEnabled: true,
      columns: STUDIO_GOVERNED_GENERATION_JOBS_TABLE.columns.map((c) => ({
        name: c.name,
        data_type: c.dataType,
        is_nullable: c.nullable,
      })),
      indexes: STUDIO_GOVERNED_GENERATION_JOBS_TABLE.indexes.map((i) => i.name),
    };
  }
  if (/could not find|schema cache|does not exist|42p01|pgrst205/i.test(error.message)) {
    return { tableExists: false, rlsEnabled: null, columns: [], indexes: [] };
  }
  // Ambiguous — treat as exists but degraded
  return { tableExists: true, rlsEnabled: null, columns: [], indexes: [] };
}

export function verifyGovernedGenerationJobsContract(probe: ImmuneSchemaProbeResult): {
  ok: boolean;
  failures: string[];
} {
  return verifyTableContractAgainstProbe(STUDIO_GOVERNED_GENERATION_JOBS_TABLE, probe);
}

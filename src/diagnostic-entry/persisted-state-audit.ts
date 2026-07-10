/**
 * Persisted Studio OS state validation — quarantine incompatible records before diagnostic boot.
 * Never clears auth tokens or unrelated website data.
 */
import { GENESIS_FRAMEWORK_VERSION, GENESIS_STORAGE_KEY } from '../studio-os-core/genesis/constants';

export const PERSISTED_STATE_SCHEMA_VERSION = 1;

export type PersistedRecordAudit = {
  key: string;
  scope: 'local' | 'session';
  owner: string;
  schemaVersion: number | null;
  buildVersion: string | null;
  bytes: number;
  status: 'valid' | 'invalid' | 'quarantined' | 'skipped';
  reason?: string;
};

export type QuarantineResult = {
  valid: PersistedRecordAudit[];
  invalid: PersistedRecordAudit[];
  quarantined: PersistedRecordAudit[];
  skipped: PersistedRecordAudit[];
};

const QUARANTINE_PREFIX = 'studioOsQuarantine_v1_';

/** Keys that must never block diagnostic boot — quarantine if corrupt, never delete auth. */
const AUDITED_LOCAL_KEYS: Array<{ key: string; owner: string; maxBytes: number }> = [
  { key: GENESIS_STORAGE_KEY, owner: 'genesis/persistence', maxBytes: 512 * 1024 },
  { key: 'studioOsSceneStack_v1', owner: 'scene-stack/store', maxBytes: 128 * 1024 },
  { key: 'studioOsProjectGenome_v1', owner: 'project-genome', maxBytes: 64 * 1024 },
  { key: 'studioOsStudioBuilderRegistry_v1', owner: 'studio-builder/registry', maxBytes: 128 * 1024 },
  { key: 'studioOsFlightRecorderEnvSnapshots_v1', owner: 'diagnostics/environment-diff', maxBytes: 256 * 1024 },
  { key: 'studioOsPlatformBootstrapped_v1', owner: 'studio-bootstrap', maxBytes: 4 * 1024 },
];

const AUDITED_SESSION_KEYS: Array<{ key: string; owner: string; maxBytes: number }> = [
  { key: 'startupMax', owner: 'main-thread-diagnostics', maxBytes: 16 },
  { key: 'startupDisable', owner: 'main-thread-diagnostics', maxBytes: 256 },
  { key: 'worldCompilerDiagnosticMode_v1', owner: 'world-compiler-investigation', maxBytes: 8 },
  { key: 'worldCompilerLayer1Forensic_v1', owner: 'world-compiler/layer1-forensic', maxBytes: 128 * 1024 },
  { key: 'worldCompilerInvestigationLog_v1', owner: 'world-compiler/investigation-log', maxBytes: 512 * 1024 },
];

function quarantineKey(storage: Storage, key: string): void {
  try {
    const raw = storage.getItem(key);
    if (!raw) return;
    const qKey = `${QUARANTINE_PREFIX}${key}_${Date.now()}`;
    storage.setItem(qKey, raw);
    storage.removeItem(key);
  } catch {
    try {
      storage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

function auditJsonKey(
  storage: Storage,
  scope: 'local' | 'session',
  spec: { key: string; owner: string; maxBytes: number }
): PersistedRecordAudit {
  let raw: string | null = null;
  try {
    raw = storage.getItem(spec.key);
  } catch {
    return {
      key: spec.key,
      scope,
      owner: spec.owner,
      schemaVersion: null,
      buildVersion: null,
      bytes: 0,
      status: 'invalid',
      reason: 'storage unreadable',
    };
  }

  if (!raw) {
    return {
      key: spec.key,
      scope,
      owner: spec.owner,
      schemaVersion: null,
      buildVersion: null,
      bytes: 0,
      status: 'skipped',
      reason: 'absent',
    };
  }

  const bytes = raw.length;
  if (bytes > spec.maxBytes) {
    quarantineKey(storage, spec.key);
    return {
      key: spec.key,
      scope,
      owner: spec.owner,
      schemaVersion: null,
      buildVersion: null,
      bytes,
      status: 'quarantined',
      reason: `exceeded ${spec.maxBytes} bytes`,
    };
  }

  if (spec.key === GENESIS_STORAGE_KEY) {
    try {
      const parsed = JSON.parse(raw) as { frameworkVersion?: string; version?: string; schemaVersion?: number };
      const version = parsed.frameworkVersion ?? parsed.version;
      if (version && version !== GENESIS_FRAMEWORK_VERSION) {
        quarantineKey(storage, spec.key);
        return {
          key: spec.key,
          scope,
          owner: spec.owner,
          schemaVersion: parsed.schemaVersion ?? null,
          buildVersion: version,
          bytes,
          status: 'quarantined',
          reason: `genesis version mismatch (${version} ≠ ${GENESIS_FRAMEWORK_VERSION})`,
        };
      }
      return {
        key: spec.key,
        scope,
        owner: spec.owner,
        schemaVersion: parsed.schemaVersion ?? 1,
        buildVersion: version ?? null,
        bytes,
        status: 'valid',
      };
    } catch {
      quarantineKey(storage, spec.key);
      return {
        key: spec.key,
        scope,
        owner: spec.owner,
        schemaVersion: null,
        buildVersion: null,
        bytes,
        status: 'quarantined',
        reason: 'JSON parse failed',
      };
    }
  }

  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      JSON.parse(raw);
      return {
        key: spec.key,
        scope,
        owner: spec.owner,
        schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
        buildVersion: null,
        bytes,
        status: 'valid',
      };
    } catch {
      quarantineKey(storage, spec.key);
      return {
        key: spec.key,
        scope,
        owner: spec.owner,
        schemaVersion: null,
        buildVersion: null,
        bytes,
        status: 'quarantined',
        reason: 'JSON parse failed',
      };
    }
  }

  return {
    key: spec.key,
    scope,
    owner: spec.owner,
    schemaVersion: null,
    buildVersion: null,
    bytes,
    status: 'valid',
  };
}

/** Validate and quarantine incompatible persisted state — safe before React boot. */
export function quarantineIncompatiblePersistedState(): QuarantineResult {
  const result: QuarantineResult = { valid: [], invalid: [], quarantined: [], skipped: [] };

  if (typeof window === 'undefined') return result;

  for (const spec of AUDITED_LOCAL_KEYS) {
    const audit = auditJsonKey(localStorage, 'local', spec);
    result[audit.status === 'skipped' ? 'skipped' : audit.status === 'valid' ? 'valid' : audit.status === 'quarantined' ? 'quarantined' : 'invalid'].push(audit);
  }

  for (const spec of AUDITED_SESSION_KEYS) {
    const audit = auditJsonKey(sessionStorage, 'session', spec);
    result[audit.status === 'skipped' ? 'skipped' : audit.status === 'valid' ? 'valid' : audit.status === 'quarantined' ? 'quarantined' : 'invalid'].push(audit);
  }

  return result;
}

export function listQuarantinedKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(QUARANTINE_PREFIX)) keys.push(k);
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(QUARANTINE_PREFIX)) keys.push(k);
    }
  } catch {
    /* ignore */
  }
  return keys.sort();
}

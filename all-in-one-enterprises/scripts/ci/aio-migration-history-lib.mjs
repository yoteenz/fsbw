#!/usr/bin/env node
/**
 * Pure helpers for AIO migration history check (local vs remote version sets).
 */

const VERSION_RE = /^\d{14}$/;

/**
 * Parse Supabase CLI `migration list --linked` terminal output.
 * Extracts the Remote column (second pipe-delimited field).
 */
export function parseRemoteVersionsFromCliOutput(text) {
  const versions = new Set();
  let sawDataRow = false;
  let malformed = false;

  if (typeof text !== 'string') {
    return { versions: [], malformed: true, sawDataRow: false };
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    if (/^\s*local\b/i.test(line) && /\bremote\b/i.test(line)) continue;
    if (/^[\s\-|│┼─═┬┴├┤]+$/u.test(line.trim())) continue;
    if (/^connecting to remote database/i.test(line.trim())) continue;
    if (/^finished\s+supabase/i.test(line.trim())) continue;

    const cols = line.split(/[|│]/).map((c) => c.trim().replace(/`/g, ''));
    if (cols.length < 2) continue;

    const remote = cols[1];
    if (!remote) continue;

    if (VERSION_RE.test(remote)) {
      versions.add(remote);
      sawDataRow = true;
      continue;
    }

    if (remote && !/^remote$/i.test(remote)) {
      malformed = true;
    }
  }

  if (!sawDataRow && text.trim().length > 0) {
    malformed = true;
  }

  return {
    versions: [...versions].sort(),
    malformed,
    sawDataRow,
  };
}

/** Parse one version per line from SQL query output. */
export function parseRemoteVersionsFromSqlOutput(text) {
  const versions = [];
  let malformed = false;

  if (typeof text !== 'string') {
    return { versions: [], malformed: true };
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^psql:/i.test(line) || /^error:/i.test(line)) {
      malformed = true;
      continue;
    }
    if (VERSION_RE.test(line)) {
      versions.push(line);
    } else {
      malformed = true;
    }
  }

  return { versions: [...new Set(versions)].sort(), malformed };
}

export function compareHistories(localVersions, remoteVersions) {
  const local = [...localVersions].sort();
  const remote = [...remoteVersions].sort();
  const remoteOnly = remote.filter((v) => !local.includes(v));
  const localOnly = local.filter((v) => !remote.includes(v));
  const historyStatus =
    remoteOnly.length === 0 && localOnly.length === 0 ? 'MATCH' : 'MISMATCH';

  return { remoteOnly, localOnly, historyStatus };
}

/**
 * Fail-closed evaluation: never infer MISMATCH when remote history was not retrieved.
 */
export function evaluateHistoryCheck({
  localVersions,
  remoteVersions = [],
  remoteQueryOk = false,
  malformed = false,
  remoteMethod = 'unknown',
}) {
  const localCount = localVersions.length;

  if (!remoteQueryOk) {
    return {
      localCount,
      remoteCount: null,
      remoteQueryStatus: 'FAIL',
      connectionStatus: 'FAIL',
      historyStatus: 'UNKNOWN',
      remoteMethod,
      remoteOnly: [],
      localOnly: [],
      exitCode: 1,
    };
  }

  if (malformed) {
    return {
      localCount,
      remoteCount: null,
      remoteQueryStatus: 'FAIL',
      connectionStatus: 'PASS',
      historyStatus: 'UNKNOWN',
      remoteMethod,
      remoteOnly: [],
      localOnly: [],
      exitCode: 1,
    };
  }

  const { remoteOnly, localOnly, historyStatus } = compareHistories(
    localVersions,
    remoteVersions,
  );

  return {
    localCount,
    remoteCount: remoteVersions.length,
    remoteQueryStatus: 'PASS',
    connectionStatus: 'PASS',
    historyStatus,
    remoteMethod,
    remoteOnly,
    localOnly,
    exitCode: historyStatus === 'MATCH' ? 0 : 1,
  };
}

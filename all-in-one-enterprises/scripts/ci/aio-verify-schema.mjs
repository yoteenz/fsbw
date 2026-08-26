#!/usr/bin/env node
/**
 * Schema + RLS enablement verification via CI-compatible pooler SQL.
 * Fail-closed: query failure => UNKNOWN, never inferred PASS/FAIL.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runPoolerSql, redactSecrets, AIO_CANONICAL_PROJECT_REF } from './aio-ci-db.mjs';

const RESULTS_PATH = process.env.AIO_CI_RESULTS_PATH ?? '.ci/aio-validation-results.json';

/** Minimum production tables (founder canon + existing TMS coverage). */
export const REQUIRED_TABLES = [
  'aio_organizations',
  'aio_dispatch_loads',
  'aio_brokerage_quotes',
  'aio_brokerage_shipments',
  'aio_load_stops',
  'aio_load_status_history',
  'aio_brokerage_load_financials',
  'aio_brokerage_freight_quotes',
  'aio_brokerage_shipper_invoices',
  'aio_brokerage_bookkeeping_handoffs',
  'aio_freight_autopilot_events',
  'aio_freight_document_completeness',
  'aio_freight_billing_packages',
  'aio_freight_exceptions',
  'aio_driver_settlements',
  'aio_driver_settlement_adjustments',
  'aio_carrier_settlements',
  'aio_dispatch_package_snapshots',
  'aio_pretrip_inspections',
  'aio_freight_locations',
];

/** Tables that must have RLS enabled (relrowsecurity = true). */
export const RLS_TABLES = [
  'aio_shipment_requests',
  'aio_brokerage_freight_quotes',
  'aio_brokerage_quote_pricing_drafts',
  'aio_brokerage_load_financials',
  'aio_carrier_offers',
  'aio_brokerage_bookkeeping_handoffs',
  'aio_dispatch_loads',
  'aio_freight_document_completeness',
  'aio_freight_autopilot_events',
  'aio_freight_billing_packages',
  'aio_freight_exceptions',
  'aio_driver_settlements',
  'aio_driver_settlement_adjustments',
  'aio_carrier_settlements',
  'aio_dispatch_package_snapshots',
  'aio_pretrip_inspections',
  'aio_freight_locations',
  'aio_brokerage_quotes',
  'aio_brokerage_shipments',
  'aio_load_stops',
];

function tableExistsQuery(tableName) {
  return `select count(*)::text from information_schema.tables where table_schema='public' and table_name='${tableName}';`;
}

function rlsEnabledQuery(tableName) {
  return `select case when c.relrowsecurity then 't' else 'f' end from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='${tableName}';`;
}

export function verifySchemaAndRls({ runSql = runPoolerSql } = {}) {
  const missing = [];
  const rlsOff = [];
  let schemaQueryOk = true;
  let rlsQueryOk = true;
  const schemaErrors = [];
  const rlsErrors = [];

  for (const table of REQUIRED_TABLES) {
    const result = runSql(tableExistsQuery(table));
    if (!result.queryOk) {
      schemaQueryOk = false;
      schemaErrors.push(`${table}: ${redactSecrets(result.stderr || 'query failed')}`);
      continue;
    }
    const count = result.stdout.trim();
    if (count !== '1') {
      missing.push(table);
    }
  }

  for (const table of RLS_TABLES) {
    const result = runSql(rlsEnabledQuery(table));
    if (!result.queryOk) {
      rlsQueryOk = false;
      rlsErrors.push(`${table}: ${redactSecrets(result.stderr || 'query failed')}`);
      continue;
    }
    const enabled = result.stdout.trim();
    if (enabled !== 't') {
      rlsOff.push(table);
    }
  }

  let schemaStatus;
  let rlsStatus;

  if (!schemaQueryOk) {
    schemaStatus = 'UNKNOWN';
  } else if (missing.length > 0) {
    schemaStatus = 'FAIL';
  } else {
    schemaStatus = 'PASS';
  }

  if (!rlsQueryOk) {
    rlsStatus = 'UNKNOWN';
  } else if (rlsOff.length > 0) {
    rlsStatus = 'FAIL';
  } else {
    rlsStatus = 'PASS';
  }

  const exitCode = schemaStatus === 'PASS' && rlsStatus === 'PASS' ? 0 : 1;

  return {
    schemaStatus,
    rlsStatus,
    schemaQueryOk,
    rlsQueryOk,
    missing,
    rlsOff,
    schemaErrors,
    rlsErrors,
    connectionMethod: 'POOLER',
    exitCode,
  };
}

function writeResults(result) {
  const data = existsSync(RESULTS_PATH)
    ? JSON.parse(readFileSync(RESULTS_PATH, 'utf8'))
    : { project: AIO_CANONICAL_PROJECT_REF };

  data.schema = result.schemaStatus;
  data.rlsEnablement = result.rlsStatus;
  data.schemaDetail = {
    missing: result.missing,
    rlsOff: result.rlsOff,
    schemaQueryOk: result.schemaQueryOk,
    rlsQueryOk: result.rlsQueryOk,
    schemaErrors: result.schemaErrors,
    rlsErrors: result.rlsErrors,
    connectionMethod: result.connectionMethod,
  };
  writeFileSync(RESULTS_PATH, `${JSON.stringify(data, null, 2)}\n`);
}

function printReport(result) {
  console.log('=== Schema verification (pooler SQL) ===');
  if (!result.schemaQueryOk) {
    console.log('SCHEMA QUERY: FAIL');
    for (const e of result.schemaErrors.slice(0, 5)) console.log(`  ${e}`);
    if (result.schemaErrors.length > 5) {
      console.log(`  ... and ${result.schemaErrors.length - 5} more`);
    }
  } else {
    console.log('SCHEMA QUERY: PASS');
    for (const t of REQUIRED_TABLES) {
      if (result.missing.includes(t)) console.log(`MISSING: ${t}`);
      else console.log(`OK: ${t}`);
    }
  }

  console.log('');
  console.log('=== RLS enablement (pg_class.relrowsecurity) ===');
  if (!result.rlsQueryOk) {
    console.log('RLS QUERY: FAIL');
    for (const e of result.rlsErrors.slice(0, 5)) console.log(`  ${e}`);
    if (result.rlsErrors.length > 5) {
      console.log(`  ... and ${result.rlsErrors.length - 5} more`);
    }
  } else {
    console.log('RLS QUERY: PASS');
    for (const t of RLS_TABLES) {
      if (result.rlsOff.includes(t)) console.log(`RLS OFF: ${t}`);
      else console.log(`RLS ON: ${t}`);
    }
  }

  console.log('');
  console.log(`SCHEMA STATUS: ${result.schemaStatus}`);
  console.log(`RLS STATUS: ${result.rlsStatus}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = verifySchemaAndRls();
  printReport(result);
  writeResults(result);
  if (result.exitCode !== 0) {
    if (result.schemaStatus === 'UNKNOWN' || result.rlsStatus === 'UNKNOWN') {
      console.error('Schema/RLS verification: UNKNOWN (connectivity/query failure — fail-closed)');
    } else {
      console.error('Schema/RLS verification: FAIL');
    }
  } else {
    console.log('Schema + RLS enablement: PASS');
  }
  process.exit(result.exitCode);
}

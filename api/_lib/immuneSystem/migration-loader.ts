import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { computeMigrationChecksum } from '../../../src/studio-os-core/immune-system/migration-safety.js';
import { findMigrationById } from '../../../src/studio-os-core/immune-system/migration-manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../../..');

export function loadApprovedMigrationSql(migrationId: string): {
  sql: string | null;
  checksum: string | null;
  filename: string | null;
} {
  const entry = findMigrationById(migrationId);
  if (!entry) return { sql: null, checksum: null, filename: null };
  const filePath = path.join(REPO_ROOT, 'supabase/migrations', entry.filename);
  if (!fs.existsSync(filePath)) return { sql: null, checksum: null, filename: entry.filename };
  const sql = fs.readFileSync(filePath, 'utf8');
  return { sql, checksum: computeMigrationChecksum(sql), filename: entry.filename };
}

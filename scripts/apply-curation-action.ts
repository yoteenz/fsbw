#!/usr/bin/env npx tsx
/**
 * P0.VR.3K — Apply founder curation action (CLI + shared with API)
 * Usage: npx tsx scripts/apply-curation-action.ts --project frontal-slayer --action MOVE_TO_WORKSPACE --target <xpId> [--reviewer founder]
 */
import { executeCurationAction } from '../src/studio-os-core/route-intelligence/experience-curation/curation-actions.ts';
import type { CurationActionType } from '../src/studio-os-core/route-intelligence/types.ts';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const projectId = arg('project');
const action = arg('action') as CurationActionType | undefined;
const targetId = arg('target');
const reviewer = arg('reviewer') ?? 'FOUNDER';

if (!projectId || !action) {
  console.error('Usage: --project <id> --action <ACTION> [--target <xpId>] [--reviewer founder]');
  process.exit(1);
}

const result = executeCurationAction(repoRoot, { projectId, action, targetId, reviewer });
console.log(JSON.stringify({ ok: result.ok, error: result.error, bundle: result.bundle, receipt: result.receipt, lockReceipt: result.lockReceipt }, null, 2));
process.exit(result.ok ? 0 : 1);

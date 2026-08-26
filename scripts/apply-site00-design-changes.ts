#!/usr/bin/env npx tsx
/**
 * P0.BRIDGE.1-FSBW — Apply approved SITE 00 design changes to FSBW source
 *
 * Usage:
 *   npm run apply:site00-design-changes
 *   npm run apply:site00-design-changes -- --change-id=<id> --dry-run
 *   npm run apply:site00-design-changes -- --project=FRONTAL_SLAYER --dry-run
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Site00DesignBridge } from '../api/_lib/site00DesignBridge/bridge.js';
import type { Site00ProjectKey } from '../api/_lib/site00DesignBridge/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

function arg(name: string): string | undefined {
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=').slice(1).join('=');
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const changeId = arg('change-id');
const project = arg('project') as Site00ProjectKey | undefined;
const dryRun = process.argv.includes('--dry-run');
const skipTests = process.argv.includes('--skip-tests');
const skipBuild = process.argv.includes('--skip-build');

async function main() {
  const bridge = new Site00DesignBridge({
    repoRoot,
    dryRun,
    projectFilter: project,
    skipTests,
    skipBuild,
  });

  if (changeId) {
    const result = await bridge.processChange(changeId, dryRun);
    console.log(JSON.stringify(result, null, 2));
    const ok = 'ok' in result ? result.ok : (result as { status: string }).status === 'VALID';
    process.exit(ok ? 0 : 1);
    return;
  }

  const changes = await bridge.getApprovedChanges(project);
  if (changes.length === 0) {
    console.log(JSON.stringify({ ok: true, message: 'No READY_FOR_REPO changes for yoteenz/fsbw', count: 0 }, null, 2));
    process.exit(0);
    return;
  }

  console.log(JSON.stringify({ ok: true, eligible: changes.length, dryRun, previews: changes.map((c) => bridge.previewChange(c)) }, null, 2));
  console.error('Pass --change-id=<id> to apply a specific change. This sprint does not auto-apply all pending changes.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

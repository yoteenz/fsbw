#!/usr/bin/env npx tsx
/** P0.VR.3L.1-FSBW — Execute Voice Lab family derivation + persist registry */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import {
  executeVoiceLabDerivation,
  persistVoiceLabExecution,
  MANIFEST_ARTIFACT_RELATIVE_PATH,
} from '../src/studio-os-core/route-intelligence/index.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const markCaptured = process.argv.includes('--mark-captured');
const siblingIdArg = process.argv.find((a) => a.startsWith('--sibling='));
const founderOverrideSiblingId = siblingIdArg?.split('=')[1];

const manifestPath = join(repoRoot, MANIFEST_ARTIFACT_RELATIVE_PATH);
if (!existsSync(manifestPath)) {
  console.error('Run npm run compile:design-pages first');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const result = executeVoiceLabDerivation({
  repoRoot,
  sourceCommit: manifest.sourceCommit,
  manifest,
  founderOverrideSiblingId,
  markSnapshotsCaptured: markCaptured,
});

persistVoiceLabExecution(repoRoot, result, manifest.sourceCommit);

console.log('P0.VR.3L.1-FSBW Voice Lab Execution');
console.log(`  sprint: ${result.sprintId}`);
console.log(`  source sibling: ${result.sourceSibling.displayName} (${result.sourceSibling.confidence})`);
console.log(`  source route: ${result.sourceSibling.route}`);
console.log(`  target status: ${result.target.reviewStatus}`);
console.log(`  ready for founder review: ${result.readyForFounderReview}`);
console.log(`  visual QA passed: ${result.visualQa.passed}`);
console.log(`  source snapshots: ${result.sourceSnapshots.filter((s) => s.status === 'CAPTURED').length}/3`);
console.log(`  target snapshots: ${result.targetSnapshots.filter((s) => s.status === 'CAPTURED').length}/3`);
if (!markCaptured) {
  console.log('  tip: run capture script then re-run with --mark-captured');
}

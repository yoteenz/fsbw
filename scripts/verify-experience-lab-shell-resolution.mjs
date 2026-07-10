#!/usr/bin/env node
/**
 * Verify Experience Lab validation render shell resolution (no browser).
 */
import { resolveShellLockState } from '../src/studio-os-core/scene-stack/world-compiler/immutable-shell.ts';
import { diagnoseShellResolution } from '../src/studio-os-core/scene-stack/shell-diagnostics.ts';
import { setValidationRenderMode } from '../src/studio-os-core/scene-stack/validation-render.ts';

let passed = 0;
let failed = 0;

function assert(name, cond) {
  if (cond) {
    passed += 1;
    console.log(`OK ${name}`);
  } else {
    failed += 1;
    console.error(`FAIL ${name}`);
  }
}

setValidationRenderMode('experience-lab-validation');

const missing = resolveShellLockState('creative-direction', 'test-project', 'arrival', {
  validationMode: true,
});
assert('missing record → no shellUrl', missing.shellUrl === null && missing.resolution === 'missing-record');

const diag = diagnoseShellResolution('creative-direction', 'test-project', 'arrival', {
  validationMode: true,
});
assert('diagnostic includes recovery action', Boolean(diag.recoveryAction));
assert('diagnostic authorization mode', diag.authorizationMode === 'experience-lab-validation');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

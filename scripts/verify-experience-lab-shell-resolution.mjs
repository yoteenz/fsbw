#!/usr/bin/env node
/**
 * Verify Experience Lab validation shell recipe + preview-scoped ephemeral registry.
 * Usage: npx tsx scripts/verify-experience-lab-shell-resolution.mjs
 */
import { buildEnvironmentShellRecipe } from '../src/studio-os-core/creative-studio-preview/environment-shell.ts';
import {
  registerValidationEnvironmentShell,
  getValidationEnvironmentShell,
  getEphemeralLayerRecord,
  verifyEphemeralShellMount,
  clearValidationPreviewSession,
} from '../src/studio-os-core/scene-stack/ephemeral-validation-registry.ts';
import { getSceneStackLayerRecord } from '../src/studio-os-core/scene-stack/store.ts';
import { resolveShellLockState } from '../src/studio-os-core/scene-stack/world-compiler/immutable-shell.ts';
import { diagnoseShellResolution, shellIsMountReady } from '../src/studio-os-core/scene-stack/shell-diagnostics.ts';
import { buildPreviewCompileContext } from '../src/studio-os-core/scene-stack/preview-compile-context.ts';
import {
  setValidationPreviewSession,
  setValidationRenderMode,
} from '../src/studio-os-core/scene-stack/validation-render.ts';

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

function report(label, data) {
  console.log(`  ${label}:`, JSON.stringify(data, null, 0));
}

const session = 'studio-os:a:studio-command-center:executive-atrium:command-center-golden-v1';
const compileRunId = 'verify-run-1';
const recipe = buildEnvironmentShellRecipe({
  companyId: 'studio-os',
  conceptId: 'a',
  projectId: 'command-center-golden-v1',
  previewSessionId: session,
});

assert('recipe has shellId', Boolean(recipe.shellId));
assert('recipe has shell prompt', Boolean(recipe.shellPrompt.primary));

const shell = {
  ...recipe,
  publicUrl: 'data:image/webp;base64,test',
  generatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60000).toISOString(),
  registryScope: 'ephemeral-validation',
  generationMethod: 'preview-canvas',
  canonicalStatus: 'non_canonical',
};

console.log('\n--- Registration ---');
registerValidationEnvironmentShell(shell);
report('registration previewSessionId', shell.previewSessionId);
report('shellId', shell.shellId);
report('registry namespace', `ephemeral-validation:${shell.previewSessionId}`);

console.log('\n--- Explicit lookup (same previewSessionId) ---');
const lookupSessionId = session;
const overlay = getEphemeralLayerRecord(
  lookupSessionId,
  recipe.departmentId,
  recipe.projectId,
  recipe.stationId,
  'environment-shell'
);
const layerRecord = getSceneStackLayerRecord(
  recipe.departmentId,
  recipe.projectId,
  recipe.stationId,
  'environment-shell',
  { validationMode: true, previewSessionId: lookupSessionId }
);
const lock = resolveShellLockState(recipe.departmentId, recipe.projectId, recipe.stationId, {
  validationMode: true,
  previewSessionId: lookupSessionId,
});
const ctx = buildPreviewCompileContext({
  previewSessionId: lookupSessionId,
  departmentId: recipe.departmentId,
  projectId: recipe.projectId,
  stationId: recipe.stationId,
  conceptId: 'a',
  companyId: 'studio-os',
  compileRunId,
});
const mountReady = shellIsMountReady(recipe.departmentId, recipe.projectId, recipe.stationId, {
  previewCompileContext: ctx,
});
const verification = verifyEphemeralShellMount({
  previewSessionId: lookupSessionId,
  departmentId: recipe.departmentId,
  projectId: recipe.projectId,
  stationId: recipe.stationId,
});
const diag = diagnoseShellResolution(recipe.departmentId, recipe.projectId, recipe.stationId, {
  previewCompileContext: ctx,
});

report('lookup previewSessionId', lookupSessionId);
report('compileRunId', compileRunId);
report('shell resolution', lock.resolution);
report('mount readiness', mountReady);
report('recovery phase', diag.recoveryPhase);

assert('registration === lookup session id', shell.previewSessionId === lookupSessionId);
assert('overlay lookup', Boolean(overlay?.publicUrl));
assert('getSceneStackLayerRecord explicit', Boolean(layerRecord?.publicUrl));
assert('resolveShellLockState validation-draft', lock.resolution === 'validation-draft');
assert('verifyEphemeralShellMount ok', verification.ok && verification.mountReady);
assert('mount ready', mountReady);
assert('diagnostic recovery-complete', diag.recoveryPhase === 'recovery-complete');

console.log('\n--- Compare-mode isolation ---');
const sessionB = 'frontal-slayer:a:creative-direction:arrival:project-001';
const recipeB = buildEnvironmentShellRecipe({
  companyId: 'frontal-slayer',
  conceptId: 'a',
  projectId: 'project-001',
  previewSessionId: sessionB,
});
registerValidationEnvironmentShell({
  ...recipeB,
  publicUrl: 'data:image/webp;base64,b',
  generatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60000).toISOString(),
  registryScope: 'ephemeral-validation',
  generationMethod: 'preview-canvas',
  canonicalStatus: 'non_canonical',
});
setValidationPreviewSession(sessionB);
const crossRead = getSceneStackLayerRecord(
  recipe.departmentId,
  recipe.projectId,
  recipe.stationId,
  'environment-shell',
  { validationMode: true, previewSessionId: sessionB }
);
assert('preview B cannot read preview A overlay', crossRead === null);
assert('preview A still resolves with explicit id', Boolean(
  getSceneStackLayerRecord(
    recipe.departmentId,
    recipe.projectId,
    recipe.stationId,
    'environment-shell',
    { validationMode: true, previewSessionId: session }
  )?.publicUrl
));

console.log('\n--- Global singleton must not drive lookup ---');
setValidationRenderMode('production');
const withoutExplicit = getSceneStackLayerRecord(
  recipe.departmentId,
  recipe.projectId,
  recipe.stationId,
  'environment-shell'
);
assert('no explicit previewSessionId → no ephemeral read', withoutExplicit === null);
assert('session shell still in registry', getValidationEnvironmentShell(session)?.shellId === recipe.shellId);

clearValidationPreviewSession(session);
clearValidationPreviewSession(sessionB);
assert('ephemeral clear', getValidationEnvironmentShell(session) === null);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

#!/usr/bin/env node
/**
 * Verify Experience Lab validation shell recipe + ephemeral registry (no browser).
 * Usage: npx tsx scripts/verify-experience-lab-shell-resolution.mjs
 */
import { buildEnvironmentShellRecipe } from '../src/studio-os-core/creative-studio-preview/environment-shell.ts';
import {
  registerValidationEnvironmentShell,
  getValidationEnvironmentShell,
  clearValidationPreviewSession,
} from '../src/studio-os-core/scene-stack/ephemeral-validation-registry.ts';

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

const session = 'test-session-studio-os-a';
const recipe = buildEnvironmentShellRecipe({
  companyId: 'studio-os',
  conceptId: 'a',
  projectId: 'test-project',
  previewSessionId: session,
});

assert('recipe has shellId', Boolean(recipe.shellId));
assert('recipe has shell prompt', Boolean(recipe.shellPrompt.primary));
assert('recipe has layer order', recipe.layerOrder.includes('environment-shell'));
assert('recipe has mounting anchors', recipe.mountingAnchors.length >= 3);
assert('studio-os world identity', recipe.worldIdentity.includes('Studio OS'));

const fsRecipe = buildEnvironmentShellRecipe({
  companyId: 'frontal-slayer',
  conceptId: 'a',
  projectId: 'test-project',
  previewSessionId: 'test-fs',
});
assert('frontal slayer unique shell id', fsRecipe.shellId.includes('frontal-slayer'));

const ndxRecipe = buildEnvironmentShellRecipe({
  companyId: 'ndx',
  conceptId: 'a',
  projectId: 'test-project',
  previewSessionId: 'test-ndx',
});
assert('ndx unique shell id', ndxRecipe.shellId.includes('ndx'));

const shell = {
  ...recipe,
  publicUrl: 'data:image/webp;base64,test',
  generatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60000).toISOString(),
  registryScope: 'ephemeral-validation',
  generationMethod: 'preview-canvas',
  canonicalStatus: 'non_canonical',
};
registerValidationEnvironmentShell(shell);
assert('ephemeral register + lookup', getValidationEnvironmentShell(session)?.shellId === recipe.shellId);
clearValidationPreviewSession(session);
assert('ephemeral clear', getValidationEnvironmentShell(session) === null);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

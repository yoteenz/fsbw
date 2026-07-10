#!/usr/bin/env node
/**
 * Verify Experience Lab / World Compiler decoupling (no browser required).
 * Run: node scripts/verify-experience-lab-runtime-independence.mjs
 */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Bootstrap minimal DOM for modules that touch document
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    documentElement: { dataset: {} },
  };
}

const require = createRequire(import.meta.url);

async function main() {
  const { buildEnvironmentShellRecipe } = await import(
    pathToFileURL(path.join(root, 'src/studio-os-core/creative-studio-preview/environment-shell.ts')).href
  ).catch(() => ({ buildEnvironmentShellRecipe: null }));

  let projectId = 'test-project';
  if (buildEnvironmentShellRecipe) {
    try {
      const recipe = buildEnvironmentShellRecipe({
        companyId: 'studio-os',
        conceptId: 'a',
        projectId: 'probe',
        previewSessionId: 'probe',
      });
      projectId = recipe.projectId;
    } catch {
      projectId = 'studio-command-center-default';
    }
  }

  const mod = await import(
    pathToFileURL(path.join(root, 'src/studio-os-core/experience-lab-runtime/independence-verification.ts')).href
  );

  const result = mod.verifyRuntimeCompilerIndependence({
    companyId: 'studio-os',
    conceptId: 'a',
    departmentId: 'studio-command-center',
    stationId: 'executive-atrium',
    projectId,
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.passed ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

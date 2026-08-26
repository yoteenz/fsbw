#!/usr/bin/env node
/**
 * Semantic verification: effective Vite/Vitest PostCSS config stays inside AIO package.
 * Does not rely on ripgrep or brittle source-text matching (GHA ubuntu-latest has no rg).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfigFromFile } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AIO_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(AIO_ROOT, '..');
const AIO_POSTCSS = join(AIO_ROOT, 'postcss.config.js');
const REPO_POSTCSS = join(REPO_ROOT, 'postcss.config.js');
const FS_FORBIDDEN = 'hyycomvcaqxxvyrfupes';

/** @typedef {{ name: string, postcssPath: string | null, error?: string }} ConfigProbe */

/** @returns {Promise<ConfigProbe>} */
async function probeConfig(configFile) {
  const configPath = join(AIO_ROOT, configFile);
  if (!existsSync(configPath)) {
    return { name: configFile, postcssPath: null, error: `missing ${configFile}` };
  }

  try {
    const loaded = await loadConfigFromFile(
      { command: 'build', mode: 'production' },
      configPath,
      AIO_ROOT,
    );
    const postcss = loaded?.config?.css?.postcss;
    if (postcss == null || postcss === false) {
      return { name: configFile, postcssPath: null, error: 'css.postcss not set' };
    }
    if (typeof postcss === 'string') {
      return { name: configFile, postcssPath: resolve(AIO_ROOT, postcss) };
    }
    if (typeof postcss === 'object' && !Array.isArray(postcss)) {
      // Inline postcss options without external file — still bounded if no plugins from root
      return { name: configFile, postcssPath: AIO_POSTCSS, error: undefined };
    }
    return { name: configFile, postcssPath: null, error: 'unexpected css.postcss shape' };
  } catch (err) {
    return {
      name: configFile,
      postcssPath: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function isInsideAio(absolutePath) {
  const rel = relative(AIO_ROOT, resolve(absolutePath));
  return rel !== '' && !rel.startsWith('..') && !resolve(absolutePath).startsWith('..');
}

function assertProbe(probe) {
  if (probe.error && !probe.postcssPath) {
    throw new Error(`${probe.name}: ${probe.error}`);
  }
  if (!probe.postcssPath) {
    throw new Error(`${probe.name}: no PostCSS path resolved`);
  }
  const resolved = resolve(probe.postcssPath);
  if (!isInsideAio(resolved)) {
    throw new Error(`${probe.name}: PostCSS resolves outside AIO: ${resolved}`);
  }
  if (existsSync(REPO_POSTCSS) && resolved === resolve(REPO_POSTCSS)) {
    throw new Error(`${probe.name}: PostCSS resolves to repository-root config (leakage)`);
  }
  if (resolved !== resolve(AIO_POSTCSS)) {
    throw new Error(
      `${probe.name}: PostCSS must resolve to ${AIO_POSTCSS} (got ${resolved})`,
    );
  }
}

function scanForbiddenRefs() {
  const files = ['vite.config.ts', 'vitest.config.ts', 'postcss.config.js'];
  for (const file of files) {
    const full = join(AIO_ROOT, file);
    if (!existsSync(full)) continue;
    const text = readFileSync(full, 'utf8');
    if (text.includes(FS_FORBIDDEN)) {
      throw new Error(`forbidden FS project ref in ${file}`);
    }
  }
}

async function main() {
  const jsonMode = process.argv.includes('--json');

  if (!existsSync(AIO_POSTCSS)) {
    throw new Error('missing all-in-one-enterprises/postcss.config.js');
  }

  const viteProbe = await probeConfig('vite.config.ts');
  const vitestProbe = await probeConfig('vitest.config.ts');

  assertProbe(viteProbe);
  assertProbe(vitestProbe);

  scanForbiddenRefs();

  const vitePostcss = resolve(viteProbe.postcssPath);
  const vitestPostcss = resolve(vitestProbe.postcssPath);

  if (!jsonMode) {
    process.stdout.write(`OK: Vite effective PostCSS: ${vitePostcss}\n`);
    process.stdout.write(`OK: Vitest effective PostCSS: ${vitestPostcss}\n`);
  } else {
    process.stdout.write(
      `${JSON.stringify(
        {
          vitePostcss,
          vitestPostcss,
          aioRoot: AIO_ROOT,
          repoPostcssBlocked: existsSync(REPO_POSTCSS),
        },
        null,
        2,
      )}\n`,
    );
  }
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});

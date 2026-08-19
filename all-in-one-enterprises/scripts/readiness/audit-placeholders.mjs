#!/usr/bin/env node
/**
 * Placeholder / fake-function audit — classifies markers in AIO src (no secrets).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'src');
const MARKERS = [
  { pattern: /\bTODO\b/g, kind: 'TODO' },
  { pattern: /\bFIXME\b/g, kind: 'FIXME' },
  { pattern: /\bplaceholder\b/gi, kind: 'placeholder' },
  { pattern: /coming soon/gi, kind: 'coming_soon' },
  { pattern: /\bmock\b/gi, kind: 'mock' },
  { pattern: /demo only/gi, kind: 'demo_only' },
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const findings = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const m of MARKERS) {
    const matches = text.match(m.pattern);
    if (matches?.length) {
      findings.push({ file: file.replace(process.cwd() + '/', ''), kind: m.kind, count: matches.length });
    }
  }
}

const summary = {
  filesScanned: files.length,
  findingCount: findings.length,
  byKind: Object.fromEntries(
    MARKERS.map((m) => [m.kind, findings.filter((f) => f.kind === m.kind).reduce((a, b) => a + b.count, 0)]),
  ),
  topFindings: findings.sort((a, b) => b.count - a.count).slice(0, 25),
};

console.log(JSON.stringify(summary, null, 2));
process.exit(0);

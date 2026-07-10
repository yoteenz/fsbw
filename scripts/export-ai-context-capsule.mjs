#!/usr/bin/env node
/**
 * AI Context Capsule™ — export generator (CLI).
 * Spec: docs/ai-collaboration/EXPORT_SPECIFICATION.md
 *
 * Usage:
 *   node scripts/export-ai-context-capsule.mjs [--format md|json|all] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const COLLAB = path.join(ROOT, 'docs/ai-collaboration');
const PACKAGE_VERSION = '1.0.0';

const CORE_FILES = [
  'README.md',
  'NEW_CHAT_CHECKLIST.md',
  'CHATGPT_OPERATING_MANUAL.md',
  'AI_STYLE_GUIDE.md',
  'AI_CONTEXT.md',
  'CURRENT_HANDOFF.md',
  'AI_GLOSSARY.md',
  'AI_CHANGELOG.md',
  'PROMPT_TEMPLATES.md',
];

function readCollab(name) {
  const p = path.join(COLLAB, name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function gitSha() {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function tailMemoryEntries(max = 3) {
  const memPath = path.join(ROOT, 'motherboard/MEMORY.md');
  if (!fs.existsSync(memPath)) return '';
  const raw = fs.readFileSync(memPath, 'utf8');
  const parts = raw.split(/\n---\n/);
  const entries = parts.filter((p) => /^##\s+\d{4}-\d{2}-\d{2}/m.test(p));
  return entries.slice(-max).join('\n---\n');
}

function executiveSummary(handoff, context) {
  const blockerMatch = handoff.match(/## Current blocker[\s\S]*?(?=##|$)/);
  const sprintMatch = handoff.match(/## Current sprint[\s\S]*?(?=##|$)/);
  return [
    'This capsule orients a new AI conversation to Studio OS / Frontal Slayer collaboration.',
    sprintMatch ? sprintMatch[0].replace(/## Current sprint\s*/i, 'Active sprint: ').trim() : '',
    blockerMatch ? blockerMatch[0].replace(/## Current blocker\s*/i, 'Blockers: ').trim() : '',
    'Read NEW_CHAT_CHECKLIST.md before any implementation prompts.',
    context.includes('Mobile-first') ? 'Verification is mobile-first.' : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildMarkdown() {
  const generatedAt = new Date().toISOString();
  const buildId = gitSha();
  const handoff = readCollab('CURRENT_HANDOFF.md');
  const context = readCollab('AI_CONTEXT.md');

  const sections = [
    `# AI Context Capsule™`,
    ``,
    `Generated: ${generatedAt}`,
    `Build: ${buildId}`,
    `Package version: ${PACKAGE_VERSION}`,
    ``,
    `## Executive summary`,
    ``,
    executiveSummary(handoff, context),
    ``,
    `## Current handoff`,
    ``,
    handoff,
    ``,
    `## AI context`,
    ``,
    context,
    ``,
    `## Recent motherboard entries`,
    ``,
    tailMemoryEntries(3) || '_No MEMORY entries found._',
    ``,
  ];

  for (const file of CORE_FILES) {
    if (file === 'CURRENT_HANDOFF.md' || file === 'AI_CONTEXT.md' || file === 'README.md') continue;
    sections.push(`## ${file.replace('.md', '')}`, ``, readCollab(file), ``);
  }

  sections.push(
    `## Verification URLs`,
    ``,
    '```',
    '/__studio-os-recovery',
    '```',
    '```',
    '/__studio-os-flight-recorder',
    '```',
    '```',
    '?compilerDiag=1',
    '```',
    ''
  );

  return sections.join('\n');
}

function buildJson(markdown) {
  const glossaryRaw = readCollab('AI_GLOSSARY.md');
  const terms = [...glossaryRaw.matchAll(/^### (.+?)$/gm)].map((m) => ({
    term: m[1].replace(/™/g, '').trim(),
    definition: '(see glossary section in capsule markdown)',
  }));

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    buildId: gitSha(),
    packageVersion: PACKAGE_VERSION,
    executiveSummary: executiveSummary(readCollab('CURRENT_HANDOFF.md'), readCollab('AI_CONTEXT.md')),
    handoffMarkdown: readCollab('CURRENT_HANDOFF.md'),
    contextMarkdown: readCollab('AI_CONTEXT.md'),
    glossary: terms.slice(0, 40),
    sourceFiles: CORE_FILES.map((f) => ({ path: `docs/ai-collaboration/${f}` })),
    fullMarkdownLength: markdown.length,
  };
}

function parseArgs() {
  const args = process.argv.slice(2);
  let format = 'all';
  let outDir = path.join(ROOT, 'dist/ai-context-capsule');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) format = args[++i];
    if (args[i] === '--out' && args[i + 1]) outDir = path.resolve(args[++i]);
  }
  return { format, outDir };
}

function main() {
  const { format, outDir } = parseArgs();
  fs.mkdirSync(outDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const md = buildMarkdown();
  const written = [];

  if (format === 'md' || format === 'all') {
    const mdPath = path.join(outDir, `ai-context-capsule-${date}.md`);
    fs.writeFileSync(mdPath, md);
    written.push(mdPath);
  }
  if (format === 'json' || format === 'all') {
    const jsonPath = path.join(outDir, `ai-context-capsule-${date}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(buildJson(md), null, 2));
    written.push(jsonPath);
  }
  if (format === 'pdf') {
    console.warn('PDF export not implemented — use pandoc manually on generated .md (see EXPORT_SPECIFICATION.md)');
  }

  console.log('AI Context Capsule™ exported:');
  for (const f of written) console.log(' ', f);
}

main();

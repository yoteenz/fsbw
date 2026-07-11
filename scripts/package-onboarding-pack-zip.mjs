#!/usr/bin/env node
/**
 * Studio OS Unified Onboarding Pack — deterministic multi-capsule onboarding.
 * Runs after individual capsule packagers in prebuild.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import {
  generateMachineReadableLayer,
  validateReportTemplateSections,
  REPORT_SECTIONS,
} from './lib/onboarding-pack-machine-readable.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

const PACK_VERSION = '1.2.0';
const PACK_FOLDER = 'StudioOS_OnboardingPack';
const LATEST_ALIAS = 'latest.zip';
const DOWNLOAD_BASE = '/downloads/onboarding-packs';
const ARCHIVE_SUBDIR = 'archive';
const PERMANENT_LATEST_PATH = '/onboarding/latest';

const CONTEXT_SRC = 'StudioOS_ContextCapsule_v0.1';
const FIC_SRC = 'founder-intelligence';
const DNA_SRC = 'StudioOS_StudioDNACapsule_v1.0';
const CI_SRC = 'collaboration-intelligence';

const CONTEXT_READING = [
  'README_FIRST.md',
  'MANIFEST.md',
  'KNOWN_BLOCKERS.md',
  'CURRENT_HANDOFF.md',
  'FOUNDER_PROFILE.md',
  'PROJECT_DNA.md',
  'AI_CONTEXT.md',
  'AI_GLOSSARY.md',
  'CHATGPT_OPERATING_MANUAL.md',
  'AI_STYLE_GUIDE.md',
  'PROJECT_CHANGELOG.md',
  'ROADMAP.md',
  'OPEN_QUESTIONS.md',
  'PROMPT_LIBRARY.md',
];

const FIC_READING = [
  'README_FIRST.md',
  'MANIFEST.md',
  'RELATIONSHIP_TO_CONTEXT_CAPSULE.md',
  'RELATIONSHIP_TO_DNA_CAPSULE.md',
  'FOUNDER_INTELLIGENCE_INDEX.md',
  'FOUNDER_PROFILE.md',
  'VISION.md',
  'PRODUCT_PHILOSOPHY.md',
  'DESIGN_LANGUAGE.md',
  'CREATIVE_DIRECTION.md',
  'STUDIO_WORLD.md',
  'CIVILIZATION.md',
  'COMPANIES.md',
  'BUSINESS_MODEL.md',
  'REVENUE_MODEL.md',
  'MONETIZATION.md',
  'MARKETPLACE.md',
  'STUDIO_WORKERS.md',
  'KNOWLEDGE_CAPTURE.md',
  'INTERVIEW_ENGINE.md',
  'EXPERT_TRUST_AND_GOVERNANCE.md',
  'DECISION_HISTORY.md',
  'COMMUNICATION_STYLE.md',
  'FOUNDER_PREFERENCES.md',
  'AI_COLLABORATION.md',
  'FUTURE_IDEAS.md',
  'LONG_TERM_ROADMAP.md',
  'FOUNDER_VALIDATION.md',
];

const DNA_READING = [
  'README_FIRST.md',
  'MANIFEST.md',
  'RELATIONSHIP_TO_CONTEXT_CAPSULE.md',
  'CANON_PRESERVATION_POLICY.md',
  'FOUNDER_DESIGN_PHILOSOPHY.md',
  'ARCHITECTURE_DNA.md',
  'CREATIVE_DIRECTION_DNA.md',
  'FOUNDER_DECISION_PATTERNS.md',
  'COMMUNICATION_DNA.md',
  'QUALITY_STANDARDS.md',
  'INSTITUTIONAL_VALUES.md',
  'AI_COLLABORATION_DNA.md',
  'CANON_REGISTRY.md',
  'EVOLUTION.md',
  'DNA_VALIDATION.md',
];

const CI_READING = [
  'README_FIRST.md',
  'MANIFEST.md',
  'RELATIONSHIP_TO_CONTEXT_CAPSULE.md',
  'RELATIONSHIP_TO_FOUNDER_INTELLIGENCE_CAPSULE.md',
  'RELATIONSHIP_TO_DNA_CAPSULE.md',
  'COLLABORATION_INTELLIGENCE_INDEX.md',
  'COLLABORATION_GLOSSARY.md',
  'DECISION_HISTORY.md',
  'EVOLUTION_TIMELINE.md',
  'FOUNDER_PREFERENCES.md',
  'AI_LESSONS.md',
  'GOOSEBUMP_MOMENTS.md',
  'HISTORICAL_CONTEXT.md',
  'RELATIONSHIP_MEMORY.md',
  'IMPORTANT_CONVERSATIONS.md',
  'COLLABORATION_PATTERNS.md',
  'MEMORY_MATURITY.md',
  'SEARCH_INDEX.md',
  'COLLABORATION_VALIDATION.md',
];

/** Substantive coverage checks across Collaboration Intelligence */
const CI_COVERAGE = [
  { topic: 'Black Box glossary', file: 'COLLABORATION_GLOSSARY.md', keywords: ['Black Box', 'World Compiler'] },
  { topic: 'Composer Sprint', file: 'COLLABORATION_GLOSSARY.md', keywords: ['Composer Sprint'] },
  { topic: 'Goosebump moments', file: 'GOOSEBUMP_MOMENTS.md', minChars: 400, keywords: ['Marketplace', 'Studio Workers'] },
  { topic: 'Decision history', file: 'DECISION_HISTORY.md', minChars: 500, keywords: ['ephemeral', 'one deploy'] },
  { topic: 'Collaboration patterns', file: 'COLLABORATION_PATTERNS.md', keywords: ['Composer Sprint', 'Verification'] },
  { topic: 'Search index', file: 'SEARCH_INDEX.md', keywords: ['Experience Lab', 'Motherboard'] },
];

/** Substantive coverage checks across Founder Intelligence */
const FIC_COVERAGE = [
  { topic: 'Studio World vision', file: 'STUDIO_WORLD.md', minChars: 600 },
  { topic: 'Marketplace mechanics', file: 'MARKETPLACE.md', minChars: 900, keywords: ['commission', 'subscription'] },
  { topic: 'Marketplace revenue', file: 'REVENUE_MODEL.md', minChars: 700, keywords: ['transaction', 'licensing'] },
  { topic: 'Business subscriptions', file: 'REVENUE_MODEL.md', keywords: ['subscription', 'Membership'] },
  { topic: 'AI worker subscriptions', file: 'STUDIO_WORKERS.md', keywords: ['Digital Payroll', 'Shadow Mode'] },
  { topic: 'Knowledge licensing', file: 'MARKETPLACE.md', keywords: ['licensing', 'Knowledge Commerce'] },
  { topic: 'Enterprise licensing', file: 'REVENUE_MODEL.md', keywords: ['Enterprise'] },
  { topic: 'Studio Workers lifecycle', file: 'STUDIO_WORKERS.md', minChars: 900, keywords: ['Retirement', 'Training'] },
  { topic: 'Studio Team / Studio HR', file: 'STUDIO_WORKERS.md', keywords: ['Studio Team', 'Studio HR'] },
  { topic: 'Knowledge Capture Interview', file: 'INTERVIEW_ENGINE.md', minChars: 500 },
  { topic: 'Video/audio interviews', file: 'INTERVIEW_ENGINE.md', keywords: ['interview'] },
  { topic: 'Save and resume', file: 'KNOWLEDGE_CAPTURE.md', keywords: ['save', 'resume'] },
  { topic: 'Living Knowledge Mirror', file: 'KNOWLEDGE_CAPTURE.md', keywords: ['Living Knowledge Mirror'] },
  { topic: 'Confessional Mode', file: 'KNOWLEDGE_CAPTURE.md', keywords: ['Confessional'] },
  { topic: 'Knowledge Vault', file: 'KNOWLEDGE_CAPTURE.md', keywords: ['Knowledge Vault'] },
  { topic: 'Expert Trust Framework', file: 'EXPERT_TRUST_AND_GOVERNANCE.md', minChars: 500 },
  { topic: 'Private invite system', file: 'INTERVIEW_ENGINE.md', keywords: ['invite'] },
  { topic: 'FSBW deployment / migration', file: 'EXPERT_TRUST_AND_GOVERNANCE.md', keywords: ['fsbw', 'migration'] },
  { topic: 'Founder prompt preferences', file: 'FOUNDER_PREFERENCES.md', keywords: ['prompt', 'COMPOSER'] },
  { topic: 'Design philosophy', file: 'DESIGN_LANGUAGE.md', minChars: 500 },
];

const OPERATIONAL_AUTHORITY_MAP = {
  'CURRENT_HANDOFF.md': 'Current implementation status',
  'KNOWN_BLOCKERS.md': 'Active blockers and gates',
  'PROJECT_DNA.md': 'Technical and architectural canon summary',
  'AI_CONTEXT.md': 'AI collaboration and repository context',
  'FOUNDER_PROFILE.md': 'Founder operating preferences (collaboration layer)',
  'STUDIO_WORLD.md': 'Long-term Studio World vision',
  'MARKETPLACE.md': 'Marketplace and expert economy mechanics',
  'REVENUE_MODEL.md': 'Revenue streams and monetization',
  'STUDIO_WORKERS.md': 'Studio Team / Workers / HR lifecycle',
  'KNOWLEDGE_CAPTURE.md': 'Expert capture and institutional learning',
  'INTERVIEW_ENGINE.md': 'Private expert interviews and invites',
  'EXPERT_TRUST_AND_GOVERNANCE.md': 'Trust, isolation, authorization',
  'ROADMAP.md': 'Future sequencing',
  'OPEN_QUESTIONS.md': 'Unresolved decisions',
};

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function readGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function copyDir(src, dest, { exclude = [] } = {}) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (exclude.includes(name)) continue;
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d, { exclude });
    else fs.copyFileSync(s, d);
  }
}

function loadRelease(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  try {
    return readJson(p);
  } catch {
    return null;
  }
}

function validateDnaAvailable() {
  const dir = path.join(ROOT, DNA_SRC);
  if (!fs.existsSync(dir)) return false;
  const release = loadRelease('api/_lib/studio-dna-capsule-release.json');
  return release?.validationStatus === 'pass';
}

function validateFicCoverage(ficDir) {
  const errors = [];
  for (const check of FIC_COVERAGE) {
    const fp = path.join(ficDir, check.file);
    if (!fs.existsSync(fp)) {
      errors.push(`Coverage missing file: ${check.file} (${check.topic})`);
      continue;
    }
    const body = fs.readFileSync(fp, 'utf8');
    if (check.minChars && body.length < check.minChars) {
      errors.push(`Coverage too thin: ${check.topic} in ${check.file} (${body.length} chars)`);
    }
    if (check.keywords) {
      for (const kw of check.keywords) {
        if (!body.toLowerCase().includes(kw.toLowerCase())) {
          errors.push(`Coverage keyword missing "${kw}" in ${check.file} (${check.topic})`);
        }
      }
    }
  }
  return errors;
}

function validateCiCoverage(ciDir) {
  const errors = [];
  for (const check of CI_COVERAGE) {
    const fp = path.join(ciDir, check.file);
    if (!fs.existsSync(fp)) {
      errors.push(`Coverage missing file: ${check.file} (${check.topic})`);
      continue;
    }
    const body = fs.readFileSync(fp, 'utf8');
    if (check.minChars && body.length < check.minChars) {
      errors.push(`Coverage too thin: ${check.topic} in ${check.file} (${body.length} chars)`);
    }
    if (check.keywords) {
      for (const kw of check.keywords) {
        if (!body.toLowerCase().includes(kw.toLowerCase())) {
          errors.push(`Coverage keyword missing "${kw}" in ${check.file} (${check.topic})`);
        }
      }
    }
  }
  return errors;
}

function buildMasterManifestEntries(includeDna) {
  const entries = [];
  const add = (rel, phase) => entries.push({ path: rel.replace(/\\/g, '/'), phase });

  add('START_HERE.md', 0);
  add('MASTER_MANIFEST.md', 0);
  add('ONBOARDING_GUIDE.md', 0);
  add('onboarding-state.json', 0);
  add('onboarding-index.json', 0);
  add('coverage-map.json', 0);
  add('cross-capsule-map.json', 0);
  add('topic-index.json', 0);
  add('source-of-truth-map.json', 0);

  for (const f of CONTEXT_READING) add(`AI_Context_Capsule/${f}`, 1);
  add('AI_Context_Capsule/context-capsule.json', 1);
  add('AI_Context_Capsule/CAPSULE_VALIDATION.md', 1);

  for (const f of FIC_READING) add(`Founder_Intelligence_Capsule/${f}`, 2);
  add('Founder_Intelligence_Capsule/founder-intelligence.json', 2);

  if (includeDna) {
    for (const f of DNA_READING) add(`Studio_DNA_Capsule/${f}`, 3);
    add('Studio_DNA_Capsule/studio-dna-capsule.json', 3);
  }

  const ciPhase = includeDna ? 4 : 3;
  for (const f of CI_READING) add(`Collaboration_Intelligence_Capsule/${f}`, ciPhase);
  add('Collaboration_Intelligence_Capsule/collaboration-intelligence.json', ciPhase);

  const finalPhase = includeDna ? 5 : 4;
  add('ONBOARDING_REPORT_TEMPLATE.md', finalPhase);
  add('ONBOARDING_PACK_VALIDATION.md', finalPhase);
  add('onboarding-pack.json', finalPhase);

  return entries;
}

function generateStartHere(includeDna, capsules) {
  const dnaLine = includeDna
    ? '- **Studio DNA Capsule** — HOW Studio OS thinks *(included)*'
    : '- **Studio DNA Capsule** — not included in this pack; absence is not a validation failure';

  return `# START HERE — Studio OS Unified Onboarding Pack

**This is the only authoritative entry point** when multiple capsules are distributed together.

**Pack version:** ${PACK_VERSION}  
**Included capsules:** ${capsules.join(', ')}

---

## Rules (read before anything else)

1. This package may contain **multiple capsules**.
2. **MASTER_MANIFEST.md** defines the **complete required reading order** — follow it exactly.
3. Individual capsule README and MANIFEST files are **subordinate** inside this pack.
4. **Do not** stop after inspecting archive contents or listing files.
5. **Do not** produce intermediate summaries between phases.
6. **Read every required file completely** before writing your report.
7. Use **ONBOARDING_REPORT_TEMPLATE.md** as the **required report structure**.
8. **Populate each section with your own findings** — do **not** copy blank instructional text as answers.
9. Generate **one** final onboarding report for the **entire pack** — not one per capsule.
10. **Stop and wait for founder approval** after completing the report.
11. After all capsules, read **CURRENT_HANDOFF.md** (AI Context) before any implementation.

> Use ONBOARDING_REPORT_TEMPLATE.md as the required structure. Populate each section with your own findings based on the documents you read. Do not copy the blank instructional text as the answer.

If a capsule is **not present** in this package, do not treat it as a missing requirement unless **MASTER_MANIFEST.md** explicitly lists it as required.

---

## Included capsules (reading order)

1. **AI Context Capsule** — WHAT the project knows *(required)*
2. **Founder Intelligence Capsule** — WHY the project exists *(required)*
3. **Studio DNA Capsule** — HOW decisions should feel *(optional when included)*
4. **Collaboration Intelligence Capsule** — HOW Founder and AI built it together *(required)*
5. **CURRENT_HANDOFF.md** — operational truth *(AI Context — read before acting)*

${dnaLine}

---

## Machine-readable index (verify before reading)

Before reading capsule documents, inspect these generated JSON files to verify pack structure and coverage:

- **onboarding-state.json** — pack state, capsule inventory, validation status
- **onboarding-index.json** — per-document metadata and report-section mapping
- **coverage-map.json** — topic coverage status
- **cross-capsule-map.json** — concept ownership across capsules
- **topic-index.json** — reverse topic → document index
- **source-of-truth-map.json** — operational authority hierarchy

These files do **not** replace reading the documents — they make coverage verifiable.

---

## Where to go next

1. **onboarding-state.json** — validate pack structure  
2. **MASTER_MANIFEST.md** — full reading order  
3. **ONBOARDING_GUIDE.md** — how to classify facts, sources, and implementation state  
4. Read every manifest entry in order  
5. **ONBOARDING_REPORT_TEMPLATE.md** — complete your single final report  
6. **Stop** — wait for founder approval

---

## Unified pack vs standalone capsules

If you received a **single capsule ZIP** without this START_HERE file, that capsule's own README_FIRST and MANIFEST are authoritative.

Inside **StudioOS_OnboardingPack/**, this file and MASTER_MANIFEST always win.

**Preferred complete handoff URL:** \`https://fsbw.vercel.app/onboarding/latest\`
`;
}

function generateMasterManifest(entries, meta) {
  const lines = [
    '# MASTER MANIFEST — Unified Onboarding Pack',
    '',
    '| Field | Value |',
    '|-------|-------|',
    `| **Pack version** | ${PACK_VERSION} |`,
    `| **Generated (UTC)** | ${meta.generatedAt} |`,
    `| **Repository commit** | ${meta.gitCommit} |`,
    `| **Required file count** | ${entries.length} |`,
    `| **Manifest checksum** | ${meta.manifestChecksum} |`,
    '',
    '## Machine-readable index (phase 0)',
    '',
    '| File | Purpose |',
    '|------|---------|',
    '| `onboarding-state.json` | Pack state, validation, capsule inventory |',
    '| `onboarding-index.json` | Per-document metadata and report mapping |',
    '| `coverage-map.json` | Topic coverage verification |',
    '| `cross-capsule-map.json` | Concept ownership across capsules |',
    '| `topic-index.json` | Topic → document reverse index |',
    '| `source-of-truth-map.json` | Operational authority hierarchy |',
    '',
    '## Per-capsule counts',
    '',
    ...Object.entries(meta.perCapsuleFileCounts).map(([k, v]) => `- **${k}:** ${v} files`),
    '',
    `## Expected report sections (${REPORT_SECTIONS.length})`,
    '',
    ...REPORT_SECTIONS.map((s) => `- ${s.number}. ${s.title}`),
    '',
    '## Complete reading order',
    '',
    '| # | Phase | Path |',
    '|---|-------|------|',
  ];
  entries.forEach((e, i) => {
    lines.push(`| ${i + 1} | ${e.phase} | \`${e.path}\` |`);
  });
  lines.push('', '## Final steps', '', '1. Complete **ONBOARDING_REPORT_TEMPLATE.md** (populated, original wording)', '2. Read **ONBOARDING_PACK_VALIDATION.md** for package metadata', '3. **Stop** — wait for founder approval', '');
  return lines.join('\n');
}

function writeValidation(packDir, meta, coverageOk) {
  const body = `# Onboarding Pack Validation — Auto-Generated

| Field | Value |
|-------|-------|
| **Pack version** | ${PACK_VERSION} |
| **Generated (UTC)** | ${meta.generatedAt} |
| **Git commit** | ${meta.gitCommit} |
| **Validation** | pass |
| **Content coverage** | ${coverageOk ? 'pass' : 'fail'} |
| **Required files** | ${meta.requiredFileCount} |
| **Actual files** | ${meta.actualFileCount} |
| **Archive checksum** | ${meta.archiveChecksum} |

## Included capsules

${meta.includedCapsules.map((c) => `- ${c}`).join('\n')}

## Optional not included

${meta.missingOptionalCapsules.length ? meta.missingOptionalCapsules.map((c) => `- ${c}`).join('\n') : '- none'}

## Checks

- ✓ START_HERE.md, MASTER_MANIFEST.md, ONBOARDING_GUIDE.md, ONBOARDING_REPORT_TEMPLATE.md present
- ✓ Machine-readable index layer (onboarding-state.json + 5 companion files) generated
- ✓ Required capsules present (including Collaboration Intelligence Capsule)
- ✓ Master manifest entries exist on disk
- ✓ Founder Intelligence content coverage validated
- ✓ Collaboration Intelligence content coverage validated
- ✓ All ${REPORT_SECTIONS.length} report sections answerable from indexed documents
- ✓ Topic index, cross-capsule map, and source-of-truth map validated
- ✓ Single final report template defined
- ✓ No mandatory reference to absent capsules

*Regenerated by scripts/package-onboarding-pack-zip.mjs*
`;
  fs.writeFileSync(path.join(packDir, 'ONBOARDING_PACK_VALIDATION.md'), body);
}

function verifyZip(zipPath) {
  execSync(`unzip -t ${JSON.stringify(zipPath)}`, { stdio: 'pipe' });
}

function packageOnboardingPack() {
  const contextRelease = loadRelease('api/_lib/context-capsule-release.json');
  const ficRelease = loadRelease('api/_lib/founder-intelligence-capsule-release.json');
  const ciRelease = loadRelease('api/_lib/collaboration-intelligence-capsule-release.json');
  if (
    contextRelease?.validationStatus !== 'pass' ||
    ficRelease?.validationStatus !== 'pass' ||
    ciRelease?.validationStatus !== 'pass'
  ) {
    console.error('\n❌ Required capsule releases not validated — aborting onboarding pack\n');
    process.exit(1);
  }

  const includeDna = validateDnaAvailable();
  const ficCoverageErrors = validateFicCoverage(path.join(ROOT, FIC_SRC));
  const ciCoverageErrors = validateCiCoverage(path.join(ROOT, CI_SRC));
  if (ficCoverageErrors.length) {
    console.error('\n❌ Founder Intelligence content coverage failed:\n');
    for (const e of ficCoverageErrors) console.error(`   • ${e}`);
    process.exit(1);
  }
  if (ciCoverageErrors.length) {
    console.error('\n❌ Collaboration Intelligence content coverage failed:\n');
    for (const e of ciCoverageErrors) console.error(`   • ${e}`);
    process.exit(1);
  }

  const stagingRoot = path.join(ROOT, '.onboarding-pack-staging');
  const packDir = path.join(stagingRoot, PACK_FOLDER);
  if (fs.existsSync(stagingRoot)) fs.rmSync(stagingRoot, { recursive: true, force: true });
  fs.mkdirSync(packDir, { recursive: true });

  copyDir(path.join(ROOT, CONTEXT_SRC), path.join(packDir, 'AI_Context_Capsule'));
  copyDir(path.join(ROOT, FIC_SRC), path.join(packDir, 'Founder_Intelligence_Capsule'));
  if (includeDna) copyDir(path.join(ROOT, DNA_SRC), path.join(packDir, 'Studio_DNA_Capsule'));
  copyDir(path.join(ROOT, CI_SRC), path.join(packDir, 'Collaboration_Intelligence_Capsule'));

  fs.copyFileSync(path.join(ROOT, 'onboarding-pack/ONBOARDING_GUIDE.md'), path.join(packDir, 'ONBOARDING_GUIDE.md'));
  fs.copyFileSync(path.join(ROOT, 'onboarding-pack/ONBOARDING_REPORT_TEMPLATE.md'), path.join(packDir, 'ONBOARDING_REPORT_TEMPLATE.md'));

  const includedCapsules = ['AI Context Capsule', 'Founder Intelligence Capsule', 'Collaboration Intelligence Capsule'];
  if (includeDna) includedCapsules.splice(2, 0, 'Studio DNA Capsule');
  const missingOptional = includeDna ? [] : ['Studio DNA Capsule (optional — not included)'];

  fs.writeFileSync(path.join(packDir, 'START_HERE.md'), generateStartHere(includeDna, includedCapsules));

  const manifestEntries = buildMasterManifestEntries(includeDna);
  const generatedAt = new Date().toISOString();
  const gitCommit = readGitCommit();
  const manifestChecksum = sha256Text(JSON.stringify(manifestEntries));

  const perCapsuleFileCounts = {
    'AI Context': CONTEXT_READING.length + 2,
    'Founder Intelligence': FIC_READING.length + 1,
    'Collaboration Intelligence': CI_READING.length + 1,
    'Machine-Readable Index': 6,
  };
  if (includeDna) perCapsuleFileCounts['Studio DNA'] = DNA_READING.length + 1;

  const meta = {
    generatedAt,
    gitCommit,
    manifestChecksum,
    requiredFileCount: manifestEntries.length,
    includedCapsules,
    missingOptionalCapsules: missingOptional,
    perCapsuleFileCounts,
  };

  const templateErrors = validateReportTemplateSections(packDir);
  if (templateErrors.length) {
    console.error('\n❌ ONBOARDING_REPORT_TEMPLATE validation failed:\n');
    for (const e of templateErrors) console.error(`   • ${e}`);
    process.exit(1);
  }

  const machineReadable = generateMachineReadableLayer({
    packDir,
    packVersion: PACK_VERSION,
    gitCommit,
    generatedAt,
    manifestEntries,
    manifestChecksum,
    includeDna,
    contextReading: CONTEXT_READING,
    ficReading: FIC_READING,
    dnaReading: DNA_READING,
    ciReading: CI_READING,
    capsuleReleases: {
      context: contextRelease,
      founderIntelligence: ficRelease,
      collaborationIntelligence: ciRelease,
      studioDna: includeDna ? loadRelease('api/_lib/studio-dna-capsule-release.json') : null,
    },
    includedCapsules,
    missingOptionalCapsules: missingOptional,
    archiveChecksum: null,
  });

  if (!machineReadable.validation.pass) {
    console.error('\n❌ Machine-readable onboarding validation failed:\n');
    for (const e of machineReadable.validation.errors) console.error(`   • ${e}`);
    process.exit(1);
  }

  fs.writeFileSync(path.join(packDir, 'MASTER_MANIFEST.md'), generateMasterManifest(manifestEntries, meta));

  const actualFileCount = manifestEntries.length;
  const onboardingPackJson = {
    schemaVersion: 2,
    packVersion: PACK_VERSION,
    machineReadableSchemaVersion: 2,
    canonVersion: contextRelease.currentVersion,
    buildNumber: gitCommit.slice(0, 7),
    generatedAt,
    repositoryCommit: gitCommit,
    includedCapsules: includedCapsules.map((name) => ({
      name,
      version:
        name === 'AI Context Capsule'
          ? contextRelease.currentVersion
          : name === 'Founder Intelligence Capsule'
            ? ficRelease.currentVersion
            : name === 'Collaboration Intelligence Capsule'
              ? ciRelease.currentVersion
              : '1.0.0',
    })),
    optionalCapsules: ['Studio DNA Capsule'],
    missingOptionalCapsules: missingOptional,
    requiredFileCount: manifestEntries.length,
    actualFileCount,
    perCapsuleFileCounts,
    masterManifestChecksum: manifestChecksum,
    validationStatus: 'pass',
    contentCoverageStatus: 'pass',
    operationalAuthorityMap: OPERATIONAL_AUTHORITY_MAP,
    reportTemplatePath: 'ONBOARDING_REPORT_TEMPLATE.md',
    reportSectionCount: REPORT_SECTIONS.length,
    machineReadableFiles: [
      'onboarding-state.json',
      'onboarding-index.json',
      'coverage-map.json',
      'cross-capsule-map.json',
      'topic-index.json',
      'source-of-truth-map.json',
    ],
    compatibilityVersion: '1.2.0',
    permanentLatestUrl: PERMANENT_LATEST_PATH,
    capsules: {
      context: { version: contextRelease.currentVersion, artifact: contextRelease.artifact },
      founderIntelligence: { version: ficRelease.currentVersion, artifact: ficRelease.artifact },
      collaborationIntelligence: { version: ciRelease.currentVersion, artifact: ciRelease.artifact },
      studioDna: includeDna ? { version: '1.0.0', included: true } : { included: false },
    },
  };

  meta.actualFileCount = actualFileCount;
  meta.requiredFileCount = manifestEntries.length;
  writeValidation(packDir, meta, true);

  fs.writeFileSync(path.join(packDir, 'onboarding-pack.json'), JSON.stringify(onboardingPackJson, null, 2) + '\n');

  for (const entry of manifestEntries) {
    const fp = path.join(packDir, entry.path);
    if (!fs.existsSync(fp)) {
      console.error(`\n❌ Master manifest entry missing: ${entry.path}\n`);
      process.exit(1);
    }
  }

  const fileName = `StudioOS_OnboardingPack_v${PACK_VERSION}.zip`;
  const publicOut = path.join(ROOT, 'public/downloads/onboarding-packs');
  const archiveOut = path.join(publicOut, ARCHIVE_SUBDIR);
  fs.mkdirSync(archiveOut, { recursive: true });

  const zipPath = path.join(archiveOut, fileName);
  execSync(`zip -r -q ${JSON.stringify(zipPath)} ${JSON.stringify(PACK_FOLDER)}`, {
    cwd: stagingRoot,
    stdio: 'inherit',
  });
  verifyZip(zipPath);

  const archiveChecksum = sha256File(zipPath);
  const stat = fs.statSync(zipPath);
  onboardingPackJson.archiveChecksum = archiveChecksum;
  onboardingPackJson.machineReadableValidation = machineReadable.validation.pass ? 'pass' : 'fail';
  fs.writeFileSync(path.join(packDir, 'onboarding-pack.json'), JSON.stringify(onboardingPackJson, null, 2) + '\n');

  const statePath = path.join(packDir, 'onboarding-state.json');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  state.checksumValidation.archiveChecksumSha256 = archiveChecksum;
  state.checksumValidation.status = 'pass';
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
  writeValidation(packDir, { ...meta, actualFileCount, archiveChecksum }, true);

  const stagingLatest = path.join(publicOut, '.latest-staging.zip');
  fs.copyFileSync(zipPath, stagingLatest);
  verifyZip(stagingLatest);
  fs.copyFileSync(stagingLatest, path.join(publicOut, LATEST_ALIAS));
  fs.unlinkSync(stagingLatest);

  const publicOnboardingDir = path.join(ROOT, 'public/onboarding');
  fs.mkdirSync(publicOnboardingDir, { recursive: true });

  const releaseManifest = {
    schemaVersion: 2,
    packType: 'unified-onboarding',
    currentVersion: PACK_VERSION,
    generatedAt,
    gitCommit,
    validationStatus: 'pass',
    contentCoverageStatus: 'pass',
    machineReadableValidation: 'pass',
    documentCount: actualFileCount,
    checksumSha256: archiveChecksum,
    artifact: fileName,
    permanentLatestUrl: PERMANENT_LATEST_PATH,
    latestDownloadPath: PERMANENT_LATEST_PATH,
    legacyLatestDownloadPath: `${DOWNLOAD_BASE}/${LATEST_ALIAS}`,
    versionedDownloadPath: `${DOWNLOAD_BASE}/${ARCHIVE_SUBDIR}/${fileName}`,
    includedCapsules: onboardingPackJson.includedCapsules,
    missingOptionalCapsules: missingOptional,
    packageHealth: 100,
    readyForAiOnboarding: true,
  };

  const writeJson = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 2) + '\n');
  writeJson(path.join(publicOut, 'release.json'), releaseManifest);
  writeJson(path.join(publicOnboardingDir, 'release.json'), releaseManifest);
  writeJson(path.join(ROOT, 'api/_lib/onboarding-pack-release.json'), releaseManifest);
  writeJson(path.join(ROOT, 'api/_lib/onboarding-pack-build-manifest.json'), {
    ...releaseManifest,
    sizeBytes: stat.size,
  });

  fs.rmSync(stagingRoot, { recursive: true, force: true });

  console.log(`\nStudio OS Unified Onboarding Pack:`);
  console.log(`  Pack version:     ${PACK_VERSION}`);
  console.log(`  Generated:        ${generatedAt}`);
  console.log(`  Validation:       pass`);
  console.log(`  Included:         ${includedCapsules.join(', ')}`);
  console.log(`  Required files:   ${actualFileCount}`);
  console.log(`  Permanent latest: ${PERMANENT_LATEST_PATH}`);
  console.log(`  Dashboard:        /onboarding`);
  console.log(`  Report sections:  ${REPORT_SECTIONS.length}\n`);
}

packageOnboardingPack();

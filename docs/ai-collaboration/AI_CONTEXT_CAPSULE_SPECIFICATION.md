# AI Context Capsule™ — Canonical System Specification

**Version:** 2.0.0  
**Status:** Architecture specification — **no HQ Archive UI implementation in this sprint**  
**Authority:** Single source of truth for the portable AI operating system layer  
**Supersedes:** `EXPORT_SPECIFICATION.md` v1.0 (retained as historical appendix)

---

## 0. North star

> The founder should **never manually explain Studio OS to an AI again.**

They export **one file**, upload **one file**, and the AI collaborates immediately with full continuity:

- the founder (collaboration profile)
- Studio OS vision and architecture
- current sprint and blockers
- workflow and terminology
- collaboration style

**Minutes, not months.**

---

## 1. Official name and identity

| Field | Value |
|-------|--------|
| **Product name** | AI Context Capsule™ |
| **File extension** | `.studiocapsule` |
| **Example filename** | `StudioOS_ContextCapsule_v2.4.0_e158ba3.studiocapsule` |
| **MIME type (future)** | `application/vnd.studio-os.context-capsule+zip` |
| **Magic bytes (future)** | `STCAP\x00` at archive header (optional v3) |

The founder sees **one file**. Internal folder structure is implementation detail.

---

## 2. Product surface (future HQ integration)

**Navigation path (permanent feature target):**

```
Studio Headquarters
  └── Studio Archive
        └── Knowledge Management
              └── Export AI Context Capsule™
```

| Action | Founder experience |
|--------|-------------------|
| **Export** | One button → one `.studiocapsule` download + optional sidecar PDF |
| **Import** (future AI tools) | Upload `.studiocapsule` → AI reads manifest readOrder |
| **Smart export** | Dropdown: Full · Sprint · Release · Handoff only · etc. |

**This sprint:** architecture + source docs + CLI v1 only. No Archive UI.

---

## 3. Package architecture

### 3.1 Archive format

`.studiocapsule` is a **ZIP archive** (DEFLATE, no encryption in v2).

| Property | Choice | Rationale |
|----------|--------|-----------|
| Container | ZIP | Universal; ChatGPT/Claude file upload compatible |
| Compression | DEFLATE default | Balance size vs compatibility |
| Entry encoding | UTF-8 paths | Cross-platform |
| Max size (soft) | 15 MB | Custom GPT upload limits; trim MEMORY tail |
| Max size (hard) | 50 MB | Reject with actionable error |

### 3.2 Internal layout (founder never sees this)

```
StudioOS_ContextCapsule_v2.4.0.studiocapsule
├── Manifest/
│   ├── manifest.json          ← required; validated against manifest.v2.schema.json
│   ├── capsule.json           ← portable machine bundle (flattened sections)
│   └── checksums.sha256       ← all file hashes
├── Version/
│   ├── capsule-version.txt
│   ├── studio-os-version.txt
│   └── project-version.txt
├── Founder/
│   └── profile.json           ← collaboration preferences only
├── StudioOS/
│   ├── context.md
│   └── project-dna.md
├── Architecture/
│   ├── overview.md            ← compressed from CORE + CODEBASE extracts
│   └── boot-paths.md            ← optional: diagnostic isolation, etc.
├── CurrentSprint/
│   ├── handoff.md
│   ├── blockers.json
│   └── open-questions.json
├── Workflow/
│   ├── operating-manual.md
│   ├── style-guide.md
│   ├── prompt-library.md
│   └── new-chat-checklist.md
├── Glossary/
│   ├── terms.json               ← structured terms + relationships + deprecated
│   └── terms.md                 ← human-readable mirror
├── History/
│   ├── changelog.md
│   ├── memory-snapshot.json
│   └── memory-recent.md         ← last N motherboard entries
├── Roadmap/
│   └── roadmap.md
└── Assets/
    ├── executive-summary.md     ← 1–2 pages
    ├── executive-summary.pdf    ← optional if generator available
    └── cover.json               ← title, date, version for PDF/UI
```

### 3.3 Section → source mapping

| Capsule path | Source (repo) | Transform |
|--------------|-----------------|-----------|
| `Founder/profile.json` | `FOUNDER_PROFILE.md` | Parse sections → JSON |
| `Workflow/operating-manual.md` | `CHATGPT_OPERATING_MANUAL.md` | Copy |
| `Workflow/style-guide.md` | `AI_STYLE_GUIDE.md` | Copy |
| `StudioOS/context.md` | `AI_CONTEXT.md` | Copy |
| `CurrentSprint/handoff.md` | `CURRENT_HANDOFF.md` | Copy |
| `Glossary/terms.json` | `AI_GLOSSARY.md` | Parse ### headings → JSON array |
| `History/changelog.md` | `AI_CHANGELOG.md` | Copy |
| `Workflow/prompt-library.md` | `PROMPT_TEMPLATES.md` | Copy |
| `StudioOS/project-dna.md` | `PROJECT_DNA.md` | Copy |
| `History/memory-snapshot.json` | `AI_MEMORY_SNAPSHOT.md` + live merge | Template + handoff merge |
| `History/memory-recent.md` | `motherboard/MEMORY.md` | Last 5 entries only |
| `Architecture/overview.md` | `motherboard/CORE.md` | Extract stack, flows, Studio OS sections (max 32 KB) |
| `Roadmap/roadmap.md` | `AI_CONTEXT.md` §11 + handoff priorities | Synthesize |
| `Assets/executive-summary.md` | Generated | Template fill from handoff + blockers |

---

## 4. Capsule contents (semantic model)

### 4.1 Founder profile

Collaboration-only JSON derived from `FOUNDER_PROFILE.md`.

**Includes:** working style, creative philosophy, decision framework, teaching/communication/review/brainstorming preferences, quality standards, learning style.

**Excludes:** legal name, home address, credentials, customer data, health, family, financials.

### 4.2 ChatGPT Operating Manual

Full `CHATGPT_OPERATING_MANUAL.md` — formatting, Composer/Terra workflows, sprint structure, testing URL rules, debugging, architecture vs implementation boundaries.

### 4.3 AI Style Guide

Full `AI_STYLE_GUIDE.md`.

### 4.4 AI Context

Full `AI_CONTEXT.md` — vision, Genesis, Studio World, Institute, Atlas, Genesis Core, Experience Lab, Compiler, roadmap, blockers.

### 4.5 Current handoff

Full `CURRENT_HANDOFF.md` plus structured `blockers.json` and `open-questions.json` parsed from handoff tables.

### 4.6 AI Glossary

Structured `terms.json`:

```json
{
  "terms": [
    {
      "id": "world-compiler",
      "canonical": "World Compiler™",
      "definition": "...",
      "relationships": [{ "type": "part-of", "target": "scene-stack" }],
      "aliases": [],
      "deprecated": false,
      "canonRef": "docs/studio-os/"
    }
  ],
  "deprecated": [
    { "term": "Scene Stack retry shell", "supersededBy": "Landmark generation failed" }
  ]
}
```

### 4.7 Project changelog

Full or truncated `AI_CHANGELOG.md` (full for `release` export; last 10 entries for `sprint`).

### 4.8 Prompt library

Full `PROMPT_TEMPLATES.md`.

### 4.9 Project DNA

Full `PROJECT_DNA.md` — philosophy and why.

### 4.10 AI memory snapshot

`memory-snapshot.json` — collaboration focus, recent discoveries, recurring workflows, pending ideas, institutional pointers. Regenerated each export.

### 4.11 Manifest

See `schemas/manifest.v2.schema.json`.

---

## 5. Manifest schema (summary)

Full JSON Schema: [`schemas/manifest.v2.schema.json`](./schemas/manifest.v2.schema.json)

**Required fields:**

| Field | Description |
|-------|-------------|
| `manifestVersion` | `2` |
| `capsuleVersion` | Semver e.g. `2.4.0` |
| `capsuleId` | Unique id |
| `generatedAt` | ISO-8601 |
| `generator` | `{ name, source, buildId, gitRef }` |
| `studioOsVersion` | Platform version |
| `projectVersion` | Repo/product marker |
| `exportType` | full \| incremental \| milestone \| release \| sprint \| … |
| `checksums` | archive + per-file SHA-256 |
| `compatibility` | platformNeutral: true, testedPlatforms[] |
| `contents` | path map |
| `readOrder` | AI onboarding sequence |

**Optional incremental fields:**

- `previousCapsuleReference`
- `incrementalChangeNumber`
- `diffSummary`

---

## 6. Versioning strategy

Three independent version lines:

| Version | Meaning | Example |
|---------|---------|---------|
| **Manifest version** | Schema breaking changes | `manifestVersion: 2` |
| **Capsule version** | Content bundle semver | `2.4.0` |
| **Studio OS version** | Platform deploy | git sha or semver |
| **Project version** | Monorepo marker | `package.json` version + sha |

**Capsule semver rules:**

- **MAJOR** — manifest breaking change or section removal
- **MINOR** — new required section or smart export type
- **PATCH** — content refresh, handoff update, typo

**Incremental capsules:**

When `exportType: incremental`, include only changed files vs `previousCapsuleReference`, plus:

- `Manifest/manifest.json` (full)
- `Manifest/diff.json` (changed paths + summaries)
- `Assets/executive-summary.md` (always)

Importer merges incremental over prior capsule in memory (future Studio Archive import UI).

---

## 7. Compression strategy

| Layer | Strategy |
|-------|----------|
| Text (.md) | ZIP DEFLATE — typically 70–85% reduction |
| JSON | Minified before zip |
| PDF | Store (already compressed) |
| Duplicate canon | Deduplicate by sha256 in generator — warn if identical |

**Size governance:**

1. Truncate `memory-recent.md` to 5 entries
2. Truncate `Architecture/overview.md` to 32 KB
3. Glossary: include all terms; definitions max 500 chars each in JSON
4. If still > 15 MB soft limit → fail with "reduce MEMORY tail" message

---

## 8. Export workflow

### 8.1 Pipeline (canonical)

```
┌─────────────────────────────────────────────────────────────┐
│  TRIGGER: HQ button | CLI | CI release | "Export capsule"   │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. COLLECT — read sources per §3.3                         │
│  2. VALIDATE — handoff freshness, schema preconditions      │
│  3. REDACT — secrets denylist, strip PII patterns           │
│  4. TRANSFORM — md→json, synthesize roadmap/summary         │
│  5. MANIFEST — build manifest.json, checksums               │
│  6. PACKAGE — write temp dir → zip → .studiocapsule         │
│  7. SIDEcar — executive-summary.pdf (optional)              │
│  8. RECORD — append AI_CHANGELOG "Capsule exported"         │
│  9. DELIVER — download URL / dist/ / Archive artifact       │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Smart export types

| Type | Contents included |
|------|-------------------|
| **full** | All sections |
| **incremental** | Diff vs previous + manifest + summary |
| **milestone** | full + milestone metadata + canon refs |
| **release** | full + full changelog + version bump |
| **sprint** | handoff, blockers, memory-snapshot, prompt-library, operating-manual § sprint |
| **founder-profile-only** | Founder/ + style-guide |
| **architecture-only** | Architecture/, Glossary/, StudioOS/context.md |
| **handoff-only** | CurrentSprint/ + memory-snapshot |

### 8.3 One-click outputs (founder receives)

From one button press:

1. **`StudioOS_ContextCapsule_v{X}.studiocapsule`** — primary artifact
2. **`StudioOS_ContextCapsule_v{X}_summary.pdf`** — optional sidecar (not inside zip for v2; separate download)

Inside the capsule, markdown and JSON copies exist for importers that unzip.

### 8.4 CLI (Phase 1 — partial)

```bash
npm run export:ai-context-capsule -- [--type full|sprint|handoff-only] [--out dir]
```

**Current:** flat md + json in `dist/`  
**Phase 2:** full `.studiocapsule` zip per this spec  
**Phase 3:** HQ Archive integration

---

## 9. Import workflow

### 9.1 Universal sequence (platform-neutral)

```
Upload StudioOS_ContextCapsule_v2.4.studiocapsule
        │
        ▼
Verify archive SHA-256 vs manifest.checksums
        │
        ▼
Read Manifest/manifest.json
        │
        ▼
Follow readOrder[] sequentially
        │
        ├── Founder/profile.json
        ├── Workflow/operating-manual.md
        ├── Workflow/style-guide.md
        ├── StudioOS/context.md
        ├── CurrentSprint/handoff.md
        ├── Glossary/terms.json
        ├── Roadmap/roadmap.md
        ├── History/changelog.md
        ├── Workflow/prompt-library.md
        ├── StudioOS/project-dna.md
        └── History/memory-snapshot.json
        │
        ▼
AI responds: "I understand the current architecture and workflow."
        │
        ▼
Ready to collaborate
```

### 9.2 Platform notes (no vendor lock-in)

| Platform | Import method |
|----------|---------------|
| **ChatGPT** | Upload `.studiocapsule` or extract `Assets/executive-summary.md` + Custom GPT knowledge |
| **Claude** | Project knowledge upload / paste executive summary |
| **Gemini** | Drive upload + system instruction referencing manifest readOrder |
| **Cursor** | Unzip to `.cursor/context/` or rely on motherboard for in-repo agents |
| **Future Studio AI** | Native importer reads manifest.v2 natively |

**Rule:** Capsule never requires OpenAI-specific fields, Claude-specific XML, or Cursor-specific paths in manifest.

### 9.3 Incremental import

1. Load base capsule from Archive registry (by `previousCapsuleReference`)
2. Apply incremental file overlays
3. Revalidate checksums for merged set
4. Skip unchanged sections in AI read (future optimization)

---

## 10. AI compatibility philosophy

| Principle | Implementation |
|-----------|----------------|
| **Platform neutral** | Markdown + JSON + open ZIP |
| **Human readable** | Every section has .md mirror |
| **Machine readable** | manifest.json + terms.json + capsule.json |
| **No secrets** | Redaction pass mandatory |
| **No PII** | Founder profile = collaboration only |
| **Deterministic** | Same inputs + git sha → same checksums |
| **Self-describing** | manifest.readOrder is onboarding |

---

## 11. AI onboarding sequence

Canonical steps (also in `NEW_CHAT_CHECKLIST.md`):

1. Parse manifest — confirm `compatibility.platformNeutral === true`
2. Read Founder profile — calibrate communication
3. Read Operating Manual — workflows and escalation
4. Read Style Guide — formatting law
5. Read Context — vision and architecture
6. Read Handoff — **authoritative current state**
7. Read Glossary — terminology lock
8. Skim Changelog — recent decisions only
9. Confirm readiness phrase
10. Await founder task — author Composer/Terra prompts per templates

**Conflict resolution:** `CurrentSprint/handoff.md` beats older chat memory beats generic training.

---

## 12. Long-term maintenance strategy

| Artifact | Maintainer | Trigger |
|----------|------------|---------|
| `CURRENT_HANDOFF.md` | Founder / agent | Every sprint |
| `AI_CHANGELOG.md` | Agent | Every decision |
| `AI_GLOSSARY.md` | Founder + agent | New canon term |
| `FOUNDER_PROFILE.md` | Founder | Collaboration preference change |
| Capsule semver | Export pipeline | Section schema change |
| HQ Archive registry | Platform | Every export stores manifest + sha |

**Automation targets:**

- Sprint close → auto `exportType: sprint`
- Git tag → auto `exportType: release` attached to GitHub Release
- Milestone doc complete → `exportType: milestone`

---

## 13. Security and privacy

| Denylist pattern | Action |
|------------------|--------|
| `SUPABASE_*`, `VITE_*`, `STRIPE_*`, `FAL_*`, `*_SECRET*`, `*_KEY` | Strip values; omit keys |
| Email addresses (except public admin docs) | Redact |
| `sb-*-auth-token` | Never include |
| Full `MEMORY.md` | Max 5 entries |
| Customer orders / profiles | Never |

Founder reviews first automated export before Custom GPT upload.

---

## 14. Future automation roadmap

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **0** | Collaboration docs in `docs/ai-collaboration/` | ✅ Done |
| **1** | CLI flat md/json export | ✅ Partial |
| **2** | `.studiocapsule` zip + manifest v2 + checksums | Specified (this doc) |
| **3** | PDF executive summary generator | Specified |
| **4** | HQ → Archive → Knowledge Management UI | Not started |
| **5** | Incremental + diff capsules | Specified |
| **6** | Archive registry + import merge UI | Not started |
| **7** | Auto-export on release CI | Not started |
| **8** | LLM executive summary with template guardrails | Optional |

---

## 15. Success criteria

The AI Context Capsule system succeeds when:

- Founder exports **one file** with zero manual assembly
- New ChatGPT session reaches sprint-quality Composer prompts in **< 10 minutes**
- Zero canon contradictions vs handoff
- Import works on ChatGPT, Claude, Gemini without vendor-specific prep
- Incremental export reduces re-read time for returning AI sessions
- HQ Archive stores capsule history with manifest index

---

## 16. Related documents

| Doc | Role |
|-----|------|
| [`README.md`](./README.md) | Folder index |
| [`NEW_CHAT_CHECKLIST.md`](./NEW_CHAT_CHECKLIST.md) | Manual onboarding (pre-capsule) |
| [`EXPORT_SPECIFICATION.md`](./EXPORT_SPECIFICATION.md) | v1 historical appendix |
| [`schemas/manifest.v2.schema.json`](./schemas/manifest.v2.schema.json) | Manifest JSON Schema |
| [`FOUNDER_PROFILE.md`](./FOUNDER_PROFILE.md) | Founder section source |
| [`PROJECT_DNA.md`](./PROJECT_DNA.md) | Philosophy source |
| [`AI_MEMORY_SNAPSHOT.md`](./AI_MEMORY_SNAPSHOT.md) | Memory snapshot template |

---

## 17. Appendix — example manifest (minimal)

```json
{
  "manifestVersion": 2,
  "capsuleVersion": "2.0.0",
  "capsuleId": "capsule-2026-07-10-e158ba3",
  "generatedAt": "2026-07-10T16:30:00.000Z",
  "generator": {
    "name": "export-ai-context-capsule",
    "source": "cli",
    "buildId": "e158ba346",
    "gitRef": "master"
  },
  "studioOsVersion": "e158ba346",
  "projectVersion": "0.0.0+e158ba346",
  "incrementalChangeNumber": 1,
  "previousCapsuleReference": null,
  "exportType": "full",
  "diffSummary": null,
  "checksums": {
    "archiveSha256": "…",
    "manifestSha256": "…",
    "files": []
  },
  "compatibility": {
    "minManifestVersion": 2,
    "platformNeutral": true,
    "testedPlatforms": ["chatgpt", "claude", "gemini", "cursor", "generic-llm"],
    "importWorkflowVersion": 1
  },
  "contents": {
    "founderProfile": "Founder/profile.json",
    "operatingManual": "Workflow/operating-manual.md",
    "handoff": "CurrentSprint/handoff.md"
  },
  "readOrder": [
    "Manifest/manifest.json",
    "Founder/profile.json",
    "Workflow/operating-manual.md",
    "Workflow/style-guide.md",
    "StudioOS/context.md",
    "CurrentSprint/handoff.md"
  ],
  "redaction": {
    "secretsStripped": true,
    "piiStripped": true,
    "memoryEntryLimit": 5
  }
}
```

---

*End of AI Context Capsule™ Canonical System Specification v2.0.0*

# Export Specification — AI Context Capsule™

**Version:** 1.0.0  
**Status:** Specification only — **no application implementation in v1.0**  
**Purpose:** Define portable export for any AI platform (ChatGPT, Claude, Gemini, etc.)

---

## 1. Command (future)

**User phrase:** `Export AI Context Capsule`

**Future locations:**

| Surface | Behavior |
|---------|----------|
| Studio OS Headquarters | Command Dock action |
| Admin debug | Script / npm command |
| Cursor agent | `./scripts/export-ai-context-capsule.mjs` |
| CI / release hook | Optional post-deploy artifact |

**v1.0 delivery:** Manual assembly from this folder + `motherboard/MEMORY.md` tail + `./scripts/export-ai-context-capsule.mjs` (spec stub).

---

## 2. Capsule contents

The export bundles **read-only** context — no secrets, tokens, or PII.

| Section | Source file(s) | Format in capsule |
|---------|----------------|-------------------|
| Operating manual | `CHATGPT_OPERATING_MANUAL.md` | Full text |
| Style guide | `AI_STYLE_GUIDE.md` | Full text |
| Project context | `AI_CONTEXT.md` | Full text |
| Current handoff | `CURRENT_HANDOFF.md` | Full text |
| Glossary | `AI_GLOSSARY.md` | Full text |
| Changelog (recent) | `AI_CHANGELOG.md` | Last N entries or full |
| Prompt templates index | `PROMPT_TEMPLATES.md` | Full text |
| New chat checklist | `NEW_CHAT_CHECKLIST.md` | Full text |
| Compressed summary | Generated | 1–2 page executive summary |
| Roadmap snapshot | `AI_CONTEXT.md` §11 + handoff | Bullet list |
| Active blockers | `CURRENT_HANDOFF.md` | Table |
| Architecture one-liner | Generated from CORE | Paragraph |
| Collaboration preferences | `AI_STYLE_GUIDE.md` §1–4 | Extract |
| Build / deploy facts | `motherboard/CORE.md` extract | Stack + one-deploy rule |
| Latest MEMORY entries | `motherboard/MEMORY.md` | Last 3–5 entries only |

**Excluded:** Supabase keys, admin credentials, customer PII, full MEMORY history, entire CORE.md (too large).

---

## 3. Output formats

### 3.1 Markdown (primary)

**Filename:** `ai-context-capsule-{ISO-date}.md`

**Structure:**

```markdown
# AI Context Capsule™
Generated: {timestamp}
Build: {git sha}
Package version: 1.0.0

## Executive summary
[Auto-generated 500 words max]

## Current handoff
[Paste CURRENT_HANDOFF.md]

## AI context
[Paste AI_CONTEXT.md]

## Glossary
[Paste AI_GLOSSARY.md or compressed table]

## Recent decisions
[Last 5 AI_CHANGELOG entries]

## Operating manual
[Paste CHATGPT_OPERATING_MANUAL.md]

## Style guide
[Paste AI_STYLE_GUIDE.md]

## Prompt templates
[Paste PROMPT_TEMPLATES.md]

## Recent motherboard entries
[Last 3 MEMORY entries — summaries only]

## Verification URLs
[Diagnostic routes — one per block in human-facing appendix]
```

### 3.2 JSON (machine-readable)

**Filename:** `ai-context-capsule-{ISO-date}.json`

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "buildId": "git-sha",
  "packageVersion": "1.0.0",
  "executiveSummary": "string",
  "handoff": { },
  "context": { },
  "glossary": [ { "term": "", "definition": "" } ],
  "changelogRecent": [ ],
  "blockers": [ ],
  "roadmap": [ ],
  "collaborationPreferences": { },
  "sourceFiles": [
    { "path": "docs/ai-collaboration/CURRENT_HANDOFF.md", "sha256": "..." }
  ]
}
```

JSON sections mirror markdown but structured for programmatic ingestion (Custom GPT knowledge, Claude Projects, etc.).

### 3.3 PDF (portable read-only)

**Filename:** `ai-context-capsule-{ISO-date}.pdf`

**Generation path (specified, not implemented):**

1. Render markdown capsule
2. Pandoc or `md-to-pdf` with print stylesheet
3. Table of contents, page numbers, founder header

**Use case:** Offline reference, sharing with collaborators without repo access.

---

## 4. Generation strategy (v1 manual)

Until automation ships:

1. Run script stub (see §6) OR
2. Founder copies `CURRENT_HANDOFF.md` + `AI_CONTEXT.md` into new ChatGPT thread
3. Attach or paste full `CHATGPT_OPERATING_MANUAL.md` once per Custom GPT setup

**Recommended Custom GPT system prompt opening:**

> Read the attached AI Context Capsule. Follow CHATGPT_OPERATING_MANUAL.md and AI_STYLE_GUIDE.md. Confirm handoff before implementing prompts.

---

## 5. Automation strategy (v2 — future)

### Triggers

| Event | Action |
|-------|--------|
| Milestone complete | Append changelog + regenerate capsule |
| Sprint finish | Update handoff + regenerate capsule |
| Release tag | Attach capsule to GitHub release asset |
| Founder command | On-demand regenerate |
| Nightly (optional) | Handoff unchanged → skip; MEMORY new → refresh summary only |

### Pipeline

```
collect sources
  → validate handoff freshness (< 7 days warning)
  → redact secrets (regex + key denylist)
  → generate executive summary (template-based v2; LLM optional v3)
  → emit .md + .json + .pdf
  → upload artifact (optional: Supabase storage / release)
  → record AI_CHANGELOG entry "Capsule exported"
```

### Idempotence

Same inputs + same git SHA → identical JSON hash (deterministic template sections).

---

## 6. Script stub (specified)

**Path:** `scripts/export-ai-context-capsule.mjs`

**CLI:**

```bash
node scripts/export-ai-context-capsule.mjs [--format md|json|pdf|all] [--out dir]
```

**Behavior (when implemented):**

1. Read files from `docs/ai-collaboration/*.md`
2. Read last 3 entries from `motherboard/MEMORY.md` (split on `## YYYY-MM-DD`)
3. Read git SHA from env or `git rev-parse HEAD`
4. Build combined markdown
5. Write to `dist/ai-context-capsule/` or `--out`
6. JSON: parse sections into schema §3.2
7. PDF: spawn pandoc if available; else warn and skip

**v1.0 repo state:** Script may exist as stub printing "spec only" — full implementation is Phase 2.

---

## 7. Security & privacy

| Rule | Detail |
|------|--------|
| No tokens | Strip `VITE_*`, `SUPABASE_*`, session cookies |
| No customer data | No orders, emails, profiles |
| MEMORY truncation | Last 3–5 entries; not full 45k+ line file |
| Founder review | First automated export reviewed before Custom GPT upload |

---

## 8. Maintenance coupling

When these change, regenerate capsule:

- `CURRENT_HANDOFF.md` (always)
- `AI_CHANGELOG.md` (decisions)
- `AI_CONTEXT.md` (roadmap/blockers)
- `AI_GLOSSARY.md` (new terms)

Operating manual and style guide change rarely — annual Custom GPT refresh sufficient.

---

## 9. Success criteria

Capsule export system passes when:

- New ChatGPT thread + capsule reaches productive sprint authoring in **< 10 minutes**
- Zero canon contradictions vs `CURRENT_HANDOFF.md`
- Composer prompts authored from capsule follow style guide (code blocks, URL rules)
- JSON validates against schemaVersion 1
- PDF readable on mobile

---

## 10. Phase roadmap

| Phase | Deliverable |
|-------|-------------|
| **1 (this sprint)** | Documentation package + this specification |
| **2** | `export-ai-context-capsule.mjs` md + json |
| **3** | PDF + release hook + Command Dock action |
| **4** | LLM-generated executive summary with template guardrails |

---

*End of Export Specification — AI Context Capsule™ v1.0.0*

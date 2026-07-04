# Memory Bible

**Admin-only** institutional knowledge layer for studio os. Curated founder context, naming standards, architecture decisions, workspace memory, and AI Context Builder packages.

Route: `/admin/studio/memory-bible`

## Purpose

Memory Bible answers:

- Who is the founder and what are current priorities?
- What companies and workspaces exist?
- How should content be written?
- How should Cursor prompts be structured?
- What design and engineering principles apply?
- What decisions were made and why?
- What names are official (and which are deprecated)?
- What should future AI agents know before helping?

Memory Bible is **not chat history**. It is stable, curated knowledge that studio os owns instead of relying on a single AI vendor memory.

## Sections

| Section | Contents |
|---------|----------|
| Founder Profile | Preferred name, companies, workspaces, priorities, tools, working style (internal only) |
| Communication Style | Voice rules for copy matching founder tone |
| Writing Rules | Editorial standards linked to Content Brain / Writing Bible |
| Cursor Prompt Standards | How to structure implementation-focused Cursor prompts |
| Design Philosophy | Luxury, immersive, modular UI principles |
| Engineering Philosophy | Architecture-first, reusable systems, approval gates |
| Brand Philosophy | Workspace-level brand rules |
| Naming Bible | Official names, deprecated aliases, usage notes, related modules |
| Decision Log | Title, date, workspace, decision, reason, alternatives, outcome, status |
| AI Preferences | Default tone, onboarding checklist, do-not rules |
| Workspace Memory | Global vs workspace-specific pillars (e.g. Frontal Slayer) |
| AI Context Builder | Task-specific context packages for Cursor, OpenArt, contractors, etc. |
| Export History | Saved packages and markdown exports |
| Version History | Memory Bible v1.0+ with change summaries |

## AI Context Builder

Workflow:

1. Select **workspace** (global studio os or Frontal Slayer)
2. Select **target** (Cursor, ChatGPT, OpenArt, FAL, contractor, designer, developer, internal team)
3. Select **task type** (development milestone, design, copywriting, photography generation, etc.)
4. Toggle **include** flags (memory bible, writing rules, knowledge graph, decisions, architecture, …)
5. Select **scopes** (Asset Factory, Photography Bible, Creative DNA, Tutorial OS, …)
6. **Generate** → copy context, copy Cursor prompt, export markdown, save package

Every package includes:

- Short context summary
- Full structured context (markdown)
- Copy/paste prompt
- Relevant files/docs list
- Related decisions and workflows
- Do-not-break rules
- Expected output
- **Sources** (traceable: memory bible, photography bible, knowledge graph, decision log, docs)

## Knowledge Graph integration

Graph node: `node-memory-bible`

Workflow map: **Institutional Memory** — Memory Bible → Naming · Decisions · Context Builder → AI Sessions

Connected nodes include Interactive Manual, Creative DNA, Smart Asset Registry, and Content Brain (writing rules).

## Interactive Manual integration

- Memory Bible appears in Knowledge Hub page guides and module walkthroughs
- Decision log entries can reference manual chapters
- **OPEN INTERACTIVE MANUAL** from Memory Bible header links to Knowledge Hub

## Permissions

- Admin-only — never expose on customer-facing Frontal Slayer pages
- Founder profile fields are internal
- Context packages exported manually by admin only

## Code layout

| Path | Role |
|------|------|
| `src/studio-os/memory-bible/types.ts` | Types for snapshot, decisions, naming, context packages |
| `src/studio-os/memory-bible/seedV1.ts` | Memory Bible v1.0 seed data |
| `src/studio-os/memory-bible/contextBuilder.ts` | `buildContextPackage()` |
| `src/hooks/useAdminStudioMemoryBibleState.ts` | localStorage persistence |
| `src/components/admin/studio/memory-bible/` | Admin UI |
| `src/services/studio/memoryBible/service.ts` | Phase 2 service stub |

Storage key: `adminStudioMemoryBible_v1` (`ADMIN_STUDIO_STORAGE_KEYS.memoryBible`)

## Versioning

- Current: **Memory Bible v1.0**
- Append version history entries when making significant changes
- Do not overwrite decision log entries without history

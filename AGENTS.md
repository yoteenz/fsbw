# Agent context (Build-a-Wig)

**At the start of every new chat:** Read `motherboard/README.md`, `motherboard/CORE.md`, `motherboard/CODEBASE.md`, and `motherboard/MEMORY.md` in order before answering or implementing. Do not skip this; use them as project context.

## "Add to motherboard" / "Load motherboard" / "Snapshot codebase to motherboard"

**If the user says any of these and you are unsure what they mean:** The **motherboard** exists in this repo. It is a **folder** (not a single file) at:

**`motherboard/`** (project root)

Do **not** say "there is no file or reference named motherboard" or ask the user to specify what to add or where the motherboard is. Do the following:

1. **Open and read** `motherboard/README.md` (in this repo).
2. For **"add to motherboard"**: also read `motherboard/ADDING.md`, then append one new entry to `motherboard/MEMORY.md` following the format and rules there; optionally add to `motherboard/CORE.md` only for new permanent design/stack facts. Do not create a new file named `MOTHERBOARD.md` at project root.
3. For **"load motherboard"**: read `motherboard/README.md`, `motherboard/CORE.md`, `motherboard/CODEBASE.md`, `motherboard/MEMORY.md` and use them as context.
4. For **"Snapshot codebase to motherboard"**: explore the repo and overwrite `motherboard/CODEBASE.md` with a structured summary of the current codebase (see `motherboard/README.md`).

The folder contains: `README.md`, `CORE.md`, `MEMORY.md`, `ADDING.md`, `CODEBASE.md`. Use only these existing files; do **not** create `MOTHERBOARD.md` or `Motherboard.md` at project root.

For full command details and protocol, see **`motherboard/README.md`**.

## Git sync after tasks; Vercel deploy on "deploy now"

- Work on **`master`** only. **Never create** `cursor/*`, `feature/*`, or side branches.
- **After completing a task:** `./scripts/agent-commit.sh --sync-only "message"` → one commit + push (Vercel skipped via `[sync-only]`).
- **When founder says "deploy now":** `./scripts/agent-commit.sh --deploy-now "message"` → push + Vercel build when account is active.
- **Auto-append `MEMORY.md` after completed tasks (default ON).**
- **`preview/mobile` was deleted** — do not recreate.
- Docs/MEMORY-only commits skip Vercel builds via **`scripts/vercel-should-build.sh`** (`vercel.json` → `ignoreCommand`).
- Full rule: **`.cursor/rules/one-deploy-per-task.mdc`**, **`motherboard/ADDING.md`**.

## Supabase production migrations

When you add a migration under `supabase/migrations/` that creates or alters **tables/schema required** for the shipped feature, **apply it to production automatically** in the same task via Supabase MCP **`apply_migration`** (`project_id`: `hyycomvcaqxxvyrfupes`), then verify with **`list_tables`**. Sync code with **`--sync-only`** after the task; say **"deploy now"** for Vercel. Full protocol: **`.cursor/rules/supabase-production-migrations.mdc`**.

## Cursor Cloud environment

- Cloud agents should use the repo environment hook in **`.cursor/environment.json`**, which runs **`./scripts/cloud-update.sh`** on startup.
- The install hook uses **`npm ci`** at repo root so local project binaries like **`tsc`** and **`vite`** are available before verification commands such as **`npm run build`**.
- Keep secrets in Cursor web environment settings, not in this repository.

### Mobile live preview (no Vercel)

Cloud agents auto-start two terminals from **`.cursor/environment.json`**:

1. **`vite`** — `npm run dev` on port **3001** (UI live; `/api` proxied to production).
2. **`preview-tunnel`** — **`./scripts/cloud-preview-tunnel.sh`** prints a mobile preview URL. With **`CLOUDFLARE_TUNNEL_TOKEN`** + **`CLOUDFLARE_TUNNEL_HOSTNAME`** secrets, uses a **persistent** hostname (see **`docs/cloud-agent/persistent-preview-tunnel.md`**). Otherwise prints a ephemeral **`https://….trycloudflare.com`** URL.

**Founder workflow:** open the **`preview-tunnel`** terminal (or read **`/tmp/cloud-preview-url.txt`**) and paste the URL on your phone. URL changes each agent session. Production Vercel deploy waits for **"deploy now"** (`--deploy-now`).

**Agent duty:** after starting work, share the mobile preview URL from the tunnel terminal in chat if the founder is on mobile.

## Spatial Architecture Review (Studio OS)

For **Studio OS product work** (new modules, admin pages, Genesis integration, navigation), read **`STUDIO_OS_BIBLE/SPATIAL_ARCHITECTURE_REVIEW.md`** and complete the review artifact **before** implementation code.

- **Skip** for P0 hotfixes, forensic/debugging sprints, and bug fixes with no new surfaces — unless the founder explicitly requests review.
- When skipping, state: **`Spatial Architecture Review: SKIPPED — [reason]`**
- See **`.cursor/rules/spatial-architecture-review.mdc`** for the full gate.

## ChatGPT handoff (Composer)

When the founder will sync context with external AI, end substantive responses with a **CONCLUSION** plain `text` code block as the **very last** element — full outcome summary for copy-paste. Canon: `StudioOS_ContextCapsule_v0.1/CHATGPT_OPERATING_MANUAL.md` §4.1 · `motherboard/CORE.md`.

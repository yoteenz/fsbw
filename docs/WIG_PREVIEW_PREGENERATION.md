# Wig preview pre-generation (NOIR first) — fal / Replicate + Supabase Storage

Offline batch: build a **manifest** of selection combos → run a **Node script** that calls **fal** or **Replicate** once per row and uploads **WebP** to **Supabase Storage** if missing.

**Paths in repo**

| Piece | Path |
|--------|------|
| Prompt template | `scripts/wig-preview/promptTemplate.mjs` — **Wig consult:** `WIG_CONSULT_STEP1_PROMPT` (3 refs), Steps 2–3. **BAW manual base (fal):** `BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS` (2 refs, logo in text). **BAW bulk:** `buildWigPreviewPrompt` (bottom) |
| NOIR manifest generator | `scripts/generate-noir-wig-preview-manifest.mjs` |
| Batch uploader | `scripts/pregenerate-wig-previews.mjs` |
| Example output | `scripts/wig-preview/manifests/noir-sanity-v1.json` (after you run generate) |

**Storage convention**

`wig-preview/{promptVersion}/{UNIT_KEY}/{selectionHash}.webp`

Example: `wig-preview/v1/NOIR/a1b2c3....webp`

Create a **public** (or signed-URL) bucket in Supabase for previews. The examples use **`wig-preview`**; if you named yours something else (e.g. **`live-preview`**), set **`STORAGE_BUCKET=live-preview`** when you run the batch script so uploads go to the right bucket.

---

## A) Phone-first: accounts, keys, bucket (Safari / Chrome on your phone)

1. **Supabase** (app or dashboard): open your project → **Storage** → **New bucket** → name **`wig-preview`** → note whether you use **public** read or signed URLs for the app.
2. **Project settings → API**: copy **`Project URL`** and **`service_role`** secret (batch script only — never ship service role to the client). Store them in your **password manager** as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. **fal** (https://fal.ai): sign in → billing → **API Keys** → create key → save as `FAL_KEY` in password manager.
4. **OR Replicate** (https://replicate.com): account → **API tokens** → create token → save as `REPLICATE_API_TOKEN`. Open **google/nano-banana-pro** → **API** tab → copy a **version** id (long hash) → save as `REPLICATE_MODEL_VERSION` (required for batch script).

5. On a **computer** later: paste the same env vars into a terminal or a `.env.wig-preview` file you **gitignore** (do not commit secrets).

---

## B) On your computer (after phone setup) — **Windows**

1. **Open the project folder** in File Explorer (the folder where your site code lives after `git clone` or download).
2. **Open a terminal in that folder:** click the address bar, type `powershell`, press Enter — *or* Shift+right-click empty space → “Open in Terminal” / “Open PowerShell window here.”*
3. **Check Node is installed:** in that window type `node -v` then Enter. If you see a version number (e.g. `v20.x`), you’re good. If not, install **Node.js LTS** from [https://nodejs.org](https://nodejs.org) using the Windows installer, then close and reopen the terminal.

Then run:

```bash
cd /path/to/fsbw
npm install
```

**1) Generate NOIR manifest** (default preset `sanity` — hundreds of rows, not full combinatorial):

```bash
npm run wig-preview:manifest:noir
# or: PRESET=medium|full PROMPT_VERSION=v1 node scripts/generate-noir-wig-preview-manifest.mjs
```

**2) Dry-run batch** (no API calls; checks paths):

```bash
DRY_RUN=1 node scripts/pregenerate-wig-previews.mjs scripts/wig-preview/manifests/noir-sanity-v1.json
```

**Windows PowerShell** (same thing — do **not** use `DRY_RUN=1` in front of the command):

```powershell
$env:DRY_RUN = "1"
$env:LIMIT = "3"
node scripts/pregenerate-wig-previews.mjs scripts/wig-preview/manifests/noir-sanity-v1.json
```

Clear dry run before a real batch: `Remove-Item Env:DRY_RUN -ErrorAction SilentlyContinue`

**3) Real batch with fal** (example):

```bash
export SUPABASE_URL="https://xxxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
export FAL_KEY="..."
export PROVIDER=fal
node scripts/pregenerate-wig-previews.mjs scripts/wig-preview/manifests/noir-sanity-v1.json
```

**4) Real batch with Replicate** (you must set version):

```bash
export REPLICATE_API_TOKEN="r8_..."
export REPLICATE_MODEL_VERSION="paste-version-hash-from-replicate-ui"
export PROVIDER=replicate
# same Supabase env as above
node scripts/pregenerate-wig-previews.mjs scripts/wig-preview/manifests/noir-sanity-v1.json
```

**Useful env knobs**

| Env | Meaning |
|-----|--------|
| `LIMIT=5` | Only first 5 rows (smoke test) |
| `SLEEP_MS=1200` | Pause between calls (rate limits) |
| `STORAGE_BUCKET` | Default `wig-preview` |

Re-runs **skip** objects that already exist (by attempting `download` on the path).

### If you see **`Forbidden`** on upload (Supabase)

That almost always means **Storage is blocking the write**, not fal.

1. **Bucket name** — In Supabase → **Storage**, the bucket must be named exactly what you set in **`STORAGE_BUCKET`** (e.g. **`live-preview`**). A typo = wrong bucket or no access.

2. **Policies (most common)** — Open bucket **`live-preview`** → **Policies**. For a quick test, add a policy that allows **`INSERT`** (and **`UPDATE`** if you use upsert) for the **`service_role`** path, or temporarily use the **Storage policy templates** (“Allow all for authenticated” won’t apply to service role the same way—use a policy that allows uploads for your use case). Easiest **dev** path: in **SQL Editor**, allow `service_role` full access to that bucket’s objects (Supabase docs: “Storage access policies”). Without any policy allowing insert, uploads return **403 Forbidden**.

3. **Wrong key** — **`SUPABASE_SERVICE_ROLE_KEY`** must be the **service_role** secret from **Project Settings → API**, not the **`anon`** key.

4. Re-run the batch after fixing policies; the script will log a longer error if upload still fails.

---

## C) Presets vs “everything”

- **`sanity`** — small grid for pipeline testing.
- **`medium`** — larger slice; adjust arrays in `scripts/generate-noir-wig-preview-manifest.mjs`.
- **`full`** — full Cartesian product of all lists in that file (**very large** — only when you intend it).

When you change prompt wording, bump **`PROMPT_VERSION`** (manifest + Storage path) so old images are not mixed with new ones.

---

## D) Wiring the live app (later)

Read-only: resolve `storagePath` from current selections (same hash algorithm as manifest), then `getPublicUrl` or signed URL. No generation on the hot path once the object exists.

---

## E) NBP on fal / Replicate

Both expose **Nano Banana Pro** style endpoints for server-side use (e.g. fal model id **`fal-ai/nano-banana-pro`** with `FAL_KEY`). Confirm **pricing and commercial terms** on the provider you bill under.

# Wig preview pre-generation (NOIR first) — fal / Replicate + Supabase Storage

Offline batch: build a **manifest** of selection combos → run a **Node script** that calls **fal** or **Replicate** once per row and uploads **WebP** to **Supabase Storage** if missing.

**Paths in repo**

| Piece | Path |
|--------|------|
| Prompt template | `scripts/wig-preview/promptTemplate.mjs` — **Wig consult:** `WIG_CONSULT_STEP1_PROMPT` (**1** ref), `WIG_CONSULT_STEP2_PROMPT(hex?, label?)` (defaults raspberry `#DA3063`), `wigConsultStep2ForCatalogColor('HONEY')` / `BAW_CATALOG_HAIR_COLOR_HEX`, `WIG_CONSULT_STEP3_PROMPT(from,to)` or `WIG_CONSULT_STEP3_PROMPT_STYLE_REFERENCE()`. **Chain helper:** `buildWigConsultChainEditPrompt` / `BAW_SELECTION_CHAIN_EDIT_PROMPT`. Legacy Step 1: `WIG_CONSULT_STEP1_PROMPT_THREE_ATTACHMENTS`. **BAW:** `BAW_SELECTION_COLOR_FROM_BASE_PROMPT`; base batch: `BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS`. **BAW bulk:** `buildWigPreviewPrompt` (bottom) |
| NOIR manifest generator | `scripts/generate-noir-wig-preview-manifest.mjs` |
| Batch uploader | `scripts/pregenerate-wig-previews.mjs` |
| BAW base images (NOIR / BLANCO / SOFT_WAVE) | `scripts/generate-baw-base-images.mjs` — `npm run wig-preview:baw-base` (needs `BAW_BACKDROP_IMAGE` path + fal + Supabase) |
| Example output | `scripts/wig-preview/manifests/noir-sanity-v1.json` (after you run generate) |
| Resolve upload path for one combo | `npm run wig-preview:resolve-path -- '<JSON>'` → `scripts/wig-preview/resolve-wig-preview-storage-path.mjs` |

**Storage convention**

`wig-preview/{promptVersion}/{UNIT_KEY}/{selectionHash}.webp`

Example: `wig-preview/v1/NOIR/a1b2c3....webp`

Create a **public** (or signed-URL) bucket in Supabase for previews. The examples use **`wig-preview`**; if you named yours something else (e.g. **`live-preview`**), set **`STORAGE_BUCKET=live-preview`** when you run the batch script so uploads go to the right bucket.

### Hand-made images (fal already done — avoid paying again)

The batch script **skips** a row if that **`storagePath`** already exists in the bucket (it tries `download` on the path). So you “add to the total” by **uploading your file to the exact same path** the manifest would use — no extra fal call.

1. **Match the naming convention:** `wig-preview/{PROMPT_VERSION}/NOIR/{32-char-hash}.webp` (same `PROMPT_VERSION` as your manifest, usually **`v1`**). Prefer **WebP**; if your file is PNG/JPEG, convert first so the path still ends in **`.webp`** or the app may not find it later.
2. **Get the exact path** for one combination (length, density, lace, texture, color, hairline, styling, add-ons must match the manifest **exactly**, including spelling like `OFF BLACK` vs `HONEY`):

```bash
npm run wig-preview:resolve-path -- '{"unitKey":"NOIR","length":"24\"","density":"200%","lace":"13X6","texture":"SILKY","color":"HONEY","hairline":"NATURAL","styling":"NONE","addOns":[]}'
```

Or open `scripts/wig-preview/manifests/noir-sanity-v1.json` (or your preset’s manifest) and search for the **`color`** / **`lace`** you care about — each row has **`storagePath`**.

3. **Upload in Supabase:** Dashboard → **Storage** → your bucket → **New folder** is optional; paste the full path as the object name (e.g. `wig-preview/v1/NOIR/f4b7d0e1....webp`) or create folders `wig-preview` → `v1` → `NOIR` and upload the file with the **hash** as the filename.

4. **Later batch run:** `pregenerate-wig-previews.mjs` will **not** regenerate that slot — you keep your hand-picked image.

**“Categorical” folders:** Categories are the **path segments** (`wig-preview` / `v1` / `NOIR` / hash). There is no separate database table in this repo yet — the **hash encodes** the full selection tuple.

### Live preview (Build-a-Wig → NOIR → Color) — admin only

On **NOIR** routes **`/build-a-wig/noir/edit/color`** and **`/build-a-wig/noir/customize/color`**, when you are signed in as an **admin** (same emails as `ADMIN_EMAILS` / `VITE_ADMIN_EMAILS`) **and** have a Supabase session, the color page calls **`POST /api/wig-preview/live-noir-color`**. The server:

1. Builds the same **manifest hash** from your current length/density/lace/texture/color/hairline/styling/add-ons.
2. For each angle (**left / front / right**), checks Storage under **`wig-preview-live/{PROMPT_VERSION}/NOIR/{hash}/{angle}.webp`**.
3. **Skips fal** if the file already exists; otherwise runs **fal `nano-banana-pro/edit`** (mannequin URL for that angle + logo URL) and **uploads** WebP.

**Vercel env (required for live feature):** `FAL_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `WIG_PREVIEW_STORAGE_BUCKET`, plus public **`WIG_PREVIEW_*_URL`** variables — see `.env.example`. Bucket must allow **public read** (or extend the API to return signed URLs). Function **`maxDuration`** is set to **120s** (up to ~3 fal calls).

**Manual fal (playground) — aspect ratio and resolution**

- **Wig consult** Step 1: **one** base image only; Step 2–3 as in `COPY-PASTE-PROMPTS.txt`. Step 1 often **9:16**; you can use **Auto + 2K** to match Step 2.
- **BAW base mannequin** (`BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS`): **Auto + 2K**, two refs (brick + backdrop). Script: `npm run wig-preview:baw-base` after setting **`BAW_BACKDROP_IMAGE`** to your white/rose backdrop file on disk.
- **Bulk text-to-image** (`pregenerate-wig-previews.mjs`): defaults **`FAL_ASPECT_RATIO=auto`** and **`FAL_RESOLUTION=2K`** (override in env if needed).

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

**2b) BAW base hero (NOIR / BLANCO / SOFT_WAVE)** — `fal-ai/nano-banana-pro/edit` + Supabase:

Put your **white/rose backdrop** image somewhere in the project (or an absolute path), then:

```bash
export FAL_KEY="..."
export SUPABASE_URL="https://xxxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
export STORAGE_BUCKET="live-preview"   # if you use that bucket
export BAW_BACKDROP_IMAGE="public/assets/your-white-rose-backdrop.png"
npm run wig-preview:baw-base
```

PowerShell:

```powershell
$env:FAL_KEY = "..."
$env:SUPABASE_URL = "https://xxxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."
$env:STORAGE_BUCKET = "live-preview"
$env:BAW_BACKDROP_IMAGE = "public/assets/your-white-rose-backdrop.png"
npm run wig-preview:baw-base
```

Outputs **`baw-base/{PROMPT_VERSION}/NOIR.webp`** (and `BLANCO.webp`, `SOFT_WAVE.webp`). `DRY_RUN=1` prints paths only. Override brick paths with `NOIR_BRICK_IMAGE`, `BLANCO_BRICK_IMAGE`, `SOFT_WAVE_BRICK_IMAGE` if defaults do not match your machine.

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
| `FAL_ASPECT_RATIO` / `FAL_RESOLUTION` | Bulk `pregenerate-wig-previews.mjs` fal text-to-image (defaults `auto` / `2K`) |
| `BAW_BACKDROP_IMAGE` | **Required** for `wig-preview:baw-base`: path to white/rose backdrop on disk |
| `UNITS` | `NOIR,BLANCO,SOFT_WAVE` (comma-separated) for baw-base script |
| `NOIR_BRICK_IMAGE` etc. | Override default brick mannequin path per unit |

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

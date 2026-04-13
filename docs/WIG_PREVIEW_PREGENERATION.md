# Wig preview pre-generation (NOIR first) — fal / Replicate + Supabase Storage

Offline batch: build a **manifest** of selection combos → run a **Node script** that calls **fal** or **Replicate** once per row and uploads **WebP** to **Supabase Storage** if missing.

**Paths in repo**

| Piece | Path |
|--------|------|
| Prompt template | `scripts/wig-preview/promptTemplate.mjs` |
| NOIR manifest generator | `scripts/generate-noir-wig-preview-manifest.mjs` |
| Batch uploader | `scripts/pregenerate-wig-previews.mjs` |
| Example output | `scripts/wig-preview/manifests/noir-sanity-v1.json` (after you run generate) |

**Storage convention**

`wig-preview/{promptVersion}/{UNIT_KEY}/{selectionHash}.webp`

Example: `wig-preview/v1/NOIR/a1b2c3....webp`

Create a **public** (or signed-URL) bucket named **`wig-preview`** in Supabase unless you override `STORAGE_BUCKET`.

---

## A) Phone-first: accounts, keys, bucket (Safari / Chrome on your phone)

1. **Supabase** (app or dashboard): open your project → **Storage** → **New bucket** → name **`wig-preview`** → note whether you use **public** read or signed URLs for the app.
2. **Project settings → API**: copy **`Project URL`** and **`service_role`** secret (batch script only — never ship service role to the client). Store them in your **password manager** as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. **fal** (https://fal.ai): sign in → billing → **API Keys** → create key → save as `FAL_KEY` in password manager.
4. **OR Replicate** (https://replicate.com): account → **API tokens** → create token → save as `REPLICATE_API_TOKEN`. Open **google/nano-banana-pro** → **API** tab → copy a **version** id (long hash) → save as `REPLICATE_MODEL_VERSION` (required for batch script).

5. On a **computer** later: paste the same env vars into a terminal or a `.env.wig-preview` file you **gitignore** (do not commit secrets).

---

## B) On your computer (after phone setup)

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

# Benchmark fixture acquisition (SITE 00 Build Object V2)

Fresh Cloud Agent pods **do not** ship with benchmark binaries. The reduced Under4MB review archive must be supplied each session (or via durable storage when available).

## Canonical archive identity

| Field | Value |
|-------|--------|
| Name | `SITE00_Build_Object_V2_Under4MB_*.zip` (reduced package; 17 files) |
| Expected SHA-256 | `82c98b0f5c4bac57372b91a13d6b59a7550ab73e03069189b68d88ec7e7c8ab2` |
| Full review package | `SITE00_Build_Object_V2_Review_Package.zip` — optional; required for `validate_v2.py` **full** pass (High GLB + FBX) |

## Acquisition paths (in order)

1. **Founder upload** — attach zip to Cloud Agent chat or place under agent uploads; copy to `benchmarks/site00-build-object-v2/incoming/` (immutable upload preserved).
2. **`WFE_REDUCED_PACKAGE_PATH`** — absolute path to the zip on the pod (optional env).
3. **`WFE_FULL_V2_PACKAGE_PATH`** — full review zip for intake only (see `incoming/README.md`).

## Preparation procedure

From repo root (after zip is on the pod):

```bash
npm run wfe:prepare-benchmark-fixture -- /path/to/SITE00_Build_Object_V2_Under4MB.zip
```

Or manually:

1. Verify: `sha256sum` matches canonical hash above; `unzip -t` passes.
2. Copy working copy → `src/studio-os-core/world-fabrication-engine/benchmarks/site00-build-object-v2/incoming/`.
3. Safe-extract → `benchmarks/site00-build-object-v2/fixture/` (use `safeExtractZip` in `artifact-intake.ts` — zip-slip protected).
4. Confirm required files:
   - `fixture/01_SOURCE/SITE00_Build_Object_V2.blend`
   - `fixture/05_DOCUMENTATION/module-manifest.json`
5. Run non-billable inventory check: `npm run wfe:verify-benchmark-fixture` (no Codex).

## Codex auth (fresh pods)

Non-billable once per pod:

```bash
printenv OPENAI_API_KEY | npx --yes @openai/codex@0.162.0 login --with-api-key
npx --yes @openai/codex@0.162.0 login status
```

Never commit `~/.codex/auth.json` or log secrets.

## Billable proof (founder authorization only)

```bash
npm run wfe:codex-fabrication-proof
```

## Policy

- Do **not** commit large binaries to git unless repository policy explicitly allows.
- Do **not** use placeholder or fabricated `.blend` files.
- **`validate_v2.py` on reduced fixture:** **PARTIAL** (missing High GLB) — do not report as full-package PASS.

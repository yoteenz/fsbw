# AI Context Capsule™ — Stable Distribution

Official distribution uses **one permanent URL** that never changes. Only the file behind it updates after each validated prebuild.

## Permanent endpoints

| URL | Purpose |
|-----|---------|
| `https://fsbw.vercel.app/context/latest` | **Primary download** — always newest validated capsule |
| `https://fsbw.vercel.app/context` | Public hub — version, validation, archive list |
| `https://fsbw.vercel.app/context/release.json` | Machine-readable release manifest |

Legacy alias (same underlying `latest.zip`):

| URL | Purpose |
|-----|---------|
| `/downloads/context-capsules/latest.zip` | Backward-compatible static path |

## Versioned archives

Historical capsules are preserved under:

```
/downloads/context-capsules/archive/StudioOS_ContextCapsule_vX.Y.Z.zip
```

The packaging script never deletes prior versioned ZIPs; it only adds or replaces the current version in the archive folder.

## Validation gate

Prebuild runs `scripts/package-ai-context-capsule-zip.mjs` which:

1. Validates all required documents, reading order, onboarding template, and version sync
2. Builds a versioned ZIP into `archive/`
3. Stages and verifies ZIP integrity (`unzip -t`)
4. Replaces `latest.zip` **only after** validation passes
5. Writes `release.json` to `public/downloads/context-capsules/` and `public/context/`

If validation fails, the script exits non-zero and **does not** replace `latest.zip`.

## Founder workflow

1. Open ChatGPT (or any AI)
2. Download `https://fsbw.vercel.app/context/latest`
3. Attach the ZIP
4. Paste the onboarding prompt from `/admin/studio/context-capsule`

No new link per release. Bookmark `/context/latest` once.

## Admin & packaging

| Resource | Path |
|----------|------|
| Admin export panel | `/admin/studio/context-capsule` |
| Source folder | `StudioOS_ContextCapsule_v0.1/` |
| Packaging script | `scripts/package-ai-context-capsule-zip.mjs` |
| Constants (src) | `src/studio-os-core/context-capsule-export/constants.ts` |
| Constants (API) | `api/_lib/contextCapsuleConstants.ts` |

```bash
npm run package:ai-context-capsule-zip
# or full prebuild:
npm run build
```

## Vercel routing

`vercel.json` rewrites `/context/latest` → `/downloads/context-capsules/latest.zip` with `Content-Disposition: attachment`. The `/context` hub is a React route in `StudioDebugRoutes.tsx`.

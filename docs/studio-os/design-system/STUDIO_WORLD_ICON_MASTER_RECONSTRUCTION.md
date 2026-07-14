# Studio World Icon Master Reconstruction (v3)

## Status

**v2 automated extraction: FROZEN** — no longer runs in `prebuild`.

**v3 deterministic crop manifest: ACTIVE** — canonical authority for all icon generation.

**Lockdown certification: REVOKED** until founder approves v3 contact sheet.

**Founder Optical Mode: PAUSED** until v3 source assets are approved.

## Canonical paths

| Asset | Path |
|-------|------|
| Labeled master (unchanged) | `src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png` |
| Crop manifest | `src/features/studio-world/icons/studio-world-icon-crop-manifest.ts` |
| v3 outputs (approved) | `src/assets/studio-world/experience-lab/icons/generated-v3/` |
| v3 previews (unapproved) | `src/assets/studio-world/experience-lab/icons/generated-v3/_preview-unapproved/` |

## Commands

```bash
npm run experience-lab:propose-crops
npm run experience-lab:build-icons
node scripts/apply-studio-world-icon-crop-patch.mjs patch.json
npm run experience-lab:build-icons-v2-frozen
```

## Admin routes

- QA: `/admin/studio/experience-lab-icon-qa`
- Crop editor: `/admin/studio/experience-lab-icon-crop-editor`

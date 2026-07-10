# AI Context Capsule™ — Release Downloads

**Purpose:** Single-file ZIP artifacts for external AI onboarding.

## Download locations

| Location | URL / path |
|----------|------------|
| **Admin UI** | `/admin/studio/context-capsule` → Export Context Capsule |
| **Production static** | `https://fsbw.vercel.app/downloads/context-capsules/StudioOS_ContextCapsule_v0.1.0.zip` |
| **Legacy static** | `/downloads/StudioOS_ContextCapsule_v0.1.0.zip` (prebuild copy) |
| **This folder** | `releases/downloads/context-capsules/` |

## Commands

```bash
npm run download:ai-context-capsule
```

Regenerates ZIP + `history.json` + `manifest.json` without modifying capsule markdown source files.

## Version history

See `context-capsules/history.json` — previous exports are retained (not deleted on new export).

# AI Context Capsule™ — Release Downloads

**Purpose:** Single-file ZIP artifacts for external AI onboarding (ChatGPT, Claude, Gemini).

## Current release

| Artifact | Version | Command to regenerate |
|----------|---------|------------------------|
| `StudioOS_ContextCapsule_v0.1.0.zip` | 0.1.0 | `npm run download:ai-context-capsule` |

## Download options

### Production (after Vercel deploy)

```
https://fsbw.vercel.app/downloads/StudioOS_ContextCapsule_v0.1.0.zip
```

Same path on your production domain: `/downloads/StudioOS_ContextCapsule_v{version}.zip`

### From this repository

Download `releases/downloads/StudioOS_ContextCapsule_v0.1.0.zip` from GitHub (Browse files → releases/downloads).

### Local generation

```bash
npm run download:ai-context-capsule
```

Creates/updates:

- `public/downloads/StudioOS_ContextCapsule_v{version}.zip` — served as static asset
- `releases/downloads/StudioOS_ContextCapsule_v{version}.zip` — repo release copy
- `manifest.json` in each folder — inventory + version metadata

## ZIP contents

The archive preserves the full capsule folder structure:

```
StudioOS_ContextCapsule_v0.1/
├── README_FIRST.md
├── MANIFEST.md
├── KNOWN_BLOCKERS.md
├── CURRENT_HANDOFF.md
├── … (all markdown documents)
```

## When to regenerate

- After any edit to `StudioOS_ContextCapsule_v*/` markdown files
- Before sharing with a new ChatGPT conversation
- Automatically on each production build (`prebuild` hook)

## Protocol

Manual v0.1 flat layout. Future automated exports will use `.studiocapsule` per `docs/ai-collaboration/AI_CONTEXT_CAPSULE_SPECIFICATION.md`.

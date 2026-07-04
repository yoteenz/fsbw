# Vision Engine™ — Studio OS Cinematic Presentation Platform

Vision Engine is a **core Studio OS engine** for generating immersive, cinematic presentation experiences for any workspace. It is **internal only** — not exposed in customer menus, navigation, footer, onboarding, or public routes.

## Architecture

```
Studio OS
├── Vision Engine™ (platform core — src/studio-os-core/vision-engine/)
├── Vision Engine Builder™ (admin — no-code presentation builder)
├── Vision Recorder™ (AI cinematographer — not a screen recorder)
├── Vision Share™ (secure interactive Vision Links)
├── Vision Analytics™ (presentation intelligence dashboard)
└── Vision AI™ (future — AI Presentation Director)
```

**Workspace adapters** register manifests with routes, stops, chapters, and branding. **Frontal Slayer** is the first workspace consumer (`src/workspaces/frontal-slayer/vision-engine/`).

## Vision Modes (11 templates)

- Creative Partner
- Investor
- Brand Story
- Product Showcase
- Product Launch
- Employee Onboarding
- Agency Presentation
- Press Tour
- Sales Demo
- Franchise Demo
- Self Guided

## Access

- **Admin:** `/admin/studio/vision-engine` — authenticated Studio OS roles only
- **Vision Share:** `/vision/:slug` — launches presentation from stored share link (not listed in public nav)
- **Runtime:** `VisionEngineProvider` in `App.tsx` — activates only when admin launches or valid Vision Share session

## Key paths

| Path | Purpose |
|------|---------|
| `src/studio-os-core/vision-engine/` | Types, store, session, mode catalog, launch |
| `src/components/vision-engine/runtime/` | Presentation UI (overlay, cinematics, hotspots) |
| `src/workspaces/frontal-slayer/vision-engine/` | FS manifest + tour script |
| `src/pages/admin/studio/vision-engine/` | Admin workspace |
| `src/pages/vision/` | Vision Share entry |

## Presentation layer

Active when `html[data-vision-engine="active"]`. Hides debug/editor chrome. Record mode: `data-vision-record="1"`.

## Vision Share (server-persisted)

Links live in **Supabase** (`vision_share_links`) and resolve via **`GET /api/vision/share?slug=`** — works on any device.

**Default production URLs** (after migration `20260704220000_vision_share_links`):

- `https://fsbw.vercel.app/vision/creative`
- `https://fsbw.vercel.app/vision/investor`
- `https://fsbw.vercel.app/vision/agency`

**Admin:** `/admin/studio/vision-engine` → Share tab · `POST /api/admin/vision-share`

Optional password on create. Stakeholders open the link — no admin login required.

## Deprecated

**Guided Tour** (Frontal Slayer-specific) is replaced by Vision Engine. Do not reintroduce public `?guidedTour=` URL bootstrap or bottom-right launcher.

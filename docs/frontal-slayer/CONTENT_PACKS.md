# Frontal Slayer Content Packs

A **Content Pack** (studio os vocabulary) is the complete production package created from one idea — episode, journal, email, social, thumbnails, products, SEO, and metadata.

## Location

- Demo seeds: `src/utils/adminStudioContentPacksDemo.ts`
- Workspace bridge: `src/workspaces/frontal-slayer/dataAdapter.ts` → `contentPacks`
- Admin UI: `/admin/studio/content-packs`
- Visual asset picker: Asset Director integration on pack detail

## Workflow

1. Create or edit pack in Content Packs module
2. Select approved visual assets (Asset Director picker)
3. Route through Production → Distribution Network

Workspace-scoped edits persist in localStorage under `studioOs_ws_frontal-slayer_adminStudioContentPacksEditable_v1`.

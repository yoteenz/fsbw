# Experience Lab Extracted Icon QA

Pipeline version: **experience-lab-icons-v2**

## Forensic audit — prior sprite corruption

The prior **CSS sprite atlas** pipeline (`build-experience-lab-icon-atlas.mjs`) caused visible corruption:

1. **Binary thresholding** — pixels were forced to fully opaque white or fully transparent, destroying anti-aliased edge pixels and thin line art.
2. **Uniform 96×96 atlas slots** — every icon was placed in a fixed slot but `ExperienceLabIcon` scaled using the full slot width (`coord.w = 96`) even when the glyph only occupied the center fraction, producing incorrect CSS `background-size` / `background-position` math.
3. **`image-rendering: crisp-edges`** — discouraged smooth downscaling on Retina displays.
4. **Shared label-band heuristic** — a single bottom-up label detector for all cells; when it mis-estimated `labelStart`, label strokes bled into glyph crops or trimmed valid glyph pixels.
5. **No per-icon optical normalization** — wide vs tall glyphs appeared at inconsistent visual sizes inside 12–32px UI targets.

**Repair (v2):** connected-component glyph/label classification · label-gap detection · per-icon overrides · text-contamination audit · individual 256×256 transparent PNGs · `<img>` rendering with registry `opticalScale`.

## Canonical labeled source (unchanged)

Path: `src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png`

Storage: `740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png`

SHA256: `d7476775716d3f2dc9b2416198c81bbd19d8e1a7f5730c5ff3c79fe6cda1f51d`

## Generated contact sheet

![Contact sheet](../../../src/assets/studio-world/experience-lab/icons/generated/_contact-sheet.png)

## Per-icon extraction results

| Semantic key | Source label | Row | Col | Audit | Confidence | Override | Bottom ratio | Preview |
|---|---|---:|---:|---|---:|---|---:|---|
| experienceLab | EXPERIENCE LAB | 0 | 0 | PASS | 0.92 | no | 0.00 | ![experienceLab](../../../src/assets/studio-world/experience-lab/icons/generated/experience-lab.png) |
| blueprint | BLUEPRINT | 0 | 1 | WARN | 1.00 | yes | 0.00 | ![blueprint](../../../src/assets/studio-world/experience-lab/icons/generated/blueprint.png) |
| construction | CONSTRUCTION | 0 | 2 | WARN | 1.00 | yes | 0.00 | ![construction](../../../src/assets/studio-world/experience-lab/icons/generated/construction.png) |
| materials | MATERIALS | 0 | 3 | WARN | 0.72 | yes | 0.00 | ![materials](../../../src/assets/studio-world/experience-lab/icons/generated/materials.png) |
| lighting | LIGHTING | 0 | 4 | WARN | 0.72 | yes | 0.00 | ![lighting](../../../src/assets/studio-world/experience-lab/icons/generated/lighting.png) |
| camera | CAMERA | 0 | 5 | WARN | 0.72 | yes | 0.00 | ![camera](../../../src/assets/studio-world/experience-lab/icons/generated/camera.png) |
| splitView | SPLIT VIEW | 0 | 6 | WARN | 1.00 | yes | 0.00 | ![splitView](../../../src/assets/studio-world/experience-lab/icons/generated/split-view.png) |
| founderRender | FOUNDER RENDER | 0 | 7 | WARN | 1.00 | yes | 0.00 | ![founderRender](../../../src/assets/studio-world/experience-lab/icons/generated/founder-render.png) |
| projects | PROJECTS | 1 | 0 | PASS | 1.00 | no | 0.00 | ![projects](../../../src/assets/studio-world/experience-lab/icons/generated/projects.png) |
| history | HISTORY | 1 | 1 | PASS | 1.00 | no | 0.00 | ![history](../../../src/assets/studio-world/experience-lab/icons/generated/history.png) |
| revisions | REVISIONS | 1 | 2 | PASS | 1.00 | no | 0.00 | ![revisions](../../../src/assets/studio-world/experience-lab/icons/generated/revisions.png) |
| milestones | MILESTONES | 1 | 3 | PASS | 0.92 | no | 0.00 | ![milestones](../../../src/assets/studio-world/experience-lab/icons/generated/milestones.png) |
| analytics | ANALYTICS | 1 | 4 | WARN | 1.00 | yes | 0.00 | ![analytics](../../../src/assets/studio-world/experience-lab/icons/generated/analytics.png) |
| performance | PERFORMANCE | 1 | 5 | WARN | 1.00 | yes | 0.00 | ![performance](../../../src/assets/studio-world/experience-lab/icons/generated/performance.png) |
| issues | ISSUES | 1 | 6 | PASS | 1.00 | no | 0.00 | ![issues](../../../src/assets/studio-world/experience-lab/icons/generated/issues.png) |
| approved | APPROVED | 1 | 7 | PASS | 1.00 | no | 0.00 | ![approved](../../../src/assets/studio-world/experience-lab/icons/generated/approved.png) |
| playback | PLAYBACK | 2 | 0 | WARN | 1.00 | yes | 0.00 | ![playback](../../../src/assets/studio-world/experience-lab/icons/generated/playback.png) |
| pause | PAUSE | 2 | 1 | PASS | 1.00 | no | 0.00 | ![pause](../../../src/assets/studio-world/experience-lab/icons/generated/pause.png) |
| stop | STOP | 2 | 2 | PASS | 1.00 | no | 0.00 | ![stop](../../../src/assets/studio-world/experience-lab/icons/generated/stop.png) |
| next | NEXT | 2 | 3 | PASS | 1.00 | no | 0.00 | ![next](../../../src/assets/studio-world/experience-lab/icons/generated/next.png) |
| previous | PREVIOUS | 2 | 4 | PASS | 1.00 | no | 0.00 | ![previous](../../../src/assets/studio-world/experience-lab/icons/generated/previous.png) |
| loop | LOOP | 2 | 5 | PASS | 1.00 | no | 0.00 | ![loop](../../../src/assets/studio-world/experience-lab/icons/generated/loop.png) |
| capture | CAPTURE | 2 | 6 | PASS | 1.00 | no | 0.00 | ![capture](../../../src/assets/studio-world/experience-lab/icons/generated/capture.png) |
| fullscreen | FULLSCREEN | 2 | 7 | PASS | 1.00 | no | 0.00 | ![fullscreen](../../../src/assets/studio-world/experience-lab/icons/generated/fullscreen.png) |
| zoomIn | ZOOM IN | 3 | 0 | WARN | 1.00 | yes | 0.00 | ![zoomIn](../../../src/assets/studio-world/experience-lab/icons/generated/zoom-in.png) |
| zoomOut | ZOOM OUT | 3 | 1 | PASS | 1.00 | no | 0.00 | ![zoomOut](../../../src/assets/studio-world/experience-lab/icons/generated/zoom-out.png) |
| pan | PAN | 3 | 2 | WARN | 1.00 | no | 0.22 | ![pan](../../../src/assets/studio-world/experience-lab/icons/generated/pan.png) |
| fitView | FIT VIEW | 3 | 3 | PASS | 0.92 | no | 0.00 | ![fitView](../../../src/assets/studio-world/experience-lab/icons/generated/fit-view.png) |
| orbit | ORBIT | 3 | 4 | WARN | 1.00 | yes | 0.00 | ![orbit](../../../src/assets/studio-world/experience-lab/icons/generated/orbit.png) |
| perspective | PERSPECTIVE | 3 | 5 | WARN | 0.72 | yes | 0.00 | ![perspective](../../../src/assets/studio-world/experience-lab/icons/generated/perspective.png) |
| toggleUi | TOGGLE UI | 3 | 6 | PASS | 1.00 | no | 0.00 | ![toggleUi](../../../src/assets/studio-world/experience-lab/icons/generated/toggle-ui.png) |
| grid | GRID | 3 | 7 | PASS | 1.00 | no | 0.00 | ![grid](../../../src/assets/studio-world/experience-lab/icons/generated/grid.png) |
| hide | HIDE | 4 | 0 | PASS | 0.92 | no | 0.00 | ![hide](../../../src/assets/studio-world/experience-lab/icons/generated/hide.png) |
| lock | LOCK | 4 | 1 | PASS | 1.00 | no | 0.08 | ![lock](../../../src/assets/studio-world/experience-lab/icons/generated/lock.png) |
| unlock | UNLOCK | 4 | 2 | WARN | 1.00 | no | 0.29 | ![unlock](../../../src/assets/studio-world/experience-lab/icons/generated/unlock.png) |
| duplicate | DUPLICATE | 4 | 3 | PASS | 0.92 | no | 0.00 | ![duplicate](../../../src/assets/studio-world/experience-lab/icons/generated/duplicate.png) |
| delete | DELETE | 4 | 4 | WARN | 0.92 | no | 0.21 | ![delete](../../../src/assets/studio-world/experience-lab/icons/generated/delete.png) |
| edit | EDIT | 4 | 5 | PASS | 1.00 | no | 0.14 | ![edit](../../../src/assets/studio-world/experience-lab/icons/generated/edit.png) |
| settings | SETTINGS | 4 | 6 | PASS | 0.92 | no | 0.00 | ![settings](../../../src/assets/studio-world/experience-lab/icons/generated/settings.png) |
| filter | FILTER | 4 | 7 | PASS | 1.00 | no | 0.14 | ![filter](../../../src/assets/studio-world/experience-lab/icons/generated/filter.png) |
| export | EXPORT | 5 | 0 | WARN | 0.92 | no | 0.27 | ![export](../../../src/assets/studio-world/experience-lab/icons/generated/export.png) |
| import | IMPORT | 5 | 1 | PASS | 1.00 | no | 0.06 | ![import](../../../src/assets/studio-world/experience-lab/icons/generated/import.png) |
| cloudSync | CLOUD SYNC | 5 | 2 | PASS | 0.92 | no | 0.00 | ![cloudSync](../../../src/assets/studio-world/experience-lab/icons/generated/cloud-sync.png) |
| database | DATABASE | 5 | 3 | PASS | 0.92 | no | 0.00 | ![database](../../../src/assets/studio-world/experience-lab/icons/generated/database.png) |
| link | LINK | 5 | 4 | PASS | 1.00 | no | 0.11 | ![link](../../../src/assets/studio-world/experience-lab/icons/generated/link.png) |
| share | SHARE | 5 | 5 | WARN | 1.00 | yes | 0.00 | ![share](../../../src/assets/studio-world/experience-lab/icons/generated/share.png) |
| users | USERS | 5 | 6 | PASS | 0.92 | no | 0.04 | ![users](../../../src/assets/studio-world/experience-lab/icons/generated/users.png) |
| team | TEAM | 5 | 7 | WARN | 1.00 | yes | 0.00 | ![team](../../../src/assets/studio-world/experience-lab/icons/generated/team.png) |
| notifications | NOTIFICATIONS | 6 | 0 | PASS | 1.00 | no | 0.10 | ![notifications](../../../src/assets/studio-world/experience-lab/icons/generated/notifications.png) |
| comments | COMMENTS | 6 | 1 | PASS | 1.00 | no | 0.03 | ![comments](../../../src/assets/studio-world/experience-lab/icons/generated/comments.png) |
| notes | NOTES | 6 | 2 | PASS | 0.92 | no | 0.08 | ![notes](../../../src/assets/studio-world/experience-lab/icons/generated/notes.png) |
| attachments | ATTACHMENTS | 6 | 3 | WARN | 1.00 | yes | 0.00 | ![attachments](../../../src/assets/studio-world/experience-lab/icons/generated/attachments.png) |
| schedule | SCHEDULE | 6 | 4 | PASS | 0.92 | no | 0.05 | ![schedule](../../../src/assets/studio-world/experience-lab/icons/generated/schedule.png) |
| timeTracking | TIME TRACKING | 6 | 5 | PASS | 1.00 | no | 0.13 | ![timeTracking](../../../src/assets/studio-world/experience-lab/icons/generated/time-tracking.png) |
| flag | FLAG | 6 | 6 | PASS | 1.00 | no | 0.04 | ![flag](../../../src/assets/studio-world/experience-lab/icons/generated/flag.png) |
| favorite | FAVORITE | 6 | 7 | PASS | 1.00 | no | 0.11 | ![favorite](../../../src/assets/studio-world/experience-lab/icons/generated/favorite.png) |
| dashboard | DASHBOARD | 7 | 0 | WARN | 1.00 | yes | 0.00 | ![dashboard](../../../src/assets/studio-world/experience-lab/icons/generated/dashboard.png) |
| focusMode | FOCUS MODE | 7 | 1 | PASS | 1.00 | no | 0.02 | ![focusMode](../../../src/assets/studio-world/experience-lab/icons/generated/focus-mode.png) |
| terminal | TERMINAL | 7 | 2 | WARN | 0.72 | yes | 0.00 | ![terminal](../../../src/assets/studio-world/experience-lab/icons/generated/terminal.png) |
| diagnostics | DIAGNOSTICS | 7 | 3 | WARN | 1.00 | yes | 0.00 | ![diagnostics](../../../src/assets/studio-world/experience-lab/icons/generated/diagnostics.png) |
| security | SECURITY | 7 | 4 | PASS | 1.00 | no | 0.09 | ![security](../../../src/assets/studio-world/experience-lab/icons/generated/security.png) |
| permissions | PERMISSIONS | 7 | 5 | WARN | 1.00 | yes | 0.00 | ![permissions](../../../src/assets/studio-world/experience-lab/icons/generated/permissions.png) |
| help | HELP | 7 | 6 | PASS | 1.00 | no | 0.08 | ![help](../../../src/assets/studio-world/experience-lab/icons/generated/help.png) |
| about | ABOUT | 7 | 7 | PASS | 1.00 | no | 0.09 | ![about](../../../src/assets/studio-world/experience-lab/icons/generated/about.png) |

## Dev QA route

Compare runtime icons at `/admin/studio/experience-lab-icon-qa` (admin only).

## Regenerate

```bash
npm run experience-lab:build-icons
```

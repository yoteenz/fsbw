# Experience Lab Icon Catalog

Founder labeled source storage path: `live-preview/Studio World/740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png`

Resolve at runtime via `resolveExperienceLabIconSourceLabeledUrl()` (prefixes `VITE_SUPABASE_URL`).

Canonical repo copy (labels preserved, **read-only extraction input**):

![Experience Lab labeled icon source](../../../src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png)

Generated contact sheet (64 extracted transparent glyphs):

![Experience Lab extracted contact sheet](../../../src/assets/studio-world/experience-lab/icons/generated/_contact-sheet.png)

Measured grid: **1402×1122** · 8×8 · per-icon **256×256** transparent PNG outputs

Forensic QA: [`EXPERIENCE_LAB_EXTRACTED_ICON_QA.md`](./EXPERIENCE_LAB_EXTRACTED_ICON_QA.md)

Admin QA route: `/admin/studio/experience-lab-icon-qa`

## Semantic map

| Semantic key | Source label | Row | Col | Intended use | Accessible label | Status |
|---|---|---:|---:|---|---|---|
| experienceLab | EXPERIENCE LAB | 0 | 0 | Experience Lab identity · architectural workbench | Experience Lab | extracted |
| blueprint | BLUEPRINT | 0 | 1 | StudioViewport Blueprint mode | Blueprint | extracted |
| construction | CONSTRUCTION | 0 | 2 | Construction Plan inspector · viewport mode | Construction | extracted |
| materials | MATERIALS | 0 | 3 | Material Library · materials viewport mode | Materials | extracted |
| lighting | LIGHTING | 0 | 4 | Lighting Studio · lighting viewport mode | Lighting | extracted |
| camera | CAMERA | 0 | 5 | Camera Studio · camera viewport mode | Camera | extracted |
| splitView | SPLIT VIEW | 0 | 6 | Split viewport mode | Split view | extracted |
| founderRender | FOUNDER RENDER | 0 | 7 | Founder Render viewport mode | Founder render | extracted |
| projects | PROJECTS | 1 | 0 | Project browser | Projects | extracted |
| history | HISTORY | 1 | 1 | Founder review history | History | extracted |
| revisions | REVISIONS | 1 | 2 | Founder review revisions | Revisions | extracted |
| milestones | MILESTONES | 1 | 3 | Milestone tracker | Milestones | extracted |
| analytics | ANALYTICS | 1 | 4 | Analytics · budget forecast workbench | Analytics | extracted |
| performance | PERFORMANCE | 1 | 5 | Performance diagnostics | Performance | extracted |
| issues | ISSUES | 1 | 6 | Inspector issues panel | Issues | extracted |
| approved | APPROVED | 1 | 7 | Approval status · inspector approved state | Approved | extracted |
| playback | PLAYBACK | 2 | 0 | Founder review playback | Play | extracted |
| pause | PAUSE | 2 | 1 | Founder review pause | Pause | extracted |
| stop | STOP | 2 | 2 | Stop playback | Stop | extracted |
| next | NEXT | 2 | 3 | Next revision step | Next | extracted |
| previous | PREVIOUS | 2 | 4 | Previous revision step | Previous | extracted |
| loop | LOOP | 2 | 5 | Loop playback | Loop | extracted |
| capture | CAPTURE | 2 | 6 | Capture viewport frame | Capture | extracted |
| fullscreen | FULLSCREEN | 2 | 7 | Viewport fullscreen toggle | Fullscreen | extracted |
| zoomIn | ZOOM IN | 3 | 0 | Viewport zoom in | Zoom in | extracted |
| zoomOut | ZOOM OUT | 3 | 1 | Viewport zoom out | Zoom out | extracted |
| pan | PAN | 3 | 2 | Viewport pan tool | Pan | extracted |
| fitView | FIT VIEW | 3 | 3 | Fit viewport to content | Fit view | extracted |
| orbit | ORBIT | 3 | 4 | Orbit camera control | Orbit | extracted |
| perspective | PERSPECTIVE | 3 | 5 | Composition studio perspective | Perspective | extracted |
| toggleUi | TOGGLE UI | 3 | 6 | Toggle viewport UI chrome | Toggle UI | extracted |
| grid | GRID | 3 | 7 | Viewport grid overlay | Grid | extracted |
| hide | HIDE | 4 | 0 | Inspector hide layer | Hide | extracted |
| lock | LOCK | 4 | 1 | Inspector lock control | Lock | extracted |
| unlock | UNLOCK | 4 | 2 | Inspector unlock control | Unlock | extracted |
| duplicate | DUPLICATE | 4 | 3 | Duplicate artifact | Duplicate | extracted |
| delete | DELETE | 4 | 4 | Delete artifact | Delete | extracted |
| edit | EDIT | 4 | 5 | Inspector edit mode | Edit | extracted |
| settings | SETTINGS | 4 | 6 | Inspector settings | Settings | extracted |
| filter | FILTER | 4 | 7 | Inspector filter | Filter | extracted |
| export | EXPORT | 5 | 0 | Export artifact | Export | extracted |
| import | IMPORT | 5 | 1 | Import asset | Import | extracted |
| cloudSync | CLOUD SYNC | 5 | 2 | Cloud sync diagnostics | Cloud sync | extracted |
| database | DATABASE | 5 | 3 | Database diagnostics | Database | extracted |
| link | LINK | 5 | 4 | Copy link | Link | extracted |
| share | SHARE | 5 | 5 | Share artifact | Share | extracted |
| users | USERS | 5 | 6 | User profile · founder identity | User | extracted |
| team | TEAM | 5 | 7 | Workforce center | Team | extracted |
| notifications | NOTIFICATIONS | 6 | 0 | Command Dock alerts | Notifications | extracted |
| comments | COMMENTS | 6 | 1 | Founder review comments | Comments | extracted |
| notes | NOTES | 6 | 2 | Founder review notes | Notes | extracted |
| attachments | ATTACHMENTS | 6 | 3 | Founder review attachments · asset reference | Attachments | extracted |
| schedule | SCHEDULE | 6 | 4 | Schedule planner | Schedule | extracted |
| timeTracking | TIME TRACKING | 6 | 5 | Time tracking | Time tracking | extracted |
| flag | FLAG | 6 | 6 | Flag for review | Flag | extracted |
| favorite | FAVORITE | 6 | 7 | Favorite artifact | Favorite | extracted |
| dashboard | DASHBOARD | 7 | 0 | Workbench dashboard navigation | Dashboard | extracted |
| focusMode | FOCUS MODE | 7 | 1 | Viewport focus mode | Focus mode | extracted |
| terminal | TERMINAL | 7 | 2 | Diagnostics terminal | Terminal | extracted |
| diagnostics | DIAGNOSTICS | 7 | 3 | Diagnostics drawer | Diagnostics | extracted |
| security | SECURITY | 7 | 4 | Security diagnostics | Security | extracted |
| permissions | PERMISSIONS | 7 | 5 | Permit center · permissions | Permissions | extracted |
| help | HELP | 7 | 6 | Help panel | Help | extracted |
| about | ABOUT | 7 | 7 | About Experience Lab | About | extracted |

## Usage

```tsx
<ExperienceLabIcon name="blueprint" size="md" label="Blueprint" />
```

Regenerate extracted icons after replacing the labeled source:

```bash
npm run experience-lab:build-icons
```

Implementation: `scripts/extract-experience-lab-icons.mjs` · outputs `src/assets/studio-world/experience-lab/icons/generated/*.png`

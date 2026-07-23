# Studio World — Visual Identity Boundary

Document what Studio World **inherits** vs **owns** visually. **No new Studio identity created in this audit.**

---

## Colors

| Element | Classification | Evidence |
| --- | --- | --- |
| `ADMIN_STUDIO_THEME.accent` `#EB1C24` | **Temporary FS inheritance** | `src/utils/adminStudioTheme.ts` — FS signature red |
| Black/gray studio admin text | **Generic reusable UI** | Theme tokens |
| Genesis seeds primary `#EB1C24` for `frontal-slayer` brand | **FS tenant demo data inside SW core** | `experience-engine/bootstrap/seed-data.ts` |
| TV Lounge / dark stages | **Intentional Studio** (module exception) | Docs + modules |

---

## Typography

| Element | Classification | Evidence |
| --- | --- | --- |
| `STUDIO_OS_UPPERCASE_CLASS` | **Intentional Studio chrome** | `adminStudioTheme.ts` — uppercase in `/admin/studio` |
| Futura-forward FS brand (customer) | **FS-owned** | Visual language / product — may leak via shared CSS |
| Root font stack in global CSS | **Shared infrastructure** | Host `index.css` |

---

## Logos & wordmarks

| Element | Classification |
| --- | --- |
| Frontal Slayer customer logos | **FS-owned** |
| Studio World™ naming in docs/UI copy | **Intentional Studio** |
| “THE STUDIO admin modules” comment | **Mixed naming** — Studio product on FS host |

---

## Icons

| Element | Classification | Evidence |
| --- | --- | --- |
| `src/features/studio-world/icons/` | **Intentional Studio** | |
| Studio World hero icons (`studio-world-hero-icons/`) | **Intentional Studio** | |
| Shared UI icon set (if from host) | **Shared infrastructure** | Not fully traced |

---

## UI primitives & layout

| Element | Classification | Evidence |
| --- | --- | --- |
| `AdminStudioLayout`, immersion shell, orb | **Intentional Studio** | |
| Glass/marble language in generation prompts | **Intentional Studio** (spatial DNA) | `studio-os-server.bundle.js` prefixes |
| FS customer glass/marble components | **FS-owned** | Not required for Studio HQ but same repo CSS possible |
| `AdminStudioModulePageShell`, cards | **Intentional Studio** patterns | |

---

## Environment assets

| Element | Classification |
| --- | --- |
| `public/studio-os/` world graph | **Intentional Studio** |
| SET-001 / FS flagship docs | **FS-owned** — separate from Studio World product identity |
| Marble assets in customer `public/` | **FS-owned** — **unclear** if Studio pages reference |

---

## Imagery & animation

| Element | Classification |
| --- | --- |
| Studio orb animations/sounds | **Intentional Studio** |
| Campus transitions | **Intentional Studio** |
| FS campaign imagery | **FS-owned** |

---

## Tone & copy

| Element | Classification |
| --- | --- |
| Uppercase operational UI in studio routes | **Intentional Studio** |
| FS North Star / Guest language in customer app | **FS-owned** |
| Studio OS constitutional copy in docs | **Intentional Studio** |

---

## Component styling

| Element | Classification |
| --- | --- |
| `ADMIN_STUDIO_THEME` panels/chips | **Studio admin theme** with **FS red** |
| Tailwind config shared | **Shared infrastructure** |

---

## Design tokens

| Element | Classification |
| --- | --- |
| Dedicated Studio token file separate from FS | **Missing** — single theme object |
| `docs/studio-os/design-system/` | **Intentional Studio** documentation |
| FS `docs/frontal-slayer/design-dna-canon` | **FS-owned** — referenced in Studio modules (design-dna-canon module) |

---

## Summary

| Category | Dominant state |
| --- | --- |
| Studio spatial/product chrome | **Intentional Studio** |
| Accent red / some seeds | **Temporary FS inheritance** |
| Global build/CSS | **Shared infrastructure** |
| FS flagship visual canon | **FS-owned** — must not be conflated with Studio World product identity long-term |

Ownership unclear items require Founder decision: whether Studio World keeps FS red or adopts independent palette at separation.

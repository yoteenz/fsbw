# Studio World — Assets Inventory

---

## Static / public

| Location | Contents |
| --- | --- |
| `public/studio-os/` | World graph JSON, master-spec manifest bundle |
| `public/` (select) | Capsule download artifacts if published |

---

## Source assets (`src/assets/studio-world/`)

| Type | Notes |
| --- | --- |
| Experience Lab icons | Used by lab v2/v3 |
| Generated parity JSON | Referenced from docs (`STUDIO_WORLD_ICON_RUNTIME_PARITY.md`) |

---

## Generated / build artifacts

| Artifact | Path |
| --- | --- |
| Manifest bundle (generated) | `src/studio-os-core/manifest-reconciliation/generated/manifest-bundle.json` |
| Icon runtime parity | `src/features/studio-world/icons/studio-world-icon-runtime-parity.generated.json` |
| Studio OS server bundle | `api/_lib/creativeProduction/studio-os-server.bundle.js` |
| Studio DNA capsule build manifest | `api/_lib/studio-dna-capsule-build-manifest.json` |

---

## Supabase storage (runtime)

| Bucket | Use |
| --- | --- |
| **`live-preview`** | AI-generated previews from Studio builder/foundry pipeline |

Asset registry stores **metadata + URLs**; binary in storage.

---

## Documents & templates (repo)

| Location | Role |
| --- | --- |
| `docs/studio-os/` | Specs, SDK (~1311 files) |
| `docs/studio-world/` | Atlas, manifesto, departments |
| `docs/studio-institute/` | Vault, expert capture |
| `STUDIO_OS_BIBLE/` | Spatial canon |
| `genesis/` (root) | README trees |
| `onboarding-pack/`, capsules | Template packs for export |
| `StudioOS_StudioDNACapsule_v1.0/studio-dna-capsule.json` | DNA JSON |

---

## UI media (components)

| System | Assets |
| --- | --- |
| Studio World hero icons | `studio-world-hero-icons/` (Sculptures, types) |
| World atlas theme | `world-atlas/studioWorldAtlasTheme.ts` |
| Production studio themes | `*Theme.ts` files across departments |
| Studio orb sounds | `studio-orb/studioOrbSounds.ts` |

No centralized Studio media DAM outside **asset registry** + storage URLs.

---

## Videos

No dedicated Studio World video library path identified in audit; TV/production modules may reference external URLs in UI demo data (not catalogued file-by-file).

---

## Icons

| System | Path |
| --- | --- |
| Icon builder/grid calibration routes | Admin pages for icon QA |
| `features/studio-world/icons/` | Runtime icon set |

---

## Templates

| Type | Source |
| --- | --- |
| Department templates | DB `studio_department_templates` |
| Industry packs | DB `studio_industry_packs` |
| Blueprint/composition | DB composition + blueprint tables |
| Prompt templates | Prompt library/registry modules |

---

## Frontal Slayer assets

Customer `brand-bible/`, product images, mansion art **not** Studio World assets unless copied into workspace generation inputs (operational, not separate inventory here).

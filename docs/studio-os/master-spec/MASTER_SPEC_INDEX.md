# Studio OS Master Specification — Index

**Single source of truth for the entire platform.**

| Property | Value |
|----------|-------|
| Version | 1.0.0 |
| Location | `docs/studio-os/master-spec/` |
| Compiled bundle | `public/studio-os/master-spec/manifest-bundle.json` |
| Sprint | S1 — Master Roadmap Import & Registry Hardening |

## Manifest files

| File | Contents |
|------|----------|
| `constitution.yaml` | Volume 0 principles |
| `volumes.yaml` | Volumes 0–XIX containers |
| `chapters/volume-i.yaml` | Volume I chapter structure (8 chapters) |
| `chapters/volume-ii.yaml` | Volume II chapter structure (9 chapters) |
| `milestones/*.yaml` | All canonical milestones (M73.5–M276) |
| `design-revisions.yaml` | DR-001–DR-005 merge overlays |
| `milestone-aliases.yaml` | Canonical ↔ shipped ID reconciliation |
| `dependency-graph.yaml` | Hard dependencies and import order |
| `MASTER_SPEC_RECONCILIATION.md` | Auto-generated coverage report |

## Architectural decisions (approved)

1. **Manifest in docs/** — specification independent of application code
2. **Shipped badges in UX** — canonical IDs only in engineering surfaces
3. **Unified search** — planned milestones labeled Planned / In Progress / Complete / Deprecated
4. **Volume I registered** — 8 chapters, 25 milestones (M73.5–M89.4)
5. **Volume II registered** — 9 chapters, 39 milestones (M90–M127)
6. **Executive Strategy Floor™ (DR-005)** — planned meta-headquarters; registration only

## Compile

```bash
node scripts/compile-master-spec.mjs
```

Runs automatically before `npm run build` via `prebuild`.

## Consumers (single source — no duplicate definitions)

- Studio OS Knowledge Registry™ (formerly Documentation Registry™)
- System Registry™
- Manifest Authoring™
- Manifest Reconciliation™
- Global search · Studio Intelligence™ · Documentation Governance™
- Engineering Dashboard™ · Roadmap™ · QA views

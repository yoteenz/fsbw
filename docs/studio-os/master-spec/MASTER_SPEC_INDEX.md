# Studio OS Master Specification — Index

**Single source of truth for the entire platform.**

| Property | Value |
|----------|-------|
| Version | 1.0.0 |
| Location | `docs/studio-os/master-spec/` |
| Compiled bundle | `public/studio-os/master-spec/manifest-bundle.json` |
| Sprint | S3 — Architecture Audit · Foundation Hardening |

## Manifest files

| File | Contents |
|------|----------|
| `constitution.yaml` | Volume 0 principles |
| `volumes.yaml` | Volumes 0–XIX containers |
| `chapters/volume-i.yaml` | Volume I chapter structure (8 chapters) |
| `chapters/volume-ii.yaml` | Volume II chapter structure (9 chapters) |
| `milestones/*.yaml` | Per-volume milestone manifests (I, II, IV, X, XI, XIV, V, VI–XIX) |
| `milestone-aliases.yaml` | Canonical ↔ shipped ID reconciliation |
| `design-revisions.yaml` | DR-001–DR-005 merge overlays |
| `dependency-graph.yaml` | Hard dependencies and import order |
| `ARCHITECTURE_VALIDATION_REPORT.md` | Architecture Validator™ gate report (auto-generated) |
| `MASTER_SPEC_RECONCILIATION.md` | Auto-generated coverage report |

## Architectural decisions (approved)

1. **Manifest in docs/** — specification independent of application code
2. **Shipped badges in UX** — canonical IDs only in engineering surfaces
3. **Unified search** — planned milestones labeled Planned / In Progress / Complete / Deprecated
4. **Volume I registered** — 8 chapters, 25 milestones (M73.5–M89.4)
5. **Volume II registered** — 9 chapters, 39 milestones (M90–M127)
6. **Executive Strategy Floor™ (DR-005)** — planned meta-headquarters; registration only
7. **Per-volume milestone manifests** — `volume-iv.yaml`, `volume-x.yaml`, `volume-xi.yaml`, `volume-xiv.yaml` (overflow file retired)
8. **Architecture Validator™** — compile-time gatekeeper; errors block build
9. **QA chain canonical IDs** — `M159-spec-qa` … `M162-spec-qa` unified across manifest, aliases, graph
10. **One Knowledge Registry™** — governance and legacy documentation-registry paths delegate to knowledge-registry

## Compile

```bash
node scripts/compile-master-spec.mjs
```

Runs **Architecture Validator™** then writes bundle. Errors block compilation; warnings are reported in `ARCHITECTURE_VALIDATION_REPORT.md`.

Runs automatically before `npm run build` via `prebuild`.

## Consumers (single source — no duplicate definitions)

- Studio OS Knowledge Registry™ (formerly Documentation Registry™)
- System Registry™
- Manifest Authoring™
- Manifest Reconciliation™
- Global search · Studio Intelligence™ · Documentation Governance™
- Engineering Dashboard™ · Roadmap™ · QA views

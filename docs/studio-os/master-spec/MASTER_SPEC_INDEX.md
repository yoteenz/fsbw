# Studio OS Master Specification — Index

**Single source of truth for the entire platform.**

| Property | Value |
|----------|-------|
| Version | 1.0.0 |
| Location | `docs/studio-os/master-spec/` |
| Compiled bundle | `public/studio-os/master-spec/manifest-bundle.json` |
| Sprint | S5 — Volume III/IV completion + M126 closure + Platform Readiness Review |

## Manifest files

| File | Contents |
|------|----------|
| `constitution.yaml` | Volume 0 principles |
| `core-philosophies.yaml` | Core Studio OS Philosophy — 16 design principles |
| `volumes.yaml` | Volumes 0–XIX containers |
| `chapters/volume-i.yaml` | Volume I chapter structure (8 chapters) |
| `chapters/volume-ii.yaml` | Volume II chapter structure (9 chapters) |
| `chapters/volume-iii.yaml` | Volume III chapter structure (6 chapters) |
| `chapters/volume-iv.yaml` | Volume IV chapter structure (9 chapters) |
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
11. **Core Studio OS Philosophy** — 16 constitutional design principles in `core-philosophies.yaml`
12. **Volume III registered** — 6 chapters, 12 milestones (M127.1–M127.12) — **authoring complete**
13. **Volume IV registered** — 9 chapters, 23 milestones (M94, M98, M142–M162-spec-qa) — **authoring complete**
14. **M126 formally closed** — Knowledge Registry™ `complete`; module documentation at `knowledge-registry.md`
15. **Documentation coverage** — Architecture Validator™ 0 warnings; all complete modules documented
16. **Platform Readiness Review** — `docs/studio-os/PLATFORM_READINESS_REVIEW.md` (pause gate before Volume V+)

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

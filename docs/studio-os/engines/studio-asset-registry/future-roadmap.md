# Future Roadmap — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.roadmap`  
**Status:** v2+ evolution plan

---

## v1.0.0 (This Sprint) — Intelligence Plane

**Delivered:** Canonical specification only.

| Deliverable | Status |
|-------------|--------|
| Registry Item schema | ✓ Spec |
| Category system | ✓ Spec |
| Lifecycle versioning | ✓ Spec |
| Dependency graph model | ✓ Spec |
| Smart Reuse engine | ✓ Spec |
| Prompt Library | ✓ Spec |
| Pack support + injection | ✓ Spec |
| Company Genome adaptation | ✓ Spec |
| Search system contract | ✓ Spec |
| Runtime integration contracts | ✓ Spec |
| Design Registry™ absorption | ✓ Spec |

**Not in v1:** Storage backend · API implementation · UI · vector search · artifact CDN.

---

## v1.1 — Compiler Integration

| Feature | Description |
|---------|-------------|
| `registrySnapshotRef` in compile input | Replace `designRegistryRef` |
| Reuse index precomputation | Snapshot builder from Approved items |
| Build Health reuse dimension live | `metrics.reusePercentage` from real links |
| CDS golden seed | Register 35 assets + 15 prompts from Creative Direction Studio™ |
| Prompt Library migration | `fal-prompt-package/` → Registry fragments |
| build-report reuse section | Automated from Reuse Engine decisions |

**Success metric:** Creative Direction Studio™ compile achieves ≥40% reuse.

---

## v1.2 — Generator Integration

| Feature | Description |
|---------|-------------|
| Auto-register on department approval | Generator → Registry write pipeline |
| Blueprint reuse seeding | Generator queries Registry before creating assets |
| Pack template loader | Entitled `department-template` from packs |
| `registryRef` in asset-manifest | Generator output includes resolved refs when reusing |

---

## v1.3 — Artifact Plane

| Feature | Description |
|---------|-------------|
| Artifact storage backend | Supabase Storage · CDN · checksum validation |
| Artifact deduplication | Content-addressed storage · single copy per hash |
| Thumbnail pipeline | Auto-generate from mesh · prompt preview |
| Version artifact pinning | Immutable artifact per Registry version |
| Generated asset promotion | `generated` → `approved` QA workflow |

---

## v1.4 — Marketplace Injection

| Feature | Description |
|---------|-------------|
| Pack purchase → injectPack() | Live entitlement on purchase |
| Pack browse API | Pre-purchase preview · view-only |
| Contributor registration | Marketplace creator upload → Draft → review |
| Royalty attribution | usageHistory → contributor dashboard |
| Expansion Center sync | M88 pack install triggers injection |

---

## v2.0 — Search & Discovery UI

| Feature | Description |
|---------|-------------|
| Natural language search | Studio Intelligence Layer routing |
| Faceted browse UI | Admin Studio Asset Registry module |
| Visual similarity | Embedding index on thumbnails |
| Command Dock integration | Proactive reuse suggestions |
| Semantic clusters | "Luxury marble environments" auto-grouping |

**Admin route (future):** `/admin/studio/asset-registry`

---

## v2.1 — Runtime Live Resolution

| Feature | Description |
|---------|-------------|
| Live genome slot swap | Runtime applies org genome without recompile |
| Hotfix artifact delivery | Patch Registry version · Runtime optional upgrade |
| Usage telemetry | Real mount counts · performance profiling |
| Deprecation warnings in room | Command Dock alerts on deprecated refs |
| Cross-department asset sharing | HQ room borrows department Registry items |

---

## v2.2 — Predictive Reuse

| Feature | Description |
|---------|-------------|
| ML reuse matching | Embedding similarity beyond `reuseCategory` |
| Compile prediction | "This department will need 12 regens" before compile |
| Cost forecasting | Provider minutes saved via reuse |
| Auto-evolve generated | Promote high-quality generated without manual QA |
| Industry trend injection | World Knowledge Engine → Registry recommendations |

Aligns with Compiler [future-roadmap.md](../studio-asset-compiler/future-roadmap.md) predictive reuse.

---

## v2.3 — Legacy Network Bridge

| Feature | Description |
|---------|-------------|
| Legacy Network™ export | Approved items publishable to M121 |
| Cross-org asset sharing | Permission-based Registry item lending |
| Community contributions | External experts register marketplace items |
| Attribution permanence | Legacy Network contributor credit on Registry items |

---

## v3.0 — Autonomous Library Growth

| Feature | Description |
|---------|-------------|
| Auto-register successful compiles | Compiler promotes proven outputs |
| Self-healing dependencies | Auto-update when successor published |
| Library health score | Mission Control panel — coverage · reuse · staleness |
| Anticipation Engine integration | "You'll need conference table assets next month" |
| Innovation Lab bridge | New product ideas → Registry item prototypes |

---

## v3.1 — Studio Foundation Models™

| Feature | Description |
|---------|-------------|
| Registry-aware generation | Foundation models trained on Registry taxonomy |
| Prompt Library as training corpus | Anonymized fragment corpus |
| Profession-specific asset vocab | Law · medical · beauty Registry namespaces |
| On-device Registry index | Offline reuse lookup for local models |

Aligns with M124 Studio Foundation Models™.

---

## Long-Term Vision

Studio Asset Registry™ becomes the **permanent creative memory** of Studio OS:

```
Department Generator™  →  creates departments
Studio Asset Compiler™  →  manufactures departments
Studio Asset Registry™  →  remembers everything
Department Runtime™  →  brings everything to life
```

| Year | Capability |
|------|------------|
| **Foundation** | Schema · reuse · packs · genome · prompts |
| **Operational** | Live Compiler + Runtime integration |
| **Intelligent** | NL search · predictive reuse · auto-growth |
| **Ecosystem** | Marketplace · Legacy Network · cross-org sharing |
| **Autonomous** | Self-healing library · anticipation · foundation models |

Unlimited industries · unlimited departments · unlimited Packs™ · unlimited assets · unlimited generators · unlimited business growth.

---

## Dependencies on Other Engines

| Engine | Registry Needs |
|--------|----------------|
| Company Genome™ (M95) | Live snapshots for adaptation |
| Organization boundary (M84) | Org-scoped entitlements |
| Event Bus™ (M131) | Registration events |
| Studio Intelligence™ (M122) | NL search routing |
| System Registry™ (M127) | Platform discovery |
| Monetization (M89) | Pack purchase entitlements |
| Memory Engine™ (M96) | Usage → organizational memory |

---

## Non-Goals (Explicit)

| Non-Goal | Reason |
|----------|--------|
| Replace Asset Director UI | Registry is intelligence · Asset Director is ops |
| Replace Blueprint Manager | Blueprints are specs · Registry is canonical library |
| Store non-reusable one-offs | Only register reusable resources |
| Auto-share private org assets | Privacy · entitlement gates required |
| Real-time collaborative editing | Versioning handles concurrent edits in v3+ |

---

## Success Metrics by Phase

| Phase | Metric |
|-------|--------|
| v1.1 | CDS compile ≥40% reuse |
| v1.4 | Pack injection < 5s after purchase |
| v2.0 | NL search 90% intent accuracy on test queries |
| v2.1 | Runtime genome swap < 100ms per slot |
| v3.0 | Platform-wide reuse ≥50% on mature orgs |
| Long-term | Every generator queries Registry first — 100% compliance |

---

_Future Roadmap — the library grows with every company Studio OS serves._

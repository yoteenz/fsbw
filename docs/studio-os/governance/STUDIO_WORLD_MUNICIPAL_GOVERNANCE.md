# Studio World Municipal Governance™

**Status:** Production Architecture (foundational layer)  
**Policy:** `municipal-governance.v1`  
**Sprint:** P0 — Establish City Council, Permit System, and Foundational Governance

---

## Philosophy

Studio World is no longer "generate anything."

```
Plan → Review → Permit → Build → Inspect → Approve → Occupy → Expand
```

| Role | Municipal metaphor |
|------|-------------------|
| Founder | Property developer |
| Experience Lab | Architecture firm |
| Creative Director Studio | Licensed construction contractor |
| Immune System | Building inspector |
| Quality Guard | Code enforcement |
| AI workers | Contractors |
| Blueprints | Architectural drawings |

---

## StudioWorldMunicipalGovernment™

**Module:** `src/studio-os-core/municipal-governance/`

Orchestrates:

- Zoning
- Permits
- Inspections
- Construction approvals
- Occupancy approvals
- Marketplace certification
- AI resource governance
- Generation budgeting
- Compatibility enforcement

Entry point: `authorizeConstruction()` — full permit workflow before construction begins.

---

## Registries

### Studio World Registry™

Canonical inventory of **official Studio World default scenes** — not founder forks or marketplace mods.

- `BEAUTY_HEADQUARTERS_REGISTRY` fixture seeds Reception, Grand Lobby, Founder Suite, Experience Lab, CDS, departments, etc.
- Each scene: sceneId, purpose, blueprint, capabilities, dependencies, sockets, lighting, materials, version, marketplace eligibility.

### Founder World Registry™

Tracks each founder's headquarters: installed defaults, fork lineage, blueprint history, occupancy state, marketplace mods.

### Department Mod Registry™

Marketplace department mods with publication validation — rejects private assets, customer data, secrets, hardcoded tenants.

---

## City Council™ + Permit Engine™

### Permit types

- Building Permit
- Department Expansion Permit
- Infrastructure / Renovation / Interior Design Permit
- Marketplace Certification Permit
- AI Service / Large World Expansion Permit

### Workflow

```
Permit Application
  → Blueprint Review
  → Dependency Review
  → Brand Asset Validation
  → Immune System Review
  → Quality Guard Review
  → Budget Review
  → GPU / Storage Forecast
  → City Council Approval
  → Permit Issued
  → Construction Begins
```

`isPermitValid()` — every structural generation requires a valid issued permit.

---

## Zoning System™

Floors: penthouse, ground-floor, basement, infrastructure.

Zones: executive, creative, customer, operations, manufacturing, public, private, infrastructure.

Example: Penthouse allows Founder Suite; forbids Shipping Warehouse.

`validateZoningPlacement()` rejects illegal coexistence.

---

## Building Code Engine™

Enforces:

- Valid blueprint + Founder Render
- Lighting + materials assigned
- No orphan dependencies, duplicate IDs, circular dependencies
- No unresolved assets

Integrated with Immune System municipal inspector.

---

## Utility Inspection™

Pre-construction verification: memory, GPU forecast, storage, AI credits, material library, brand assets, permission graph, API/worker availability, queue capacity.

Construction cannot begin if utilities fail.

---

## Construction Budget Engine™ + Permit Fee System™

`forecastConstructionBudget()` — AI cost, GPU time, storage, duration, asset/render counts, queue load, retry cost.

Founder sees projected cost **before** council approval.

`calculatePermitFee()` — configurable platform fees (priority review, emergency construction, marketplace certification). Future monetization hooks here.

---

## Occupancy Permit™

Construction completion ≠ deployment.

```
Inspection → Quality Guard → Immune System → Performance → Accessibility → Compatibility → Occupancy Permit → Department Opens
```

Until occupancy granted: **UNDER CONSTRUCTION**.

---

## Municipal Ledger™

Auditable record of permit applications, approvals, denials, inspections, certifications, occupancy grants.

---

## Municipal Dashboard™

**Data contract only in P0** (`MunicipalDashboardState`) — future UI in Constitution Hall governance wing.

Displays: pending permits, inspection queue, occupancy queue, budget usage, AI utilization, city health score.

---

## Integration

| System | Hook |
|--------|------|
| Experience Lab | `validateExperienceLabGeneration()` — registered scene + permit required |
| Creative Director Studio | `validateCdsArchitectureChange()` — interior vs structural permit types |
| Immune System | `municipalInspectorHalt()` — halt on permit/zoning/code/budget violations |
| Quality Guard | `validateQualityGuardForOccupancy()` — occupancy gate |
| Model Routing (P1) | Budget forecast uses render/asset counts from routing decisions |

---

## Future extensibility

Designed for: multi-building campuses, corporate districts, third-party architectural firms, municipal taxes, economic simulation, regional governments — without architectural redesign.

---

## Related docs

- `docs/studio-os/investigations/SPATIAL_ARCHITECTURE_REVIEW_MUNICIPAL_GOVERNANCE.md`
- `docs/studio-os/governance/STUDIO_WORLD_GOVERNANCE_HIERARCHY.md`
- `docs/studio-os/production/EXPERIENCE_LAB_CDS_MANUFACTURING_PIPELINE.md`
- `docs/studio-os/production/CANONICAL_MODEL_ROUTING_ARCHITECTURE.md`

## Documented gaps (P0-B+)

| Gap | Phase |
|-----|-------|
| Permit persistence in Supabase | P0-B |
| EL/CDS production gates wired to `authorizeConstruction` | P0-B |
| Constitution Hall UI for Municipal Dashboard | P1 |
| Marketplace certification badges on mod install | P1 |

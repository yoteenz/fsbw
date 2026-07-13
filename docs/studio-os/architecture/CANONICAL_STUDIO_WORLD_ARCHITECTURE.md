# Canonical Studio World Architecture

**Status:** P0 foundational layer  
**Spatial review:** `docs/studio-os/investigations/SPATIAL_ARCHITECTURE_REVIEW_CANONICAL_STUDIO_WORLD.md` (Approved 4.8)  
**Module:** `src/studio-os-core/canonical-studio-world/`

---

## Hierarchy (canonical)

```
Studio World
  ├── Canonical Departments (global — exist once)
  ├── Industry Packs (Studio World templates)
  ├── Company HQ (tenant — editable)
  │     ├── Departments
  │     ├── Rooms
  │     ├── Scenes
  │     └── Assets
```

**Law:** Only the **Company HQ layer** belongs to the company. Everything above is Studio World infrastructure.

---

## Canonical departments (never company-owned)

Experience Lab · Creative Director Studio · Construction Mode · Marketplace · Permit Office · City Council · Composition Studio · Asset Registry · Lighting Studio · Material Library · Blueprint Author · AI Workforce · Immune System · Quality Guard · World Compiler · Asset Vault · Command Center

Companies **use** these departments. They never generate their own copies.

---

## Experience Lab entry (replaces company selector)

**Removed:** Company switcher (Studio OS · Frontal Slayer · NDX)  
**New:** Studio World Registry → Industry Pack selection

Founder selects: Hair Brand · Hair Salon · Medical Practice · Law Firm · Real Estate · Restaurant · Fitness · Creator · Agency · Education · E-Commerce · Technology · Nonprofit · Hospitality · Corporate · Government · Custom Blank Pack

---

## Editable vs canonical

| Editable (Company HQ) | Canonical (Studio World) |
|-----------------------|--------------------------|
| HQ departments · rooms · scenes | All infrastructure departments |
| Decor · materials · furniture · lighting | Industry Pack defaults |
| Brand assets · architecture · custom additions | Department templates · reuse engine |

---

## Experience Lab workflow

```
Select Industry Pack → Load Canonical Registry → Generate HQ Blueprint
  → Generate HQ Founder Render → Generate Department Blueprints/Renders
  → Approve Entire Pack → Hand Complete Pack to CDS
```

CDS never invents departments — edits approved ones only.

---

## Code entry points

| Export | Role |
|--------|------|
| `CANONICAL_DEPARTMENT_REGISTRY` | Global infrastructure departments |
| `EXPERIENCE_LAB_INDUSTRY_PACK_OPTIONS` | EL entry pack list |
| `resolveExperienceLabPack()` | Pack selection → Industry Pack |
| `assertCanonicalDepartment()` | Reject company-owned infra |
| `resolveCompanyHqOrganizationId()` | Tenant boundary for HQ customization |

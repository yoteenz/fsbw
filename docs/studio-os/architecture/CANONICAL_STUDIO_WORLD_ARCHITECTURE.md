# Canonical Studio World Architecture

**Status:** P0 foundational layer  
**Spatial review:** `docs/studio-os/investigations/SPATIAL_ARCHITECTURE_REVIEW_CANONICAL_STUDIO_WORLD.md` (Approved 4.8) · `docs/studio-os/investigations/SPATIAL_ARCHITECTURE_REVIEW_EXPERIENCE_LAB_ADMIN_INFRASTRUCTURE.md` (Approved 4.7)  
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
**New:** Studio World Registry → Industry Pack selection (admin only)

**Permission model:** Experience Lab is **Studio World admin infrastructure** — portfolio owners only. Founders never enter Experience Lab.

Founder flow:

```
Founder creates company → selects published Industry Pack → pack clones into workspace → enters Creative Director Studio
```

Admin flow (Experience Lab):

```
Select Industry Pack → canonical HQ → Founder Render → Blueprint → Construction Plan → Publish → Industry Pack Registry
```

---

## Permission model

| Studio World Admin | Founder |
|--------------------|---------|
| Experience Lab · Blueprint Author · Industry Pack Registry · Canonical Department Registry · Construction Planning · World Compiler · AI Workforce · Permit System · Asset/Marketplace Publishing | Creative Director Studio · Construction Mode · Asset Library · Marketplace · Property Management · Brand Settings |

Code: `permission-model.ts` · `useRequireStudioWorldAdmin` · `filterStudioModulesForPrincipal`

---

## Industry Pack options (admin planning)

Admin selects pack archetype when authoring: Hair Brand · Hair Salon · Medical Practice · Law Firm · Real Estate · Restaurant · Fitness · Creator · Agency · Education · E-Commerce · Technology · Nonprofit · Hospitality · Corporate · Government · Custom Blank Pack

Founders select from **published** packs only at company creation — not inside Experience Lab.


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
| `permission-model.ts` | Admin vs founder access — EL hidden from founders |
| `clonePublishedIndustryPackToFounderWorkspace()` | Founder pack clone → CDS entry |

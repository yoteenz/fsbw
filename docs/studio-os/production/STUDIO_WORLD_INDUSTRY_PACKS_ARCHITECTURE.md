# Studio World Industry Packs™ — Canonical Architecture

**Status:** P0 foundational layer  
**Spatial review:** `docs/studio-os/investigations/SPATIAL_ARCHITECTURE_REVIEW_INDUSTRY_PACKS.md` (Approved 4.6)  
**Module:** `src/studio-os-core/industry-packs/`

---

## Objective

Studio World generates **complete headquarters for an industry**, not individual rooms.

| Layer | Responsibility |
|-------|----------------|
| **Business Archetype** | Category (Beauty, Healthcare, …) — contains Industry Packs |
| **Industry Pack** | First-class HQ template (Hair Salon, Law Firm, …) |
| **Department Template** | Reusable wing (Reception, Office, …) — **shared across packs** |
| **Experience Lab** | Choose archetype → industry → generate **entire** HQ → approve → handoff |
| **Creative Director Studio** | Manufacture departments/assets on frozen HQ — never invents architecture |
| **Construction Mode** | Assemble approved assets only |
| **Marketplace** | Industry Packs · Department Packs · mods · entire headquarters |

---

## World hierarchy (canonical)

```
Studio World
  → Business Archetype
    → Industry Pack
      → Department Registry (shared templates)
        → Construction Blueprint (per department slot)
          → Founder Render (HQ hero)
            → Founder Approval
              → Creative Director Studio
                → Construction Mode
                  → Published Headquarters
                    → Marketplace
```

---

## Shared Department Registry™

Departments are **not owned by one Industry Pack**. They are reusable components referenced by version.

Example: `reception` v6 is shared by Hair Salon, Law Firm, Doctor, Realtor, Marketing Agency packs. Only **customization layers** differ per pack instance.

**Law:** `DepartmentReuseEngine™` must run before any generation. Never regenerate a compatible shared department.

---

## Generation priority (cost optimization — mandatory)

1. Reuse existing department if compatible  
2. Reuse existing construction template  
3. Reuse existing material library  
4. Reuse existing lighting profile  
5. Reuse camera pack  
6. Generate **only** missing departments  
7. Generate **only** changed departments  

Never regenerate an entire headquarters because one department changed.

---

## Versioning

- Each **Department Template** has independent revisions (`reception` v1…v6).  
- Each **Industry Pack** pins department versions (`Hair Pack` → Reception v6, Lobby v4, …).  
- Updating `office` v9 does **not** regenerate `reception`.

---

## Experience Lab workflow (target)

```
Choose Archetype → Choose Industry Pack → Generate ALL Departments
  → Construction Blueprint (HQ) → Founder Render → Founder Review
  → Approve Headquarters → Send Entire Pack to CDS
```

**Not:** generate Reception, then Lobby, then Office one at a time.

---

## Creative Director Studio (target)

CDS receives `ApprovedHeadquartersHandoff`:

- Approved HQ Founder Render (frozen)  
- Department registry with template refs + versions  
- Construction metadata per department  
- Asset graph · dependencies  

CDS edits **departments, assets, materials, lighting** — not rooms invented from scratch.

---

## Marketplace evolution

Sell: Industry Packs · Department Packs · Room Variants · Asset Collections · Material/Lighting/Camera/Animation Packs · Construction Templates · Entire Headquarters.

**Mod system:** Official Pack → Founder Mod → City Council → Permit → Inspection → Marketplace Eligible. Mods attach to **departments**, not random generation.

---

## Persistence (Supabase)

| Entity | Table |
|--------|-------|
| BusinessArchetype | `studio_business_archetypes` |
| DepartmentTemplate | `studio_department_templates` |
| IndustryPack | `studio_industry_packs` |
| IndustryPackVersion | `studio_industry_pack_versions` |
| FounderPackInstance | `studio_founder_pack_instances` |
| MarketplacePack | `studio_marketplace_packs` |

Graphs (`PackDependencyGraph`, `DepartmentReuseGraph`) stored as JSONB on pack versions and instances.

---

## Code entry points

| Export | Role |
|--------|------|
| `BUSINESS_ARCHETYPE_REGISTRY` | Permanent archetype catalog |
| `SHARED_DEPARTMENT_REGISTRY` | Reusable department templates |
| `INDUSTRY_PACK_REGISTRY` | Official + custom packs |
| `resolveDepartmentReuse()` | Cost optimization gate |
| `buildHeadquartersGenerationPlan()` | EL orchestration plan |
| `buildApprovedHeadquartersHandoff()` | CDS gate contract |
| `OFFICIAL_INDUSTRY_PACKS` | Admin-founder canonical packs |

---

## Integration

- **Municipal Governance:** pack install requires permit; mods use `DepartmentModRegistry`  
- **Production Pipeline:** `ApprovedHeadquartersHandoff` supersedes single-room handoff for pack flows  
- **Model Routing:** NBP for HQ/department world intents; NB2 for CDS asset manufacturing  

---

## Success criteria

- Studio World generates businesses, not rooms  
- Industry Packs are the primary generation unit  
- Departments are shared reusable objects  
- Overlapping departments generated once, reused everywhere  
- EL generates complete headquarters; CDS edits complete headquarters  
- Marketplace sells businesses, departments, and mods  
- AI cost minimized via reuse engine

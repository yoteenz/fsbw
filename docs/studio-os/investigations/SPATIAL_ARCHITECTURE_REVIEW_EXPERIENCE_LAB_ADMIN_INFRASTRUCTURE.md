# Experience Lab Admin Infrastructure — Spatial Architecture Review

**Sprint:** P0 — Experience Lab becomes Studio World admin infrastructure  
**Date:** 2026-07-13  
**Status:** APPROVED  
**Overall World Score:** 4.7

---

## Review questions

| # | Question | Answer |
|---|----------|--------|
| 1 | Where does this live in Studio World? | Experience Lab moves to **Studio World government layer** — same plane as Industry Pack Registry and Blueprint Author. Not in Company HQ. |
| 2 | Which department owns it? | **Experience Lab™** — internal architecture department. Portfolio owners only. |
| 3 | Genesis integration? | EL publishes approved packs to registry; founders receive clones via `clonePublishedIndustryPackToFounderWorkspace()` — no direct Genesis hooks in founder path. |
| 4 | Navigation placement? | Removed from founder nav/search. Retained under INTELLIGENCE for Studio World Admin with `studioWorldAdminOnly` flag. |
| 5 | Duplicate department risk? | No — reinforces single global EL; founders use CDS only. |
| 6 | Orphan page risk? | No — founders redirect to CDS (`/admin/studio/department/creative-direction`). |
| 7 | Feature-first nav? | No — permission model gates infra before nav renders. |
| 8 | Another dashboard? | No — EL remains planning workbench; founders get CDS immersion. |
| 9 | Spatial continuity? | Admin infra behind portfolio guard; founder creative path unchanged at CDS immersive route. |
| 10 | World score impact? | +0.2 clarity — separates government planning from tenant customization. |

---

## Placement

```
Studio World (government)
  └── Experience Lab (admin only)
        └── Publish → Industry Pack Registry

Company HQ (tenant)
  └── Founder selects published pack
        └── Clone → Creative Director Studio (sole creative workspace)
```

---

## Implementation

- `permission-model.ts` — roles, path guards, infrastructure IDs
- `founder-workspace-entry.ts` — pack clone + CDS entry path
- `useRequireStudioWorldAdmin` — route guard
- `adminStudioNavigation` — `studioWorldAdminOnly` + `filterStudioModulesForPrincipal`
- `adminStudioSearch` — excludes admin infra for founders

---

## Gates

- G1: Wire founder company-creation UI to `clonePublishedIndustryPackToFounderWorkspace` (onboarding flow)
- G2: Persist published pack instances to Supabase before founder clone
- G3: CDS gate on `ApprovedHeadquartersHandoff` at room entry (P0-C)

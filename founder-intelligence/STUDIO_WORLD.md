# Studio World

The complete ecosystem — districts, organizations, destinations.

---
**Last Updated:** 2026-07-11  
**Confidence Level:** High  
**Source:** CORE multi-company routing, World Graph, master spec  
**Status:** Approved  
**Version:** 1.0.0  
**Related Documents:** CIVILIZATION.md, COMPANIES.md, Context `AI_GLOSSARY.md`  
**Future Questions:** Publish public Studio World map for partners?

---

## Why Studio World exists

Software features without geography feel disposable. Studio World gives every module an **address** — users travel, they don't "open settings."

## Navigation philosophy

- **Atlas** and Knowledge Graph connect places to concepts  
- **Multi-company native** — `/admin/studio/companies/{slug}/...` for org-scoped rooms  
- **Global routes** — command-center, archives, expeditions, mission-control remain platform-level  
- Never hardcode `frontal-slayer` in new company-scoped components — use `useCompanyRoute()`  

## Major districts (conceptual)

| District | Purpose |
|----------|---------|
| **Grand Atrium / Mission Control** | Executive HQ per organization |
| **Creative Direction Studio** | Brand and visual production |
| **Studio Institute** | Learning Operating System (LOS) — learning woven through the city; see `EDUCATIONAL_PHILOSOPHY.md` |
| **Expert Capture / Studio Institute invites** | Private expert interviews |
| **Experience Lab** | Runtime experiments (isolated debug routes) |
| **Archives & Legacy** | Permanent memory, museum, time capsules |
| **Marketplace & Knowledge Commerce** | Expertise economy |

## Frontal Slayer on the map

Build-a-Wig storefront + admin is the **host deployment** — first live organization (`frontal-slayer`). Customers experience commerce; founder experiences Headquarters behind it.

## Future expansion

New capabilities **infill** existing geography — new wings, departments, destinations — rather than replacing the world map.

## Cross-reference

Technical routes: Context Capsule `AI_CONTEXT.md`, `motherboard/CODEBASE.md`

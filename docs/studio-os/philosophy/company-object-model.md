# Company Object Model™

**Company™ is the root object of Studio OS**

---

## The Highest Object

The highest object inside Studio OS is no longer a **Project**.

It is:

**Company™**

Every other object belongs to a Company.

---

## Containment Hierarchy

```
COMPANY™
├── Headquarters™          — Studio World™ physical home
│   ├── Floors™
│   ├── Departments™     — organizational units
│   │   └── Sets™        — physical environments
│   ├── Transitions™     — journeys between Sets™
│   └── AI Employees™    — digital workforce
├── Projects™            — initiatives with intent & timeline
│   └── Assets™          — generated · certified · registered
├── Content™             — editorial · campaigns · publishing
├── Operations™          — workflows · tasks · automation
├── Products™            — what the company sells
├── Customers™           — who the company serves
├── Employees™           — human team (future · multiplayer)
├── Marketplace™         — installed packs · Sets™ · transitions
└── Legacy™              — Archive™ · Chronicle™ · preserved truth
```

**Rule:** If it cannot be hung from **Company™**, it is orphaned.

---

## Company™ Definition

A **Company™** is the persistent organizational entity Studio OS manages — not a workspace toggle, not a folder, not a tenant row alone.

| Property | Meaning |
|----------|---------|
| **Identity** | Name · industry · founding story · genome |
| **Headquarters** | Living world manifestation |
| **Lifecycle stage** | Discover → Legacy™ position |
| **Operations** | Active departments · projects · metrics |
| **Outputs** | Websites · apps · products — derived artifacts |
| **Memory** | Blueprint · Profession Brain · Legacy |

---

## Object Relationships

| Parent | Child | Relationship |
|--------|-------|--------------|
| Company™ | Headquarters™ | 1:1 primary (1:N for holding companies future) |
| Company™ | Department™ | 1:N |
| Department™ | Set™ | 1:1 primary (1:N expansion) |
| Company™ | Project™ | 1:N |
| Project™ | Asset™ | 1:N |
| Company™ | Product™ | 1:N |
| Company™ | Customer™ | 1:N |
| Company™ | Legacy™ | 1 append-only stream |

**Projects™** are initiatives *inside* a company — never the root.

---

## Canonical Example — Frontal Slayer™

```
Frontal Slayer™ (Company)
    │
    ├── Headquarters™ (The Mansion™)
    │       ├── Creative Atelier™ (Set)
    │       ├── Marketing War Room™ (Set)
    │       ├── Packaging Atelier™ (Set)
    │       ├── Customer Experience™ (Set)
    │       ├── Finance Vault™ (Set)
    │       └── The Archive™ / Hall of Legacy™ (Set)
    │
    ├── Products™ (wig units · gift cards · memberships)
    ├── Website™ (output — storefront evidence)
    ├── Content™ (editorial · campaigns · NDXBOOK)
    ├── Operations™ (orders · consults · fulfillment)
    ├── Launches™ (campaign orchestration)
    └── Growth™ (expansion · marketplace · departments)
```

Studio OS is **continuously building Frontal Slayer** — not merely its website.

---

## Genome™ Placement

| Genome | Scope |
|--------|-------|
| **Company Genome™** | Whole company identity |
| **Project Genome™** | Single initiative inside company |
| **Set DNA™** | Single environment inside department |
| **Department DNA™** | Organizational personality |

All genomes **belong to Company™** — they express it at different scales.

---

## Workspace vs Company

| Concept | Role |
|---------|------|
| **Workspace** (platform) | Host environment · Frontal Slayer · NDXBOOK · future brands |
| **Company™** (product object) | The business Studio OS manages |

On fsbw, **Frontal Slayer** is both workspace and company. Future multi-company holdings attach multiple Company™ objects to one portfolio owner.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Project as root object | Fragments company truth |
| Website as primary entity | Output mistaken for product |
| Orphan admin page | No company anchor |
| Feature with no Company™ scope | Fails object model |
| Duplicate company truth across tools | Breaks Engine promise |

---

## Cross-References

- [company-engine.md](./company-engine.md)
- [Studio World™](../world/studio-world.md)
- [Sets™](../world/sets-philosophy.md)
- [Organization boundary](../../../motherboard/CORE.md) — `OrganizationContextProvider`

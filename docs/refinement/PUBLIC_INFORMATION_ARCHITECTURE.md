# Public Information Architecture

**Post-Build Refinement 01** · All In One Enterprises Inc.

---

## Conceptual site map

```
HOME (/)
│
├── SERVICES (mega menu → existing routes)
│   ├── Start & Register
│   │   ├── Business Formation          → /services/business-formation
│   │   ├── Operating Authority         → /services/operating-authority-assistance
│   │   ├── BOC-3                       → /services/boc-3-assistance
│   │   └── Tags & Registration         → /services/tag-services
│   ├── Permits & Compliance
│   │   ├── Permitting (division)       → /services/permitting
│   │   ├── IRP, IFTA, Fuel/Road taxes  → individual service slugs
│   │   ├── Renewals, Compliance        → /services/renewals, /services/compliance-support
│   ├── Operate
│   │   ├── Dispatching                 → /services/dispatching
│   │   ├── Factoring                   → /services/factoring
│   │   └── Trucking Insurance          → /services/insurance
│   └── Move Freight
│       ├── Brokerage                   → /services/brokerage
│       ├── Shipper Services            → /services/shipper-services
│       └── Freight Quote               → /services/freight-quote
│
├── START YOUR BUSINESS                 → /start-your-business
├── ROAD READY™                         → /road-ready  → intake /get-started
├── RESOURCES (dropdown)
│   ├── Road Ready™, Start Your Business, About#resources, Compliance Guide, Contact
├── ABOUT                               → /about
├── CONTACT                             → /contact
└── CLIENT LOGIN                        → /portal (auth required)

Supporting public routes (unchanged):
/services · /get-started · /roadmap · /service-plan · /request/* · /quote/:token · /schedule
```

---

## Homepage sections (target: 6 + footer)

1. **Header** — sticky nav with Services mega menu + Resources dropdown
2. **Hero** — positioning + primary/secondary CTAs + qualitative trust strip
3. **Primary service pathways** — 6 navigation cards (not service detail)
4. **Road Ready™ teaser** — dark band, illustrative ring, category list, intake CTA
5. **Customer stage split** — Starting from scratch / Already on the road
6. **Client command center teaser** — single dashboard preview
7. **Final CTA** — Start My Business · Request a Quote · Talk to an Expert
8. **Footer** — Services · Company · Resources · Contact

---

## Progressive disclosure principle

| Visitor question | Homepage answer | Deeper route |
|------------------|-----------------|--------------|
| What is All In One? | Hero + trust strip | `/about` |
| What can you help with? | 6 pathway cards | `/services/*` |
| Where do I go? | Pathway Explore CTAs | Category/service pages |
| Don't know what I need? | Road Ready teaser | `/road-ready` → `/get-started` |
| Why trust? | Qualitative statements only | `/about` |
| How do I start? | Hero + final CTA | `/start-your-business` |

---

## Mobile navigation

Expandable **Services** and **Resources** sections — not a flat link dump. Top-level: Start Your Business, Road Ready™, About, Contact, Client Login.

Pathway cards: **2-column grid** on small screens, 3-column from tablet up.

---

## Configuration source of truth

| Concern | Module |
|---------|--------|
| Mega menu structure | `all-in-one-enterprises/src/data/publicNavigation.ts` |
| Homepage pathways | `all-in-one-enterprises/src/data/homePathways.ts` |
| Service activation (public) | `all-in-one-enterprises/src/launch/serviceActivationLaunch.ts` |
| Path helpers | `all-in-one-enterprises/src/utils/paths.ts` |

---

## Claims policy

No unverified metrics, reviews, customer counts, or partnership logos on the public homepage. Illustrative Road Ready percentage is labeled **Example**.

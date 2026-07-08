# Studio Exchange™ — Implementation

**ARTICLE-E05 · Professional License System™**

**Status:** Implemented (foundation)  
**Route:** `/admin/studio/studio-exchange`  
**Legacy redirect:** `/admin/studio/marketplace` → Studio Exchange™

---

## Mission

Replace traditional course commerce with **Professional Licenses™**. Every Career World inherits the same commerce foundation — no profession hardcoding in engine logic.

---

## Module Structure

```
src/studio-os-core/studio-exchange/
├── constants.ts
├── types.ts
├── engine.ts                 # Public orchestration API
├── index.ts
├── exchange/
│   ├── schema.ts
│   └── catalog.ts            # Exchange-ready asset class listings
├── licenses/
│   ├── schema.ts             # ProfessionalLicense model
│   └── engine.ts
├── career-worlds/
│   ├── schema.ts
│   ├── mapping.ts            # CareerWorldId ↔ ProfessionId
│   └── registry.ts           # Listings from E02 blueprints
├── expansions/
│   ├── schema.ts
│   └── registry.ts           # Per-world expansion registration
├── certifications/
│   ├── schema.ts
│   └── registry.ts
├── ceremonies/
│   ├── schema.ts
│   ├── templates.ts
│   └── framework.ts          # Reusable ceremony stages
├── mentor-economy/
│   ├── schema.ts
│   └── engine.ts
├── businesses/
│   ├── schema.ts
│   └── engine.ts
├── rewards/
│   ├── schema.ts
│   └── engine.ts
└── persistence/
    ├── store-schema.ts
    └── store.ts              # localStorage (Supabase adapter future)
```

---

## Professional License™ Schema

| Field | Purpose |
|-------|---------|
| `licenseId` | Stable license identity |
| `profession` | Profession Simulation / Brain reference |
| `careerWorldId` | Career World entry target |
| `version` | License schema version |
| `status` | active · suspended · renewal-required · etc. |
| `owner` | organizationId + citizenId |
| `issueDate` | When profession entry was granted |
| `renewalRequirements` | Optional renewal gates |
| `includedExpansionIds` | Career Expansions™ bundled or purchased |
| `certificationProgress` | Per-certification progress + ceremony refs |
| `mentorEligibility` | Mentor Economy™ gates |
| `businessEligibility` | Legacy Business™ gates |

---

## Public API (`engine.ts`)

| Function | Purpose |
|----------|---------|
| `listStudioExchangeCareerWorlds()` | All exchange listings from Career World blueprints |
| `getStudioExchangeCatalog()` | Asset-class catalog (licenses, expansions, certifications) |
| `acquireProfessionalLicense()` | Grant profession entry |
| `addExpansionToLicense()` | Attach Career Expansion™ |
| `recordLicenseProgress()` | Update certification progress |
| `scheduleCertificationCeremony()` | Start in-world ceremony |
| `advanceCertificationCeremony()` | Progress ceremony stages |
| `assignMentorApprentice()` | Mentor Economy™ assignment |
| `foundLegacyBusiness()` | Create Legacy Business™ |
| `buildStudioExchangeDashboard()` | Exchange summary for UI |

---

## Integration

| System | Relationship |
|--------|--------------|
| **Career Worlds™ (E02)** | `career-worlds/registry.ts` builds listings from `CAREER_WORLD_BLUEPRINTS` |
| **Profession Simulation Engine™ (E01)** | `simulationEngineRef(professionId)` on each listing |
| **Profession Brain™** | `professionBrainRef(professionId)` included in every license |
| **Knowledge Retention Engine™ (E03)** | Ceremonies write `professionalMemoryRecordId` |
| **World Graph™** | `ingestStudioExchangeNodes()` — license products + expansion edges |

---

## UI

- **Hook:** `src/hooks/useStudioExchangeState.ts`
- **Workspace:** `src/components/admin/studio/studio-exchange/StudioExchangeWorkspace.tsx`
- **Page:** `/admin/studio/studio-exchange`

Tabs: Professional Licenses™ · Career Expansions™ · Certification Ceremonies™ · Mentor Economy™ · Legacy Businesses™

---

## Extension Points

1. **`registerCareerExpansion(definition)`** — add profession-specific expansions without engine changes
2. **`registerExchangeCertification(definition)`** — add certification tracks per world
3. **`registerCeremonyTemplate(template)`** — new ceremony formats
4. **`CareerWorldPersistenceAdapter` pattern** — swap localStorage for Supabase
5. **Payment rails** — plug commerce adapter at `acquireProfessionalLicense()` boundary
6. **Exchange asset classes** — `EXCHANGE_ASSET_CLASSES` supports future hero-object, headquarters-package listings

---

## Routing Migration

- `adminStudioExchangePath()` → `/admin/studio/studio-exchange`
- `adminStudioMarketplacePath()` → alias to Exchange (deprecated name)
- `/admin/studio/marketplace` → redirects to Studio Exchange™

---

## Verification

```bash
npm run compile-world-graph
npm run build
```

---

## Conventions

- Never frame UX as Buy Course / Enroll / Subscription — use **Acquire Professional License™ / Enter Career World™**
- Certifications must use **Certification Ceremonies™** — not PDF-only rewards
- Every new Career World in `CAREER_WORLD_IDS` automatically receives expansions, certifications, and exchange listings via registry seeding

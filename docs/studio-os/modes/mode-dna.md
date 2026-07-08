# Mode DNA™

**What each Mode™ configures automatically**

---

## Purpose

**Mode DNA™** is the bundled configuration profile applied when a founder selects a Mode™.

It shapes the journey — not the platform engine.

---

## Mode DNA™ Schema (Conceptual)

```typescript
interface ModeDNA {
  modeId: ModeId;
  displayName: string;
  version: string;

  headquarters: {
    layoutPriority: string[];      // wing emphasis order
    defaultEnvironment: string;    // e.g. entrepreneur-mansion
    starterWings: string[];
    mapTopology: 'single' | 'campus' | 'multi-client' | 'multi-location';
  };

  departments: {
    priorityOrder: string[];     // install / surface first
    deferred: string[];
    starterPacks: string[];
  };

  ai: {
    orbPersonality: string;        // tone register
    conciergeRoster: string[];     // emphasized roles
    executiveBriefingStyle: string;
    proactivityLevel: 'high' | 'balanced' | 'governance';
  };

  studioWorld: {
    transitionEmphasis: string[];
    worldStateDefaults: string[];
    arrivalCeremonyVariant: string;
  };

  companyEngine: {
    lifecycleFocus: string[];      // Company Lifecycle stages emphasized
    recommendationTopics: string[];
    kpiSet: string[];
  };

  workflows: {
    productionEmphasis: string[];
    approvalCeremony: 'founder-led' | 'committee' | 'client-facing';
    automationStarters: string[];
  };

  terminology: {
    founderTitle: string;          // e.g. "Founder" vs "Executive"
    projectLabel: string;
    clientLabel?: string;
    locationLabel?: string;
  };

  marketplace: {
    suggestedPacks: string[];
    decorMood: string;
  };

  learningPath: {
    firstWeekGoals: string[];
    orbTutorialTopics: string[];
  };
}
```

---

## Shared Foundation (Never Overridden)

| Always shared | Never mode-specific fork |
|---------------|--------------------------|
| Company Engine™ | Core runtime |
| Studio World™ engine | FAL generation |
| Production Lifecycle™ | Auth · org boundary |
| Set™ / Transition™ systems | Validation Loop™ |
| Creative Approval Pipeline™ | Asset Registry™ |

Mode DNA only sets **weights · defaults · copy · priorities**.

---

## Application Timing

| Event | Mode DNA action |
|-------|-----------------|
| **First Mode selection** | Full DNA apply |
| **Mode evolution** | Diff apply — preserve company memory |
| **Blueprint complete** | DNA + Blueprint merge |
| **Inauguration** | DNA reflected in Charter language |

---

## Merge Rules

```
Final Experience = Mode DNA™ + Industry Pack + Company Genome™ + Founder Journey™
```

Later layers **refine** Mode DNA — they do not erase it unless Mode evolution occurs.

---

## Persistence

| Store | Contents |
|-------|----------|
| `organization.modeId` | Active mode |
| `organization.modeHistory[]` | Evolution trail |
| `organization.modeDnaVersion` | Config manifest version |

World Memory™ and Blueprint™ survive Mode changes.

---

## Example — Entrepreneur Mode™ Snapshot

```json
{
  "modeId": "entrepreneur",
  "headquarters": {
    "layoutPriority": ["creative", "brand", "product", "marketing", "launch"],
    "mapTopology": "single"
  },
  "departments": {
    "priorityOrder": ["creative-direction", "marketing", "product", "operations"],
    "starterPacks": ["founder-essentials"]
  },
  "ai": {
    "orbPersonality": "founder-partner",
    "proactivityLevel": "high"
  },
  "terminology": {
    "founderTitle": "Founder"
  }
}
```

Per-mode detail in individual Mode docs.

---

## Cross-References

- Individual Mode specs: `entrepreneur-mode.md` · `enterprise-mode.md` · etc.
- [mode-evolution.md](./mode-evolution.md)
- [Industry Architecture™](../industry-architecture.md)

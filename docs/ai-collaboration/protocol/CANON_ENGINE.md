# Canon Engine

**Protocol module:** L1 — Rules and terminology  
**Capsule path:** `Canon/canon.json`  
**Purpose:** AI automatically avoids violating canon — official terms, deprecated terms, architectural rules.

---

## Purpose

The Canon Engine tracks what is **official**, what is **deprecated**, what **conflicts**, and what **rules** govern design and architecture.

It is the immune system of institutional memory.

---

## canon.json schema

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "canonVersion": "2026-07-10",
  "terminology": {
    "official": [
      {
        "term": "Studio OS",
        "trademark": false,
        "definition": "Platform layer — living headquarters for organizations",
        "aliases": [],
        "canonRef": "docs/studio-os/"
      },
      {
        "term": "AI Context Protocol",
        "trademark": true,
        "definition": "Universal AI onboarding standard for institutional memory transfer",
        "aliases": ["ACP"],
        "canonRef": "docs/ai-collaboration/AI_CONTEXT_PROTOCOL_SPECIFICATION.md"
      },
      {
        "term": "Genesis Core",
        "trademark": true,
        "definition": "Constitutional platform DNA — governs what Studio OS may become",
        "canonRef": "docs/studio-os/genesis/"
      }
    ],
    "deprecated": [
      {
        "term": "MOTHERBOARD.md",
        "reason": "Motherboard is folder motherboard/, not root file",
        "supersededBy": "motherboard/README.md",
        "since": "2026-07-08"
      }
    ],
    "conflicting": [
      {
        "terms": ["Studio Atlas", "World Atlas"],
        "resolution": "Use Studio Atlas in product canon; World Atlas only in legacy docs pending migration",
        "authority": "docs/studio-world/"
      }
    ]
  },
  "architecturalRules": [
    {
      "id": "rule-place-over-menu",
      "rule": "Every production feature must have a Studio World address",
      "severity": "error",
      "source": "PROJECT_DNA"
    },
    {
      "id": "rule-governed-generation",
      "rule": "Material asset generation requires production authorization",
      "severity": "error",
      "source": "Genesis constitution"
    },
    {
      "id": "rule-one-deploy-per-task",
      "rule": "One git push to master per completed user task",
      "severity": "error",
      "source": "motherboard/CORE.md"
    },
    {
      "id": "rule-admin-protected",
      "rule": "Frontal Slayer admin pages unchanged unless founder names page",
      "severity": "warning",
      "source": "ADMIN_ALIGNMENT_PROTOCOL"
    }
  ],
  "designLanguage": {
    "principles": ["Luxury", "Futuristic", "Elegant", "Spatial"],
    "antiPatterns": ["Widget grid executive IA", "Menu-first navigation", "SaaS dashboard aesthetic"],
    "canonRef": "docs/frontal-slayer/design-dna-canon/"
  },
  "brandLanguage": {
    "organization": "Frontal Slayer",
    "productFamily": ["Studio OS", "Studio World", "Genesis"],
    "tone": "Executive, visionary, precise — not casual startup slang"
  },
  "violations": {
    "detection": "Onboarding report + pre-contribution lint (future IME)",
    "reporting": "List in onboarding report under potential inconsistencies"
  },
  "glossaryRef": "Glossary/terms.json",
  "productBibles": [
    "docs/studio-os/",
    "docs/studio-world/",
    "docs/studio-os/genesis/"
  ]
}
```

---

## Canon hierarchy

```
Genesis constitution (highest)
    ↓
Studio OS / Studio World bibles
    ↓
AI collaboration layer (this folder)
    ↓
motherboard (Cursor agent memory)
    ↓
Exploratory chat (lowest — not canon until promoted)
```

Promotion path: exploratory → bible/changelog entry → canon.json update → capsule regen.

---

## Violation severity

| Severity | AI behavior |
|----------|-------------|
| `error` | Must not proceed without founder override + decision memory entry |
| `warning` | Proceed with explicit note in plan |
| `info` | Prefer canon term; log in onboarding report |

---

## Generation sources

| Source | Feeds |
|--------|-------|
| `AI_GLOSSARY.md` | Official terminology |
| Product bibles | Architectural rules, design language |
| `AI_CHANGELOG.md` | Deprecations and supersessions |
| Admin alignment protocol | Protected page rules |
| Health system | Conflicting terminology detection |

---

## AI usage contract

1. Load canon.json before generating architecture or product copy  
2. Never use deprecated terms in production proposals  
3. Resolve conflicting terms per `conflicting[].resolution`  
4. Surface rule violations in onboarding report  
5. Propose canon promotion — never assume chat consensus is canon  

---

*Protocol module — specification only*

# Founder Decision Patterns

**Capsule:** Studio DNA Capsule 1.0.0  
**Scope:** How major product and architecture decisions are typically made.

---

## Default decision flow

```
Explore broadly
    ↓
Evaluate long-term scalability
    ↓
Preserve flexibility
    ↓
Prefer reusable systems
    ↓
Validate assumptions (docs, prototype, or MVP)
    ↓
Implement with minimal scope
    ↓
Document + canon register if enduring
```

---

## Recurring patterns

### Explore broadly before selecting a direction

Multiple viable approaches are considered — especially for platform boundaries, auth models, and spatial IA. Premature lock-in is avoided when migration cost is high.

### Evaluate long-term scalability first

“If we have 50 orgs, 500 experts, and a new domain — does this still work?” Shortcuts that fail at scale are rejected unless explicitly time-boxed as MVP.

### Preserve flexibility whenever possible

Config over hardcode. Profiles over forks. Auth grant types over ad-hoc checks. Feature flags and env vars over compile-time host strings.

### Prefer systems that reuse across products

Expert Capture profiles, invite message variants, department packs, and capsule exports follow the same rule: **one engine, many instances**.

### Validate assumptions before implementation

Vision bibles and Composer sprints often **design first**; production code follows approval. MVPs validate workflows with trusted users (e.g. family experts) before external scale.

### Favor elegant simplicity over unnecessary complexity

The smallest correct diff wins. Five-line fixes beat hundred-line abstractions unless the pattern repeats three times.

### Build for the future while delivering value today

Phase 1 invite token auth scaffolds Studio Accounts without rewriting interviews. Temporary FSBW routes isolate `/studio-institute` without FSBW branding in core.

---

## Decision types

| Type | Typical outcome |
|------|-----------------|
| **Canon page change** | Requires named page + sections — Frontal Slayer Admin Alignment Protocol |
| **New platform module** | Core in `studio-os-core/`, docs, tests, motherboard entry |
| **Customer-visible change** | Mobile-first verification on real device |
| **AI / automation** | Governance gate; expert-approved knowledge only for training |
| **Temporary deployment** | Migration-ready config; documented in MEMORY |

---

## When the founder says “approved for implementation”

Treat as **canon promotion signal** — update `CANON_REGISTRY.md` maturity and implement within stated scope. Do not expand scope silently.

---

*Decision patterns are descriptive of history — not a license to skip founder approval on new directions.*

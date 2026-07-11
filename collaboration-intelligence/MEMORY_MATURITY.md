# Memory Maturity

Taxonomy for Collaboration Intelligence entries. Every glossary term, decision, and conversation summary should declare maturity where practical.

---

## Levels

| Level | Definition | Agent behavior |
|-------|------------|----------------|
| **Experimental** | Explored in conversation; not approved for build | Do not implement without founder approval |
| **Historical** | Accurate for a past phase; may be outdated | Use for context only; verify against handoff |
| **Working** | Current operating assumption | Follow unless contradicted by handoff/code |
| **Approved** | Founder-approved policy or pattern | Follow unless explicit override |
| **Canonical** | Binds architecture, naming, or process | Do not contradict without constitutional review |
| **Deprecated** | Replaced; kept for lookup | Do not apply to new work |

---

## Promotion path

```
Experimental → Working → Approved → Canonical
                    ↘ Historical → Deprecated
```

Promotion requires **founder explicit approval** or documented decision in `DECISION_HISTORY.md`.

---

## Demotion

When code or handoff supersedes an entry:

1. Mark original **Deprecated** or **Historical**
2. Add successor entry with **Working** or **Approved**
3. Append MEMORY.md with conversation summary

---

## Cross-capsule maturity

| Capsule | Primary maturity domain |
|---------|-------------------------|
| AI Context | Operational truth (always current) |
| Founder Intelligence | Strategic Approved / Canonical |
| Studio DNA | Taste Canonical |
| Collaboration Intelligence | Process + shorthand Working–Canonical |

---
**Last Updated:** 2026-07-11  
**Confidence Level:** High  
**Source:** Collaboration Intelligence Capsule sprint v1.0  
**Status:** Approved  
**Version:** 1.0.0  
**Related Documents:** MANIFEST.md, COLLABORATION_GLOSSARY.md  
**Future Questions:** JSON schema field `maturity` per glossary entry?

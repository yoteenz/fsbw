# Quality Standards

**Capsule:** Studio DNA Capsule 1.0.0  
**Scope:** What “Studio quality” means — the bar before something ships.

---

## Definition

Studio quality is **production-ready, intentional, and trustworthy** — premium in feel, disciplined in scope, explainable to the founder and safe for real users.

---

## Standard dimensions

| Dimension | Meaning |
|-----------|---------|
| **Production-ready** | Builds pass; critical paths tested; env documented |
| **Elegant** | Restraint, hierarchy, no accidental complexity |
| **Intentional** | Every control and copy line has purpose |
| **Consistent** | Matches surrounding canon and design DNA |
| **Explainable** | Contributor can describe behavior without code |
| **Governed** | Trust, publishing, and training gates respected |
| **Accessible** | Legible, tappable (44px+ on mobile owner tools), no horizontal scroll traps |
| **Scalable** | Config-driven; no host hardcoding; profile/registry patterns |
| **Premium** | Hospitality-grade calm; no cheap UI |
| **Delightful without excess** | Earned moments only |

---

## Ship gates

Before marking a sprint complete:

1. **`npm run build`** passes (or equivalent for scope)  
2. Tests added/updated for core logic when applicable  
3. Docs + motherboard MEMORY for non-trivial work  
4. No silent canon violations on protected admin pages  
5. Mobile-usable for owner/expert flows when UI is in scope  
6. Migration path stated for temporary deployments  

---

## Quality failures (do not ship)

- Broken resume/autosave on expert interviews  
- Public nav links to private Institute routes  
- Hardcoded `fsbw.vercel.app` in reusable core  
- Second production push to fix forgotten MEMORY  
- “AI will figure it out” onboarding without capsules  

---

## Pair with Context Capsule

Operational quality includes **accurate handoff** — blockers and stage in Context Capsule; judgment and bar in this file.

---

*Quality Standards are non-negotiable defaults — exceptions require founder explicit approval.*

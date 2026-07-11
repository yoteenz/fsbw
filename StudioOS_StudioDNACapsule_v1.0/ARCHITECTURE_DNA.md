# Architecture DNA

**Capsule:** Studio DNA Capsule 1.0.0  
**Scope:** Recurring engineering values — how systems are chosen, extended, and preserved.

---

## Engineering values

### Architecture before implementation

Design the boundary, data flow, and migration path **before** writing UI. A sprint that skips architecture creates invisible debt.

### Preserve canon

Pages, flows, and admin surfaces the founder has approved are **protected**. Alignment is surgical and named — not “modernization” by default. See `CANON_PRESERVATION_POLICY.md`.

### Reuse over duplication

Shared interview views, profile-driven branding, invite systems, and platform modules beat copy-paste pages per profession. One engine, many profiles.

### Build platforms, not pages

Expert Capture is a platform with profiles. Studio Institute invites are a platform with message variants. Admin Studio is a platform with workspaces. Pages are thin shells.

### Migration-first thinking

Temporary deployments (e.g. FSBW Vercel host) use **configuration and route constants** — never hardcoded hosts or brand strings in core modules. Domain changes must be env-only.

### Long-term maintainability

Prefer explicit types, documented contracts, and testable core modules over clever one-offs. Future agents should understand the system without archaeology.

### Explainability

Systems should be describable in plain language. If a feature cannot be explained to the founder in one paragraph, it is not ready.

### Governance before automation

Publishing, training knowledge, asset generation, and canon promotion require **human gates** until trust is earned. Automation amplifies; it does not replace judgment.

### Technical debt is deferred complexity

Debt is acceptable when **documented, bounded, and scheduled**. Undocumented debt is a lie to future contributors.

### Systems should evolve without rewrites

New capabilities (Studio Accounts, billing, org management) extend auth grants, registries, and config — they do not fork parallel implementations.

---

## Structural patterns in this repo

| Pattern | Example |
|---------|---------|
| Core in `studio-os-core/` | expert-capture, invite-system, knowledge-mirror |
| Profile-driven variation | Tax vs Permitting Expert Capture |
| Isolated routes for internal tools | `/studio-institute/*` skips storefront bootstrap |
| Serverless API + Supabase | invites, expert capture sessions |
| Motherboard memory | `motherboard/CORE.md`, `MEMORY.md` |
| One deploy per task | single commit + push on `master` |

---

## Architecture review questions

1. Can this migrate to a new domain with config only?  
2. Does this duplicate an existing module?  
3. What is canon — what must not change without approval?  
4. Where does this live in Studio World spatially?  
5. What happens in 18 months if we add orgs, billing, and SSO?  

---

*Architecture DNA evolves slowly — append via EVOLUTION.md, register in CANON_REGISTRY.md when approved.*

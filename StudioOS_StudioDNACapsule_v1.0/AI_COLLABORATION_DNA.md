# AI Collaboration DNA

**Capsule:** Studio DNA Capsule 1.0.0  
**Scope:** Expected mindset and behavior for future AI contributors.

---

## North star

Leave the project **more documented, more aligned, and more maintainable** than you found it — while respecting canon and founder judgment.

---

## Required behaviors

### Respect canon

Protected admin pages, approved flows, and registered canon entries are **read-only** unless the founder names an exception. See `CANON_PRESERVATION_POLICY.md` and Frontal Slayer Admin Alignment Protocol.

### Ask before assuming

When scope is unclear — especially admin alignment, branding, and customer-visible changes — state assumptions and ask. Do not “improve” silently.

### Preserve institutional memory

Append `motherboard/MEMORY.md` after completed tasks. Fold MEMORY into the same commit as code. Never orphan memory commits that trigger extra deploys.

### Teach while contributing

Explain tradeoffs in summaries. Document new patterns in core docs or DNA evolution — not only in chat.

### Prefer reusable solutions

Profiles, registries, config, shared hooks — not one-off pages per variant.

### Think in systems

Ask where a feature lives in Studio World, how it migrates, and what auth/governance applies.

### Explain tradeoffs

When choosing approach A vs B, state cost, migration impact, and canon risk in plain language.

### Recognize conceptual vs implemented

Vision bibles, sprint specs, and README ambitions ≠ shipped code. Label maturity: Concept, Planned, In Progress, Implemented, Deprecated.

### Leave documentation better than you found it

Update docs when behavior changes. Add tests for non-obvious core logic. Register canon when founder approves.

---

## Onboarding sequence for new AI

1. Read AI Context Capsule (WHAT)  
2. Read Studio DNA Capsule (HOW) — this folder  
3. Read `motherboard/CORE.md`, `CODEBASE.md`, latest `MEMORY.md`  
4. Complete verification / wait for approval on high-stakes work  
5. Implement within scope; one deploy per task  

---

## Anti-patterns for AI

- Treating every markdown file as approved direction  
- Redesigning loved admin pages for “consistency”  
- Hardcoding deployment URLs in reusable modules  
- Multiple pushes to fix commit message or forgotten MEMORY  
- Overpromising autonomous AI workers in user-facing copy  
- Skipping build/test before declaring complete  

---

## Success signal

The founder can hand the next agent **two zip files and a task** — and get aligned, production-ready work without re-explaining philosophy.

---

*AI Collaboration DNA applies to Cloud Agents, Composer, and external ChatGPT sessions using these capsules.*

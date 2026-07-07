# 17 — Marketplace Runtime

**Engine Module:** `studio.department-runtime.v1.marketplace`  
**Status:** Live installation specification  
**Parent:** [Asset Compiler Marketplace Export](../asset-compiler/13_MARKETPLACE_EXPORT.md) · SDK [13](../../sdk/13_MARKETPLACE_PACKAGING.md)

---

## Definition

**Marketplace Runtime** installs departments, buildings, AI employees, objects, interactions, and expansions **without restarting Headquarters**.

---

## Hot Install Pipeline

```
Marketplace package downloaded
    ↓
Validate package (QA rules from Compiler 12)
    ↓
Copy assets to organization storage
    ↓
Register in Asset Registry™
    ↓
Merge into HQ architecture profile
    ↓
Register department in Runtime catalog
    ↓
Register Concierge roles
    ↓
Register Command Dock commands
    ↓
Update World Map destinations
    ↓
Emit marketplace-installed event
    ↓
Optional: pre-assemble in BACKGROUND (prefetch)
```

**No HQ restart. No user logout. No deploy.**

---

## Install Modes

| Mode | Behavior |
|------|----------|
| **Hot** | Immediate catalog availability; assemble on first visit |
| **Prefetch** | Background assemble after install |
| **Queued** | Install during low-activity window |

---

## Installable Package Types

| Type | Runtime Action |
|------|----------------|
| **Department** | Full package mount + DNA merge |
| **Building** | HQ layout wing addition |
| **AI Employees** | Concierge roster extension |
| **Objects** | Object Manager class extension (SDK amendment required) |
| **Interactions** | Interaction map merge |
| **Expansion** | Multi-department + building bundle |

---

## Genome on Install

```
Neutral package
    ↓
Installing org live Genome
    ↓
First visit: full injection (13)
    ↓
Department appears native to that company
```

---

## Version Updates

```
Marketplace update available
    ↓
Orb + Expansion Center notification
    ↓
User approves update
    ↓
Hot-swap changed assets (11)
    ↓
Preserve object + project state
    ↓
Version increment in manifest
```

Non-destructive — user work preserved.

---

## Rollback

Previous package version retained; rollback restores archived asset versions (Compiler 10).

---

## Conflict Resolution

| Conflict | Resolution |
|----------|------------|
| Duplicate department ID | Prompt replace or rename |
| Missing dependency | Offer dependency install |
| Incompatible SDK | Block with upgrade message |

---

_Next: [18 — Runtime API](./18_RUNTIME_API.md)_

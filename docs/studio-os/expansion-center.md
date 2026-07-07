# Expansion Center™

**Milestone:** M88 · **Volume:** volume-i · **Module ID:** `expansion-center`

**Route:** `/admin/studio/expansion-center`

## Purpose

**Headquarters Expansions™** — founders install business capabilities into their existing Headquarters. Never subscribe to features. Never download templates.

**Canonical model:** [Headquarters Engine™](./headquarters-engine.md) · [Headquarters Expansions™](./headquarters-engine.md#headquarters-expansions)

## What an Expansion installs

Each Expansion adds **together**:

- New departments · workspaces · workflows
- New AI specialists · concierge teams
- New automations · analytics · documentation
- New achievements · progression systems

**Not templates. Business capabilities.**

### Example expansions

Photography · Education · Retail · Podcast · Membership · Franchise — see [Headquarters Engine™](./headquarters-engine.md#example-expansions).

### Cross-industry rule

Any Headquarters may install any Expansion regardless of starter industry. See [Cross-industry expansions](./headquarters-engine.md#cross-industry-expansions).

## Master Specification

| Field | Value |
|-------|-------|
| Canonical ID | `M88` |
| Internal ID | `expansion-center` |
| Implementation | partial — evolves toward Headquarters Expansions model |
| Chapter | chapter-i-7 |

## Architecture

| Layer | Path |
|-------|------|
| Module root | `src/studio-os-core/industry-architecture/` (packs · install engine) |
| Philosophy | `docs/studio-os/headquarters-engine.md` |
| System Registry | Registered via `knowledge-registry` + `system-registry` |
| Master Spec | `docs/studio-os/master-spec/milestones/` |

## Related systems

business-model-engine · mission-control · studio-institute · industry-architecture · pack-install-engine · headquarters-layout-engine · **headquarters-engine** · **headquarters-marketplace**

## Engineering notes

One-click Expansion install — Volume III infrastructure (M127.x) feeds this consumer. UI language: **Expand Headquarters** · **Install Expansion** — never "buy template" or "enable feature."

## Consumers

- Studio OS Knowledge Registry™ (M126)
- System Registry™ (M127)
- Command Dock™ · Studio Intelligence™ · Documentation Governance™ (M126.5)
- Architecture Validator™ — documentation coverage gate

## QA & release

Complete modules require this file per Architecture Validator™. No production release without registry, documentation, and trust checks per Constitution™.

---
_Amended 2026-07-07 — Headquarters Engine™ platform philosophy_

# Command Dock™

**Milestone:** M82 · **Volume:** volume-i · **Module ID:** `command-dock`

**Route:** `/admin/studio/mission-control`

## Purpose

Primary interaction layer — executive command console on every Headquarters surface.

## Master Specification

| Field | Value |
|-------|-------|
| Canonical ID | `M82` |
| Internal ID | `command-dock` |
| Implementation | complete |
| Chapter | chapter-i-3 |

## Architecture

| Layer | Path |
|-------|------|
| Module root | `src/studio-os-core/command-dock/` |
| System Registry | Registered via `knowledge-registry` + `system-registry` |
| Master Spec | `docs/studio-os/master-spec/milestones/` |

## Related systems

concierge-routing · studio-intelligence · mission-control

## Engineering notes

Not chatbot/search/palette. DR-001 will reimagine dock via Studio Orb™ — spec registered, product work deferred.

## Consumers

- Studio OS Knowledge Registry™ (M126)
- System Registry™ (M127)
- Command Dock™ · Studio Intelligence™ · Documentation Governance™ (M126.5)
- Architecture Validator™ — documentation coverage gate

## QA & release

Complete modules require this file per Architecture Validator™. No production release without registry, documentation, and trust checks per Constitution™.

---
_Auto-authored from Master Specification — 2026-07-07_

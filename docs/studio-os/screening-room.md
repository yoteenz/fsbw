# Screening Room™

**Milestone:** M80 · **Volume:** volume-i · **Module ID:** `screening-room`

**Route:** `/admin/studio/screening-room`

## Purpose

Luxury review theater — experience every production before publication.

## Master Specification

| Field | Value |
|-------|-------|
| Canonical ID | `M80` |
| Internal ID | `screening-room` |
| Implementation | complete |
| Chapter | chapter-i-2 |

## Architecture

| Layer | Path |
|-------|------|
| Module root | `src/studio-os-core/screening-room/` |
| System Registry | Registered via `knowledge-registry` + `system-registry` |
| Master Spec | `docs/studio-os/master-spec/milestones/` |

## Related systems

render-queue · concierge-approval-flow

## Engineering notes

Private cinema aesthetic — darkened environment, glass controls.

## Consumers

- Studio OS Knowledge Registry™ (M126)
- System Registry™ (M127)
- Command Dock™ · Studio Intelligence™ · Documentation Governance™ (M126.5)
- Architecture Validator™ — documentation coverage gate

## QA & release

Complete modules require this file per Architecture Validator™. No production release without registry, documentation, and trust checks per Constitution™.

---
_Auto-authored from Master Specification — 2026-07-07_

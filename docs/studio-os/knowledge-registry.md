# Studio OS Knowledge Registry™

**Milestone:** M126 · **Volume:** volume-ii · **Module ID:** `knowledge-registry`

**Route:** `/admin/studio/knowledge-registry`

## Purpose

Single source of truth for platform knowledge architecture.

## Master Specification

| Field | Value |
|-------|-------|
| Canonical ID | `M126` |
| Internal ID | `knowledge-registry` |
| Implementation | complete |
| Chapter | chapter-ii-9 |

## Architecture

| Layer | Path |
|-------|------|
| Module root | `src/studio-os-core/knowledge-registry/` |
| System Registry | Registered via `knowledge-registry` + `system-registry` |
| Master Spec | `docs/studio-os/master-spec/milestones/` |

## Related systems

manifest-reconciliation · manifest-authoring · system-registry · documentation-sync · DR-005

## Engineering notes

Studio OS Knowledge Registry™ — Master Spec single source of truth. Formal closure: per-volume manifests, Core Philosophy™, Constitution™, Architecture Validator™ gate, and module documentation complete. Feeds Executive Strategy Floor™ (DR-005).

## Consumers

- Studio OS Knowledge Registry™ (M126)
- System Registry™ (M127)
- Command Dock™ · Studio Intelligence™ · Documentation Governance™ (M126.5)
- Architecture Validator™ — documentation coverage gate

## QA & release

Complete modules require this file per Architecture Validator™. No production release without registry, documentation, and trust checks per Constitution™.

---
_Auto-authored from Master Specification — 2026-07-07_

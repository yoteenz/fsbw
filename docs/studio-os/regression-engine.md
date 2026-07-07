# Regression Engine™

**Milestone:** M160 · **Volume:** volume-iv · **Module ID:** `regression-engine`

**Route:** `/admin/studio/regression-engine`

## Purpose

Verifies changes do not break existing functionality.

## Master Specification

| Field | Value |
|-------|-------|
| Canonical ID | `M160-spec-qa` |
| Internal ID | `regression-engine` |
| Implementation | complete |
| Chapter | — |

## Architecture

| Layer | Path |
|-------|------|
| Module root | `src/studio-os-core/regression-engine/` |
| System Registry | Registered via `knowledge-registry` + `system-registry` |
| Master Spec | `docs/studio-os/master-spec/milestones/` |

## Related systems

See Master Specification dependency graph

## Engineering notes

Registered in Master Specification.

## Consumers

- Studio OS Knowledge Registry™ (M126)
- System Registry™ (M127)
- Command Dock™ · Studio Intelligence™ · Documentation Governance™ (M126.5)
- Architecture Validator™ — documentation coverage gate

## QA & release

Complete modules require this file per Architecture Validator™. No production release without registry, documentation, and trust checks per Constitution™.

---
_Auto-authored from Master Specification — 2026-07-07_

# Self-Healing™ Engine

**Milestone:** M150 · **Volume:** volume-iv · **Module ID:** `self-healing-engine`

**Route:** `/admin/studio/self-healing-engine`

## Purpose

Repairs low-risk issues and prepares recovery plans.

## Master Specification

| Field | Value |
|-------|-------|
| Canonical ID | `M150` |
| Internal ID | `self-healing-engine` |
| Implementation | complete |
| Chapter | — |

## Architecture

| Layer | Path |
|-------|------|
| Module root | `src/studio-os-core/self-healing-engine/` |
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

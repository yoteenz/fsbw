# Render Queue™

**Milestone:** M79 · **Volume:** volume-i · **Module ID:** `render-queue`

**Route:** `/admin/studio/render-queue`

## Purpose

Visible pipeline for every production — founder never wonders what AI is doing.

## Master Specification

| Field | Value |
|-------|-------|
| Canonical ID | `M79` |
| Internal ID | `render-queue` |
| Implementation | complete |
| Chapter | chapter-i-2 |

## Architecture

| Layer | Path |
|-------|------|
| Module root | `src/studio-os-core/render-queue/` |
| System Registry | Registered via `knowledge-registry` + `system-registry` |
| Master Spec | `docs/studio-os/master-spec/milestones/` |

## Related systems

production-studio · screening-room

## Engineering notes

Subtle animations communicate work in progress.

## Consumers

- Studio OS Knowledge Registry™ (M126)
- System Registry™ (M127)
- Command Dock™ · Studio Intelligence™ · Documentation Governance™ (M126.5)
- Architecture Validator™ — documentation coverage gate

## QA & release

Complete modules require this file per Architecture Validator™. No production release without registry, documentation, and trust checks per Constitution™.

---
_Auto-authored from Master Specification — 2026-07-07_

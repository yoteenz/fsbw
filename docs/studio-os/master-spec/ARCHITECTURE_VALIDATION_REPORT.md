# Architecture Validator™ Report

Generated: 2026-07-08T01:59:22.472Z

## Summary

| Severity | Count |
|----------|-------|
| Errors | 0 |
| Warnings | 1 |
| **Gate** | **✅ PASS** |

## Checks Performed

- Dependency integrity (milestone dependsOn + dependency graph)
- Registry integrity (Knowledge Registry M126, System Registry M127, QA chain)
- Manifest integrity (volumes, milestones, chapters, design revisions)
- Naming consistency (canonical IDs, aliases, shipped badges)
- Circular dependencies (dependency graph DFS)
- Duplicate definitions (canonicalId, internalId, shipped badge)
- Version consistency (YAML file versions)
- Constitution compliance (required principles)
- Core Philosophy compliance (≥15 principles, Volume III alignment)
- Knowledge Registry compliance
- Missing documentation (complete modules without docs/studio-os/*.md)

## Issues

| Severity | Code | Entity | Message |
|----------|------|--------|---------|
| warning | VERSION_MISMATCH | — | Multiple active spec file versions: 1.1.0, 1.2.0 |

## Architectural Gatekeeper

Architecture Validator™ runs on every compile (`prebuild`). Errors block the build.
Warnings are reported for review but do not block compilation.

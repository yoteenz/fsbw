# Architecture Validator™ Report

Generated: 2026-07-07T06:07:43.628Z

## Summary

| Severity | Count |
|----------|-------|
| Errors | 0 |
| Warnings | 34 |
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
- Knowledge Registry compliance
- Missing documentation (complete modules without docs/studio-os/*.md)

## Issues

| Severity | Code | Entity | Message |
|----------|------|--------|---------|
| warning | MISSING_DOCUMENTATION | company-onboarding-intelligence | No docs/studio-os/company-onboarding-intelligence.md for complete module |
| warning | MISSING_DOCUMENTATION | arrival-experience | No docs/studio-os/arrival-experience.md for complete module |
| warning | MISSING_DOCUMENTATION | concierge-layer | No docs/studio-os/concierge-layer.md for complete module |
| warning | MISSING_DOCUMENTATION | production-studio | No docs/studio-os/production-studio.md for complete module |
| warning | MISSING_DOCUMENTATION | render-queue | No docs/studio-os/render-queue.md for complete module |
| warning | MISSING_DOCUMENTATION | screening-room | No docs/studio-os/screening-room.md for complete module |
| warning | MISSING_DOCUMENTATION | concierge-approval-flow | No docs/studio-os/concierge-approval-flow.md for complete module |
| warning | MISSING_DOCUMENTATION | concierge-routing | No docs/studio-os/concierge-routing.md for complete module |
| warning | MISSING_DOCUMENTATION | command-dock | No docs/studio-os/command-dock.md for complete module |
| warning | MISSING_DOCUMENTATION | living-headquarters-presence | No docs/studio-os/living-headquarters-presence.md for complete module |
| warning | MISSING_DOCUMENTATION | mission-control | No docs/studio-os/mission-control.md for complete module |
| warning | MISSING_DOCUMENTATION | design-dna-canon | No docs/studio-os/design-dna-canon.md for complete module |
| warning | MISSING_DOCUMENTATION | design-genome | No docs/studio-os/design-genome.md for complete module |
| warning | MISSING_DOCUMENTATION | executive-council | No docs/studio-os/executive-council.md for complete module |
| warning | MISSING_DOCUMENTATION | qa-headquarters | No docs/studio-os/qa-headquarters.md for complete module |
| warning | MISSING_DOCUMENTATION | qa-inspector | No docs/studio-os/qa-inspector.md for complete module |
| warning | MISSING_DOCUMENTATION | qa-simulation-engine | No docs/studio-os/qa-simulation-engine.md for complete module |
| warning | MISSING_DOCUMENTATION | ai-red-team | No docs/studio-os/ai-red-team.md for complete module |
| warning | MISSING_DOCUMENTATION | executive-trust-dashboard | No docs/studio-os/executive-trust-dashboard.md for complete module |
| warning | MISSING_DOCUMENTATION | time-machine | No docs/studio-os/time-machine.md for complete module |
| warning | MISSING_DOCUMENTATION | predictive-qa | No docs/studio-os/predictive-qa.md for complete module |
| warning | MISSING_DOCUMENTATION | self-healing-engine | No docs/studio-os/self-healing-engine.md for complete module |
| warning | MISSING_DOCUMENTATION | decision-audit | No docs/studio-os/decision-audit.md for complete module |
| warning | MISSING_DOCUMENTATION | confidence-engine | No docs/studio-os/confidence-engine.md for complete module |
| warning | MISSING_DOCUMENTATION | organizational-guardian | No docs/studio-os/organizational-guardian.md for complete module |
| warning | MISSING_DOCUMENTATION | design-compliance-engine | No docs/studio-os/design-compliance-engine.md for complete module |
| warning | MISSING_DOCUMENTATION | prompt-qa | No docs/studio-os/prompt-qa.md for complete module |
| warning | MISSING_DOCUMENTATION | experience-qa | No docs/studio-os/experience-qa.md for complete module |
| warning | MISSING_DOCUMENTATION | visual-diff-engine | No docs/studio-os/visual-diff-engine.md for complete module |
| warning | MISSING_DOCUMENTATION | accessibility-auditor | No docs/studio-os/accessibility-auditor.md for complete module |
| warning | MISSING_DOCUMENTATION | performance-monitor | No docs/studio-os/performance-monitor.md for complete module |
| warning | MISSING_DOCUMENTATION | regression-engine | No docs/studio-os/regression-engine.md for complete module |
| warning | MISSING_DOCUMENTATION | release-readiness | No docs/studio-os/release-readiness.md for complete module |
| warning | MISSING_DOCUMENTATION | engineering-excellence-dashboard | No docs/studio-os/engineering-excellence-dashboard.md for complete module |

## Architectural Gatekeeper

Architecture Validator™ runs on every compile (`prebuild`). Errors block the build.
Warnings are reported for review but do not block compilation.

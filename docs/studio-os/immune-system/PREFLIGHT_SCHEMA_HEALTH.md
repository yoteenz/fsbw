# Preflight Schema Health

Before dispatch, `runGenerationArtifactPreflight()` validates artifact intent is known and has a registered validator.

## Codes

| Code | Meaning |
|------|---------|
| `NO_VALIDATOR_FOR_ARTIFACT_INTENT` | Intent not in registry |
| `MISSING_ARTIFACT_INTENT` | Layer could not resolve intent |
| `UNREACHABLE_COMPLETION_STATE` | Reserved for future schema/table preflight |

## Schema audit (2026-07-13)

Production `hyycomvcaqxxvyrfupes` verified:

- `studio_governed_generation_jobs` ✓
- `studio_asset_registry_*` ✓
- `studio_creative_intelligence_*` ✓
- `studio_os_org_memberships` ✓
- `studio_os_workspace_state` ✓

No missing migration applied in parity sprint.

# Business Name Registry Support Matrix

Honest support status for All In One automated business name checks. **Do not mark unsupported states as supported.**

| State | Automated Lookup Supported | Source | Method | Manual Review Required | Known Limitations |
|-------|---------------------------|--------|--------|------------------------|-------------------|
| TN | Yes* | Tennessee Secretary of State Business Information Search | Topograph API → live TN CAB portal | No* | No official public REST API; requires `AIO_TOPOGRAPH_API_KEY`. Starts-with name matching. |
| GA | Yes* | Georgia Secretary of State eCorp Business Search | Topograph API → live eCorp portal | No* | Portal disclaimer: search not intended as name availability search. Requires provider key. |
| IL | Yes* | Illinois Secretary of State Business Entity Search | Topograph API | No* | Requires provider key. |
| All other US states | No | Respective Secretary of State / business registry | None (manual) | Yes | No supported automated integration configured. |

\* Without `AIO_TOPOGRAPH_API_KEY`, TN/GA/IL behave as **lookup unavailable** → manual verification required.

## Demo mode (all states)

Deterministic synthetic responses via `DemoBusinessNameRegistryAdapter`. Does not call live registries unless explicitly configured for live integration testing.

## Provider configuration

| Variable | Purpose |
|----------|---------|
| `AIO_TOPOGRAPH_API_KEY` | Commercial registry provider API key |
| `AIO_TOPOGRAPH_API_BASE` | Optional base URL (default `https://api.topograph.co`) |
| `AIO_ALLOW_DEMO_NAME_CHECK` | Allow demo adapter via HTTP endpoint (non-production) |

## Adding a new state

1. Confirm lawful integration path (official API or approved provider).
2. Add entry to `stateCapabilities.ts`.
3. Implement or extend adapter (e.g. Topograph country code mapping).
4. Update this matrix — do not ship until verified end-to-end.

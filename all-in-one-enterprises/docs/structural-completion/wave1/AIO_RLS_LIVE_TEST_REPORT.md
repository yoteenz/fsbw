# Wave 1 live RLS test report

| Suite | File | When runs |
|-------|------|-----------|
| Anon deny matrix | `wave1TenantIsolation.live.test.ts` | `AIO_LIVE_SUPABASE_TEST=1` + URL/anon |
| Core role matrix | same | + core JWT envs |
| Freight RLS | `freightRlsIntegration.test.ts` | CI production validate |

Regenerate this report after CI run; local agent without secrets: expect **BLOCKED** for role matrix, skipped anon without anon key.
